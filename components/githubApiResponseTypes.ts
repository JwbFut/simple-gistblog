export interface GistFile {
    filename: string;
    type: string;
    raw_url: string;
}

export interface GistOwner {
    login: string;
    avatar_url: string;
    html_url: string;
}

export interface UserGist {
    html_url: string;
    created_at: string;
    owner: GistOwner;
    files: Record<string, GistFile>;
}

export interface UserBlog {
    title: string;
    url: string;
    raw_url: string;
    created_at: Date | string
    author_name: string;
    author_url: string;
    first_chars: string;
}