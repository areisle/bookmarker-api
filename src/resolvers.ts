import { AuthenticationError, ForbiddenError, UserInputError } from "apollo-server";
import { login } from "./auth";
import { prisma } from "./db";
import { Resolvers } from "./generated";
import { RequestContext } from "./generated/utilities";
import { checkIsBookmarked, getBookmarkIdsForUrl } from "./isBookmarked";

type NonNull<P> = P extends Promise<infer U>
    ? Promise<Exclude<U, null>>
    : Exclude<P, null>;

type NonNullValues<Obj> = {
    [K in keyof Obj]: NonNull<Obj[K]>;
};

function strip<Obj>(object: Obj): NonNullValues<Obj> {
    const next = {} as NonNullValues<Obj>;
    for (const [key, value] of Object.entries(object)) {
        if (value !== undefined && value !== null) {
            next[key] = value;
        }
    }
    return next;
}

interface CheckArgs {
    context: RequestContext;
    categoryId: number;
    requireAdmin?: boolean;
    allowInactive?: boolean;
}

const checkBelongsToCategory = async (args: CheckArgs) => {
    const { context, categoryId, requireAdmin, allowInactive } = args;

    if (!context.user) {
        throw new AuthenticationError('Authentication required')
    }
    const user = await prisma.userCategory.findUnique({
        where: {
            userId_categoryId: {
                userId: context.user.id,
                categoryId,
            },
        },
    });

    if (
        !user ||
        (!allowInactive && !user.active) ||
        (requireAdmin && !user.admin)
    ) {
        throw new ForbiddenError("User does not belong to category.");
    }
};

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
        category: async (parent, args, context, info) => {
            return (await prisma.category.findUnique({
                where: {
                    id: parent.categoryId,
                },
            }))!;
        },
    },
    Category: {},
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
    Query: {
        bookmarks: async (parent, args, context) => {
            if (!context.user) {
                throw new AuthenticationError('Authentication required')
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
                throw new AuthenticationError('Authentication required')
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
                throw new AuthenticationError('Authentication required')
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
                throw new AuthenticationError('Authentication required')
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
                throw new AuthenticationError('Authentication required')
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
                throw new AuthenticationError('Authentication required')
            }
            return checkIsBookmarked(context.user.id, args.url);
        },
        bookmarksForUrl:  async (parent, args, context) => {
            if (!context.user) {
                throw new AuthenticationError('Authentication required')
            }
            const bookmarkIds = await getBookmarkIdsForUrl(context.user.id, args.url);

            return prisma.bookmark.findMany({
                where: {
                    id: {
                        in: bookmarkIds
                    }
                }
            })
        },
        bookmark:  async (parent, args, context) => {
            if (!context.user) {
                throw new AuthenticationError('Authentication required')
            }

            const bookmark = await prisma.bookmark.findUnique({
                where: {
                    id: args.id
                }
            })

            if (!bookmark) {
                return null;
            }

            await checkBelongsToCategory({ context, categoryId: bookmark.categoryId });

            return bookmark;
        },
    },
    Mutation: {
        addTag: async (parent, args, context) => {
            if (!context.user) {
                throw new AuthenticationError('Authentication required')
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
                throw new AuthenticationError('Authentication required')
            }
            return prisma.tag.delete({
                where: {
                    bookmarkId_name_createdById: {
                        bookmarkId: args.bookmarkId,
                        createdById: context.user.id,
                        name: args.name,
                    },
                },
            });
        },
        addCategory: async (_, args, context) => {
            if (!context.user) {
                throw new AuthenticationError('Authentication required')
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
        leaveCategory: async (_, args, context) => {
            if (!context.user) {
                throw new AuthenticationError('Authentication required')
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
                throw new AuthenticationError('Authentication required')
            }
            await checkBelongsToCategory({
                context,
                categoryId: args.categoryId,
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
                throw new AuthenticationError('Authentication required')
            }
            await checkBelongsToCategory({
                context,
                categoryId: args.categoryId,
                requireAdmin: true,
            });

            await prisma.userCategory.delete({
                where: {
                    id: args.id,
                },
            });
        },
        login: async (_, args, context) => {
            return login(args.email, args.password)
        },
        addBookmark: async (_, args, context) => {
            const userId = context.user?.id;
            if (!userId) {
                throw new AuthenticationError('Authentication required')
            }
            const { tags, categoryId, ...rest } = strip(args.input);
            await checkBelongsToCategory({
                context,
                categoryId,
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
                            }))
                        }
                    }
                }
            })
        },
        removeBookmark: async (_, args, context) => {
            if (!context.user) {
                throw new AuthenticationError('Authentication required')
            }

            const bookmark = await prisma.bookmark.findUnique({
                where: {
                    id: args.id,
                }
            });

            if (!bookmark) {
                throw new UserInputError('Unable to find bookmark with given id.');
            }

            await checkBelongsToCategory({
                context,
                categoryId: bookmark.categoryId,
            });

            const tagsByOtherUsers = await prisma.tag.count({
                where: {
                    bookmarkId: args.id,
                    createdById: {
                        not: context.user.id
                    }
                }
            });

            if (tagsByOtherUsers) {
                throw new UserInputError('Cannot remove bookmark that has tags written by another user.');
            }

            await prisma.bookmark.delete({
                where: {
                    id: args.id,
                }
            });
        },
        updateBookmark: async (_, args, context) => {
            const userId = context.user?.id;

            if (!userId) {
                throw new AuthenticationError('Authentication required')
            }

            const bookmark = await prisma.bookmark.findUnique({
                where: {
                    id: args.bookmarkId,
                }
            });

            if (!bookmark) {
                throw new UserInputError('Unable to find bookmark with given id.');
            }

            await checkBelongsToCategory({
                context,
                categoryId: bookmark.categoryId,
            });

            // @ts-ignore
            await prisma.$transaction(async (transaction: typeof prisma) => {
                let { tags = [], ...rest } = strip(args.input);

                if (tags.length) {
                    tags = tags.map((tag) => tag.toLowerCase())
                    // delete removed tags
                    await prisma.tag.deleteMany({
                        where: {
                            bookmarkId: args.bookmarkId,
                            createdById: userId,
                            name: {
                                notIn: tags
                            }
                        }
                    });

                    // create added tags
                    await Promise.all(tags.map((name) => transaction.tag.upsert({
                        where: {
                            bookmarkId_name_createdById: {
                                bookmarkId: args.bookmarkId,
                                createdById: userId,
                                name,
                            }
                        },
                        update: {},
                        create: {
                            name,
                            createdBy: {
                                connect: { id: userId }
                            },
                            bookmark: {
                                connect: { id: args.bookmarkId }
                            },
                            category: {
                                connect: { id: bookmark.categoryId }
                            }
                        }
                    })));
                }

                await transaction.bookmark.update({
                    where: { id: args.bookmarkId },
                    data: rest
                });
            })
        }
    },
};

export { resolvers };
