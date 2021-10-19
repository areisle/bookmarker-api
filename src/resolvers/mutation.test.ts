// make sure users can't get categories they don't belong to

import { createUser } from "../auth";
import { prisma } from "../db";
import { server } from "..";
import { gql } from "apollo-server";

const mockRequest = (token: string = '') => ({
    req: {
        headers: {
            authorization: token
        }
    }
}) as any;

let userTokens: string[] = [];

beforeAll(async () => {
    // clear test db
    await prisma.user.deleteMany({});
    await prisma.category.deleteMany({});
    // cascade delete will take care of the rest

    // add test data
    // add a few test users
    await Promise.all(
        [1, 2, 3].map((num) => createUser(`test-user-${num}@email.ca`, `password-${num}`))
    );

    const getToken = async (user: number) => {
        return (await server.executeOperation({
            query: gql`
                mutation login($email: String!, $password: String!) {
                    login(email: $email, password: $password)
                }
                `,
            variables: {
                email: `test-user-${user}@email.ca`,
                password: `password-${user}`,
            },
        }, mockRequest())).data?.login;
    }

    userTokens = await Promise.all([1, 2, 3].map((num) => getToken(num)))
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
    let categoryId: number;
    let bookmarkId: number;

    beforeAll(async () => {
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
        categoryId = resp.data?.addCategory.id

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

        bookmarkId = response.data?.addBookmark.id
    })

    test("user can't get category", async () => {
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
    let categoryId: number;
    let bookmarkId: number;

    beforeAll(async () => {
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
        categoryId = response.data?.addCategory.id

        // add user
        response = await server.executeOperation({
            query: gql`
                mutation addUsers($categoryId: Int!, $emails: [String!]!) {
                    addUsers(categoryId: $categoryId, emails: $emails)
                }
            `,
            variables: {
                categoryId,
                emails: [`test-user-1@email.ca`]
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

        bookmarkId = response.data?.addBookmark.id
    })

    test("user can't get category", async () => {
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

    test.todo("user can reject invitation to join category");
    test.todo("user can accept invitation to join category");
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
