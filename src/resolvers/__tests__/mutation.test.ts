// make sure users can't get categories they don't belong to

import { prisma } from "../../db";
import { server } from "../..";
import { gql } from "apollo-server";
import { User } from ".prisma/client";
import { createTestUserAndLogin, mockRequest } from "./utilities";

let users: User[] = [];
let userTokens: string[] = [];

beforeAll(async () => {
    const usersAndTokens = await Promise.all(Array(3).fill(null).map(() => createTestUserAndLogin()));

    for (const [user, token] of usersAndTokens) {
        users.push(user);
        userTokens.push(token);
    }
});

test("user can create new categories", async () => {
    let resp = await server.executeOperation({
        query: gql`
            query categories {
                categories {
                    id
                    name
                }
            }
        `
    }, mockRequest(userTokens[0]));

    const prevCategoriesCount = resp.data?.categories.length;

    // add category
    await server.executeOperation({
        query: gql`
            mutation addCategory($name: String!) {
                addCategory(name: $name) {
                    id
                    name
                }
            }
        `,
        variables: {
            name: 'My Category Title'
        },
    }, mockRequest(userTokens[0]));

    resp = await server.executeOperation({
        query: gql`
            query categories {
                categories {
                    id
                    name
                }
            }
        `
    }, mockRequest(userTokens[0]));

    expect(resp.data?.categories.length).toEqual(prevCategoriesCount + 1)
});

describe("user doesn't belong to category", () => {
    const createCategory  = async () => {
        // add category for user 2
        const resp = await server.executeOperation({
            query: gql`
                mutation addCategory($name: String!) {
                    addCategory(name: $name) {
                        id
                        name
                    }
                }
            `,
            variables: {
                name: 'User 2s Private Category'
            },
        }, mockRequest(userTokens[1]));
        const categoryId = resp.data?.addCategory.id

        // add a bookmark
        let response = await server.executeOperation({
            query: gql`
                mutation addBookmark($input: CreateBookmarkContent!) {
                    addBookmark(input: $input) {
                        id
                    }
                }
            `,
            variables: {
                input: {
                    categoryId,
                    title: 'something',
                    url: 'https://test.com/something',
                    description: '',
                    tags: ['hello', 'world']
                }
            },
        }, mockRequest(userTokens[1]));

        const bookmarkId = response.data?.addBookmark.id
        return { categoryId, bookmarkId };
    }

    test("user can't get category", async () => {
        const { categoryId } = await createCategory();

        const response = await server.executeOperation({
            query: gql`
                query getCategory($id: Int!) {
                    category(id: $id) {
                        name
                    }
                }
            `,
            variables: {
                id: categoryId
            },
        }, mockRequest(userTokens[0]));

        expect(response.data?.category).toBeNull()
        expect(response.errors).toHaveLength(1)
        expect(response.errors?.[0].extensions?.code).toEqual('FORBIDDEN')
    });

    test("user can't add bookmarks", async () => {
        const { categoryId } = await createCategory();

        const response = await server.executeOperation({
            query: gql`
                mutation addBookmark($input: CreateBookmarkContent!) {
                    addBookmark(input: $input) {
                        id
                    }
                }
            `,
            variables: {
                input: {
                    categoryId,
                    title: 'something',
                    url: 'https://test.com/something',
                    description: '',
                    tags: ['hello', 'world']
                }
            },
        }, mockRequest(userTokens[0]));

        expect(response.data?.addBookmark).toBeNull()
        expect(response.errors).toHaveLength(1)
        expect(response.errors?.[0].extensions?.code).toEqual('FORBIDDEN')
    });

    test("user can't remove bookmarks", async () => {
        const { bookmarkId } = await createCategory();

        let response = await server.executeOperation({
            query: gql`
                mutation removeBookmark($id: Int!) {
                    removeBookmark(id: $id)
                }
            `,
            variables: {
                id: bookmarkId
            },
        }, mockRequest(userTokens[0]));

        expect(response.errors).toHaveLength(1)
        expect(response.errors?.[0].extensions?.code).toEqual('FORBIDDEN')
    });

    test("user can't add tags", async () => {
        const { bookmarkId } = await createCategory();
        let response = await server.executeOperation({
            query: gql`
                mutation addTag($bookmarkId: Int!, $name: String!) {
                    addTag(bookmarkId: $bookmarkId, name: $name)
                }
            `,
            variables: {
                bookmarkId,
                name: 'new tag'
            },
        }, mockRequest(userTokens[0]));

        expect(response.errors).toHaveLength(1)
        expect(response.errors?.[0].extensions?.code).toEqual('FORBIDDEN')
    });

    test("user can't remove tags", async () => {
        const { bookmarkId } = await createCategory();

        let response = await server.executeOperation({
            query: gql`
                mutation removeTag($bookmarkId: Int!, $name: String!) {
                    removeTag(bookmarkId: $bookmarkId, name: $name)
                }
            `,
            variables: {
                bookmarkId,
                name: 'hello'
            },
        }, mockRequest(userTokens[0]));

        expect(response.errors).toHaveLength(1)
        expect(response.errors?.[0].extensions?.code).toEqual('FORBIDDEN')
    });

    test("user can't invite users", async () => {
        const { categoryId } = await createCategory();

        let response = await server.executeOperation({
            query: gql`
                mutation addUsers($categoryId: Int!, $emails: [String!]!) {
                    addUsers(categoryId: $categoryId, emails: $emails)
                }
            `,
            variables: {
                categoryId,
                emails: [`test-user-3@email.ca`]
            },
        }, mockRequest(userTokens[0]));

        expect(response.errors).toHaveLength(1)
        expect(response.errors?.[0].extensions?.code).toEqual('FORBIDDEN')

    });
});

