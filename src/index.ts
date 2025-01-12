import { ApolloServer, AuthenticationError } from "apollo-server";
import { typeDefs } from "./typeDefs";
import { resolvers } from "./resolvers";
import { db } from "./db";
import { RequestContext } from "./resolvers/generated/utilities";

export const server = new ApolloServer({
    typeDefs,
    resolvers,
    context: async ({ req }): Promise<RequestContext> => {
        let email: string | undefined = req?.headers.authorization ?? req?.headers.Authorization?.[0];

        if (process.env.NODE_ENV === 'development' && process.env.AUTH_EMAIL) {
            email = process.env.AUTH_EMAIL;
        }

        if (!email) {
            throw new AuthenticationError(`no auth header found ${email}`)
        }
        const user = await db.user.findUniqueOrThrow({
            where: {
                email,
            },
        });

        // Add the user to the context
        return { user };
    },
});


if (process.env.NODE_ENV !== 'test') {
    // The `listen` method launches a web server.
    server.listen({ port: process.env.PORT || 4000 }).then(({ url }) => {
        console.log(`🚀  Server ready at ${url}`);
    });
}