import "@/app/globals.css"
import Footer from "@/components/Footer";

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