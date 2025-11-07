"use client"

import Link from "next/link";

export default function Page() {
    return (
        <div className="absolute m-auto inset-x-0 inset-y-0 w-1/2 h-1/2 text-neutral-100 text-center text-xl">
            Sorry. Something went wrong. <br /><br />
            <Link href="/" className="hover:text-neutral-50"> Click here to redirect to home page. </Link> <br />
            <Link href="/" className="hover:text-neutral-50"> 点这里以重定向到主页面. </Link>
        </div>
    );
}