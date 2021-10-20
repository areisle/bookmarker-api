// make sure users can't get categories they don't belong to

import { gql } from "apollo-server";
import { prisma } from "../../db";
import { server } from "../..";
import { createTestUser, mockRequest } from "./utilities";
import { User } from ".prisma/client";

let testUser: User;

beforeAll(async () => {
    // clear test db
    // await prisma.user.deleteMany({});
    // await prisma.category.deleteMany({});
    // cascade delete will take care of the rest
    testUser = await createTestUser()
});

test("user can't login without account", async () => {
    const response = await server.executeOperation({
        query: gql`
            mutation login($email: String!, $password: String!) {
                login(email: $email, password: $password)
            }
            `,
        variables: {
            email: `test-user-7@email.ca`,
            password: 'password',
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
            email: testUser.email,
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
            email: testUser.email,
            password: 'password',
        },
    }, mockRequest());

    expect(typeof response.data?.login).toEqual('string');
});
