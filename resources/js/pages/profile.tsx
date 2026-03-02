import { Head, usePage } from '@inertiajs/react';
import {
    MapPin,
    Shield,
    Mail,
    Phone,
    Calendar,
    Waves,
    Timer,
    Flame,
    Trophy,
    TrendingUp,
    Edit3,
    ChevronRight,
    Star,
} from 'lucide-react';
import HomeLayout from '@/layouts/home-layout';
import type { User } from '@/types';

/* ── Mock stats (replace with real data later) ─────────────────────────── */

const stats = [
    { label: 'Sessions', value: '47', icon: Waves, color: 'text-blue-300', sub: 'Total swims' },
    { label: 'Pools', value: '6', icon: MapPin, color: 'text-cyan-300', sub: 'Visited' },
    { label: 'Hours', value: '62', icon: Timer, color: 'text-indigo-300', sub: 'In water' },
    { label: 'Streak', value: '12', icon: Flame, color: 'text-orange-300', sub: 'Days' },
];

const achievements = [
    { name: 'First Splash', icon: '🏊', earned: true },
    { name: '10 Sessions', icon: '🎯', earned: true },
    { name: 'Marathon', icon: '🏅', earned: true },
    { name: '100 Hours', icon: '💎', earned: false },
];

const recentActivity = [
    { pool: 'Taj Kumarakom Resort', date: '22 Feb', duration: '1h 20m', laps: 40 },
    { pool: 'Kottayam Club Pool', date: '20 Feb', duration: '45m', laps: 24 },
    { pool: 'Hotel Arcadia Rooftop', date: '18 Feb', duration: '1h 05m', laps: 32 },
];

/* ── Component ─────────────────────────────────────────────────────────── */

