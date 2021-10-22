import { AuthenticationError, UserInputError } from "apollo-server";
import { login } from "../auth";
import { prisma } from "../db";
import { Resolvers } from "./generated";
import { checkBelongsToCategory, strip } from "./helpers";

const Mutation: Resolvers["Mutation"] = {
    addTag: async (parent, args, context) => {
        if (!context.user) {
            throw new AuthenticationError("Authentication required");
        }
        const bookmark = await prisma.bookmark.findUnique({
            where: {
                id: args.bookmarkId,
            },
        });

        if (!bookmark) {
            throw new UserInputError("Bookmark not found.");
        }

        await checkBelongsToCategory({
            context,
            categoryId: bookmark.categoryId,
            requireActive: true,
        });

        await prisma.tag.create({
            data: {
                name: args.name,
                category: { connect: { id: bookmark.categoryId } },
                bookmark: { connect: { id: args.bookmarkId } },
                createdBy: { connect: { id: context.user.id } },
            },
        });
    },
    removeTag: async (parent, args, context) => {
        if (!context.user) {
            throw new AuthenticationError("Authentication required");
        }

        const bookmark = await prisma.bookmark.findUnique({
            where: {
                id: args.bookmarkId,
            },
        });

        if (!bookmark) {
            throw new UserInputError("Bookmark not found.");
        }

        await checkBelongsToCategory({
            context,
            categoryId: bookmark.categoryId,
            requireActive: true,
        });

        return prisma.tag.deleteMany({
            where: {
                bookmarkId: args.bookmarkId,
                createdById: context.user.id,
                name: args.name,
            },
        });
    },
    addCategory: async (_, args, context) => {
        if (!context.user) {
            throw new AuthenticationError("Authentication required");
        }
        return prisma.category.create({
            data: {
                name: args.name,
                users: {
                    create: [
                        {
                            user: { connect: { id: context.user.id } },
                            active: true,
                            admin: true,
                        },
                    ],
                },
            },
        });
    },
    joinCategory: async (_, args, context) => {
        if (!context.user) {
            throw new AuthenticationError("Authentication required");
        }

        await checkBelongsToCategory({
            categoryId: args.id,
            context,
        })

        await prisma.userCategory.update({
            where: {
                userId_categoryId: {
                    categoryId: args.id,
                    userId: context.user.id,
                }
            },
            data: {
                active: true
            }
        })
    },
    leaveCategory: async (_, args, context) => {
        if (!context.user) {
            throw new AuthenticationError("Authentication required");
        }
        const users = await prisma.userCategory.findMany({
            where: {
                categoryId: args.id,
            },
        });

        if (users.length === 1 && users[0].userId === context.user.id) {
            // user is only user in category. delete entire category
            await prisma.category.delete({
                where: {
                    id: args.id,
                },
            });
        } else {
            // delete user from category
            await prisma.userCategory.deleteMany({
                where: {
                    userId: context.user.id,
                    categoryId: args.id,
                },
            });
        }
    },
    addUsers: async (_, args, context) => {
        if (!context.user) {
            throw new AuthenticationError("Authentication required");
        }
        await checkBelongsToCategory({
            context,
            categoryId: args.categoryId,
            requireActive: true,
            requireAdmin: true,
        });

        const promises = args.emails.map((email) => {
            return prisma.userCategory.create({
                data: {
                    user: {
                        connectOrCreate: {
                            where: {
                                email,
                            },
                            create: {
                                email,
                            },
                        },
                    },
                    category: {
                        connect: {
                            id: args.categoryId,
                        },
                    },
                },
            });
        });
        await Promise.all(promises);
    },
    removeUser: async (_, args, context) => {
        if (!context.user) {
            throw new AuthenticationError("Authentication required");
        }
        await checkBelongsToCategory({
            context,
            categoryId: args.categoryId,
            requireActive: true,
            requireAdmin: true,
        });

        await prisma.userCategory.delete({
            where: {
                id: args.id,
            },
        });
    },
    login: async (_, args, context) => {
        return login(args.email, args.password);
    },
    addBookmark: async (_, args, context) => {
        const userId = context.user?.id;
        if (!userId) {
            throw new AuthenticationError("Authentication required");
        }
        const { tags, categoryId, ...rest } = strip(args.input);
        await checkBelongsToCategory({
            context,
            categoryId,
            requireActive: true,
        });

        return prisma.bookmark.create({
            data: {
                ...rest,
                categoryId,
                tags: {
                    createMany: {
                        data: (tags ?? []).map((name) => ({
                            name,
                            createdById: userId,
                            categoryId,
                        })),
                    },
                },
            },
        });
    },
    removeBookmark: async (_, args, context) => {
        if (!context.user) {
            throw new AuthenticationError("Authentication required");
        }

        const bookmark = await prisma.bookmark.findUnique({
            where: {
                id: args.id,
            },
        });

        if (!bookmark) {
            throw new UserInputError("Unable to find bookmark with given id.");
        }

        await checkBelongsToCategory({
            context,
            categoryId: bookmark.categoryId,
            requireActive: true,
        });

        const tagsByOtherUsers = await prisma.tag.count({
            where: {
                bookmarkId: args.id,
                createdById: {
                    not: context.user.id,
                },
            },
        });

        if (tagsByOtherUsers) {
            throw new UserInputError(
                "Cannot remove bookmark that has tags written by another user."
            );
        }

        await prisma.bookmark.delete({
            where: {
                id: args.id,
            },
        });
    },
    updateBookmark: async (_, args, context) => {
        const userId = context.user?.id;

        if (!userId) {
            throw new AuthenticationError("Authentication required");
        }

        const bookmark = await prisma.bookmark.findUnique({
            where: {
                id: args.bookmarkId,
            },
        });

        if (!bookmark) {
            throw new UserInputError("Unable to find bookmark with given id.");
        }

        await checkBelongsToCategory({
            context,
            categoryId: bookmark.categoryId,
            requireActive: true,
        });

        // @ts-ignore
        await prisma.$transaction(async (transaction: typeof prisma) => {
            let { tags, aliases, ...rest } = strip(args.input);

            if (aliases) {
                await transaction.bookmarkAlias.deleteMany({
                    where: {
                        bookmarkId: args.bookmarkId,
                        url: {
                            notIn: aliases,
                        },
                    },
                });

                // create missing aliases
                await Promise.all(
                    aliases.map((url) =>
                        transaction.bookmarkAlias.upsert({
                            where: {
                                bookmarkId_url: {
                                    bookmarkId: args.bookmarkId,
                                    url,
                                },
                            },
                            update: {},
                            create: {
                                url,
                                bookmark: {
                                    connect: { id: args.bookmarkId },
                                },
                            },
                        })
                    )
                );
            }

            if (tags) {
                tags = tags.map((tag) => tag.toLowerCase());
                // delete removed tags
                await prisma.tag.deleteMany({
                    where: {
                        bookmarkId: args.bookmarkId,
                        createdById: userId,
                        name: {
                            notIn: tags,
                        },
                    },
                });

                // create added tags
                await Promise.all(
                    tags.map((name) =>
                        transaction.tag.upsert({
                            where: {
                                bookmarkId_name_createdById: {
                                    bookmarkId: args.bookmarkId,
                                    createdById: userId,
                                    name,
                                },
                            },
                            update: {},
                            create: {
                                name,
                                createdBy: {
                                    connect: { id: userId },
                                },
                                bookmark: {
                                    connect: { id: args.bookmarkId },
                                },
                                category: {
                                    connect: { id: bookmark.categoryId },
                                },
                            },
                        })
                    )
                );
            }

            await transaction.bookmark.update({
                where: { id: args.bookmarkId },
                data: rest,
            });
        });
    },
    addCategoryPatternAlias: async (_, args, context) => {
        const userId = context.user?.id;
        const { categoryId, input } = args;

        if (!userId) {
            throw new AuthenticationError("Authentication required");
        }

        await checkBelongsToCategory({
            context,
            categoryId,
            requireAdmin: true,
            requireActive: true,
        });

        try {
            // test valid regex
            new RegExp(`^${input.match}$`);
        } catch {
            throw new UserInputError(
                `Unable to add pattern alias. "match" is invalid. ${input.match} is not a valid regular expression.`
            );
        }

        await prisma.categoryPatternAlias.create({
            data: {
                category: { connect: { id: categoryId } },
                ...input,
            },
        });
    },
    removeCategoryPatternAlias: async (_, args, context) => {
        const userId = context.user?.id;
        const { id } = args;

        if (!userId) {
            throw new AuthenticationError("Authentication required");
        }

        const alias = await prisma.categoryPatternAlias.findUnique({
            where: { id: args.id },
        });

        if (!alias) {
            throw new UserInputError(
                `Unable to find pattern alias record with id: ${id}`
            );
        }

        await checkBelongsToCategory({
            context,
            categoryId: alias?.categoryId,
            requireAdmin: true,
            requireActive: true,
        });

        await prisma.categoryPatternAlias.delete({
            where: {
                id: args.id,
            },
        });
    },
    updateCategoryPatternAlias: async (_, args, context) => {
        const userId = context.user?.id;
        const { id } = args;
        const input = strip(args.input);

        if (!userId) {
            throw new AuthenticationError("Authentication required");
        }

        const alias = await prisma.categoryPatternAlias.findUnique({
            where: { id: args.id },
        });

        if (!alias) {
            throw new UserInputError(
                `Unable to find pattern alias record with id: ${id}`
            );
        }

        await checkBelongsToCategory({
            context,
            categoryId: alias?.categoryId,
            requireAdmin: true,
            requireActive: true,
        });

        try {
            // test valid regex
            if (input.match) {
                new RegExp(`^${input.match}$`);
            }
        } catch {
            throw new UserInputError(
                `Unable to update pattern alias. "match" is invalid. ${input.match} is not a valid regular expression.`
            );
        }

        await prisma.categoryPatternAlias.update({
            where: {
                id: args.id,
            },
            data: input,
        });
    },
};

export { Mutation };
