import { AuthenticationError } from "apollo-server";
import { prisma } from "../db";
import { Bookmark, Category, Resolvers } from "./generated";
import { checkIsBookmarked, getBookmarkIdsForUrl } from "./isBookmarked";
import { checkBelongsToCategory, strip } from "./helpers";


const Query: Resolvers['Query'] = {
    bookmarks: async (parent, args, context) => {
        if (!context.user) {
            throw new AuthenticationError("Authentication required");
        }
        const { categoryId, take = 100, skip = 0, orderBy, where } = strip(args);
        await checkBelongsToCategory({ context, categoryId });

        const total = await prisma.bookmark.count({
            where: {
                ...where,
                categoryId,
            },
        });

        const bookmarks = await prisma.bookmark.findMany({
            take,
            skip,
            orderBy: [
                ...orderBy,
                { id: 'desc' }
            ],
            where: {
                ...where,
                categoryId,
            },
        });

        return {
            data: bookmarks as Bookmark[],
            meta: {
                count: bookmarks.length,
                skip: skip,
                take: take,
                total,
            }
        }
    },
    tags: async (parent, args, context) => {
        if (!context.user) {
            throw new AuthenticationError("Authentication required");
        }
        const { categoryId, ...rest } = strip(args);
        await checkBelongsToCategory({ context, categoryId });

        const tags = await prisma.tag.groupBy({
            ...rest,
            where: {
                ...rest.where,
                categoryId,
            },
            by: ["name"],
            _count: {
                name: true,
            },
            orderBy: {
                _count: {
                    name: "desc",
                },
            },
        });
        return tags;
    },
    users: async (parent, args, context) => {
        if (!context.user) {
            throw new AuthenticationError("Authentication required");
        }
        const { categoryId } = args;
        await checkBelongsToCategory({ context, categoryId });

        return prisma.userCategory.findMany({
            where: {
                categoryId,
            },
        });
    },
    categories: async (parent, args, context, info) => {
        if (!context.user) {
            throw new AuthenticationError("Authentication required");
        }
        const { activeOnly, take = 100, skip = 0 } = strip(args);
        const filters = {
            users: {
                some: {
                    userId: context.user.id,
                    ...(activeOnly ? { active: true } : {})
                },
            },
        };

        const total = await prisma.category.count({
            where: filters,
        });

        const categories = await prisma.category.findMany({
            take,
            skip,
            where: filters,
        });

        return {
            data: categories as Category[],
            meta: {
                count: categories.length,
                total,
                skip,
                take,
            }
        }
    },
    category: async (parent, args, context, info) => {
        if (!context.user) {
            throw new AuthenticationError("Authentication required");
        }
        await checkBelongsToCategory({ context, categoryId: args.id });

        return prisma.category.findUnique({
            where: {
                id: args.id,
            },
        });
    },
    isBookmarked: async (parent, args, context) => {
        if (!context.user) {
            throw new AuthenticationError("Authentication required");
        }
        return checkIsBookmarked(context.user.id, args.url);
    },
    bookmarksForUrl: async (parent, args, context) => {
        if (!context.user) {
            throw new AuthenticationError("Authentication required");
        }
        const bookmarkIds = await getBookmarkIdsForUrl(
            context.user.id,
            args.url
        );

        return prisma.bookmark.findMany({
            where: {
                id: {
                    in: bookmarkIds,
                },
            },
        });
    },
    bookmark: async (parent, args, context) => {
        if (!context.user) {
            throw new AuthenticationError("Authentication required");
        }

        const bookmark = await prisma.bookmark.findUnique({
            where: {
                id: args.id,
            },
        });

        if (!bookmark) {
            return null;
        }

        await checkBelongsToCategory({
            context,
            categoryId: bookmark.categoryId,
        });

        return bookmark;
    },
};

export { Query };
