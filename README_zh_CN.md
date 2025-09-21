[English](README.md) | 简体中文 

# Simple GistBlog

一个基于 GitHub Gist 的简单博客系统。

## 示例

https://blogs.jawbts.org

## 功能特点
- 非常简单

该系统会获取 *关注用户* 的 Gist 并将其显示为博客文章。请注意，Gist 必须是公开的，只能包含一个文件，且文件名必须以 `blog#` 开头并以 `.md` 结尾，文件类型必须为 `text/markdown`。这两个部分之间的文本将被视为博客标题。

**不要** 在同一秒创建两个有相同名字的帖子!

## 快速开始
参考 Next.js 快速入门指南：https://nextjs.org/docs/app/getting-started

1. 克隆此仓库
2. 运行 ```npm ci && npm run dev```
3. 设置环境变量：
    - WATCHING_USERS: 您想要关注的 GitHub 用户名列表
4. 通过编辑 ```components/Footer.tsx``` 自定义页脚
5. 修改文件中的元数据。您可以搜索 Jawbts 然后全部替换他们
6. 开始使用！