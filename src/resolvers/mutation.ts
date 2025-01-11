import { AuthenticationError, UserInputError } from "apollo-server";
import { db } from "../db";
import without from 'lodash.without';
import { CreateDramaContent, Resolvers } from "./generated";
import { cleanText, COUNTRY, DRAMA_STATUS, getCanonicalUrl, isAnyBookmarked, strip, WATCHED_STATUS } from "./helpers";

function cleanAndValidateDramaArgs({ id, input }: { id?: number; input: CreateDramaContent }) {
    const args = strip(input);

    if (!id || args.title !== undefined) {
        args.title = cleanText(args.title ?? '');
        if (!args.title) {
            throw new UserInputError('\'title\' is required.')
        }
    }

    if (!id || args.links !== undefined) {
        args.links = (args.links ?? []).map((l) => l.trim()).filter(Boolean);

        if (!args.links.length) {
            throw new UserInputError('At least 1 link is required.')
        }
    }

    if (!id || args.status !== undefined) {
        if (!args.status?.trim()) {
            throw new UserInputError('\'status\' is required.');
        }

        if (!Object.values<string | undefined>(DRAMA_STATUS).includes(args.status)) {
            throw new UserInputError(`"${args.status}" is not a valid \'status\'. Must be one of ${Object.values(DRAMA_STATUS).map((s) => `"${s}"`).join(', ')}.`)
        }
    }

    if (args.country !== undefined) {
        if (!Object.values<string>(COUNTRY).includes(args.country)) {
            throw new UserInputError(`"${args.country}" is not a valid \'country\'. Must be one of ${Object.values(COUNTRY).map((s) => `"${s}"`).join(', ')}.`)
        }
    }

    if (typeof args.finishedAiringAt === 'string') {
        args.finishedAiringAt = args.finishedAiringAt + 'T00:00:00.000Z';
    }

    if (typeof args.startedAiringAt === 'string') {
        args.startedAiringAt = args.startedAiringAt + 'T00:00:00.000Z';
    }

    if (args.tags !== undefined) {
        args.tags = (args.tags ?? []).map((name) => cleanText(name).toLowerCase()).filter(Boolean);
    }

    if (args.watched) {
        if (!Object.values<string>(WATCHED_STATUS).includes(args.watched)) {
            throw new UserInputError(`"${args.watched}" is not a valid \'watched\'. Must be one of ${Object.values(WATCHED_STATUS).map((s) => `"${s}"`).join(', ')}.`)
        }
    } else {
        delete args.watched;
    }

    return args;
}

