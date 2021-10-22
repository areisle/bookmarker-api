import { AuthenticationError, ForbiddenError } from "apollo-server";
import { prisma } from "../db";
import { RequestContext } from "./generated/utilities";

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
    requireActive?: boolean;
}

const checkBelongsToCategory = async (args: CheckArgs) => {
    const { context, categoryId, requireAdmin, requireActive } = args;

    if (!context.user) {
        throw new AuthenticationError("Authentication required");
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
        (requireActive && !user.active) ||
        (requireAdmin && !user.admin)
    ) {
        throw new ForbiddenError("User does not belong to category.");
    }
};

export { checkBelongsToCategory, strip };
