import { AuthenticationError } from "apollo-server";
import { db } from "../db";
import { Resolvers, Drama, Activity } from "./generated";
import { isAnyBookmarked, strip } from "./helpers";


const Query: Resolvers['Query'] = {
    activity: async (parent, args, context) => {
        if (!context.user) {
            throw new AuthenticationError("Authentication required");
        }
        const { take = 100, skip = 0, orderBy = [], where = {} } = strip(args);

        const total = await db.activity.count({
            where,
        });

        const activity = await db.activity.findMany({
            take,
            skip,
            orderBy: [
                ...orderBy,
                { id: 'desc' }
            ],
            where,
        });

        return {
            data: activity as Activity[],
            meta: {
                count: activity.length,
                skip: skip,
                take: take,
                total,
            }
        }
    },
    currentUser: async (parent, args, context) => {
        if (!context.user) {
            throw new AuthenticationError("Authentication required");
        }
        return context.user;
    },
    drama: async (parent, args, context) => {
        if (!context.user) {
            throw new AuthenticationError("Authentication required");
        }

        const drama = await db.drama.findUnique({
            where: {
                id: args.id,
            },
        });

        if (!drama) {
            return null;
        }

        return drama;
    },
    dramas: async (parent, args, context) => {
        if (!context.user) {
            throw new AuthenticationError("Authentication required");
        }
        const { take = 100, skip = 0, orderBy = [], where = {} } = strip(args);

        const total = await db.drama.count({
            where,
        });

        const bookmarks = await db.drama.findMany({
            take,
            skip,
            orderBy: [
                ...orderBy,
                { lastModifiedAt: 'desc' }
            ],
            where,
        });

        return {
            data: bookmarks as Partial<Drama>[] as Drama[],
            meta: {
                count: bookmarks.length,
                skip: skip,
                take: take,
                total,
            }
        }
    },
    isDramaBookmarked: async (parent, args, context) => {
        if (!context.user) {
            throw new AuthenticationError("Authentication required");
        }

        const links = await isAnyBookmarked([args.url]);
        return links[0]?.dramaId ?? null;
    },
    tags: async (parent, args, context) => {
        if (!context.user) {
            throw new AuthenticationError("Authentication required");
        }
        const { where = {}, take } = strip(args);


        const tags = await db.tag.groupBy({
            where,
            by: ["name"],
            _count: {
                name: true,
            },
            orderBy: {
                _count: {
                    name: "desc",
                },
            },
            take,
        });
        return tags.map((tag) => ({ name: tag.name }));
    },
    users: async (parent, args, context) => {
        if (!context.user) {
            throw new AuthenticationError("Authentication required");
        }
        return db.user.findMany();
    },
    dump: async (parent, args, context) => {
        if (!context.user) {
            throw new AuthenticationError("Authentication required");
        }
        return {
            user: (await db.user.findMany()).map((record) => ({
                id: record.id,
                createdAt: record.createdAt,
                lastModifiedAt: record.lastModifiedAt,
                email: record.email,
                admin: record.admin,
            })),
            drama: (await db.drama.findMany()).map((record) => ({
                id: record.id,
                createdAt: record.createdAt,
                createdById: record.createdById,
                lastModifiedAt: record.lastModifiedAt,
                lastModifiedById: record.lastModifiedById,
                title: record.title,
                description: record.description,
                startedAiringAt: record.startedAiringAt,
                finishedAiringAt: record.finishedAiringAt,
                country: record.country,
                episodeDuration: record.episodeDuration,
                episodeCount: record.episodeCount,
                status: record.status,
            })),
            watched: (await db.watched.findMany()).map(record => ({
                id: record.id,
                createdAt: record.createdAt,
                lastModifiedAt: record.lastModifiedAt,
                createdById: record.createdById,
                dramaId: record.dramaId,
                status: record.status,
            })),
            link: (await db.link.findMany()).map(record => ({
                id: record.id,
                createdAt: record.createdAt,
                createdById: record.createdById,
                dramaId: record.dramaId,
                url: record.url,
            })),
            tag: (await db.tag.findMany()).map(record => ({
                id: record.id,
                createdAt: record.createdAt,
                createdById: record.createdById,
                dramaId: record.dramaId,
                name: record.name,
            })),
            activity: (await db.activity.findMany()).map(record => ({
                id: record.id,
                createdAt: record.createdAt,
                createdById: record.createdById,
                dramaId: record.dramaId,
                message: record.message,
            }))
        }
    },
};

export { Query };
