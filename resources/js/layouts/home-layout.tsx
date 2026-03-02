import type { ReactNode } from 'react';
import { BottomNav } from '@/components/bottom-nav';
import { TopNav } from '@/components/top-nav';

interface HomeLayoutProps {
    children: ReactNode;
}

export default function HomeLayout({ children }: HomeLayoutProps) {
    return (
        <div className="relative min-h-screen bg-[#0b1120]">
            {/* Ambient glow */}
            <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
                <div className="absolute -top-40 left-1/2 h-[500px] w-[600px] -translate-x-1/2 rounded-full bg-blue-600/8 blur-[150px]" />
                <div className="absolute top-1/2 -right-40 h-[400px] w-[400px] rounded-full bg-blue-500/6 blur-[130px]" />
                <div className="absolute bottom-0 left-0 h-[300px] w-[500px] rounded-full bg-indigo-600/5 blur-[120px]" />
            </div>

            {/* Desktop top nav */}
            <TopNav />

            {/* Main content */}
            <main className="relative z-10 pb-28 md:pb-8">
                {children}
            </main>

            {/* Mobile bottom nav */}
            <BottomNav />
        </div>
    );
}
