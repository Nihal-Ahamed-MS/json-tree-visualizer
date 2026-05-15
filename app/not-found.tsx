import Link from "next/link"

export default function NotFound() {
    return (
        <div className="flex min-h-screen flex-col items-center justify-center gap-4">
            <div className="text-center space-y-2">
                <h1 className="text-8xl font-bold text-muted-foreground/20">404</h1>
                <h2 className="text-2xl font-semibold">Page Not Found</h2>
                <p className="text-muted-foreground text-sm max-w-md">
                    The page you're looking for doesn't exist or has been moved.
                </p>
            </div>
            <div className="flex gap-3">
                <Link
                    href="/"
                    className="px-4 py-2 rounded-md bg-primary text-primary-foreground text-sm hover:opacity-90 transition"
                >
                    Go Home
                </Link>
                <Link
                    href="/contact"
                    className="px-4 py-2 rounded-md border text-sm hover:bg-muted transition"
                >
                    Contact Support
                </Link>
            </div>
        </div>
    )
}