import { normalizeUserBlog } from "@/components/githubApiResponseTypes";
import { fetchBlog, getGistBlogs } from "@/components/githubDataFetcher";
import { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export const revalidate = 1800; // 30 minutes

export async function generateMetadata({
    params,
}: {
    params: Promise<{ slug: string }>;
}): Promise<Metadata> {
    const { slug } = await params;

    const res = await getGistBlogs();
    const blog = res.blogs.find((item) => item.title === slug);

    if (!blog) {
        return {
            title: "Page Not Found"
        }
    }

    return {
        title: blog.author_name + " - " + slug,
        description: blog.first_chars.slice(0, 100) + "...",
        keywords: ["Blog"]
    }
}

export default async function Page({
    params,
}: {
    params: Promise<{ slug: string }>;
}) {
    const { slug } = await params;

    const res = await getGistBlogs();
    const blog = res.blogs.find((item) => item.title === slug);
    const author_map = res.author_avatars_base64;

    if (!blog) {
        notFound();
    }

    const text = await fetchBlog(blog.raw_url);

    return (
        <div className="max-w-4xl mx-auto px-4 py-8">
            {/* return to index */}
            <Link
                href="/"
                className="inline-flex items-center text-sm text-neutral-400 hover:text-blue-300 mb-6 transition-colors"
            >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Back to Index
            </Link>

            {/* title */}
            <h1 className="text-3xl font-bold text-white mb-4">{blog.title}</h1>

            {/* author & date */}
            <div className="flex items-center gap-4 mb-8">
                <Link
                    href={blog.author_url}
                    target="_blank"
                    className="flex-shrink-0"
                >
                    <img
                        src={author_map.get(blog.author_name)}
                        alt={blog.author_name}
                        className="w-12 h-12 rounded-full object-cover border-2 border-neutral-600 hover:border-blue-400 transition-colors cursor-pointer"
                    />
                </Link>
                <div className="flex flex-col">
                    <Link
                        href={blog.author_url}
                        target="_blank"
                        className="text-blue-300 hover:text-blue-100 hover:underline transition-colors"
                    >
                        {blog.author_name}
                    </Link>
                    <p className="text-sm text-neutral-400">
                        {normalizeUserBlog(blog).created_at.toLocaleDateString("en-US", {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                        })
                        }
                    </p>
                </div>
            </div>

            {/* blog content */}
            <article className="prose prose-invert prose-lg max-w-none mb-5">
                <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    components={{
                        a: ({ node, ...props }) => (
                            <a className="text-blue-300 hover:text-blue-100 hover:underline transition-colors" {...props} />
                        ),
                        blockquote: ({ node, ...props }) => (
                            <blockquote className="border-l-4 border-blue-400 pl-4 text-neutral-400 [&>p]:text-neutral-400 my-4" {...props} />
                        ),
                        p: ({ node, ...props }) => (
                            <p className="mb-4 text-neutral-300" {...props} />
                        )
                    }}
                >
                    {text}
                </ReactMarkdown>
            </article>

            {/* Fixed "View on GitHub" Button */}
            <Link
                href={blog.url}
                target="_blank"
                className="fixed bottom-6 right-6 bg-blue-500 hover:bg-blue-400 text-neutral-200 font-medium py-3 px-5 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 z-50"
            >
                View on GitHub
            </Link>
        </div>
    );
}