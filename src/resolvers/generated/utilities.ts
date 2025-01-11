interface RequestContext {
    user: {
        id: number;
        email: string;
        admin: boolean;
    } | null;
}

export type { RequestContext };
