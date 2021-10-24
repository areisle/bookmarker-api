import { ApolloServer, AuthenticationError } from "apollo-server";
import { typeDefs } from "./typeDefs";
import { resolvers } from "./resolvers";
import { prisma } from "./db";
import { RequestContext } from "./resolvers/generated/utilities";
import { verifyToken } from "./firebase";

export const server = new ApolloServer({
    typeDefs,
    resolvers,
    context: async ({ req }): Promise<RequestContext> => {
        const token = req?.headers.authorization;

        let email: string | undefined = '';

        if (process.env.NODE_ENV === 'development' && process.env.AUTH_EMAIL) {
            email = process.env.AUTH_EMAIL;
        } else {
            if (!token) {
                return { user: null };
            }

            try {
                ({ email } = await verifyToken(token));
            } catch (e) {
                throw new AuthenticationError(`Unable to authenticate user. ${(e as Error).message}`)
            }

            if (!email) {
                return { user: null };
            }
        }

        const user = await prisma.user.upsert({
            where: {
                email,
            },
            create: {
                email,
            },
            update: {},
        });

        // Add the user to the context
        return { user: user };
    },
});


if (process.env.NODE_ENV !== 'test') {
    // The `listen` method launches a web server.
    server.listen({ port: process.env.PORT || 4000 }).then(({ url }) => {
        console.log(`🚀  Server ready at ${url}`);
    });
}
