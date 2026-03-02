import { Head, usePage } from '@inertiajs/react';
import {
    Home as HomeIcon,
    Waves,
    Timer,
    Flame,
    Dumbbell,
    Plus,
    Star,
    MapPin,
    Users,
    TrendingUp,
    ChevronRight,
} from 'lucide-react';
import HomeLayout from '@/layouts/home-layout';

/* ------------------------------------------------------------------ */
/*  Pool data                                                          */
/* ------------------------------------------------------------------ */

const categoryIcons = [
    { icon: Waves, color: 'text-blue-300' },
    { icon: Timer, color: 'text-cyan-300' },
    { icon: Flame, color: 'text-orange-300' },
    { icon: Dumbbell, color: 'text-emerald-300' },
];

const nearbyPool = {
    name: 'Hotel Arcadia',
    subtitle: 'Rooftop Pool',
    image: 'https://images.unsplash.com/photo-1582719508461-905c673771fd?w=600&q=80',
    distance: '2.4 km',
    type: 'Indoor Pool',
    rating: 4.5,
    capacity: '60%',
    price: '₹2,000',
    openSlots: 3,
};

const recentPools = [
    {
        name: 'Taj Kumarakom Resort',
        image: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=200&q=80',
        visits: 8,
        total: 12,
        rating: 4.5,
    },
    {
        name: 'Kottayam Club Pool',
        image: 'https://images.unsplash.com/photo-1575429198097-0414ec08e8cd?w=200&q=80',
        visits: 15,
        total: 20,
        rating: 4.2,
    },
];

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export default function HomePage() {
    const { props } = usePage();
    const user = (props as any).auth?.user;
    const firstName = user?.name?.split(' ')[0] ?? 'User';

    return (
        <HomeLayout>
            <Head title="Home" />

            {/* ===================================================================
                MOBILE LAYOUT — matches FitPulse left screen
            =================================================================== */}
            <div className="md:hidden">
                {/* ── Hero image ── */}
                <div className="relative h-[46vh] min-h-[340px] overflow-hidden">
                    <img
                        src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&q=80"
                        alt="Pool"
                        className="h-full w-full object-cover"
                    />
                    {/* Gradient → dark navy bottom */}
                    <div className="absolute inset-0 bg-gradient-to-b from-[#0b1120]/30 via-transparent to-[#0b1120]" />
                    {/* Blue glow seam */}
                    <div className="absolute inset-x-0 bottom-0 h-[2px] bg-gradient-to-r from-transparent via-blue-400/30 to-transparent blur-[1px]" />

                    {/* Header overlay */}
                    <div className="absolute inset-x-0 top-0 flex items-start justify-between px-5 pt-12">
                        <div>
                            <h1 className="text-[26px] leading-tight font-bold text-white">
                                Hi {firstName},
                                <br />
                                Welcome!
                            </h1>
                        </div>
                        <button className="mt-1 flex h-11 w-11 items-center justify-center rounded-2xl border border-blue-300/15 bg-[#111d36]/60 text-blue-200/70 shadow-[0_0_16px_rgba(59,130,246,0.08)] backdrop-blur-xl">
                            <HomeIcon className="h-5 w-5" />
                        </button>
                    </div>
                </div>

                {/* ── Content below hero ── */}
                <div className="relative z-10 -mt-4 space-y-5 px-4 pb-6">

                    {/* ── Section: My Pools ── */}
                    <h2 className="text-[17px] font-bold text-blue-50">My Pools</h2>

                    {/* ── Weekly Stats card ── */}
                    <div className="overflow-hidden rounded-[22px] border border-blue-400/10 bg-[#111d36]/50 p-4 shadow-[0_0_30px_rgba(59,130,246,0.04)] backdrop-blur-2xl">
                        <div className="flex items-center justify-between">
                            {/* Left: label + icons */}
                            <div>
                                <p className="text-[13px] font-semibold text-blue-100/90">Weekly Stats</p>
                                <div className="mt-2.5 flex items-center gap-2">
                                    {categoryIcons.map((item, i) => {
                                        const Icon = item.icon;
                                        return (
                                            <div
                                                key={i}
                                                className="flex h-9 w-9 items-center justify-center rounded-full border border-blue-400/10 bg-blue-500/8"
                                            >
                                                <Icon className={`h-4 w-4 ${item.color} drop-shadow-[0_0_6px_rgba(147,197,253,0.3)]`} />
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                            {/* Right: Add button */}
                            <div className="flex flex-col items-center gap-1">
                                <button className="flex h-10 w-10 items-center justify-center rounded-2xl border border-blue-400/15 bg-blue-500/10 text-blue-300 transition-all hover:bg-blue-500/20">
                                    <Plus className="h-5 w-5" />
                                </button>
                                <span className="text-[10px] font-medium text-blue-200/40">Add New</span>
                            </div>
                        </div>
                    </div>

                    {/* ── Section: Nearby Pool ── */}
                    <h2 className="text-[17px] font-bold text-blue-50">Active Nearby</h2>

                    {/* ── Active pool card (like "Running" card) ── */}
                    <div className="overflow-hidden rounded-[22px] border border-blue-400/10 bg-[#111d36]/50 p-4 shadow-[0_0_30px_rgba(59,130,246,0.04)] backdrop-blur-2xl">
                        <div className="flex items-start gap-4">
                            {/* Left side info */}
                            <div className="flex-1">
                                <h3 className="text-base font-bold text-blue-50">{nearbyPool.name}</h3>
                                <div className="mt-1 flex items-center gap-2">
                                    {/* Streak-like badge */}
                                    <div className="rounded-xl border border-blue-400/10 bg-blue-500/8 px-2.5 py-1">
                                        <p className="text-[10px] font-bold text-blue-200/50">Distance</p>
                                        <p className="text-xs font-bold text-blue-100">{nearbyPool.distance}</p>
                                    </div>
                                    {/* Progress-like badge */}
                                    <div className="rounded-xl border border-blue-400/10 bg-blue-500/8 px-2.5 py-1">
                                        <p className="text-[10px] font-bold text-blue-200/50">Capacity</p>
                                        <p className="text-xs font-bold text-blue-100">{nearbyPool.capacity}</p>
                                    </div>
                                </div>

                                <div className="mt-3 flex items-center gap-2">
                                    <div className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.8)]" />
                                    <span className="text-xs text-blue-200/50">{nearbyPool.type}</span>
                                </div>
                                <p className="mt-0.5 text-xs text-blue-200/40">
                                    {nearbyPool.subtitle}
                                </p>
                            </div>

                            {/* Right side: circular progress ring */}
                            <div className="flex flex-col items-center">
                                <div className="relative flex h-20 w-20 items-center justify-center">
                                    <svg className="h-20 w-20 -rotate-90" viewBox="0 0 80 80">
                                        <circle cx="40" cy="40" r="34" fill="none" stroke="rgba(59,130,246,0.08)" strokeWidth="6" />
                                        <circle
                                            cx="40"
                                            cy="40"
                                            r="34"
                                            fill="none"
                                            stroke="url(#poolGrad)"
                                            strokeWidth="6"
                                            strokeLinecap="round"
                                            strokeDasharray={`${0.6 * 2 * Math.PI * 34} ${2 * Math.PI * 34}`}
                                            className="drop-shadow-[0_0_8px_rgba(59,130,246,0.4)]"
                                        />
                                        <defs>
                                            <linearGradient id="poolGrad" x1="0" y1="0" x2="1" y2="1">
                                                <stop offset="0%" stopColor="#60a5fa" />
                                                <stop offset="100%" stopColor="#22d3ee" />
                                            </linearGradient>
                                        </defs>
                                    </svg>
                                    <div className="absolute flex flex-col items-center">
                                        <span className="text-[10px] text-blue-200/40">Rating</span>
                                        <span className="text-lg font-bold text-blue-100">{nearbyPool.rating}</span>
                                    </div>
                                </div>
                                <div className="mt-1 flex items-center gap-1 rounded-xl border border-blue-400/10 bg-blue-500/8 px-2 py-0.5">
                                    <MapPin className="h-3 w-3 text-blue-300/60" />
                                    <span className="text-[10px] font-bold text-blue-200/50">
                                        {nearbyPool.openSlots} slots
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Price row */}
                        <div className="mt-3 flex items-center justify-between border-t border-blue-400/8 pt-3">
                            <div className="flex items-center gap-1.5">
                                <Star className="h-3.5 w-3.5 fill-blue-300/80 text-blue-300/80" />
                                <span className="text-xs font-semibold text-blue-200/60">Starting from</span>
                            </div>
                            <span className="text-sm font-bold text-blue-100">{nearbyPool.price}/hr</span>
                        </div>
                    </div>

                    {/* ── Section: Previous / Recent ── */}
                    <div className="flex items-center justify-between">
                        <h2 className="text-[17px] font-bold text-blue-50">Recent Visits</h2>
                        <button className="flex items-center gap-0.5 text-xs font-medium text-blue-300/50 transition hover:text-blue-300/80">
                            View All
                            <ChevronRight className="h-3.5 w-3.5" />
                        </button>
                    </div>

                    {/* ── Recent pool cards ── */}
                    {recentPools.map((pool, idx) => (
                        <div
                            key={idx}
                            className="flex items-center gap-3.5 overflow-hidden rounded-[18px] border border-blue-400/8 bg-[#111d36]/40 p-3 shadow-[0_0_20px_rgba(59,130,246,0.03)] backdrop-blur-xl"
                        >
                            {/* Circular progress + avatar */}
                            <div className="relative flex h-14 w-14 shrink-0 items-center justify-center">
                                <svg className="h-14 w-14 -rotate-90" viewBox="0 0 56 56">
                                    <circle cx="28" cy="28" r="24" fill="none" stroke="rgba(59,130,246,0.08)" strokeWidth="4" />
                                    <circle
                                        cx="28"
                                        cy="28"
                                        r="24"
                                        fill="none"
                                        stroke="rgba(96,165,250,0.5)"
                                        strokeWidth="4"
                                        strokeLinecap="round"
                                        strokeDasharray={`${(pool.visits / pool.total) * 2 * Math.PI * 24} ${2 * Math.PI * 24}`}
                                        className="drop-shadow-[0_0_6px_rgba(59,130,246,0.3)]"
                                    />
                                </svg>
                                <div className="absolute flex items-center justify-center">
                                    <span className="text-xs font-bold text-blue-200/70">
                                        {Math.round((pool.visits / pool.total) * 100)}%
                                    </span>
                                </div>
                            </div>

                            {/* Info */}
                            <div className="flex-1">
                                <p className="text-sm font-bold text-blue-100">{pool.name}</p>
                                <p className="mt-0.5 text-xs text-blue-200/35">
                                    {pool.visits} visits completed · {pool.visits}/{pool.total}
                                </p>
                            </div>

                            {/* Rating */}
                            <div className="flex items-center gap-1">
                                <Star className="h-3 w-3 fill-blue-300/60 text-blue-300/60" />
                                <span className="text-xs font-semibold text-blue-200/50">{pool.rating}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* ===================================================================
                DESKTOP LAYOUT — expanded version
            =================================================================== */}
            <div className="mx-auto hidden max-w-7xl md:block">
                {/* Desktop hero banner */}
                <div className="relative mx-5 mt-5 h-[300px] overflow-hidden rounded-[28px] border border-blue-400/8">
                    <img
                        src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200&q=80"
                        alt="Pool"
                        className="h-full w-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-[#0b1120]/80 via-[#0b1120]/30 to-transparent" />
                    <div className="absolute inset-x-0 bottom-0 h-[2px] bg-gradient-to-r from-transparent via-blue-400/20 to-transparent blur-[1px]" />

                    <div className="absolute bottom-0 left-0 p-8">
                        <h1 className="text-3xl font-bold tracking-tight text-white">
                            Hi {firstName}, Welcome!
                        </h1>
                        <div className="mt-2 flex items-center gap-1 text-sm text-blue-200/50">
                            <MapPin className="h-3.5 w-3.5 text-blue-400/60" />
                            Kottayam, Kerala
                        </div>
                    </div>
                </div>

                {/* Desktop content grid */}
                <div className="mt-5 grid grid-cols-3 gap-4 px-5">
                    {/* Col 1: Weekly Stats */}
                    <div className="overflow-hidden rounded-[22px] border border-blue-400/10 bg-[#111d36]/50 p-5 shadow-[0_0_30px_rgba(59,130,246,0.04)] backdrop-blur-2xl">
                        <p className="text-[13px] font-semibold text-blue-100/90">Weekly Stats</p>
                        <div className="mt-3 flex items-center gap-2">
                            {categoryIcons.map((item, i) => {
                                const Icon = item.icon;
                                return (
                                    <div
                                        key={i}
                                        className="flex h-10 w-10 items-center justify-center rounded-full border border-blue-400/10 bg-blue-500/8"
                                    >
                                        <Icon className={`h-4 w-4 ${item.color}`} />
                                    </div>
                                );
                            })}
                        </div>
                        <button className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl border border-blue-400/12 bg-blue-500/8 py-2.5 text-sm font-medium text-blue-200/60 transition hover:bg-blue-500/15 hover:text-blue-200/80">
                            <Plus className="h-4 w-4" />
                            Add New Pool
                        </button>
                    </div>

                    {/* Col 2: Active Nearby */}
                    <div className="overflow-hidden rounded-[22px] border border-blue-400/10 bg-[#111d36]/50 p-5 shadow-[0_0_30px_rgba(59,130,246,0.04)] backdrop-blur-2xl">
                        <div className="flex items-start justify-between">
                            <div>
                                <p className="text-[13px] font-semibold text-blue-200/50">Active Nearby</p>
                                <h3 className="mt-1 text-base font-bold text-blue-50">{nearbyPool.name}</h3>
                            </div>
                            <div className="relative flex h-16 w-16 items-center justify-center">
                                <svg className="h-16 w-16 -rotate-90" viewBox="0 0 64 64">
                                    <circle cx="32" cy="32" r="27" fill="none" stroke="rgba(59,130,246,0.08)" strokeWidth="5" />
                                    <circle cx="32" cy="32" r="27" fill="none" stroke="url(#dGrad)" strokeWidth="5" strokeLinecap="round" strokeDasharray={`${0.6 * 2 * Math.PI * 27} ${2 * Math.PI * 27}`} />
                                    <defs><linearGradient id="dGrad" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#60a5fa" /><stop offset="100%" stopColor="#22d3ee" /></linearGradient></defs>
                                </svg>
                                <span className="absolute text-sm font-bold text-blue-100">{nearbyPool.rating}</span>
                            </div>
                        </div>
                        <div className="mt-2 flex gap-2">
                            <span className="rounded-lg border border-blue-400/10 bg-blue-500/8 px-2 py-1 text-[11px] font-semibold text-blue-200/50">{nearbyPool.distance}</span>
                            <span className="rounded-lg border border-blue-400/10 bg-blue-500/8 px-2 py-1 text-[11px] font-semibold text-blue-200/50">{nearbyPool.capacity} cap.</span>
                        </div>
                        <div className="mt-3 flex items-center justify-between border-t border-blue-400/8 pt-3">
                            <span className="text-xs text-blue-200/40">Starting from</span>
                            <span className="text-sm font-bold text-blue-100">{nearbyPool.price}/hr</span>
                        </div>
                    </div>

                    {/* Col 3: Recent Visits */}
                    <div className="overflow-hidden rounded-[22px] border border-blue-400/10 bg-[#111d36]/50 p-5 shadow-[0_0_30px_rgba(59,130,246,0.04)] backdrop-blur-2xl">
                        <div className="flex items-center justify-between">
                            <p className="text-[13px] font-semibold text-blue-100/90">Recent Visits</p>
                            <button className="text-[11px] font-medium text-blue-300/40 hover:text-blue-300/70">View All</button>
                        </div>
                        <div className="mt-3 space-y-3">
                            {recentPools.map((pool, idx) => (
                                <div key={idx} className="flex items-center gap-3 rounded-xl border border-blue-400/6 bg-[#0b1120]/40 p-2.5">
                                    <div className="relative flex h-10 w-10 shrink-0 items-center justify-center">
                                        <svg className="h-10 w-10 -rotate-90" viewBox="0 0 40 40">
                                            <circle cx="20" cy="20" r="17" fill="none" stroke="rgba(59,130,246,0.08)" strokeWidth="3" />
                                            <circle cx="20" cy="20" r="17" fill="none" stroke="rgba(96,165,250,0.5)" strokeWidth="3" strokeLinecap="round" strokeDasharray={`${(pool.visits / pool.total) * 2 * Math.PI * 17} ${2 * Math.PI * 17}`} />
                                        </svg>
                                        <span className="absolute text-[9px] font-bold text-blue-200/60">{Math.round((pool.visits / pool.total) * 100)}%</span>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="truncate text-xs font-bold text-blue-100">{pool.name}</p>
                                        <p className="text-[10px] text-blue-200/30">{pool.visits}/{pool.total} visits</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </HomeLayout>
    );
}
