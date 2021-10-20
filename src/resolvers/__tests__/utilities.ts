import { createUser } from "../../auth";
import { v4 as uuid } from "uuid";
import { gql } from "apollo-server";
import { server } from "../..";
import { User } from ".prisma/client";

const createTestUser = async () => {
    const email = `test-user-${uuid()}@email.ca`;
    const user = await createUser(email, `password`);
    return user;
};

const createTestUserAndLogin = async () => {
    const user = await createTestUser();
    let token = (
        await server.executeOperation(
            {
                query: gql`
                    mutation login($email: String!, $password: String!) {
                        login(email: $email, password: $password)
                    }
                `,
                variables: {
                    email: user.email,
                    password: `password`,
                },
            },
            mockRequest()
        )
    ).data?.login;

    return [user, token] as [User, string];
};

const mockRequest = (token: string = "") =>
    ({
        req: {
            headers: {
                authorization: token,
            },
        },
    } as any);

export { createTestUser, mockRequest, createTestUserAndLogin };
