English | [简体中文](README_zh_CN.md)  

# simple gistblog

A simple blog system based on GitHub Gist.

## Example

https://blogs.jawbts.org

## Features
- Really simple

This system will fetch the *watching users*' gists and display them as blog posts. Please notice the gist must be public, with only one file and the filename must start with `blog#` and end with `.md`, file type must be `text/markdown`. Text between these two parts will be treated as the blog's title.

## Quick Start
Refer to nextjs quick start guide: https://nextjs.org/docs/app/getting-started

1. Clone this repository
2. Run ```npm ci && npm run dev```
3. Set Environment Variables:
    - WATCHING_USERS: A list of GitHub usernames that you want to watch.
3. Custom the footer by editing ```components/Footer.tsx```
3. Enjoy!