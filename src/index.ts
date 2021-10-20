import { ApolloServer, AuthenticationError } from "apollo-server";
import { typeDefs } from "./typeDefs";
import { resolvers } from "./resolvers";
import { prisma } from "./db";
import { RequestContext } from "./resolvers/generated/utilities";
import { authenticateToken } from "./auth";

export const server = new ApolloServer({
    typeDefs,
    resolvers,
    context: async ({ req }): Promise<RequestContext> => {
        const token = req?.headers.authorization;

        let email = '';

        if (process.env.NODE_ENV === 'development' && process.env.AUTH_EMAIL) {
            email = process.env.AUTH_EMAIL;
        } else {
            if (!token) {
                return { user: null };
            }

            ({ email } = authenticateToken(token));
        }

        const user = await prisma.user.findFirst({
            where: {
                email,
            },
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
