import { getCanonicalUrl } from "./helpers"

test.each([
    ['https://ww3.dramanice.video/love-when-the-stars-fall', 'https://ww3.dramanice.video/love-when-the-stars-fall'],
    ['https://ww3.dramanice.video/love-when-the-stars-fall/', 'https://ww3.dramanice.video/love-when-the-stars-fall'],
    ['https://ww3.dramanice.video/love-when-the-stars-fall/del', 'https://ww3.dramanice.video/love-when-the-stars-fall/del'],
    ['https://ww3.dramanice.video/love-when-the-stars-fall-episode-8', 'https://ww3.dramanice.video/love-when-the-stars-fall'],
    ['https://ww3.dramanice.video/love-when-the-stars-fall-episode-8/', 'https://ww3.dramanice.video/love-when-the-stars-fall'],
    ['https://www.youtube.com/watch?v=RC11Xe5HEk', 'https://www.youtube.com/watch?v=RC11Xe5HEk'],
])('%s should have canonical url of %S', (input, expected) => {
    expect(getCanonicalUrl(input).canonical).toEqual(expected);
})