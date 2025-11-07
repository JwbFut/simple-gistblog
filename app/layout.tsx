import "@/app/globals.css"
import Footer from "@/components/Footer";
import { Metadata } from "next";

export const metadata: Metadata = {
    icons: [
        {
            url: "https://cdn.jawbts.org/photos/logo.svg",
            type: "image/svg+xml",
            rel: "icon"
        }
    ]
}

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="zh" className="bg-neutral-800">
            <body className="overflow-x-clip">
                {children}

                <Footer />
            </body>
        </html>
    );
}