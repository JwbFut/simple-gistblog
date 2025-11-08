import { MAX_URLS_PER_SITEMAP } from "./Consts";
import { NormalizedUserBlog, normalizeUserBlog } from "./GithubApiResponseTypes";
import { getGistBlogs } from "./GithubDataFetcher"

interface SubSiteMap {
    id: number
    blogs: NormalizedUserBlog[]
    last_modified: Date
}

export async function getSubSiteMaps(): Promise<SubSiteMap[]> {
    const res = await getGistBlogs();
    if (!res) {
        throw new Error("Something went wrong");
    }
    const blogs = res.blogs;
    const map_num = Math.ceil(blogs.length / MAX_URLS_PER_SITEMAP);

    const sub_maps: SubSiteMap[] = [];

    for (let i = 0; i < map_num; i++) {
        const sub_blogs = blogs.slice(i * MAX_URLS_PER_SITEMAP, (i + 1) * MAX_URLS_PER_SITEMAP);
        const last_modify_time = sub_blogs.reduce((acc, blog) => acc > normalizeUserBlog(blog).updated_at ? acc : normalizeUserBlog(blog).updated_at, new Date(0));
        sub_maps.push({
            id: i,
            blogs: sub_blogs.map(normalizeUserBlog),
            last_modified: last_modify_time
        });
    }

    return sub_maps;
}