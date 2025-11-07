import { GistFile, normalizeUserBlog, UserBlog, UserGist } from "@/components/githubApiResponseTypes";
import { fetcherResult, serverSideCache } from "@/components/ServerSideCache";
import { API_CACHE_TIME, API_MAX_CACHE_TIME, POST_CACHE_TIME, POST_MAX_CACHE_TIME } from "./Consts";

if (!process.env.WATCHING_USERS) {
    throw new Error("Environment variable WATCHING_USERS is not set");
}

const HEADERS = {
    "Accept": "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28"
}

async function fetchWithRetry(url: string, retries: number = 3, headers: Record<string, string> = {}) {
    try {
        const response = await fetch(url, { headers: { ...HEADERS, ...headers } });
        if (response.ok) {
            return response;
        } else {
            throw new Error(`Failed to fetch ${url}: ${response.status} ${response.statusText}`);
        }
    } catch (error) {
        if (retries > 0) {
            console.warn(`Failed to fetch ${url}, retrying...`, error);
            return await fetchWithRetry(url, retries - 1, headers);
        } else {
            console.error(`Failed to fetch ${url} after ${retries} retries`, error);
            throw error;
        }
    }
}

async function fetchAllPages(url: string) {
    const allData = [];
    let page = 1;
    while (true) {
        const data = await (await fetchWithRetry(`${url}?per_page=100&page=${page}`)).json();
        if (data.length === 0) break;
        allData.push(...data);
        page++;
    }
    return allData;
}

const _getGistBlogs = async () => {
    if (!process.env.WATCHING_USERS) {
        throw new Error("Environment variable WATCHING_USERS is not set");
    }

    const allGists = [];
    for (const user of process.env.WATCHING_USERS.split(",")) {
        if (user.trim() === "") continue;

        const data = await fetchAllPages(`https://api.github.com/users/${user}/gists`);
        allGists.push(...data as UserGist[]);
    }

    const blogs: UserBlog[] = [];
    const author_avatars = new Map<string, string>();
    for (const gist of allGists) {
        if (Object.keys(gist.files).length != 1) continue;
        const file = Object.values(gist.files)[0] as GistFile;

        const match = file.filename.match(/^blog#(.+)\.md$/);
        if (!match) continue;

        author_avatars.set(gist.owner.login, gist.owner.avatar_url);

        // Fetch the first 500 characters of the blog content
        const content_ab = await (await fetchWithRetry(file.raw_url, 3, { Range: "bytes=0-4096" })).arrayBuffer();
        const decoder = new TextDecoder('utf-8', { fatal: false });
        const content = decoder.decode(content_ab);

        blogs.push({
            title: match[1],
            url: gist.html_url,
            raw_url: file.raw_url,
            created_at: new Date(gist.created_at),
            updated_at: new Date(gist.updated_at),
            author_name: gist.owner.login,
            author_url: gist.owner.html_url,
            first_chars: content.substring(0, 1000).split("\n")[0]
        });
    }

    const author_avatars_base64 = new Map<string, string>();

    // fetch avatar images
    for (const [name, url] of author_avatars) {
        const avatar_res = await fetchWithRetry(url, 3, {});
        const avatar_ab = await avatar_res.arrayBuffer();
        const buffer = Buffer.from(avatar_ab);
        const avatar_base64 = `data:${avatar_res.headers.get('content-type')};base64,${buffer.toString('base64')}`;
        author_avatars_base64.set(name, avatar_base64);
    }

    return { value: { blogs, author_avatars_base64 }, lastUpdated: new Date() } as fetcherResult<{ blogs: UserBlog[], author_avatars_base64: Map<string, string> }>;
};

const _fetchBlog = async (raw_url: string) => {
    const response = await fetchWithRetry(raw_url, 3, {});
    return { value: await response.text(), lastUpdated: new Date() } as fetcherResult<string>;
}

export const getGistBlogs = async () => {
    return await serverSideCache.get("gist_blogs", _getGistBlogs, undefined, API_CACHE_TIME, API_MAX_CACHE_TIME);
}

// null: something went wrong
// undefined: not found
export const fetchBlog = async (timestamp: string, title: string) => {
    const res = await getGistBlogs();
    if (!res) return null;

    const blog = res.blogs.find((item) => item.title == title && normalizeUserBlog(item).created_at.getTime() / 1000 == Number(timestamp));
    if (!blog) return undefined;

    return { text: await serverSideCache.get(`blog_${blog.title}%$#DONT_USE_THIS_KEY#$%${timestamp}`, () => _fetchBlog(blog.raw_url), normalizeUserBlog(blog).updated_at, POST_CACHE_TIME, POST_MAX_CACHE_TIME), blog: normalizeUserBlog(blog) };
}