'use client';

import { normalizeUserBlog, UserBlog } from '@/components/GithubApiResponseTypes';
import Link from 'next/link';

interface BlogListProps {
    blogs: UserBlog[];
    author_avatars_base64: Record<string, string>;
}

const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone: "UTC",
});

function getFormattedDate(date: Date | string): string {
    let dateObj: Date;
    if (typeof date === "string") {
        dateObj = new Date(date);
    } else {
        dateObj = date;
    }

    return formatter.format(dateObj);
}

export default function BlogList({ blogs, author_avatars_base64 }: BlogListProps) {
    return (
        <div className="max-w-4xl mx-auto space-y-4">
            {blogs.map((blog) => (
                <Link
                    key={blog.url}
                    href={`/blogs/${(normalizeUserBlog(blog).created_at.getTime() / 1000).toString()}/${encodeURIComponent(blog.title)}`}
                    className="relative flex flex-col sm:flex-row items-start gap-4 p-4 rounded-lg hover:bg-neutral-700 transition-colors border-b border-neutral-700 last:border-b-0 cursor-pointer overflow-hidden"
                >
                    {/* avatar */}
                    <div
                        onClick={(event) => {
                            event.preventDefault();
                            window.open(blog.author_url, '_blank');
                        }}
                        className="flex-shrink-0 mt-1"
                    >
                        <img
                            src={author_avatars_base64[blog.author_name]}
                            alt={blog.author_name}
                            className="w-12 h-12 rounded-full object-cover border-2 border-neutral-600 hover:border-blue-400 transition-colors cursor-pointer"
                        />
                    </div>

                    {/* content area */}
                    <div className="flex-grow flex flex-row min-w-0 gap-4 items-start h-full">
                        <div className="flex flex-col gap-2 not-sm:max-w-[60%]">
                            {/* title */}
                            <p className="text-lg font-medium text-blue-300 group-hover:text-blue-100 group-hover:underline transition-all truncate">
                                {blog.title}
                            </p>

                            {/* date & author */}
                            <p className="text-sm text-neutral-400 mt-1">
                                {getFormattedDate(blog.created_at)} by {blog.author_name}
                            </p>
                        </div>

                        {/* preview, expand when hovered */}
                        <div className="p-4 flex-1 group not-sm:hidden">
                            <div className="overflow-hidden transition-all duration-300 ease-in-out max-h-0 group-hover:max-h-80 opacity-0 group-hover:opacity-100 mt-2">
                                <p className="text-sm text-neutral-400 leading-relaxed whitespace-pre-wrap break-words">
                                    {blog.first_chars}
                                </p>
                            </div>
                        </div>
                    </div>
                </Link>
            ))}
        </div>
    );
}