export default function ProfilePage() {
    const { props } = usePage();
    const user = ((props as any).profileUser ?? (props as any).auth?.user) as User;
    const memberSince = user?.created_at
        ? new Date(user.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
        : 'Unknown';

    return (
        <HomeLayout>
            <Head title="Profile" />

            {/* ═══════════════════════════════════════════════════════
                MOBILE LAYOUT
            ═══════════════════════════════════════════════════════ */}
            <div className="md:hidden">
                {/* ── Profile Header ── */}
                <div className="relative overflow-hidden pb-6">
                    {/* Background gradient */}
                    <div className="absolute inset-0 bg-gradient-to-b from-blue-600/10 via-[#0b1120] to-[#0b1120]" />
                    <div className="absolute inset-x-0 bottom-0 h-[2px] bg-gradient-to-r from-transparent via-blue-400/20 to-transparent blur-[1px]" />

                    <div className="relative flex flex-col items-center px-5 pt-8">
                        {/* Avatar */}
                        <div className="relative">
                            <div className={`h-24 w-24 overflow-hidden rounded-full border-[3px] ${user?.is_coach
                                    ? 'border-amber-400/60 shadow-[0_0_25px_rgba(251,191,36,0.25)]'
                                    : 'border-blue-400/30 shadow-[0_0_20px_rgba(59,130,246,0.15)]'
                                }`}>
                                {user?.avatar ? (
                                    <img src={user.avatar} alt={user.name} className="h-full w-full object-cover" />
                                ) : (
                                    <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-blue-500/30 to-indigo-500/30 text-2xl font-bold text-blue-100">
                                        {user?.name?.charAt(0) ?? 'U'}
                                    </div>
                                )}
                            </div>
                            {/* Online indicator */}
                            <div className="absolute bottom-1 right-1 h-4 w-4 rounded-full border-2 border-[#0b1120] bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.6)]" />
                        </div>

                        {/* Name + Badge */}
                        <div className="mt-4 flex items-center gap-2.5">
                            <h1 className="text-xl font-bold text-white">{user?.name ?? 'User'}</h1>
                            {user?.is_coach && <CoachBadge />}
                        </div>

                        {/* Location */}
                        {user?.location && (
                            <div className="mt-1.5 flex items-center gap-1.5 text-sm text-blue-200/40">
                                <MapPin className="h-3.5 w-3.5 text-blue-400/50" />
                                <span>{user.location}</span>
                            </div>
                        )}

                        {/* Member since */}
                        <div className="mt-1 flex items-center gap-1.5 text-xs text-blue-200/25">
                            <Calendar className="h-3 w-3" />
                            <span>Member since {memberSince}</span>
                        </div>

                        {/* Bio */}
                        {user?.bio && (
                            <p className="mt-3 max-w-xs text-center text-sm leading-relaxed text-blue-100/50">
                                {user.bio}
                            </p>
                        )}

                        {/* Edit Profile button */}
                        <button className="mt-4 flex items-center gap-2 rounded-2xl border border-blue-400/12 bg-blue-500/8 px-5 py-2 text-sm font-medium text-blue-200/60 transition-all hover:bg-blue-500/15 hover:text-blue-200/80">
                            <Edit3 className="h-3.5 w-3.5" />
                            Edit Profile
                        </button>
                    </div>
                </div>

                {/* ── Content ── */}
                <div className="space-y-5 px-4 pb-6">

                    {/* ── Stats Grid ── */}
                    <div className="grid grid-cols-2 gap-3">
                        {stats.map((stat) => {
                            const Icon = stat.icon;
                            return (
                                <div
                                    key={stat.label}
                                    className="overflow-hidden rounded-[18px] border border-blue-400/10 bg-[#111d36]/50 p-4 shadow-[0_0_20px_rgba(59,130,246,0.03)] backdrop-blur-2xl"
                                >
                                    <div className="flex items-center gap-2">
                                        <div className="flex h-8 w-8 items-center justify-center rounded-full border border-blue-400/10 bg-blue-500/8">
                                            <Icon className={`h-3.5 w-3.5 ${stat.color} drop-shadow-[0_0_6px_rgba(147,197,253,0.3)]`} />
                                        </div>
                                        <span className="text-[11px] font-semibold text-blue-200/40">{stat.label}</span>
                                    </div>
                                    <p className="mt-2 text-2xl font-bold text-blue-100">{stat.value}</p>
                                    <p className="text-[10px] text-blue-200/30">{stat.sub}</p>
                                </div>
                            );
                        })}
                    </div>

                    {/* ── Achievements ── */}
                    <div>
                        <div className="flex items-center justify-between">
                            <h2 className="text-[17px] font-bold text-blue-50">Achievements</h2>
                            <button className="flex items-center gap-0.5 text-xs font-medium text-blue-300/50 transition hover:text-blue-300/80">
                                View All
                                <ChevronRight className="h-3.5 w-3.5" />
                            </button>
                        </div>
                        <div className="mt-3 flex gap-2.5">
                            {achievements.map((ach) => (
                                <div
                                    key={ach.name}
                                    className={`flex flex-1 flex-col items-center gap-1.5 rounded-[16px] border p-3 text-center transition-all ${ach.earned
                                            ? 'border-blue-400/10 bg-[#111d36]/50 shadow-[0_0_15px_rgba(59,130,246,0.04)]'
                                            : 'border-blue-400/5 bg-[#111d36]/20 opacity-40'
                                        }`}
                                >
                                    <span className="text-xl">{ach.icon}</span>
                                    <span className="text-[9px] font-semibold leading-tight text-blue-200/50">{ach.name}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* ── Contact Info ── */}
                    <div className="overflow-hidden rounded-[18px] border border-blue-400/10 bg-[#111d36]/50 p-4 shadow-[0_0_20px_rgba(59,130,246,0.03)] backdrop-blur-2xl">
                        <p className="text-[13px] font-semibold text-blue-100/90">Contact Info</p>
                        <div className="mt-3 space-y-2.5">
                            <div className="flex items-center gap-3">
                                <div className="flex h-8 w-8 items-center justify-center rounded-full border border-blue-400/10 bg-blue-500/8">
                                    <Mail className="h-3.5 w-3.5 text-blue-300/60" />
                                </div>
                                <span className="text-sm text-blue-200/50">{user?.email ?? '—'}</span>
                            </div>
                            {user?.phone && (
                                <div className="flex items-center gap-3">
                                    <div className="flex h-8 w-8 items-center justify-center rounded-full border border-blue-400/10 bg-blue-500/8">
                                        <Phone className="h-3.5 w-3.5 text-blue-300/60" />
                                    </div>
                                    <span className="text-sm text-blue-200/50">{user.phone}</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* ── Recent Activity ── */}
                    <div>
                        <div className="flex items-center justify-between">
                            <h2 className="text-[17px] font-bold text-blue-50">Recent Activity</h2>
                            <button className="flex items-center gap-0.5 text-xs font-medium text-blue-300/50 transition hover:text-blue-300/80">
                                View All
                                <ChevronRight className="h-3.5 w-3.5" />
                            </button>
                        </div>
                        <div className="mt-3 space-y-2.5">
                            {recentActivity.map((activity, idx) => (
                                <div
                                    key={idx}
                                    className="flex items-center gap-3.5 overflow-hidden rounded-[18px] border border-blue-400/8 bg-[#111d36]/40 p-3 shadow-[0_0_20px_rgba(59,130,246,0.03)] backdrop-blur-xl"
                                >
                                    {/* Circle icon */}
                                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-blue-400/10 bg-blue-500/8">
                                        <Waves className="h-4.5 w-4.5 text-blue-300/60" />
                                    </div>
                                    {/* Info */}
                                    <div className="flex-1">
                                        <p className="text-sm font-bold text-blue-100">{activity.pool}</p>
                                        <p className="mt-0.5 text-xs text-blue-200/35">
                                            {activity.duration} · {activity.laps} laps
                                        </p>
                                    </div>
                                    {/* Date */}
                                    <span className="text-xs font-medium text-blue-200/30">{activity.date}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* ═══════════════════════════════════════════════════════
                DESKTOP LAYOUT
            ═══════════════════════════════════════════════════════ */}
            <div className="mx-auto hidden max-w-7xl md:block">
                {/* ── Profile Header Banner ── */}
                <div className="relative mx-5 mt-5 overflow-hidden rounded-[28px] border border-blue-400/8">
                    {/* Background */}
                    <div className="h-[200px] bg-gradient-to-br from-blue-600/15 via-[#111d36] to-indigo-600/10" />
                    <div className="absolute inset-x-0 bottom-0 h-[2px] bg-gradient-to-r from-transparent via-blue-400/20 to-transparent blur-[1px]" />

                    {/* Content overlay */}
                    <div className="absolute inset-0 flex items-end p-8">
                        <div className="flex items-end gap-6">
                            {/* Avatar */}
                            <div className={`h-28 w-28 shrink-0 overflow-hidden rounded-full border-[3px] ${user?.is_coach
                                    ? 'border-amber-400/60 shadow-[0_0_30px_rgba(251,191,36,0.25)]'
                                    : 'border-blue-400/30 shadow-[0_0_25px_rgba(59,130,246,0.15)]'
                                }`}>
                                {user?.avatar ? (
                                    <img src={user.avatar} alt={user.name} className="h-full w-full object-cover" />
                                ) : (
                                    <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-blue-500/30 to-indigo-500/30 text-3xl font-bold text-blue-100">
                                        {user?.name?.charAt(0) ?? 'U'}
                                    </div>
                                )}
                            </div>
                            {/* Info */}
                            <div className="pb-1">
                                <div className="flex items-center gap-3">
                                    <h1 className="text-2xl font-bold tracking-tight text-white">{user?.name ?? 'User'}</h1>
                                    {user?.is_coach && <CoachBadge size="lg" />}
                                </div>
                                <div className="mt-1.5 flex items-center gap-4">
                                    {user?.location && (
                                        <div className="flex items-center gap-1.5 text-sm text-blue-200/40">
                                            <MapPin className="h-3.5 w-3.5 text-blue-400/50" />
                                            <span>{user.location}</span>
                                        </div>
                                    )}
                                    <div className="flex items-center gap-1.5 text-sm text-blue-200/30">
                                        <Calendar className="h-3.5 w-3.5" />
                                        <span>Member since {memberSince}</span>
                                    </div>
                                </div>
                                {user?.bio && (
                                    <p className="mt-2 max-w-lg text-sm leading-relaxed text-blue-100/50">
                                        {user.bio}
                                    </p>
                                )}
                            </div>
                        </div>
                        {/* Edit button */}
                        <div className="ml-auto self-start pt-2">
                            <button className="flex items-center gap-2 rounded-2xl border border-blue-400/12 bg-blue-500/8 px-5 py-2 text-sm font-medium text-blue-200/60 transition-all hover:bg-blue-500/15 hover:text-blue-200/80">
                                <Edit3 className="h-3.5 w-3.5" />
                                Edit Profile
                            </button>
                        </div>
                    </div>
                </div>

                {/* ── Desktop Content Grid ── */}
                <div className="mt-5 grid grid-cols-3 gap-4 px-5">

                    {/* Col 1: Stats */}
                    <div className="overflow-hidden rounded-[22px] border border-blue-400/10 bg-[#111d36]/50 p-5 shadow-[0_0_30px_rgba(59,130,246,0.04)] backdrop-blur-2xl">
                        <p className="text-[13px] font-semibold text-blue-100/90">Statistics</p>
                        <div className="mt-4 space-y-4">
                            {stats.map((stat) => {
                                const Icon = stat.icon;
                                return (
                                    <div key={stat.label} className="flex items-center gap-3">
                                        <div className="flex h-10 w-10 items-center justify-center rounded-full border border-blue-400/10 bg-blue-500/8">
                                            <Icon className={`h-4 w-4 ${stat.color}`} />
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-xs text-blue-200/40">{stat.label}</p>
                                            <p className="text-lg font-bold text-blue-100">{stat.value} <span className="text-xs font-normal text-blue-200/30">{stat.sub}</span></p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Col 2: Achievements + Contact */}
                    <div className="space-y-4">
                        {/* Achievements */}
                        <div className="overflow-hidden rounded-[22px] border border-blue-400/10 bg-[#111d36]/50 p-5 shadow-[0_0_30px_rgba(59,130,246,0.04)] backdrop-blur-2xl">
                            <div className="flex items-center justify-between">
                                <p className="text-[13px] font-semibold text-blue-100/90">Achievements</p>
                                <button className="text-[11px] font-medium text-blue-300/40 hover:text-blue-300/70">View All</button>
                            </div>
                            <div className="mt-3 grid grid-cols-4 gap-2">
                                {achievements.map((ach) => (
                                    <div
                                        key={ach.name}
                                        className={`flex flex-col items-center gap-1.5 rounded-[14px] border p-3 text-center transition-all ${ach.earned
                                                ? 'border-blue-400/10 bg-[#0b1120]/40'
                                                : 'border-blue-400/5 bg-[#0b1120]/20 opacity-40'
                                            }`}
                                    >
                                        <span className="text-lg">{ach.icon}</span>
                                        <span className="text-[9px] font-semibold leading-tight text-blue-200/50">{ach.name}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Contact Info */}
                        <div className="overflow-hidden rounded-[22px] border border-blue-400/10 bg-[#111d36]/50 p-5 shadow-[0_0_30px_rgba(59,130,246,0.04)] backdrop-blur-2xl">
                            <p className="text-[13px] font-semibold text-blue-100/90">Contact Info</p>
                            <div className="mt-3 space-y-3">
                                <div className="flex items-center gap-3">
                                    <div className="flex h-9 w-9 items-center justify-center rounded-full border border-blue-400/10 bg-blue-500/8">
                                        <Mail className="h-3.5 w-3.5 text-blue-300/60" />
                                    </div>
                                    <span className="text-sm text-blue-200/50">{user?.email ?? '—'}</span>
                                </div>
                                {user?.phone && (
                                    <div className="flex items-center gap-3">
                                        <div className="flex h-9 w-9 items-center justify-center rounded-full border border-blue-400/10 bg-blue-500/8">
                                            <Phone className="h-3.5 w-3.5 text-blue-300/60" />
                                        </div>
                                        <span className="text-sm text-blue-200/50">{user.phone}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Col 3: Recent Activity */}
                    <div className="overflow-hidden rounded-[22px] border border-blue-400/10 bg-[#111d36]/50 p-5 shadow-[0_0_30px_rgba(59,130,246,0.04)] backdrop-blur-2xl">
                        <div className="flex items-center justify-between">
                            <p className="text-[13px] font-semibold text-blue-100/90">Recent Activity</p>
                            <button className="text-[11px] font-medium text-blue-300/40 hover:text-blue-300/70">View All</button>
                        </div>
                        <div className="mt-3 space-y-3">
                            {recentActivity.map((activity, idx) => (
                                <div key={idx} className="flex items-center gap-3 rounded-xl border border-blue-400/6 bg-[#0b1120]/40 p-2.5">
                                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-blue-400/10 bg-blue-500/8">
                                        <Waves className="h-4 w-4 text-blue-300/60" />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <p className="truncate text-xs font-bold text-blue-100">{activity.pool}</p>
                                        <p className="text-[10px] text-blue-200/30">
                                            {activity.duration} · {activity.laps} laps
                                        </p>
                                    </div>
                                    <span className="shrink-0 text-[10px] font-medium text-blue-200/25">{activity.date}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </HomeLayout>
    );
}

/* ── COACH Badge Component ─────────────────────────────────────────────── */

function CoachBadge({ size = 'sm' }: { size?: 'sm' | 'lg' }) {
    const isLg = size === 'lg';
    return (
        <div
            className={`inline-flex items-center gap-1.5 rounded-full border border-amber-400/25 bg-gradient-to-r from-amber-500/20 to-orange-500/15 shadow-[0_0_12px_rgba(251,191,36,0.2)] backdrop-blur-sm ${isLg ? 'px-3.5 py-1.5' : 'px-2.5 py-1'
                }`}
        >
            <Shield
                className={`text-amber-400 drop-shadow-[0_0_4px_rgba(251,191,36,0.5)] ${isLg ? 'h-4 w-4' : 'h-3 w-3'
                    }`}
                fill="currentColor"
            />
            <span
                className={`font-extrabold tracking-widest text-amber-300 ${isLg ? 'text-xs' : 'text-[10px]'
                    }`}
            >
                COACH
            </span>
        </div>
    );
}
