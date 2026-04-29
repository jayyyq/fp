import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "InkMeet — Fountain pen meet-up groups around the world",
  description:
    "A directory of fountain pen meet-up groups, posses, and online communities. Submit your own to the list.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col">
        <header className="border-b border-ink-100 bg-paper-50/80 backdrop-blur sticky top-0 z-10">
          <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
            <Link href="/" className="font-serif text-xl tracking-tight text-ink-900">
              InkMeet<span className="text-ink-500">.</span>
            </Link>
            <nav className="flex items-center gap-6 text-sm">
              <Link href="/" className="hover:text-ink-600">
                Browse
              </Link>
              <Link
                href="/submit"
                className="rounded-full bg-ink-900 px-4 py-1.5 text-paper-50 hover:bg-ink-700"
              >
                Submit a group
              </Link>
            </nav>
          </div>
        </header>

        <main className="flex-1">{children}</main>

        <footer className="border-t border-ink-100 mt-16">
          <div className="max-w-5xl mx-auto px-6 py-8 text-sm text-ink-700 flex flex-wrap justify-between gap-4">
            <p>Built for fountain pen people. Listings are moderated.</p>
            <div className="flex gap-4">
              <Link href="/submit" className="hover:text-ink-900">
                Submit a group
              </Link>
              <Link href="/admin" className="hover:text-ink-900">
                Admin
              </Link>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