const Mutation: Resolvers["Mutation"] = {
    addUser: async (_, args, context) => {
        if (!context.user?.admin) {
            throw new AuthenticationError("Admin required");
        }

        const user = await db.user.create({
            data: { email: args.email.toLowerCase() }
        });

        await db.activity.create({
            data: {
                createdById: context.user.id,
                message: `User ${user.email} added`,
            }
        });

        return user;
    },
    removeUser: async (_, args, context) => {
        if (!context.user?.admin) {
            throw new AuthenticationError("Admin required");
        }
        await db.user.delete({
            where: { email: args.email }
        });

        await db.activity.create({
            data: {
                createdById: context.user.id,
                message: `User ${args.email} deleted`,
            }
        });
    },
    addDrama: async (_, args, context) => {
        if (!context.user) {
            throw new AuthenticationError("Authentication required.");
        }

        let { tags = [], links = [], watched, ...rest } = cleanAndValidateDramaArgs(args);


        // check links don't already exist
        const exists = await isAnyBookmarked(links);
        if (exists.length) {
            throw new UserInputError(`url(s) ${links.join(',')} are already bookmarked.`);
        }

        const watchedMany: { status: string; createdById: number }[] = [];
        if (rest.status !== DRAMA_STATUS.COMPLETED) {
            // assume no one has watched it
            const users = await db.user.findMany();
            for (const user of users) {
                watchedMany.push({
                    status: WATCHED_STATUS.NO,
                    createdById: user.id
                })
            }
        } else if (watched) {
            watchedMany.push({
                status: watched,
                createdById: context.user.id
            });
        }

        const drama = await db.drama.create({
            data: {
                ...rest,
                createdById: context.user!.id,
                lastModifiedById: context.user!.id,
                links: {
                    create: links.map((url) => ({
                        url: getCanonicalUrl(url).canonical,
                        createdById: context.user!.id,
                    }))
                },
                tags: {
                    create: tags.map((name) => ({
                        name,
                        createdById: context.user!.id,
                    })),
                },
                watched: {
                    create: watchedMany
                }
            },
        });

        await db.activity.create({
            data: {
                createdById: context.user!.id,
                message: `Drama added`,
                dramaId: drama.id,
            }
        });

        return drama;
    },
    removeDrama: async (_, args, context) => {
        if (!context.user) {
            throw new AuthenticationError("Authentication required.");
        }

        await db.drama.delete({
            where: {
                id: args.id,
            },
        });

        await db.activity.create({
            data: {
                createdById: context.user.id,
                message: `Drama deleted`,
                dramaId: args.id,
            }
        });
    },
    updateDrama: async (_, args, context) => {
        if (!context.user) {
            throw new AuthenticationError("Authentication required.");
        }

        const input = cleanAndValidateDramaArgs(args);
        let { links, tags, watched, ...rest } = input;
        links = links?.map((link) => getCanonicalUrl(link).canonical)
        // need to compare in order to get changes
        const prev = await db.drama.findUniqueOrThrow({
            where: { id: args.id },
            include: { tags: true, watched: true, links: true }
        });

        const prevTags = prev.tags.filter((tag) => tag.createdById === context.user!.id).map((tag) => tag.name);
        const prevLinks = prev.links.map(link => link.url);
        const prevWatchedStatus = prev.watched.find((watch) => watch.createdById === context.user!.id)?.status;

        let newTags = without(tags ?? [], ...prevTags);
        let removedTags = without(prevTags, ...tags ?? []);
        let newLinks = without(links ?? [], ...prevLinks);
        let removedLinks = without(prevLinks, ...links ?? []);

        // check links don't already exist
        const exists = (await isAnyBookmarked(newLinks, [args.id])).filter((link) => link.dramaId !== prev.id);
        if (exists.length) {
            throw new UserInputError(`url(s) ${newLinks.join(',')} are already bookmarked.`);
        }

        const drama = await db.drama.update({
            where: { id: args.id },
            data: {
                ...rest,
                lastModifiedById: context.user.id,
                tags: (newTags.length || removedTags.length) ? {
                    deleteMany: {
                        dramaId: args.id,
                        createdById: context.user.id,
                        name: { in: removedTags }
                    },
                    create: newTags.map((name) => ({ name, createdById: context.user!.id, })),
                } : undefined,
                links: (newLinks.length | removedLinks.length) ? {
                    deleteMany: {
                        dramaId: args.id,
                        url: { in: removedLinks }
                    },
                    create: newLinks.map((url) => ({ url, createdById: context.user!.id, })),
                } : undefined,
                watched: watched ? {
                    upsert: [{
                        where: { createdById_dramaId: {
                            createdById: context.user.id,
                            dramaId: args.id,
                        }},
                        update: { status: watched },
                        create: {
                            status: watched,
                            createdById: context.user.id,
                        }
                    }]
                } : undefined,
            }
        });

        let activityDescription = '';

        const quote = (value: string | string[] | null | undefined) => (Array.isArray(value) ? value: [value ?? '']).map((v) => `"${v}"`).join(', ');

        const addActivity = (...values: string[]) => {
            const value = values.join(' ');
            activityDescription += `\n${value}`;
        }

        for (const [key, value] of Object.entries(rest)) {
            let prevValue = prev[key];
            if (prevValue instanceof Date) {
                prevValue = prevValue.toISOString()
            }
            if (prevValue !== value) {
                addActivity(`Updated ${key} from`, quote(prevValue), 'to', quote(value));
            }
        }
        if (watched !== undefined && watched !== prevWatchedStatus) {
            addActivity(`Updated watched status from ${quote(prevWatchedStatus)} to ${quote(watched)}`);
        }

        if (newLinks.length) {
            addActivity('Added link(s)', quote(newLinks));
        }

        if (removedLinks.length) {
            addActivity('Removed link(s)', quote(removedLinks))
        }

        if (newTags.length) {
            addActivity('Added tag(s)', quote(newTags))
        }

        if (removedTags.length) {
            addActivity('Removed tag(s)', quote(removedTags));
        }

        await db.activity.create({
            data: {
                dramaId: drama.id,
                createdById: context.user.id,
                message: activityDescription || 'Updated. No Changes.',
            }
        });

        return drama;
    },
};

export { Mutation };
