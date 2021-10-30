import { prisma } from "../db";
import { Resolvers } from "./generated";
import { Query } from "./query";
import { Mutation } from "./mutation";

const resolvers: Resolvers = {
    Bookmark: {
        tags: async (parent, args, context, info) => {
            return prisma.tag.findMany({
                orderBy: [{ name: "asc" }],
                where: {
                    bookmark: { id: parent.id },
                },
            });
        },
        groupedTags: async (parent, args, context, info) => {
            type Result = {
                total: number;
                name: string;
                createdByCurrentUser: number;
            };

            const userId = context.user?.id;

            return prisma.$queryRaw<Result[]>`
                SELECT
                    name,
                    COUNT(*) as total,
                    SUM(CASE WHEN "createdById" = ${userId} THEN 1 ELSE 0 END) as "createdByCurrentUser"
                FROM
                    "Tag"
                WHERE
                    "bookmarkId" = ${parent.id}
                GROUP BY
                    name
                ORDER BY name ASC;
            `;
        },
        category: async (parent, args, context, info) => {
            return (await prisma.category.findUnique({
                where: {
                    id: parent.categoryId,
                },
            }))!;
        },
        aliases: async (parent, args, context, info) => {
            return prisma.bookmarkAlias.findMany({
                where: {
                    bookmarkId: parent.id,
                },
            });
        },
    },
    Category: {
        rules: async (parent, args, context, info) => {
            return prisma.categoryPatternAlias.findMany({
                where: {
                    category: { id: parent.id },
                },
            });
        },
        users: async (parent, args, context, info) => {
            return prisma.userCategory.findMany({
                where: {
                    category: { id: parent.id },
                },
            });
        },
        isAdmin: async (parent, args, context, info) => {
            const count = await prisma.userCategory.count({
                where: {
                    category: { id: parent.id },
                    user: { id: context.user!.id },
                    admin: true,
                },
            });

            return Boolean(count);
        },
        isActive: async (parent, args, context, info) => {
            const count = await prisma.userCategory.count({
                where: {
                    category: { id: parent.id },
                    user: { id: context.user!.id },
                    active: true,
                },
            });

            return Boolean(count);
        },
    },
    User: {},
    UserCategory: {
        user: async (parent) => {
            const user = await prisma.userCategory
                .findUnique({
                    where: {
                        id: parent.id,
                    },
                })
                .user();
            return user!;
        },
    },
    Tag: {
        createdBy: async (parent) => {
            const user = await prisma.tag
                .findUnique({
                    where: {
                        id: parent.id,
                    },
                })
                .createdBy();
            return user!;
        },
        createdByCurrentUser: (parent, args, context) => {
            return parent.createdById === context.user!.id;
        },
    },
    Query,
    Mutation,
};

export { resolvers };
