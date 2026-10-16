import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import { Analytics } from '@vercel/analytics/next';
import { SITE } from '@/lib/site';
import './index.css';

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' });

export const metadata: Metadata = {
    metadataBase: new URL(SITE.url),
    title: {
        default: SITE.title,
        template: `%s | ${SITE.name}`,
    },
    description: SITE.description,
    keywords: SITE.keywords,
    applicationName: SITE.name,
    authors: [SITE.author],
    creator: SITE.author.name,
    category: 'developer tools',
    alternates: {
        canonical: '/',
    },
    openGraph: {
        type: 'website',
        url: '/',
        siteName: SITE.name,
        title: SITE.title,
        description: SITE.description,
        locale: 'en_US',
    },
    twitter: {
        card: 'summary_large_image',
        title: SITE.title,
        description: SITE.description,
    },
    robots: {
        index: true,
        follow: true,
        googleBot: {
            index: true,
            follow: true,
            'max-image-preview': 'large',
            'max-snippet': -1,
        },
    },
    verification: {
        google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION,
    },
};

export const viewport: Viewport = {
    themeColor: '#0a0a0a',
    colorScheme: 'dark',
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en" className={inter.variable}>
            <body className="bg-[#0a0a0a] font-sans text-zinc-50 antialiased selection:bg-cyan-500/30">
                {children}
                <Analytics />
            </body>
        </html>
    );
}
