import { ORIGIN_URL } from '@/components/Consts';
import { getSubSiteMaps } from '@/components/SiteMapManager';

export async function GET() {
    const sub_maps = await getSubSiteMaps();

    const sitemapIndex = `
<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${Array.from({ length: sub_maps.length }, (_, i) => {
        const pageNum = i + 1;
        return `
  <sitemap>
    <loc>${ORIGIN_URL}/sitemap/${pageNum}</loc>
    <lastmod>${sub_maps[i].last_modified.toISOString()}</lastmod>
  </sitemap>`;
    }).join('')}
</sitemapindex>`.trim();

    return new Response(sitemapIndex, {
        headers: {
            'Content-Type': 'application/xml',
        },
    });
}