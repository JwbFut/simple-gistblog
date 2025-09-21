import { GistFile, UserBlog, UserGist } from "@/components/githubApiResponseTypes";

if (!process.env.WATCHING_USERS) {
    throw new Error("Environment variable WATCHING_USERS is not set");
}

const HEADERS = {
    "Accept": "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28"
}

async function fetchWithRetry(url: string, retries: number = 3, headers: Record<string, string> = {}, revalidate: number = 60 * 30) {
    try {
        const response = await fetch(url, { headers: { ...HEADERS, ...headers }, next: { revalidate: revalidate } });
        if (response.ok) {
            return response;
        } else {
            throw new Error(`Failed to fetch ${url}: ${response.status} ${response.statusText}`);
        }
    } catch (error) {
        if (retries > 0) {
            console.warn(`Failed to fetch ${url}, retrying...`, error);
            return await fetchWithRetry(url, retries - 1, headers, revalidate);
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

export const getGistBlogs = async () => {
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
        const content_ab = await (await fetchWithRetry(file.raw_url, 3, { Range: "bytes=0-4096" }, 3600 * 24)).arrayBuffer();
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
        const avatar_res = await fetchWithRetry(url, 3, {}, 3600 * 24 * 7);
        const avatar_ab = await avatar_res.arrayBuffer();
        const buffer = Buffer.from(avatar_ab);
        const avatar_base64 = `data:${avatar_res.headers.get('content-type')};base64,${buffer.toString('base64')}`;
        author_avatars_base64.set(name, avatar_base64);
    }

    return { blogs, author_avatars_base64 };
};

export const fetchBlog = async (raw_url: string) => {
    const response = await fetchWithRetry(raw_url, 3, {}, 3600 * 12);
    return await response.text();
}