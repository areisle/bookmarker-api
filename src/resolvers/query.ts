import { AuthenticationError } from "apollo-server";
import { prisma } from "../db";
import { Resolvers } from "./generated";
import { checkIsBookmarked, getBookmarkIdsForUrl } from "./isBookmarked";
import { checkBelongsToCategory, strip } from "./helpers";

const Query: Resolvers['Query'] = {
    bookmarks: async (parent, args, context) => {
        if (!context.user) {
            throw new AuthenticationError("Authentication required");
        }
        const { categoryId, ...rest } = strip(args);
        await checkBelongsToCategory({ context, categoryId });

        return prisma.bookmark.findMany({
            ...rest,
            where: {
                ...rest.where,
                categoryId,
            },
        });
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
    categories: (parent, args, context, info) => {
        if (!context.user) {
            throw new AuthenticationError("Authentication required");
        }
        const rest = strip(args);
        return prisma.category.findMany({
            ...rest,
            where: {
                users: {
                    some: {
                        userId: context.user.id,
                    },
                },
            },
        });
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
