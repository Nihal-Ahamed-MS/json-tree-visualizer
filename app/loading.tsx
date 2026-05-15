import { Spinner } from '@/components/ui/spinner';

export default function Loading() {
    return (
        <main className="flex min-h-screen flex-col items-center justify-center p-24">
            <div className="flex flex-col items-center space-y-4 text-primary">
                <Spinner />
            </div>
        </main>
    );
}
