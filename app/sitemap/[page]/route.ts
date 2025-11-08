import { ORIGIN_URL } from "@/components/Consts";
import { normalizeUserBlog } from "@/components/GithubApiResponseTypes";
import { getSubSiteMaps } from "@/components/SiteMapManager";
import { NextRequest } from "next/server";

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ page: string }> }
) {
    const page = parseInt((await params).page, 10) - 1;

    if (isNaN(page) || page < 0) {
        return new Response('Invalid page', { status: 400 });
    }

    const sub_maps = await getSubSiteMaps();
    const cur_map = sub_maps[page];

    if (!cur_map) {
        return new Response('Page not found', { status: 404 });
    }

    const sitemap = `
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${cur_map.blogs
            .map(
                (blog) => `
  <url>
    <loc>${ORIGIN_URL}/blogs/${(normalizeUserBlog(blog).created_at.getTime() / 1000).toString()}/${blog.title}</loc>
    <lastmod>${blog.updated_at.toISOString()}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>`
            )
            .join('')}
</urlset>`.trim();

    return new Response(sitemap, {
        headers: {
            'Content-Type': 'application/xml',
        },
    });
}