describe("user is invited to category", () => {
    const createCategory  = async () => {
        // add category for user 2
        let response = await server.executeOperation({
            query: gql`
                mutation addCategory($name: String!) {
                    addCategory(name: $name) {
                        id
                        name
                    }
                }
            `,
            variables: {
                name: 'User 2s Private Category'
            },
        }, mockRequest(userTokens[1]));
        const categoryId = response.data?.addCategory.id

        response = await server.executeOperation({
            query: gql`
                mutation addUsers($categoryId: Int!, $emails: [String!]!) {
                    addUsers(categoryId: $categoryId, emails: $emails)
                }
            `,
            variables: {
                categoryId,
                emails: [users[0].email]
            },
        }, mockRequest(userTokens[1]));

        // add a bookmark
        response = await server.executeOperation({
            query: gql`
                mutation addBookmark($input: CreateBookmarkContent!) {
                    addBookmark(input: $input) {
                        id
                    }
                }
            `,
            variables: {
                input: {
                    categoryId,
                    title: 'something',
                    url: 'https://test.com/something',
                    description: '',
                    tags: ['hello', 'world']
                }
            },
        }, mockRequest(userTokens[1]));

        const bookmarkId = response.data?.addBookmark.id
        return { categoryId, bookmarkId };
    }

    test("user can get category", async () => {
        const { categoryId } = await createCategory();

        const response = await server.executeOperation({
            query: gql`
                query getCategory($id: Int!) {
                    category(id: $id) {
                        name
                    }
                }
            `,
            variables: {
                id: categoryId
            },
        }, mockRequest(userTokens[0]));

        expect(response.data?.category).not.toBeNull()
        expect(response.errors).toBeUndefined()
    });

    test("user can't add bookmarks", async () => {
        const { categoryId } = await createCategory();

        const response = await server.executeOperation({
            query: gql`
                mutation addBookmark($input: CreateBookmarkContent!) {
                    addBookmark(input: $input) {
                        id
                    }
                }
            `,
            variables: {
                input: {
                    categoryId,
                    title: 'something',
                    url: 'https://test.com/something',
                    description: '',
                    tags: ['hello', 'world']
                }
            },
        }, mockRequest(userTokens[0]));

        expect(response.data?.addBookmark).toBeNull()
        expect(response.errors).toHaveLength(1)
        expect(response.errors?.[0].extensions?.code).toEqual('FORBIDDEN')
    });

    test("user can't remove bookmarks", async () => {
        const { bookmarkId } = await createCategory();

        let response = await server.executeOperation({
            query: gql`
                mutation removeBookmark($id: Int!) {
                    removeBookmark(id: $id)
                }
            `,
            variables: {
                id: bookmarkId
            },
        }, mockRequest(userTokens[0]));

        expect(response.errors).toHaveLength(1)
        expect(response.errors?.[0].extensions?.code).toEqual('FORBIDDEN')
    });

    test("user can't add tags", async () => {
        const { bookmarkId } = await createCategory();

        let response = await server.executeOperation({
            query: gql`
                mutation addTag($bookmarkId: Int!, $name: String!) {
                    addTag(bookmarkId: $bookmarkId, name: $name)
                }
            `,
            variables: {
                bookmarkId,
                name: 'new tag'
            },
        }, mockRequest(userTokens[0]));

        expect(response.errors).toHaveLength(1)
        expect(response.errors?.[0].extensions?.code).toEqual('FORBIDDEN')
    });

    test("user can't remove tags", async () => {
        const { bookmarkId } = await createCategory();

        let response = await server.executeOperation({
            query: gql`
                mutation removeTag($bookmarkId: Int!, $name: String!) {
                    removeTag(bookmarkId: $bookmarkId, name: $name)
                }
            `,
            variables: {
                bookmarkId,
                name: 'hello'
            },
        }, mockRequest(userTokens[0]));

        expect(response.errors).toHaveLength(1)
        expect(response.errors?.[0].extensions?.code).toEqual('FORBIDDEN')
    });

    test("user can't invite users", async () => {
        const { categoryId } = await createCategory();

        let response = await server.executeOperation({
            query: gql`
                mutation addUsers($categoryId: Int!, $emails: [String!]!) {
                    addUsers(categoryId: $categoryId, emails: $emails)
                }
            `,
            variables: {
                categoryId,
                emails: [`test-user-3@email.ca`]
            },
        }, mockRequest(userTokens[0]));

        expect(response.errors).toHaveLength(1)
        expect(response.errors?.[0].extensions?.code).toEqual('FORBIDDEN')

    });

    test("user can reject invitation to join category", async () => {
        const { categoryId } = await createCategory();

        let resp = await server.executeOperation({
            query: gql`
                query categories {
                    categories {
                        id
                        name
                    }
                }
            `
        }, mockRequest(userTokens[0]));

        const prevCategoriesCount = resp.data?.categories.length;

        let response = await server.executeOperation({
            query: gql`
                mutation leaveCategory($id: Int!) {
                    leaveCategory(id: $id)
                }
            `,
            variables: {
                id: categoryId,
            },
        }, mockRequest(userTokens[0]));

        expect(response.errors).toBeUndefined()

        resp = await server.executeOperation({
            query: gql`
                query categories {
                    categories {
                        id
                        name
                    }
                }
            `
        }, mockRequest(userTokens[0]));

        expect(resp.data?.categories.length).toEqual(prevCategoriesCount - 1)
    });

    test("user can accept invitation to join category", async () => {
        const { categoryId } = await createCategory();

        await server.executeOperation({
            query: gql`
                mutation ($id: Int!) {
                    joinCategory(id: $id)
                }
            `,
            variables: { id: categoryId }
        }, mockRequest(userTokens[0]));

        const userCategory = await prisma.userCategory.findFirst({
            where: {
                userId: users[0].id,
                categoryId,
            }
        })

        expect(userCategory?.active).toEqual(true);

    });
});

describe("user is active for category", () => {
    test.todo("user can get category");
    test.todo("user can add bookmarks");
    test.todo("user can remove bookmarks");
    test.todo("user can't remove bookmark with tags by another user");
    test.todo("user can add tags");
    test.todo("user can remove tags");
    test.todo("user can't invite users");

    describe("category has only one user", () => {
        test.todo("user can delete category");
    });

    describe("category has multiple users", () => {
        test.todo("user can leave category");
        test.todo("user can't delete category");
    });
});

describe("user is admin for category", () => {
    test.todo("user can get category");
    test.todo("user can add bookmarks");
    test.todo("user can remove bookmarks");
    test.todo("user can't remove bookmark with tags by another user");
    test.todo("user can add tags");
    test.todo("user can remove tags");
    test.todo("user can invite users");

    describe("category has only one user", () => {
        test.todo("user can delete category");
    });

    describe("category has multiple users", () => {
        test.todo("user can leave category");
        test.todo("user can't delete category");
    });
});
