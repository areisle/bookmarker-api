import { Prisma } from "@prisma/client";
import { URL } from "url";
import { prisma } from "./db";



const getCanonicalUrls = async (userId: number, url: string) => {
    const parsedUrl = new URL(url);

    type AliasResult = {
        match: string;
        canonical: string;
    }[]

    const aliasPatterns = await prisma.$queryRaw<AliasResult>`
        SELECT
            match, canonical
        FROM
            "CategoryPatternAlias"
            JOIN "Category" ON "CategoryPatternAlias"."categoryId" = "Category".id
            JOIN "UserCategory" ON "UserCategory"."categoryId" = "Category".id
        WHERE
            "UserCategory"."userId" = ${userId}
            AND "CategoryPatternAlias".origin = ${parsedUrl.origin};
    `;

    const aliasMatchedUrls: string[] = []

    for (const { match, canonical } of aliasPatterns) {
        const matched = parsedUrl.pathname.match(new RegExp(`^${match}$`));

        if (matched) {
            // build canonical url
            let newUrl = canonical
            for (const [name, value] of Object.entries(matched.groups ?? {})) {
                newUrl = newUrl.replace('${' + name + '}', value)
            }

            newUrl = parsedUrl.origin + newUrl

            aliasMatchedUrls.push(newUrl);
        }
    }

    return aliasMatchedUrls;
}

const bookmarksQuery = async (userId: number, urls: string[]) => {
    const result = await prisma.$queryRaw<{ id: number }[]>`
        SELECT
            "Bookmark".id
        FROM
            "Bookmark"
            JOIN "Category" ON "Bookmark"."categoryId" = "Category".id
            JOIN "UserCategory" ON "UserCategory"."categoryId" = "Category".id
            LEFT JOIN "BookmarkAlias" on "Bookmark".id = "BookmarkAlias"."bookmarkId"
        WHERE
            "UserCategory"."userId" = ${userId}
            AND (
                "Bookmark".url in (${Prisma.join(urls)})
                OR "BookmarkAlias".url in (${Prisma.join(urls)})
            )
    `;

    return result.map((bookmark) => bookmark.id);
}

const getBookmarkIdsForUrl = async (userId: number, url: string) => {
    let bookmarks = await bookmarksQuery(userId, [url])

    if (bookmarks.length) {
        return bookmarks
    }

    const aliasMatchedUrls  = await getCanonicalUrls(userId, url);

    if (aliasMatchedUrls.length) {
        // check if any of these are bookmarked
        return bookmarksQuery(userId, aliasMatchedUrls)
    }

    return []
}

const checkIsBookmarked = async (userId: number, url: string) => {
    const bookmarks = await getBookmarkIdsForUrl(userId, url)
    return Boolean(bookmarks?.length);
}



export {
    checkIsBookmarked,
    getBookmarkIdsForUrl,
}
