import BlogList from "@/components/BlogList";
import { UserBlog } from "@/components/githubApiResponseTypes";
import { getGistBlogs } from "@/components/githubDataFetcher";
import { Metadata } from "next";

export const revalidate = 1800; // 30 minutes

export const metadata: Metadata = {
  title: 'Jawbts Blog',
  description: 'Jawbts Blog',
}

export default async function Page() {
  let blogs: UserBlog[] = [];
  let author_avatars_base64: Map<string, string> = new Map();
  let author_dict: Record<string, string> = {};

  const res = await getGistBlogs();
  blogs = res.blogs;
  author_avatars_base64 = res.author_avatars_base64;

  for (const [k, v] of author_avatars_base64) {
    author_dict[k] = v;
  }

  // newest first
  const sortedBlogs = blogs.sort((a, b) => {
    if (typeof a.created_at === "string") {
      a.created_at = new Date(a.created_at);
    }
    if (typeof b.created_at === "string") {
      b.created_at = new Date(b.created_at);
    }
    return b.created_at.getTime() - a.created_at.getTime()
  });

  return (
    <div className="bg-neutral-800 min-h-screen text-white p-6">
      <h1 className="text-4xl font-bold mb-8 text-left max-w-4xl mx-auto">
        Jawbts Blogs
      </h1>

      <BlogList blogs={sortedBlogs} author_avatars_base64={author_dict} />
    </div>
  );
}
