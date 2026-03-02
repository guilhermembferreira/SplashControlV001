import { Link, usePage } from '@inertiajs/react';
import { Home, UserRound, Timer, Settings, Users } from 'lucide-react';
import { cn } from '@/lib/utils';

interface NavItemDef {
    icon: React.ElementType;
    href: string;
    id: string;
    label: string;
    amber?: boolean;
}

function NavIcon({ item, url }: { item: NavItemDef; url: string }) {
    const Icon = item.icon;
    const isActive = url === item.href || (item.href !== '/' && url.startsWith(item.href));

    return (
        <Link
            href={item.href}
            className={cn(
                'flex flex-col items-center gap-0.5 px-3 py-1 transition-all duration-300',
                item.amber
                    ? isActive ? 'text-amber-400' : 'text-amber-200/30 hover:text-amber-200/70'
                    : isActive ? 'text-white'    : 'text-blue-200/25 hover:text-blue-200/50',
            )}
        >
            <Icon
                className={cn(
                    'h-[22px] w-[22px] transition-all duration-300',
                    isActive && (item.amber
                        ? 'drop-shadow-[0_0_8px_rgba(251,191,36,0.4)]'
                        : 'drop-shadow-[0_0_8px_rgba(255,255,255,0.3)]'),
                )}
                strokeWidth={isActive ? 2.2 : 1.5}
                fill={isActive ? 'currentColor' : 'none'}
            />
            <span className={cn('text-[10px] font-medium leading-none', isActive ? 'opacity-100' : 'opacity-50')}>
                {item.label}
            </span>
        </Link>
    );
}

export function BottomNav() {
    const { url, props } = usePage();
    const user = (props as any).auth?.user;
    const isCoach = user?.is_coach;

    const isTimerActive = url === '/timer' || url.startsWith('/timer');

    return (
        <nav className="fixed inset-x-0 bottom-0 z-50 md:hidden">
            {/* Gradient fade */}
            <div className="pointer-events-none absolute inset-x-0 -top-8 h-8 bg-gradient-to-t from-[#0b1120] to-transparent" />

            <div className="relative bg-[#0b1120]/95 pb-[env(safe-area-inset-bottom,0px)] backdrop-blur-xl">
                {/* Top glow line */}
                <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-blue-500/15 to-transparent" />

                {isCoach ? (
                    /* ── Coach layout: Início | Atletas | [Timer FAB] | Grupos | Perfil ── */
                    <div className="flex items-end justify-around px-4 pt-1 pb-2">
                        <NavIcon item={{ icon: Home,      href: '/',                id: 'home',     label: 'Início'  }} url={url} />
                        <NavIcon item={{ icon: UserRound, href: '/coach/athletes', id: 'athletes', label: 'Atletas', amber: true }} url={url} />

                        {/* Timer FAB */}
                        <Link href="/timer" className="group relative -mt-6 flex flex-col items-center gap-0.5">
                            <div className="absolute inset-x-0 top-0 h-[50px] rounded-full bg-blue-500/20 blur-xl transition-all duration-500 group-hover:bg-blue-500/30" />
                            <div className={cn(
                                'relative flex h-[50px] w-[50px] items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-blue-600 transition-all duration-300 group-active:scale-90',
                                isTimerActive
                                    ? 'shadow-[0_4px_24px_rgba(59,130,246,0.7)]'
                                    : 'shadow-[0_4px_20px_rgba(59,130,246,0.5)] group-hover:shadow-[0_6px_30px_rgba(59,130,246,0.6)]',
                            )}>
                                <Timer className="h-6 w-6 text-white" strokeWidth={2} fill={isTimerActive ? 'currentColor' : 'none'} />
                            </div>
                            <span className="text-[10px] font-medium leading-none text-blue-200/50">Timer</span>
                        </Link>

                        <NavIcon item={{ icon: Users,     href: '/coach/groups',   id: 'groups',   label: 'Grupos',  amber: true }} url={url} />
                        <NavIcon item={{ icon: UserRound, href: '/profile',        id: 'profile',  label: 'Perfil'  }} url={url} />
                    </div>
                ) : (
                    /* ── Non-coach layout: Início | Timer | Perfil | Definições ── */
                    <div className="flex items-center justify-around px-6 pt-2 pb-2">
                        <NavIcon item={{ icon: Home,      href: '/',                 id: 'home',     label: 'Início'     }} url={url} />
                        <NavIcon item={{ icon: Timer,     href: '/timer',            id: 'timer',    label: 'Timer'      }} url={url} />
                        <NavIcon item={{ icon: UserRound, href: '/profile',          id: 'profile',  label: 'Perfil'     }} url={url} />
                        <NavIcon item={{ icon: Settings,  href: '/settings/profile', id: 'settings', label: 'Definições' }} url={url} />
                    </div>
                )}
            </div>
        </nav>
    );
}
