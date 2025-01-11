import { db } from "../db";

type NonNull<P> = P extends Promise<infer U>
    ? Promise<Exclude<U, null>>
    : Exclude<P, null>;

type NonNullValues<Obj> = {
    [K in keyof Obj]: NonNull<Obj[K]>;
};

function strip<Obj>(object: Obj): NonNullValues<Obj> {
    const next = {} as NonNullValues<Obj>;
    for (const [key, value] of Object.entries(object as any)) {
        if (value !== undefined && value !== null) {
            next[key] = value;
        }
    }
    return next;
}

const cleanText = (text: string) => text.trim().replace(/[\|\&\=\!\~\<\>\,\$\]\[]/gi, '');
const arrayToString = (array: any[]) => array.map(v => `"${v}"`).join(', ');

function getCanonicalUrl(urlString: string) {
    let url = urlString.replace(/\/$/, '');
    const parsed = new URL(url);
    const domain = parsed.host.split('.').slice(-2)[0];
    if (domain !== 'dramanice') {
        return {
            url,
            canonical: url,
            filters: { url }
        }
    }
    // remove episode suffix and starting slash
    let path = parsed.pathname.replace(/-episode-\d+$/, '').replace(/^\//, '');
    return {
        url,
        canonical: `${parsed.origin}/${path}`,
        filters: {
            AND: [
                {
                    url: { contains: '.dramanice.' }
                },
                {
                    url: { endsWith: path }
                }
            ]
        }
    }

}

async function isAnyBookmarked(urls: string[], exceptIds: number[] | null = null) {
    const conditions: any[] = [];

    if (!urls.length) { return []; }

    for (const url of urls) {
        const parsed = getCanonicalUrl(url)
        conditions.push(parsed.filters)
    }

    const links = await db.link.findMany({
        where: { AND: [
            { OR: conditions },
            { NOT: { dramaId: { in: exceptIds || [] } }}
        ] }
    });
    if (links.length > urls.length) {
        throw new Error(`Multiple dramas found with same link. ${links.map(link => link.url).join(',')}`)
    }
    return links;
}

export enum DRAMA_STATUS {
    COMPLETED = 'Completed',
    COMPLETED_MISSING_SUBS = 'Completed - Missing Subs',
    ONGOING = 'Ongoing',
    UPCOMING = 'Upcoming',
}

export enum WATCHED_STATUS {
    YES = 'yes',
    NO = 'no',
    MAYBE = 'maybe',
    DROPPED = 'dropped',
}

export enum COUNTRY {
    CHINA = 'China',
    KOREA = 'South Korea',
    JAPAN = 'Japan',
    TAIWAN = 'Taiwan',
    THAILAND = 'Thailand',
    HONG_KONG = 'Hong Kong',
    PHILIPPINES = 'Philippines',
    Other = 'Other',
}

export { strip, cleanText, arrayToString, isAnyBookmarked, getCanonicalUrl };
