import { normalizeUserBlog } from "@/components/githubApiResponseTypes";
import { fetchBlog, getGistBlogs } from "@/components/githubDataFetcher";
import LayoutWrapper from "@/components/LayoutWrapper";
import { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export const revalidate = 1800; // 30 minutes

export async function generateMetadata({
    params,
}: {
    params: Promise<{ timestamp: string, title: string }>;
}): Promise<Metadata> {
    const { timestamp, title } = await params;

    const res = await fetchBlog(timestamp, title);

    if (res == undefined) {
        return {
            title: "Page Not Found"
        }
    };

    if (res == null) {
        return {
            title: "Something Went Wrong"
        }
    };

    const blog = res.blog;

    return {
        title: blog.author_name + " - " + title,
        description: blog.first_chars.slice(0, 100) + "...",
        keywords: ["Blog"]
    };
}

export default async function Page({
    params,
}: {
    params: Promise<{ timestamp: string, title: string }>;
}) {
    const { timestamp, title } = await params;

    const res = await fetchBlog(timestamp, title);

    if (res == undefined) {
        notFound();
    }

    if (res == null) {
        throw new Error("Something Went Wrong");
    }

    const text = res.text;
    const blog = res.blog;

    const resB = await getGistBlogs();
    if (!resB) {
        throw new Error("Something Went Wrong");
    }

    const author_map = resB.author_avatars_base64;

    return (
        <LayoutWrapper>
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
                            ),
                            code: ({ node, className, children, ...props }) => (
                                <code className="block whitespace-pre-wrap break-words bg-neutral-800 text-neutral-300 p-4 rounded-lg my-4 text-sm overflow-x-auto" {...props}>
                                    {children}
                                </code>
                            ),
                            pre: ({ node, ...props }) => (
                                <pre className="whitespace-pre-wrap break-words bg-neutral-800 text-neutral-300 p-4 rounded-lg my-4 overflow-x-auto" {...props} />
                            ),
                            img: async ({ src, alt, ...props }) => {
                                const fetch_image = async () => {
                                    if (!src) {
                                        return null;
                                    }
                                    let ab, content_type;
                                    if (src instanceof Blob) {
                                        ab = await src.arrayBuffer();
                                        content_type = src.type;
                                    } else {
                                        const response = await fetch(src);
                                        const blob = await response.blob();
                                        ab = await blob.arrayBuffer();
                                        content_type = blob.type;
                                    }
                                    const buffer = Buffer.from(ab);
                                    const base64 = buffer.toString("base64");
                                    return `data:${content_type};base64,${base64}`;
                                }

                                let url: string | null = null;
                                try {
                                    url = await fetch_image();
                                } catch (e) {
                                    // fallback
                                    return <img src={src} alt={alt} {...props} />;
                                }

                                if (!url) {
                                    // fallback
                                    return <img src={src} alt={alt} {...props} />;
                                }

                                return <img src={url} alt={alt} {...props} />;
                            }
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
        </LayoutWrapper>
    );
}