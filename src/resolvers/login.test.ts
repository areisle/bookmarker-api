// make sure users can't get categories they don't belong to

import { gql } from "apollo-server";
import { createUser } from "../auth";
import { prisma } from "../db";
import { server } from "..";

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
});

const mockRequest = (token: string = '') => ({
    req: {
        headers: {
            authorization: token
        }
    }
}) as any;

test("user can't login without account", async () => {
    const response = await server.executeOperation({
        query: gql`
            mutation login($email: String!, $password: String!) {
                login(email: $email, password: $password)
            }
            `,
        variables: {
            email: `test-user-7@email.ca`,
            password: 'password-1',
        },
    }, mockRequest());

    expect(response.data).toBeNull()
    expect(response.errors).toHaveLength(1)
    expect(response.errors?.[0].message).toMatch(/Unable to find user/)
});

test("user can't login with incorrect password", async () => {
    const response = await server.executeOperation({
        query: gql`
            mutation login($email: String!, $password: String!) {
                login(email: $email, password: $password)
            }
            `,
        variables: {
            email: `test-user-1@email.ca`,
            password: 'password-2',
        },
    }, mockRequest());

    expect(response.data).toBeNull()
    expect(response.errors).toHaveLength(1)
    expect(response.errors?.[0].message).toMatch(/Invalid password/)
});

test("user can login", async () => {
    const response = await server.executeOperation({
        query: gql`
            mutation login($email: String!, $password: String!) {
                login(email: $email, password: $password)
            }
            `,
        variables: {
            email: `test-user-1@email.ca`,
            password: 'password-1',
        },
    }, mockRequest());

    expect(typeof response.data?.login).toEqual('string');
});
