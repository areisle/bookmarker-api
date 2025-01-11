import { db } from "../db";
import { GroupedTag, Resolvers } from "./generated";
import { Query } from "./query";
import { Mutation } from "./mutation";
import startCase from 'lodash.startcase';

function createdBy(parent: { createdById: number }){
    return db.user.findUniqueOrThrow({
        where: {
            id: parent.createdById,
        },
    });
}

const x = createdBy({ createdById: 3 });

const resolvers: Resolvers = {
    Activity: {
        createdBy,
        drama: async (parent) => {
            if (parent.dramaId) {
                return db.drama.findUnique({
                    where: {
                        id: parent.dramaId,
                    },
                });
            }
            return null;
        },
    },
    Drama: {
        tags: async (parent) => {
            return db.tag.findMany({
                orderBy: [{ name: "asc" }],
                where: {
                    dramaId: parent.id,
                },
            });
        },
        links: async (parent) => {
            return db.link.findMany({
                where: {
                    dramaId: parent.id,
                },
            });
        },
        createdBy,
        currentUserWatched: async (parent, args, context) => {
            const watched = await db.watched.findUnique({
                where: {
                    createdById_dramaId: {
                        createdById: context.user!.id,
                        dramaId: parent.id,
                    }
                }
            });
            return watched?.status ?? null;
        },
        groupedTags: async (parent, args, context) => {
            const tags = await db.tag.findMany({
                orderBy: [{ name: "asc" }],
                where: {
                    dramaId: parent.id,
                },
            });

            const groups: Record<string, GroupedTag> = {};

            tags.forEach((tag) => {
                groups[tag.name] = groups[tag.name] || { name: tag.name, count: 0, current: false }
                groups[tag.name].count += 1;
                if (tag.createdById === context.user!.id) {
                    groups[tag.name].current = true;
                }
            });

            const groupedTags = Object.values(groups).sort((a, b) => {
                if (a.name > b.name) return 1;
                return -1
            });

            return groupedTags
        },
        lastModifiedBy: async (parent) => {
            return db.user.findUniqueOrThrow({
                where: {
                    id: parent.lastModifiedById,
                },
            });
        },
        watched: async (parent) => {
            return db.watched.findMany({
                where: {
                    dramaId: parent.id,
                },
            });
        },
    },
    Link: {
        createdBy,
        title: (parent, args, context) => {
            let match = parent.url.match(/https:\/\/dramanice\..*\/drama\/(?<name>.*)-detail/);
            if (match) {
                return `${startCase(match.groups!.name)} (dramanice)`
            }
            match = parent.url.match(/https:\/\/mydramalist\.com\/\d+-(?<name>.*)/);
            if (match) {
                return `${startCase(match.groups!.name)} (mydramalist)`
            }
            return parent.url;
        },
    },
    Tag: {
        createdBy,
        createdByCurrentUser: (parent, args, context) => {
            return parent.createdById === context.user!.id;
        },
    },
    User: {
        createdBy: (parent) => {
            if (parent.createdById) {
                return db.user.findUnique({
                    where: {
                        id: parent.createdById,
                    },
                });
            }
            return null;
        }
    },
    Watched: {
        createdBy,
    },
    Query,
    Mutation,
};

export { resolvers };
