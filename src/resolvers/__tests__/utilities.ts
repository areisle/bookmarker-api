import { v4 as uuid } from "uuid";
import { gql } from "apollo-server";
import { server } from "../..";
import { User } from ".prisma/client";
import { prisma } from "../../db";

const createTestUser = async () => {
    const email = `test-user-${uuid()}@email.ca`;
    const user = await prisma.user.create({
        data: { email }
    })
    return user;
};


const mockRequest = (token: string = "") =>
    ({
        req: {
            headers: {
                authorization: token,
            },
        },
    } as any);

export { createTestUser, mockRequest };
