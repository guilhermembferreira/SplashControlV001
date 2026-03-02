import { useState, useRef, useEffect } from 'react';
import { Link, usePage, router } from '@inertiajs/react';
import { Home, UserRound, Timer, Settings, Users, LogOut } from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
    { icon: Home,      href: '/',        id: 'home',    label: 'Início' },
    { icon: Timer,     href: '/timer',   id: 'timer',   label: 'Timer'  },
    { icon: UserRound, href: '/profile', id: 'profile', label: 'Perfil' },
];

export function TopNav() {
    const { url, props } = usePage();
    const user = (props as any).auth?.user;
    const [showUserMenu, setShowUserMenu] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        function handleClickOutside(e: MouseEvent) {
            if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
                setShowUserMenu(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <nav className="sticky top-0 z-50 hidden md:block">
            <div className="border-b border-blue-400/6 bg-[#0b1120]/90 backdrop-blur-2xl">
                <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">

                    {/* Logo */}
                    <Link href="/" className="group flex items-center gap-2.5">
                        <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-blue-400/15 bg-blue-500/10 transition-all duration-300 group-hover:shadow-[0_0_20px_rgba(59,130,246,0.15)]">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4.5 w-4.5 text-blue-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M2 12c.5-1 1.5-2 3-2s2.5 1 3 2 1.5 2 3 2 2.5-1 3-2 1.5-2 3-2 2.5 1 3 2" />
                                <path d="M2 17c.5-1 1.5-2 3-2s2.5 1 3 2 1.5 2 3 2 2.5-1 3-2 1.5-2 3-2 2.5 1 3 2" />
                            </svg>
                        </div>
                        <span className="text-lg font-bold tracking-tight text-blue-50">SplashControl</span>
                    </Link>

                    {/* Center nav */}
                    <div className="flex items-center gap-1">
                        {navItems.map((item) => {
                            const Icon = item.icon;
                            const isActive = url === item.href || (item.href !== '/' && url.startsWith(item.href));
                            return (
                                <Link
                                    key={item.id}
                                    href={item.href}
                                    className={cn(
                                        'flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition-all duration-300',
                                        isActive
                                            ? 'bg-blue-500/10 text-blue-100'
                                            : 'text-blue-200/25 hover:bg-blue-500/5 hover:text-blue-200/50',
                                    )}
                                >
                                    <Icon className="h-4 w-4" strokeWidth={isActive ? 2.2 : 1.5} fill={isActive ? 'currentColor' : 'none'} />
                                    <span>{item.label}</span>
                                </Link>
                            );
                        })}

                        {/* Coach items */}
                        {user?.is_coach && (
                            <>
                                <Link
                                    href="/coach/athletes"
                                    className={cn(
                                        'flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition-all duration-300',
                                        url.startsWith('/coach/athletes')
                                            ? 'bg-amber-500/10 text-amber-200'
                                            : 'text-amber-200/30 hover:bg-amber-500/10 hover:text-amber-200/70',
                                    )}
                                >
                                    <UserRound className="h-4 w-4" strokeWidth={url.startsWith('/coach/athletes') ? 2.2 : 1.5} />
                                    <span>Atletas</span>
                                </Link>
                                <Link
                                    href="/coach/groups"
                                    className={cn(
                                        'flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition-all duration-300',
                                        url.startsWith('/coach/groups')
                                            ? 'bg-amber-500/10 text-amber-200'
                                            : 'text-amber-200/30 hover:bg-amber-500/10 hover:text-amber-200/70',
                                    )}
                                >
                                    <Users className="h-4 w-4" strokeWidth={url.startsWith('/coach/groups') ? 2.2 : 1.5} />
                                    <span>Grupos</span>
                                </Link>
                            </>
                        )}
                    </div>

                    {/* Right side */}
                    <div className="flex items-center gap-3">

                        {/* Settings */}
                        <Link
                            href="/settings/profile"
                            className={cn(
                                'flex h-9 w-9 items-center justify-center rounded-xl border border-blue-400/8 transition-all hover:bg-blue-500/5',
                                url.startsWith('/settings')
                                    ? 'text-blue-200/70 bg-blue-500/5'
                                    : 'text-blue-200/25 hover:text-blue-200/50',
                            )}
                        >
                            <Settings className="h-[18px] w-[18px]" />
                        </Link>

                        {/* Avatar + dropdown */}
                        <div ref={menuRef} className="relative">
                            <button
                                onClick={() => setShowUserMenu(v => !v)}
                                className="h-9 w-9 overflow-hidden rounded-full border-2 border-amber-400/40 shadow-[0_0_10px_rgba(251,191,36,0.15)] transition-all hover:border-amber-400/60"
                            >
                                {user?.avatar ? (
                                    <img src={user.avatar} alt={user.name} className="h-full w-full object-cover" />
                                ) : (
                                    <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-blue-500/30 to-indigo-500/30 text-xs font-bold text-blue-100">
                                        {user?.name?.charAt(0) ?? 'U'}
                                    </div>
                                )}
                            </button>

                            {showUserMenu && (
                                <div className="absolute right-0 top-11 w-52 rounded-xl border border-blue-400/10 bg-[#111d36] py-1 shadow-2xl">
                                    {/* User info */}
                                    <div className="border-b border-blue-400/8 px-3 py-2.5">
                                        <p className="truncate text-sm font-semibold text-blue-50">{user?.name}</p>
                                        <p className="truncate text-xs text-blue-200/40">{user?.email}</p>
                                    </div>

                                    <Link
                                        href="/profile"
                                        onClick={() => setShowUserMenu(false)}
                                        className="flex items-center gap-2.5 px-3 py-2 text-sm text-blue-200/60 transition-colors hover:bg-blue-500/5 hover:text-blue-100"
                                    >
                                        <UserRound className="h-4 w-4" />
                                        Perfil
                                    </Link>
                                    <Link
                                        href="/settings/profile"
                                        onClick={() => setShowUserMenu(false)}
                                        className="flex items-center gap-2.5 px-3 py-2 text-sm text-blue-200/60 transition-colors hover:bg-blue-500/5 hover:text-blue-100"
                                    >
                                        <Settings className="h-4 w-4" />
                                        Definições
                                    </Link>

                                    <div className="my-1 border-t border-blue-400/8" />

                                    <button
                                        onClick={() => router.post('/logout')}
                                        className="flex w-full items-center gap-2.5 px-3 py-2 text-sm text-red-400/70 transition-colors hover:bg-red-500/5 hover:text-red-400"
                                    >
                                        <LogOut className="h-4 w-4" />
                                        Terminar sessão
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                </div>
            </div>
        </nav>
    );
}
