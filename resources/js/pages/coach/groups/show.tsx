import { useState, useEffect } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import HomeLayout from '@/layouts/home-layout';
import { ArrowLeft, Trash2, Users, X, Plus } from 'lucide-react';

interface Athlete { id: number; name: string; gender?: string; }
interface Group   { id: number; name: string; description?: string; athletes: Athlete[]; }

export default function GroupShow({
    group: initialGroup,
    availableAthletes: initialAvailable,
}: {
    group: Group;
    availableAthletes: Athlete[];
}) {
    const [members,        setMembers]        = useState<Athlete[]>(initialGroup.athletes ?? []);
    const [available,      setAvailable]      = useState<Athlete[]>(initialAvailable);
    const [dragOver,       setDragOver]       = useState(false);
    const [newAthleteName, setNewAthleteName] = useState('');
    const [creatingAthlete, setCreatingAthlete] = useState(false);

    useEffect(() => {
        setMembers(initialGroup.athletes ?? []);
    }, [initialGroup.id]);

    useEffect(() => {
        setAvailable(initialAvailable);
    }, [initialAvailable]);

    const addAthlete = (a: Athlete) => {
        if (members.some(m => m.id === a.id)) return;
        setMembers(prev => [...prev, a]);
        setAvailable(prev => prev.filter(x => x.id !== a.id));
        router.post(
            `/coach/groups/${initialGroup.id}/add-athlete`,
            { athlete_id: a.id },
            {
                preserveState: true,
                preserveScroll: true,
                onError: () => {
                    setMembers(prev => prev.filter(x => x.id !== a.id));
                    setAvailable(prev => [...prev, a].sort((x, y) => x.name.localeCompare(y.name)));
                },
            },
        );
    };

    const removeAthlete = (a: Athlete) => {
        setMembers(prev => prev.filter(x => x.id !== a.id));
        setAvailable(prev => [...prev, a].sort((x, y) => x.name.localeCompare(y.name)));
        router.delete(
            `/coach/groups/${initialGroup.id}/remove-athlete/${a.id}`,
            {
                preserveState: true,
                preserveScroll: true,
                onError: () => {
                    setMembers(prev => [...prev, a]);
                    setAvailable(prev => prev.filter(x => x.id !== a.id));
                },
            },
        );
    };

    const createAthlete = () => {
        const name = newAthleteName.trim();
        if (!name) return;
        setCreatingAthlete(true);
        router.post(
            '/coach/athletes',
            { name },
            {
                preserveState: true,
                only: ['availableAthletes'],
                onSuccess: () => {
                    setNewAthleteName('');
                    setCreatingAthlete(false);
                },
                onError: () => setCreatingAthlete(false),
            },
        );
    };

    const destroyGroup = () => {
        if (confirm('Tens a certeza que queres eliminar este grupo?')) {
            router.delete(`/coach/groups/${initialGroup.id}`);
        }
    };

    return (
        <HomeLayout>
            <Head title={initialGroup.name} />

            <div className="flex flex-col h-[calc(100dvh-7rem)] md:h-[calc(100dvh-6rem)] overflow-hidden px-2 pt-2 pb-1 gap-2">

                {/* Header */}
                <div className="flex items-center justify-between shrink-0 px-1">
                    <div className="flex items-center gap-2">
                        <Link
                            href="/coach/groups"
                            className="w-7 h-7 flex items-center justify-center rounded-xl bg-white/5 hover:bg-white/10 border border-white/8 text-white/40 hover:text-white/70 transition-all"
                        >
                            <ArrowLeft className="w-3.5 h-3.5" />
                        </Link>
                        <Users className="w-4 h-4 text-blue-400" />
                        <h1 className="text-white font-bold text-sm tracking-wide">{initialGroup.name}</h1>
                        <span className="text-white/25 text-xs tabular-nums">{members.length} atletas</span>
                    </div>
                    <button
                        onClick={destroyGroup}
                        className="h-7 px-2.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 border transition-all bg-red-500/10 hover:bg-red-500/20 text-red-400/70 hover:text-red-300 border-red-400/15"
                    >
                        <Trash2 className="w-3 h-3" />
                        <span className="hidden sm:block">Eliminar grupo</span>
                    </button>
                </div>

                {/* Two-column body */}
                <div className="flex flex-1 min-h-0 gap-2">

                    {/* ── Left: available athletes ── */}
                    <div className="flex flex-col w-1/2 min-h-0 rounded-2xl border border-white/8 bg-white/2.5 overflow-hidden">
                        <div className="flex items-center gap-2 px-3 py-2.5 border-b border-white/6 shrink-0">
                            <p className="text-white/30 text-[10px] font-bold uppercase tracking-wider">
                                Disponíveis · {available.length}
                            </p>
                        </div>
                        <div className="flex-1 min-h-0 overflow-y-auto px-2 py-2 space-y-1">
                            {available.map(a => (
                                <button
                                    key={a.id}
                                    draggable
                                    onDragStart={e => {
                                        e.dataTransfer.setData('athleteId',   String(a.id));
                                        e.dataTransfer.setData('athleteName', a.name);
                                    }}
                                    onClick={() => addAthlete(a)}
                                    className="w-full flex items-center gap-2.5 rounded-xl border border-white/8 bg-white/2 hover:bg-white/5 hover:border-white/15 px-3 py-2.5 text-left transition-all cursor-grab active:cursor-grabbing"
                                >
                                    <div className="w-7 h-7 rounded-full bg-blue-500/15 border border-blue-400/15 flex items-center justify-center shrink-0">
                                        <span className="text-[10px] font-bold text-blue-300/60">{a.name[0]?.toUpperCase()}</span>
                                    </div>
                                    <span className="flex-1 text-white/65 text-sm font-medium truncate">{a.name}</span>
                                    <Plus className="w-3.5 h-3.5 text-white/15 shrink-0" />
                                </button>
                            ))}
                            {available.length === 0 && (
                                <div className="flex flex-col items-center justify-center h-full gap-2 py-8">
                                    <Users className="w-6 h-6 text-white/10" />
                                    <p className="text-white/15 text-xs text-center">Todos os atletas estão no grupo</p>
                                </div>
                            )}
                        </div>

                        {/* ── Create new athlete ── */}
                        <div className="shrink-0 border-t border-white/6 px-2 py-2">
                            <div className="flex gap-1.5">
                                <input
                                    value={newAthleteName}
                                    onChange={e => setNewAthleteName(e.target.value)}
                                    onKeyDown={e => e.key === 'Enter' && createAthlete()}
                                    placeholder="Novo atleta..."
                                    className="flex-1 h-7 px-2.5 rounded-xl bg-white/5 border border-white/10 text-white/70 text-xs placeholder-white/20 focus:outline-none focus:border-blue-400/40 min-w-0"
                                />
                                <button
                                    onClick={createAthlete}
                                    disabled={!newAthleteName.trim() || creatingAthlete}
                                    className="h-7 px-2.5 rounded-xl text-xs font-semibold bg-blue-500/15 hover:bg-blue-500/25 text-blue-300/70 hover:text-blue-200 border border-blue-400/15 disabled:opacity-30 transition-all flex items-center gap-1 shrink-0"
                                >
                                    <Plus className="w-3 h-3" />
                                    Criar
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* ── Right: group members drop zone ── */}
                    <div
                        className={`flex flex-col w-1/2 min-h-0 rounded-2xl border overflow-hidden transition-all duration-150 ${
                            dragOver
                                ? 'border-blue-400/30 bg-blue-950/20'
                                : 'border-white/8 bg-white/2.5'
                        }`}
                        onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                        onDragLeave={() => setDragOver(false)}
                        onDrop={e => {
                            e.preventDefault();
                            setDragOver(false);
                            const id   = Number(e.dataTransfer.getData('athleteId'));
                            const name = e.dataTransfer.getData('athleteName');
                            if (id && name) addAthlete({ id, name });
                        }}
                    >
                        <div className="flex items-center gap-2 px-3 py-2.5 border-b border-white/6 shrink-0">
                            <p className="text-white/30 text-[10px] font-bold uppercase tracking-wider">
                                {initialGroup.name} · {members.length}
                            </p>
                        </div>
                        <div className="flex-1 min-h-0 overflow-y-auto px-2 py-2 space-y-1">
                            {members.length === 0 ? (
                                <div className={`flex flex-col items-center justify-center h-full gap-2.5 rounded-xl border-2 border-dashed mx-1 transition-all ${
                                    dragOver ? 'border-blue-400/40 bg-blue-500/5' : 'border-white/8'
                                }`}>
                                    <Users className="w-5 h-5 text-white/12" />
                                    <p className="text-white/15 text-[10px] text-center px-4 leading-relaxed">
                                        Toca ou arrasta<br/>atletas para o grupo
                                    </p>
                                </div>
                            ) : (
                                members.map((a, idx) => (
                                    <div key={a.id} className="flex items-center gap-2.5 rounded-xl border border-white/8 bg-white/2.5 px-3 py-2.5">
                                        <span className="text-[9px] text-white/20 w-4 tabular-nums shrink-0">{idx + 1}</span>
                                        <div className="w-7 h-7 rounded-full bg-blue-500/15 border border-blue-400/15 flex items-center justify-center shrink-0">
                                            <span className="text-[10px] font-bold text-blue-300/60">{a.name[0]?.toUpperCase()}</span>
                                        </div>
                                        <span className="flex-1 text-white/70 text-sm font-medium truncate">{a.name}</span>
                                        <button
                                            onClick={() => removeAthlete(a)}
                                            className="text-white/20 hover:text-red-400 transition-colors shrink-0"
                                        >
                                            <X className="w-3.5 h-3.5" />
                                        </button>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                </div>
            </div>
        </HomeLayout>
    );
}
