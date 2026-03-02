import { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import HomeLayout from '@/layouts/home-layout';
import { Users, Plus, ChevronRight, X, UserPlus } from 'lucide-react';

interface Athlete { id: number; name: string; }

export default function GroupsIndex({
    groups,
    athletes,
}: {
    groups:   { id: number; name: string; description?: string; athletes_count: number }[];
    athletes: Athlete[];
}) {
    const [sheetOpen,  setSheetOpen]  = useState(false);
    const [groupName,  setGroupName]  = useState('');
    const [selected,   setSelected]   = useState<Athlete[]>([]);
    const [tab,        setTab]        = useState<'available' | 'selected'>('available');
    const [newName,    setNewName]    = useState('');
    const [submitting, setSubmitting] = useState(false);

    const openSheet = () => {
        setGroupName('');
        setSelected([]);
        setNewName('');
        setTab('available');
        setSheetOpen(true);
    };

    const addToGroup = (a: Athlete) => {
        if (selected.some(x => x.id === a.id)) return;
        setSelected(prev => [...prev, a]);
    };

    const removeFromGroup = (id: number) =>
        setSelected(prev => prev.filter(a => a.id !== id));

    const submit = () => {
        if (!groupName.trim() || submitting) return;
        setSubmitting(true);
        router.post('/coach/groups', {
            name:        groupName.trim(),
            athlete_ids: selected.map(a => a.id),
        }, {
            onSuccess: () => { setSheetOpen(false); setSubmitting(false); },
            onError:   () => setSubmitting(false),
        });
    };

    const createAthleteInline = () => {
        const name = newName.trim();
        if (!name) return;
        router.post('/coach/athletes', { name }, {
            preserveState: true,
            only: ['athletes'],
            onSuccess: () => setNewName(''),
        });
    };

    const available = athletes.filter(a => !selected.some(s => s.id === a.id));

    return (
        <HomeLayout>
            <Head title="Grupos de Treino" />

            <div className="flex flex-col h-[calc(100dvh-7rem)] md:h-[calc(100dvh-6rem)] overflow-hidden px-2 pt-2 pb-1 gap-2">

                {/* Header */}
                <div className="flex items-center justify-between shrink-0 px-1">
                    <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-blue-400" />
                        <h1 className="text-white font-bold text-sm tracking-wide">Grupos</h1>
                        <span className="text-white/25 text-xs tabular-nums">{groups.length}</span>
                    </div>
                    <button
                        onClick={openSheet}
                        className="h-7 px-2.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 border transition-all bg-blue-500/20 hover:bg-blue-500/30 text-blue-200 border-blue-400/20"
                    >
                        <Plus className="w-3 h-3" />
                        Criar grupo
                    </button>
                </div>

                {/* Groups list */}
                <div className="flex-1 min-h-0 overflow-y-auto space-y-2 pb-2">
                    {groups.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full gap-3 text-center px-6">
                            <div className="w-16 h-16 rounded-2xl bg-white/3 border border-white/8 flex items-center justify-center">
                                <Users className="w-7 h-7 text-white/15" />
                            </div>
                            <p className="text-white/30 text-sm font-semibold">Sem grupos criados</p>
                            <button
                                onClick={openSheet}
                                className="h-8 px-4 rounded-xl text-xs font-semibold border transition-all bg-blue-500/15 text-blue-300/80 border-blue-400/20 flex items-center gap-1.5"
                            >
                                <Plus className="w-3 h-3" />
                                Criar primeiro grupo
                            </button>
                        </div>
                    ) : (
                        groups.map(group => (
                            <Link
                                key={group.id}
                                href={`/coach/groups/${group.id}`}
                                className="flex items-center gap-3 rounded-2xl border border-white/8 bg-white/2.5 hover:bg-white/4 active:bg-white/5 hover:border-white/15 px-4 py-3.5 transition-all"
                            >
                                <div className="w-10 h-10 rounded-xl bg-blue-500/15 border border-blue-400/15 flex items-center justify-center shrink-0">
                                    <span className="text-sm font-black text-blue-300/70">{group.name[0]?.toUpperCase()}</span>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-white/85 font-bold text-sm truncate">{group.name}</p>
                                    <p className="text-white/25 text-xs mt-0.5">
                                        {group.description ? group.description : `${group.athletes_count ?? 0} atletas`}
                                    </p>
                                </div>
                                <div className="flex items-center gap-2 shrink-0">
                                    <span className="h-5 px-2 rounded-full bg-white/5 border border-white/8 text-white/35 text-[10px] font-semibold tabular-nums flex items-center">
                                        {group.athletes_count ?? 0}
                                    </span>
                                    <ChevronRight className="w-3.5 h-3.5 text-white/20" />
                                </div>
                            </Link>
                        ))
                    )}
                </div>
            </div>

            {/* ── Create group sheet ── */}
            {sheetOpen && (
                <>
                    <div className="fixed inset-0 bg-black/60 z-40" onClick={() => setSheetOpen(false)} />
                    <div className="fixed bottom-0 left-0 right-0 z-50 bg-[#0a0c12] border-t border-white/10 rounded-t-2xl h-[85vh] flex flex-col">

                        {/* Drag handle */}
                        <div className="flex justify-center pt-3 pb-1 shrink-0">
                            <div className="w-8 h-1 rounded-full bg-white/15" />
                        </div>

                        {/* Name + criar */}
                        <div className="flex items-center gap-2 px-4 pt-2 pb-3 shrink-0">
                            <input
                                value={groupName}
                                onChange={e => setGroupName(e.target.value)}
                                onKeyDown={e => e.key === 'Enter' && submit()}
                                placeholder="Nome do grupo..."
                                autoFocus
                                className="flex-1 h-11 px-4 rounded-2xl bg-white/5 border border-white/10 text-white text-base font-semibold placeholder-white/20 focus:outline-none focus:border-blue-400/40 focus:bg-white/8"
                            />
                            <button
                                onClick={submit}
                                disabled={!groupName.trim() || submitting}
                                className="h-11 px-5 rounded-2xl text-sm font-bold bg-blue-500/25 hover:bg-blue-500/35 text-blue-200 border border-blue-400/25 disabled:opacity-30 transition-all shrink-0"
                            >
                                Criar
                            </button>
                            <button
                                onClick={() => setSheetOpen(false)}
                                className="w-9 h-9 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/35 transition-colors shrink-0"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        {/* Tab bar */}
                        <div className="flex h-9 mx-4 mb-3 rounded-xl bg-white/5 border border-white/8 overflow-hidden p-0.5 gap-0.5 shrink-0">
                            <button
                                onClick={() => setTab('available')}
                                className={`flex-1 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                                    tab === 'available'
                                        ? 'bg-white/10 text-white/80'
                                        : 'text-white/30 hover:text-white/50'
                                }`}
                            >
                                <Users className="w-3 h-3" />
                                Disponíveis
                                {available.length > 0 && (
                                    <span className="text-[9px] tabular-nums opacity-60">{available.length}</span>
                                )}
                            </button>
                            <button
                                onClick={() => setTab('selected')}
                                className={`flex-1 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                                    tab === 'selected'
                                        ? 'bg-blue-500/20 text-blue-200'
                                        : 'text-white/30 hover:text-white/50'
                                }`}
                            >
                                No grupo
                                {selected.length > 0 && (
                                    <span className={`text-[9px] tabular-nums font-black ${tab === 'selected' ? 'text-blue-300' : 'opacity-60'}`}>
                                        {selected.length}
                                    </span>
                                )}
                            </button>
                        </div>

                        {/* Tab: Disponíveis */}
                        {tab === 'available' && (
                            <div className="flex flex-col flex-1 min-h-0">
                                <div className="flex-1 min-h-0 overflow-y-auto px-4 space-y-1.5 pb-2">
                                    {available.map(a => (
                                        <button
                                            key={a.id}
                                            onClick={() => addToGroup(a)}
                                            className="w-full flex items-center gap-3 rounded-2xl border border-white/8 bg-white/2.5 hover:bg-white/4 active:bg-white/5 hover:border-white/15 px-3.5 py-3 text-left transition-all"
                                        >
                                            <div className="w-9 h-9 rounded-full bg-blue-500/15 border border-blue-400/15 flex items-center justify-center shrink-0">
                                                <span className="text-sm font-bold text-blue-300/70">{a.name[0]?.toUpperCase()}</span>
                                            </div>
                                            <span className="flex-1 text-white/70 text-sm font-medium truncate">{a.name}</span>
                                            <div className="w-7 h-7 rounded-lg bg-blue-500/10 border border-blue-400/15 flex items-center justify-center shrink-0">
                                                <Plus className="w-3.5 h-3.5 text-blue-300/50" />
                                            </div>
                                        </button>
                                    ))}
                                    {athletes.length === 0 && (
                                        <div className="flex flex-col items-center gap-2 py-10 text-center">
                                            <Users className="w-6 h-6 text-white/10" />
                                            <p className="text-white/20 text-xs">Sem atletas criados ainda</p>
                                        </div>
                                    )}
                                </div>

                                {/* Criar atleta inline */}
                                <div className="shrink-0 border-t border-white/6 px-4 py-3">
                                    <div className="flex gap-2">
                                        <div className="flex-1 relative">
                                            <UserPlus className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/20 pointer-events-none" />
                                            <input
                                                value={newName}
                                                onChange={e => setNewName(e.target.value)}
                                                onKeyDown={e => e.key === 'Enter' && createAthleteInline()}
                                                placeholder="Criar novo atleta..."
                                                className="w-full h-10 pl-9 pr-3 rounded-xl bg-white/5 border border-white/10 text-white/70 text-sm placeholder-white/20 focus:outline-none focus:border-blue-400/40"
                                            />
                                        </div>
                                        <button
                                            onClick={createAthleteInline}
                                            disabled={!newName.trim()}
                                            className="h-10 px-4 rounded-xl text-xs font-semibold bg-white/5 hover:bg-white/10 text-white/50 hover:text-white/70 border border-white/8 disabled:opacity-30 transition-all shrink-0"
                                        >
                                            Criar
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Tab: No grupo */}
                        {tab === 'selected' && (
                            <div className="flex-1 min-h-0 overflow-y-auto px-4 pb-6 space-y-1.5">
                                {selected.length === 0 ? (
                                    <div className="flex flex-col items-center gap-3 py-12 text-center">
                                        <div className="w-14 h-14 rounded-2xl bg-white/3 border-2 border-dashed border-white/10 flex items-center justify-center">
                                            <Users className="w-6 h-6 text-white/12" />
                                        </div>
                                        <div>
                                            <p className="text-white/25 text-sm font-semibold">Grupo vazio</p>
                                            <p className="text-white/15 text-xs mt-0.5">Volta a Disponíveis e toca nos atletas</p>
                                        </div>
                                        <button
                                            onClick={() => setTab('available')}
                                            className="h-8 px-4 rounded-xl text-xs font-semibold border transition-all bg-blue-500/15 text-blue-300/80 border-blue-400/20 flex items-center gap-1.5"
                                        >
                                            <Plus className="w-3 h-3" />
                                            Adicionar atletas
                                        </button>
                                    </div>
                                ) : (
                                    selected.map((a, idx) => (
                                        <div key={a.id} className="flex items-center gap-3 rounded-2xl border border-white/8 bg-white/2.5 px-3.5 py-3">
                                            <span className="text-[10px] text-white/20 w-5 tabular-nums shrink-0 text-center">{idx + 1}</span>
                                            <div className="w-9 h-9 rounded-full bg-blue-500/15 border border-blue-400/15 flex items-center justify-center shrink-0">
                                                <span className="text-sm font-bold text-blue-300/70">{a.name[0]?.toUpperCase()}</span>
                                            </div>
                                            <span className="flex-1 text-white/75 text-sm font-medium truncate">{a.name}</span>
                                            <button
                                                onClick={() => removeFromGroup(a.id)}
                                                className="w-7 h-7 rounded-lg bg-white/5 hover:bg-red-500/15 text-white/25 hover:text-red-400 transition-all flex items-center justify-center shrink-0"
                                            >
                                                <X className="w-3.5 h-3.5" />
                                            </button>
                                        </div>
                                    ))
                                )}
                            </div>
                        )}

                    </div>
                </>
            )}

        </HomeLayout>
    );
}
