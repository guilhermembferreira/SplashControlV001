import { useState, useEffect } from 'react';
import { router, usePage } from '@inertiajs/react';
import HomeLayout from '@/layouts/home-layout';
import {
    Play, Pause, RotateCcw, Timer, Plus, Minus, Flag, Trash2,
    LayoutList, Columns3, CheckCircle2, ChevronLeft, ChevronRight,
    History, Save, Users, X, UserPlus,
} from 'lucide-react';

/* ── Types ─────────────────────────────────────────────────────────────── */

type TimerMode = 'groups' | 'lanes' | 'history';

interface AthleteRef { id: number; name: string; }
interface SwimGroupRef { id: number; name: string; athletes: AthleteRef[]; }

interface LaneTimer {
    elapsed: number;
    startTime: number | null;
    isRunning: boolean;
    splits: number[];
    finished: boolean;
    restStart: number | null;
    restElapsed: number;
    athleteId: number | null;
    athleteName: string | null;
}

interface Group {
    id: number;
    name: string;
    swimmers: number;
    distance: number;
    elapsed: number;
    startTime: number | null;
    isRunning: boolean;
    splits: number[];
    restStart: number | null;
    restElapsed: number;
    lanes: LaneTimer[];
    swimGroupId: number | null;
}

interface SessionRecord {
    id: number;
    group_name: string;
    session_date: string;
    elapsed_ms: number;
    distance_m: number | null;
    swimmer_count: number;
    splits: number[] | null;
    created_at: string;
}

/* ── Helpers ────────────────────────────────────────────────────────────── */

const DISTANCES = [0, 25, 50, 100, 200, 400, 800, 1500];

const STROKES = [
    { value: 'livre',    label: 'Livre' },
    { value: 'costas',   label: 'Costas' },
    { value: 'bruços',   label: 'Bruços' },
    { value: 'mariposa', label: 'Mariposa' },
    { value: 'estilos',  label: 'Estilos' },
];

let _uid = 1;

const newLane = (): LaneTimer => ({
    elapsed: 0, startTime: null, isRunning: false,
    splits: [], finished: false, restStart: null, restElapsed: 0,
    athleteId: null, athleteName: null,
});

const newGroup = (n: number): Group => ({
    id: _uid++, name: `Group ${n}`, swimmers: 4, distance: 0,
    elapsed: 0, startTime: null, isRunning: false,
    splits: [], restStart: null, restElapsed: 0,
    lanes: Array.from({ length: 4 }, newLane),
    swimGroupId: null,
});

const pad2 = (n: number) => String(n).padStart(2, '0');

const fmt = (ms: number) => {
    const m  = Math.floor(ms / 60000);
    const s  = Math.floor((ms % 60000) / 1000);
    const cs = Math.floor((ms % 1000) / 10);
    return `${pad2(m)}:${pad2(s)}.${pad2(cs)}`;
};

const fmtRest = (ms: number) => {
    const m = Math.floor(ms / 60000);
    const s = Math.floor((ms % 60000) / 1000);
    return `${pad2(m)}:${pad2(s)}`;
};

const fmtPace = (elapsedMs: number, distanceM: number): string => {
    if (distanceM <= 0) return '';
    const paceMs = (elapsedMs / distanceM) * 100;
    const m = Math.floor(paceMs / 60000);
    const s = Math.floor((paceMs % 60000) / 1000);
    return `${pad2(m)}:${pad2(s)}/100m`;
};

const fmtDate = (dateStr: string): string => {
    const today     = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
    if (dateStr === today)     return 'Hoje';
    if (dateStr === yesterday) return 'Ontem';
    const d = new Date(dateStr + 'T00:00:00');
    return d.toLocaleDateString('pt-PT', { day: 'numeric', month: 'short', year: 'numeric' });
};

const gridCols = (n: number) => {
    if (n <= 1) return 'grid-cols-1';
    if (n === 2) return 'grid-cols-2';
    if (n <= 4) return 'grid-cols-2';
    if (n <= 6) return 'grid-cols-2 sm:grid-cols-3';
    return              'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4';
};

const timerFont = (n: number) => {
    if (n <= 2) return 'text-5xl md:text-6xl';
    if (n <= 4) return 'text-4xl md:text-5xl';
    if (n <= 6) return 'text-3xl md:text-4xl';
    return             'text-2xl md:text-3xl';
};

/* ── Shared style tokens ─────────────────────────────────────────────────── */

const cardBg = (running: boolean, resting: boolean, finished: boolean) => {
    if (running)  return 'border-blue-400/30 bg-blue-950/30 shadow-[0_0_20px_rgba(59,130,246,0.08)]';
    if (resting)  return 'border-amber-400/20 bg-amber-950/15';
    if (finished) return 'border-emerald-400/20 bg-emerald-950/15';
    return               'border-white/8 bg-white/[0.025]';
};

const headerBorder = (running: boolean, resting: boolean, finished: boolean) => {
    if (running)  return 'border-blue-400/15';
    if (resting)  return 'border-amber-400/12';
    if (finished) return 'border-emerald-400/12';
    return               'border-white/6';
};

const timerColor = (running: boolean, resting: boolean, finished: boolean, hasData: boolean) => {
    if (running)  return 'text-blue-100';
    if (resting)  return 'text-amber-200';
    if (finished) return 'text-emerald-300';
    if (hasData)  return 'text-white/90';
    return               'text-white/18';
};

const playBtnCls = (running: boolean) =>
    running
        ? 'bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 border border-amber-400/25'
        : 'bg-blue-500/20 hover:bg-blue-500/30 text-blue-200 border border-blue-400/20';

const iconBtnCls = 'bg-white/5 hover:bg-white/10 text-white/40 hover:text-white/70 border border-white/8';

const globalBtn = (color: 'blue' | 'amber' | 'neutral') => {
    const colors = {
        blue:    'bg-blue-500/20 hover:bg-blue-500/30 text-blue-200 border-blue-400/20',
        amber:   'bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 border-amber-400/25',
        neutral: 'bg-white/5 hover:bg-white/10 text-white/40 hover:text-white/70 border-white/8',
    };
    return `h-7 px-2.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 border transition-all ${colors[color]}`;
};

/* ── Component ──────────────────────────────────────────────────────────── */

export default function TimerPage() {
    const { sessions: propSessions, swimGroups: propSwimGroups, athletes: propAthletes } =
        usePage<{
            sessions: SessionRecord[];
            swimGroups?: SwimGroupRef[];
            athletes?: AthleteRef[];
        }>().props;

    const sessions      = propSessions ?? [];
    const isCoach       = propSwimGroups !== undefined;
    const coachGroups   = propSwimGroups ?? [];
    const coachAthletes = propAthletes ?? [];

    const [mode, setMode]                     = useState<TimerMode>('groups');
    const [activeGroupIdx, setActiveGroupIdx] = useState(0);
    const [groups, setGroups]                 = useState<Group[]>([newGroup(1), newGroup(2)]);
    const [savedFlash, setSavedFlash]         = useState<number | null>(null);

    // Assignment panel state
    const [assignGroupId, setAssignGroupId]         = useState<number | null>(null);
    const [assignPickingLane, setAssignPickingLane] = useState<number | null>(null);
    const [assignSearch, setAssignSearch]           = useState('');
    const [newGroupInput, setNewGroupInput]         = useState('');
    const [newAthleteInput, setNewAthleteInput]     = useState('');

    // Save times modal state
    const [saveTimesGroupId, setSaveTimesGroupId] = useState<number | null>(null);
    const [saveStroke, setSaveStroke]             = useState('livre');
    const [savePoolLength, setSavePoolLength]     = useState<'25m' | '50m'>('25m');
    const [saveDistance, setSaveDistance]         = useState(100);
    const [saveLaneSelected, setSaveLaneSelected] = useState<Set<number>>(new Set());
    const [saveSuccess, setSaveSuccess]           = useState(false);

    useEffect(() => {
        const id = setInterval(() => {
            setGroups(prev => {
                const now = Date.now();
                const anyActive = prev.some(g =>
                    g.isRunning || g.restStart !== null ||
                    g.lanes.some(l => l.isRunning || l.restStart !== null),
                );
                if (!anyActive) return prev;
                return prev.map(g => ({
                    ...g,
                    elapsed: g.isRunning && g.startTime !== null ? now - g.startTime : g.elapsed,
                    restElapsed: !g.isRunning && g.restStart !== null ? now - g.restStart : g.restElapsed,
                    lanes: g.lanes.map(l => ({
                        ...l,
                        elapsed: l.isRunning && l.startTime !== null ? now - l.startTime : l.elapsed,
                        restElapsed: !l.isRunning && l.restStart !== null ? now - l.restStart : l.restElapsed,
                    })),
                }));
            });
        }, 50);
        return () => clearInterval(id);
    }, []);

    /* ── Timer mutations ──────────────────────────────────────────── */

    const upd = (id: number, fn: (g: Group) => Group) =>
        setGroups(prev => prev.map(g => g.id === id ? fn(g) : g));

    const toggleGroup = (id: number) => {
        const now = Date.now();
        upd(id, g => g.isRunning
            ? { ...g, isRunning: false, elapsed: now - (g.startTime ?? now), startTime: null, restStart: now, restElapsed: 0 }
            : { ...g, isRunning: true,  startTime: now - g.elapsed, restStart: null, restElapsed: 0 },
        );
    };

    const resetGroup = (id: number) =>
        upd(id, g => ({ ...g, isRunning: false, elapsed: 0, startTime: null, splits: [], restStart: null, restElapsed: 0 }));

    const addSplit = (id: number) =>
        upd(id, g => g.elapsed === 0 ? g : { ...g, splits: [...g.splits, g.elapsed] });

    const changeSwimmers = (id: number, d: number) =>
        upd(id, g => {
            const count = Math.max(1, Math.min(12, g.swimmers + d));
            const lanes = [...g.lanes];
            while (lanes.length < count) lanes.push(newLane());
            while (lanes.length > count) lanes.pop();
            return { ...g, swimmers: count, lanes };
        });

    const cycleDistance = (id: number) =>
        upd(id, g => {
            const idx     = DISTANCES.indexOf(g.distance);
            const nextIdx = (idx === -1 ? 0 : idx + 1) % DISTANCES.length;
            return { ...g, distance: DISTANCES[nextIdx] };
        });

    const saveSession = (id: number) => {
        const g = groups.find(gr => gr.id === id);
        if (!g || g.elapsed === 0) return;

        const today = new Date().toISOString().split('T')[0];

        router.post('/swim-sessions', {
            group_name:    g.name,
            session_date:  today,
            elapsed_ms:    Math.round(g.elapsed),
            distance_m:    g.distance > 0 ? g.distance : null,
            swimmer_count: g.swimmers,
            splits:        g.splits.length > 0 ? g.splits : null,
        }, {
            preserveState: true,
            only: ['sessions'],
            onSuccess: () => {
                setSavedFlash(id);
                setTimeout(() => setSavedFlash(null), 1500);
            },
        });
    };

    const deleteSession = (sessionId: number) => {
        router.delete(`/swim-sessions/${sessionId}`, {
            preserveState: true,
            only: ['sessions'],
        });
    };

    const toggleLane = (gid: number, li: number) => {
        const now = Date.now();
        upd(gid, g => ({
            ...g,
            lanes: g.lanes.map((l, i) => i !== li ? l
                : l.isRunning
                    ? { ...l, isRunning: false, elapsed: now - (l.startTime ?? now), startTime: null, restStart: now, restElapsed: 0 }
                    : { ...l, isRunning: true, startTime: now - l.elapsed, finished: false, restStart: null, restElapsed: 0 },
            ),
        }));
    };

    const finishLane = (gid: number, li: number) => {
        const now = Date.now();
        upd(gid, g => ({
            ...g,
            lanes: g.lanes.map((l, i) => i !== li ? l : {
                ...l, isRunning: false,
                elapsed: l.isRunning ? now - (l.startTime ?? now) : l.elapsed,
                startTime: null, finished: true, restStart: null, restElapsed: 0,
            }),
        }));
    };

    const addLaneSplit = (gid: number, li: number) =>
        upd(gid, g => ({
            ...g,
            lanes: g.lanes.map((l, i) => i === li && l.elapsed > 0 ? { ...l, splits: [...l.splits, l.elapsed] } : l),
        }));

    const startAllGroupLanes = (gid: number) => {
        const now = Date.now();
        upd(gid, g => ({
            ...g,
            lanes: g.lanes.map(l => l.isRunning || l.finished ? l
                : { ...l, isRunning: true, startTime: now - l.elapsed, restStart: null, restElapsed: 0 },
            ),
        }));
    };

    const pauseAllGroupLanes = (gid: number) => {
        const now = Date.now();
        upd(gid, g => ({
            ...g,
            lanes: g.lanes.map(l => l.isRunning
                ? { ...l, isRunning: false, elapsed: now - (l.startTime ?? now), startTime: null, restStart: now, restElapsed: 0 }
                : l,
            ),
        }));
    };

    const resetAllGroupLanes = (gid: number) =>
        upd(gid, g => ({
            ...g,
            lanes: g.lanes.map(l => ({ ...newLane(), athleteId: l.athleteId, athleteName: l.athleteName })),
        }));

    const refreshLane = (gid: number, li: number) =>
        upd(gid, g => ({
            ...g,
            lanes: g.lanes.map((l, i) => i !== li ? l
                : { ...l, elapsed: 0, startTime: null, isRunning: false, splits: [], finished: false },
            ),
        }));

    const hardResetLane = (gid: number, li: number) =>
        upd(gid, g => ({
            ...g,
            lanes: g.lanes.map((l, i) => i === li
                ? { ...newLane(), athleteId: l.athleteId, athleteName: l.athleteName }
                : l,
            ),
        }));

    const allRunning = groups.length > 0 && groups.every(g => g.isRunning);

    const toggleAll = () => {
        const now = Date.now();
        setGroups(prev => allRunning
            ? prev.map(g => ({ ...g, isRunning: false, elapsed: now - (g.startTime ?? now), startTime: null, restStart: now, restElapsed: 0 }))
            : prev.map(g => g.isRunning ? g : { ...g, isRunning: true, startTime: now - g.elapsed, restStart: null, restElapsed: 0 }),
        );
    };

    const resetAll = () =>
        setGroups(prev => prev.map(g => ({
            ...g, isRunning: false, elapsed: 0, startTime: null, splits: [], restStart: null, restElapsed: 0,
            lanes: g.lanes.map(l => ({ ...newLane(), athleteId: l.athleteId, athleteName: l.athleteName })),
        })));

    const maxGroups = mode === 'lanes' ? 5 : 12;

    const addGroup = () => {
        if (groups.length < maxGroups) setGroups(prev => [...prev, newGroup(prev.length + 1)]);
    };

    const switchMode = (next: TimerMode) => {
        if (next === 'lanes' && groups.length > 5) setGroups(prev => prev.slice(0, 5));
        setMode(next);
        setActiveGroupIdx(0);
    };

    const removeGroup = (id: number) => {
        if (groups.length <= 1) return;
        setGroups(prev => {
            const next = prev.filter(g => g.id !== id);
            setActiveGroupIdx(i => Math.min(i, next.length - 1));
            return next;
        });
    };

    /* ── Coach mutations ─────────────────────────────────────────────── */

    const openAssignPanel = (groupId: number) => {
        setAssignGroupId(groupId);
        setAssignPickingLane(null);
        setAssignSearch('');
    };

    const linkSwimGroup = (groupId: number, swimGroup: SwimGroupRef) => {
        upd(groupId, g => {
            const targetCount = Math.min(Math.max(g.swimmers, swimGroup.athletes.length), 12);
            const lanes = Array.from({ length: targetCount }, (_, i): LaneTimer => {
                const existing = g.lanes[i] ?? newLane();
                const athlete  = swimGroup.athletes[i] ?? null;
                return { ...existing, athleteId: athlete?.id ?? null, athleteName: athlete?.name ?? null };
            });
            return { ...g, name: swimGroup.name, swimmers: targetCount, swimGroupId: swimGroup.id, lanes };
        });
    };

    const assignLaneAthlete = (groupId: number, laneIdx: number, athlete: AthleteRef) => {
        upd(groupId, g => ({
            ...g,
            lanes: g.lanes.map((l, i) => i !== laneIdx ? l : { ...l, athleteId: athlete.id, athleteName: athlete.name }),
        }));
        setAssignPickingLane(null);
        setAssignSearch('');
    };

    const removeLaneAthlete = (groupId: number, laneIdx: number) => {
        upd(groupId, g => ({
            ...g,
            lanes: g.lanes.map((l, i) => i !== laneIdx ? l : { ...l, athleteId: null, athleteName: null }),
        }));
    };

    const createGroupQuick = () => {
        const name = newGroupInput.trim();
        if (!name) return;
        router.post('/coach/groups', { name }, {
            preserveState: true,
            only: ['swimGroups'],
            onSuccess: () => setNewGroupInput(''),
        });
    };

    const createAthleteQuick = () => {
        const name = newAthleteInput.trim();
        if (!name) return;
        router.post('/coach/athletes', { name }, {
            preserveState: true,
            only: ['athletes'],
            onSuccess: () => setNewAthleteInput(''),
        });
    };

    const openSaveTimesModal = (groupId: number) => {
        const g = groups.find(gr => gr.id === groupId);
        if (!g) return;
        const initSelected = new Set(
            g.lanes
                .map((l, i) => ({ l, i }))
                .filter(({ l }) => l.athleteId !== null && l.elapsed > 0)
                .map(({ i }) => i),
        );
        setSaveTimesGroupId(groupId);
        setSaveLaneSelected(initSelected);
        setSaveDistance(g.distance > 0 ? g.distance : 100);
        setSaveSuccess(false);
    };

    const toggleSaveLane = (laneIdx: number) => {
        setSaveLaneSelected(prev => {
            const next = new Set(prev);
            if (next.has(laneIdx)) next.delete(laneIdx);
            else next.add(laneIdx);
            return next;
        });
    };

    const saveAthletesTimes = () => {
        const g = groups.find(gr => gr.id === saveTimesGroupId);
        if (!g) return;
        const today = new Date().toISOString().split('T')[0];
        const records = g.lanes
            .map((l, i) => ({ l, i }))
            .filter(({ l, i }) => saveLaneSelected.has(i) && l.athleteId !== null && l.elapsed > 0)
            .map(({ l }) => ({
                athlete_id:  l.athleteId!,
                record_type: 'practice' as const,
                stroke:      saveStroke,
                distance:    saveDistance,
                time_ms:     Math.round(l.elapsed),
                pool_length: savePoolLength,
                date:        today,
            }));
        if (records.length === 0) return;
        router.post('/coach/records/bulk', { records }, {
            preserveState: true,
            onSuccess: () => {
                setSaveSuccess(true);
                setTimeout(() => {
                    setSaveSuccess(false);
                    setSaveTimesGroupId(null);
                }, 1500);
            },
        });
    };

    /* ── Derived ──────────────────────────────────────────────────────── */

    const cols         = gridCols(groups.length);
    const tFont        = timerFont(groups.length);
    const clampedIdx   = Math.min(activeGroupIdx, groups.length - 1);
    const activeGroup  = groups[clampedIdx];
    const anyHeatRunning = activeGroup?.lanes.some(l => l.isRunning) ?? false;

    const sessionsByDate = sessions.reduce((acc, s) => {
        if (!acc[s.session_date]) acc[s.session_date] = [];
        acc[s.session_date].push(s);
        return acc;
    }, {} as Record<string, SessionRecord[]>);

    const sortedDates = Object.keys(sessionsByDate).sort((a, b) => b.localeCompare(a));

    // Assignment panel derived
    const assignGroup        = assignGroupId !== null ? groups.find(g => g.id === assignGroupId) : null;
    const assignedAthleteIds = new Set(assignGroup?.lanes.map(l => l.athleteId).filter(Boolean) ?? []);
    const availableAthletes  = coachAthletes.filter(a =>
        !assignedAthleteIds.has(a.id) &&
        (assignSearch === '' || a.name.toLowerCase().includes(assignSearch.toLowerCase())),
    );

    // Save times modal derived
    const saveTimesGroup     = saveTimesGroupId !== null ? groups.find(g => g.id === saveTimesGroupId) : null;
    const saveLanesWithTimes = saveTimesGroup?.lanes.map((l, i) => ({ l, i })).filter(({ l }) => l.elapsed > 0) ?? [];

    /* ── Render ───────────────────────────────────────────────────────── */

    return (
        <HomeLayout>
            <div className="flex flex-col h-[calc(100dvh-7rem)] md:h-[calc(100dvh-6rem)] overflow-hidden px-2 pt-2 pb-1 gap-2">

                {/* ── Shared header ─────────────────────────────────────── */}
                <div className="flex items-center justify-between shrink-0 px-1">
                    <div className="flex items-center gap-2">
                        <Timer className="w-4 h-4 text-blue-400" />
                        <h1 className="text-white font-bold text-sm tracking-wide">Pool Timer</h1>
                        {mode !== 'history' && (
                            <span className="text-white/25 text-xs tabular-nums">{groups.length}/{maxGroups}</span>
                        )}
                        {mode === 'history' && (
                            <span className="text-white/25 text-xs tabular-nums">{sessions.length} guardadas</span>
                        )}
                    </div>

                    <div className="flex items-center gap-1.5">
                        {/* Mode pill */}
                        <div className="flex h-7 rounded-xl bg-white/5 border border-white/8 overflow-hidden p-0.5 gap-0.5">
                            <button
                                onClick={() => switchMode('groups')}
                                className={`h-6 px-2.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all ${
                                    mode === 'groups' ? 'bg-blue-500 text-white' : 'text-white/40 hover:text-white/70'
                                }`}
                            >
                                <LayoutList className="w-3 h-3" />
                                <span className="hidden sm:block">Groups</span>
                            </button>
                            <button
                                onClick={() => switchMode('lanes')}
                                className={`h-6 px-2.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all ${
                                    mode === 'lanes' ? 'bg-blue-500 text-white' : 'text-white/40 hover:text-white/70'
                                }`}
                            >
                                <Columns3 className="w-3 h-3" />
                                <span className="hidden sm:block">Pool</span>
                            </button>
                            <button
                                onClick={() => switchMode('history')}
                                className={`h-6 px-2.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all ${
                                    mode === 'history' ? 'bg-emerald-500 text-white' : 'text-white/40 hover:text-white/70'
                                }`}
                            >
                                <History className="w-3 h-3" />
                                <span className="hidden sm:block">Histórico</span>
                            </button>
                        </div>

                        {mode === 'groups' && (
                            <>
                                <button onClick={resetAll} className={globalBtn('neutral')}>
                                    <RotateCcw className="w-3 h-3" />
                                    <span className="hidden sm:block">Reset All</span>
                                </button>
                                <button
                                    onClick={toggleAll}
                                    className={globalBtn(allRunning ? 'amber' : 'blue')}
                                >
                                    {allRunning
                                        ? <><Pause className="w-3 h-3" fill="currentColor" /> Pause All</>
                                        : <><Play  className="w-3 h-3" fill="currentColor" /> Start All</>
                                    }
                                </button>
                            </>
                        )}

                        {mode === 'lanes' && activeGroup && (
                            <>
                                <button onClick={() => resetAllGroupLanes(activeGroup.id)} className={globalBtn('neutral')}>
                                    <RotateCcw className="w-3 h-3" />
                                    <span className="hidden sm:block">Reset All</span>
                                </button>
                                <button
                                    onClick={() => anyHeatRunning ? pauseAllGroupLanes(activeGroup.id) : startAllGroupLanes(activeGroup.id)}
                                    className={globalBtn(anyHeatRunning ? 'amber' : 'blue')}
                                >
                                    {anyHeatRunning
                                        ? <><Pause className="w-3 h-3" fill="currentColor" /> Pause All</>
                                        : <><Play  className="w-3 h-3" fill="currentColor" /> Start All</>
                                    }
                                </button>
                            </>
                        )}

                        {mode !== 'history' && (
                            <button onClick={addGroup} disabled={groups.length >= maxGroups} className={`h-7 w-7 rounded-xl ${iconBtnCls} flex items-center justify-center transition-all disabled:opacity-25`}>
                                <Plus className="w-3.5 h-3.5" />
                            </button>
                        )}
                    </div>
                </div>

                {/* ════════════════════════════════════════════════════════
                    MODE 1 — Groups (blocks)
                ════════════════════════════════════════════════════════ */}
                {mode === 'groups' && (
                    <div className={`grid ${cols} gap-2 flex-1 min-h-0`} style={{ gridAutoRows: '1fr' }}>
                        {groups.map(g => {
                            const elapsed    = g.elapsed;
                            const lastSplit  = g.splits[g.splits.length - 1] ?? 0;
                            const lapMs      = g.splits.length > 0 ? elapsed - lastSplit : elapsed;
                            const compact    = groups.length >= 7;
                            const isResting  = !g.isRunning && elapsed > 0;
                            const isSaved    = savedFlash === g.id;
                            const hasAthletes = g.lanes.some(l => l.athleteId);

                            return (
                                <div key={g.id} className={`flex flex-col rounded-2xl border overflow-hidden transition-all duration-200 ${cardBg(g.isRunning, isResting, false)}`}>

                                    {/* Card header */}
                                    <div className={`flex items-center justify-between px-3 py-1.5 border-b shrink-0 ${headerBorder(g.isRunning, isResting, false)}`}>
                                        <span className="text-white/55 text-[11px] font-bold tracking-wider uppercase truncate max-w-20">
                                            {g.name}
                                        </span>
                                        <div className="flex items-center gap-1">
                                            {/* Distance cycle button */}
                                            <button
                                                onClick={() => cycleDistance(g.id)}
                                                className="text-[10px] font-mono font-bold tabular-nums text-white/25 hover:text-cyan-400/80 transition-colors min-w-[28px] text-center"
                                                title="Tap para ciclar distância"
                                            >
                                                {g.distance > 0 ? `${g.distance}m` : '—m'}
                                            </button>
                                            <span className="text-white/10 text-[10px]">|</span>
                                            <button onClick={() => changeSwimmers(g.id, -1)} disabled={g.swimmers <= 1} className="w-5 h-5 flex items-center justify-center text-white/25 hover:text-white/60 disabled:opacity-20 transition-colors">
                                                <Minus className="w-2.5 h-2.5" />
                                            </button>
                                            <span className="text-white/35 text-[10px] tabular-nums w-7 text-center">{g.swimmers}sw</span>
                                            <button onClick={() => changeSwimmers(g.id, +1)} disabled={g.swimmers >= 12} className="w-5 h-5 flex items-center justify-center text-white/25 hover:text-white/60 disabled:opacity-20 transition-colors">
                                                <Plus className="w-2.5 h-2.5" />
                                            </button>
                                            {isCoach && (
                                                <button
                                                    onClick={() => openAssignPanel(g.id)}
                                                    className={`ml-0.5 transition-colors ${hasAthletes ? 'text-blue-400/60 hover:text-blue-300' : 'text-white/15 hover:text-blue-400'}`}
                                                    title="Atletas"
                                                >
                                                    <Users className="w-2.5 h-2.5" />
                                                </button>
                                            )}
                                            <button onClick={() => removeGroup(g.id)} disabled={groups.length <= 1} className="ml-0.5 text-white/15 hover:text-red-400 disabled:opacity-0 transition-colors">
                                                <Trash2 className="w-2.5 h-2.5" />
                                            </button>
                                        </div>
                                    </div>

                                    {/* Timer */}
                                    <div className={`shrink-0 flex flex-col items-center justify-center gap-0.5 ${compact ? 'py-2' : 'py-3'}`}>
                                        <div className={`font-mono font-bold tabular-nums leading-none ${tFont} ${timerColor(g.isRunning, isResting, false, elapsed > 0)}`}>
                                            {fmt(elapsed)}
                                        </div>
                                        <div className={`font-mono tabular-nums text-xs transition-opacity ${g.splits.length > 0 ? 'text-blue-400/50 opacity-100' : 'opacity-0'}`}>
                                            lap&nbsp;{fmt(lapMs)}
                                        </div>
                                        {isResting && g.restElapsed > 0 && (
                                            <div className={`font-mono tabular-nums text-amber-400/65 ${compact ? 'text-[10px]' : 'text-xs'}`}>
                                                REST&nbsp;{fmtRest(g.restElapsed)}
                                            </div>
                                        )}
                                    </div>

                                    {/* Splits */}
                                    <div className="flex-1 min-h-0 overflow-y-auto px-2.5 py-0.5">
                                        {g.splits.length === 0 ? (
                                            <div className="flex items-center justify-center h-full">
                                                <span className="text-white/10 text-[10px]">no splits</span>
                                            </div>
                                        ) : (
                                            <div className="space-y-px">
                                                {[...g.splits].reverse().map((sp, ri) => {
                                                    const i    = g.splits.length - 1 - ri;
                                                    const prev = g.splits[i - 1] ?? 0;
                                                    return (
                                                        <div key={i} className="grid grid-cols-3 items-center text-[10px] py-px border-b border-white/4 last:border-0">
                                                            <span className="text-white/20">#{i + 1}</span>
                                                            <span className="text-white/50 font-mono tabular-nums text-center">{fmt(sp)}</span>
                                                            <span className="text-blue-400/40 font-mono tabular-nums text-right">+{fmt(sp - prev)}</span>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        )}
                                    </div>

                                    {/* Controls */}
                                    <div className={`flex gap-1.5 border-t shrink-0 px-2.5 py-1.5 ${headerBorder(g.isRunning, isResting, false)}`}>
                                        <button
                                            onClick={() => toggleGroup(g.id)}
                                            className={`flex-1 h-7 rounded-xl font-semibold text-xs flex items-center justify-center gap-1 transition-all ${playBtnCls(g.isRunning)}`}
                                        >
                                            {g.isRunning
                                                ? <><Pause className="w-2.5 h-2.5" fill="currentColor" /><span className="hidden sm:inline">Pause</span></>
                                                : <><Play  className="w-2.5 h-2.5" fill="currentColor" /><span className="hidden sm:inline">Start</span></>
                                            }
                                        </button>
                                        <button onClick={() => addSplit(g.id)} disabled={elapsed === 0} title="Split" className={`h-7 w-7 rounded-xl ${iconBtnCls} flex items-center justify-center disabled:opacity-20 transition-all`}>
                                            <Flag className="w-2.5 h-2.5" />
                                        </button>
                                        <button
                                            onClick={() => saveSession(g.id)}
                                            disabled={elapsed === 0}
                                            title="Guardar sessão"
                                            className={`h-7 w-7 rounded-xl flex items-center justify-center disabled:opacity-20 transition-all border ${
                                                isSaved
                                                    ? 'bg-emerald-500/25 text-emerald-300 border-emerald-400/30'
                                                    : iconBtnCls
                                            }`}
                                        >
                                            <Save className="w-2.5 h-2.5" />
                                        </button>
                                        <button onClick={() => resetGroup(g.id)} title="Reset" className={`h-7 w-7 rounded-xl ${iconBtnCls} flex items-center justify-center transition-all`}>
                                            <RotateCcw className="w-2.5 h-2.5" />
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* ════════════════════════════════════════════════════════
                    MODE 2 — Pool (lane columns, 1 heat at a time)
                ════════════════════════════════════════════════════════ */}
                {mode === 'lanes' && activeGroup && (
                    <div className="flex-1 min-h-0 flex flex-col gap-2">

                        {/* Heat navigation */}
                        <div className="flex items-center justify-between shrink-0">
                            <button
                                onClick={() => setActiveGroupIdx(i => Math.max(0, i - 1))}
                                disabled={clampedIdx === 0}
                                className={`h-7 w-7 rounded-xl ${iconBtnCls} flex items-center justify-center disabled:opacity-20 transition-all`}
                            >
                                <ChevronLeft className="w-4 h-4" />
                            </button>

                            <div className="flex items-center gap-2">
                                <span className="text-white/65 text-sm font-bold tracking-wider uppercase">
                                    {activeGroup.name}
                                </span>
                                <span className="text-white/25 text-xs tabular-nums">
                                    {clampedIdx + 1}/{groups.length}
                                </span>
                                {isCoach && (
                                    <button
                                        onClick={() => openAssignPanel(activeGroup.id)}
                                        className={`transition-colors ${activeGroup.lanes.some(l => l.athleteId) ? 'text-blue-400/60 hover:text-blue-300' : 'text-white/20 hover:text-blue-400'}`}
                                        title="Atletas"
                                    >
                                        <Users className="w-3.5 h-3.5" />
                                    </button>
                                )}
                                <button
                                    onClick={() => removeGroup(activeGroup.id)}
                                    disabled={groups.length <= 1}
                                    className="text-white/15 hover:text-red-400 disabled:opacity-0 transition-colors"
                                >
                                    <Trash2 className="w-3 h-3" />
                                </button>
                            </div>

                            <button
                                onClick={() => setActiveGroupIdx(i => Math.min(groups.length - 1, i + 1))}
                                disabled={clampedIdx === groups.length - 1}
                                className={`h-7 w-7 rounded-xl ${iconBtnCls} flex items-center justify-center disabled:opacity-20 transition-all`}
                            >
                                <ChevronRight className="w-4 h-4" />
                            </button>
                        </div>

                        {/* Pool card */}
                        {(() => {
                            const g           = activeGroup;
                            const anyRunning  = g.lanes.some(l => l.isRunning);
                            const allFinished = g.lanes.length > 0 && g.lanes.every(l => l.finished);
                            const canSaveTimes = isCoach && g.lanes.some(l => l.elapsed > 0);

                            return (
                                <div className={`flex-1 min-h-0 rounded-2xl border overflow-hidden flex flex-col transition-all duration-200 ${cardBg(anyRunning, false, allFinished)}`}>

                                    {/* Pool card header — mirrors group card header */}
                                    <div className={`flex items-center justify-between px-3 py-1.5 border-b shrink-0 ${headerBorder(anyRunning, false, allFinished)}`}>
                                        <div className="flex items-center gap-2">
                                            <span className="text-white/35 text-[11px] tabular-nums">{g.swimmers} lanes</span>
                                            {allFinished && (
                                                <span className="text-[10px] font-bold text-emerald-400/70 tracking-wider uppercase">
                                                    ✓ Heat done
                                                </span>
                                            )}
                                            {canSaveTimes && (
                                                <button
                                                    onClick={() => openSaveTimesModal(g.id)}
                                                    className="h-5 px-2 rounded-lg text-[9px] font-semibold bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300/80 border border-emerald-400/20 transition-all"
                                                >
                                                    Guardar tempos
                                                </button>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <button onClick={() => changeSwimmers(g.id, -1)} disabled={g.swimmers <= 1} className="w-5 h-5 flex items-center justify-center text-white/25 hover:text-white/60 disabled:opacity-20 transition-colors">
                                                <Minus className="w-2.5 h-2.5" />
                                            </button>
                                            <button onClick={() => changeSwimmers(g.id, +1)} disabled={g.swimmers >= 12} className="w-5 h-5 flex items-center justify-center text-white/25 hover:text-white/60 disabled:opacity-20 transition-colors">
                                                <Plus className="w-2.5 h-2.5" />
                                            </button>
                                        </div>
                                    </div>

                                    {/* Lane columns */}
                                    <div className="flex flex-1 min-h-0 overflow-x-auto">
                                        {g.lanes.map((lane, idx) => {
                                            const lastSplit = lane.splits[lane.splits.length - 1] ?? 0;
                                            const lapMs     = lane.splits.length > 0 ? lane.elapsed - lastSplit : lane.elapsed;
                                            const isOdd     = idx % 2 === 1;
                                            const isResting = !lane.isRunning && lane.elapsed > 0 && !lane.finished;

                                            return (
                                                <div
                                                    key={idx}
                                                    className={`flex-1 min-w-16 flex flex-col transition-all duration-200 ${
                                                        lane.finished ? 'bg-emerald-500/5'
                                                        : lane.isRunning ? 'bg-blue-500/8'
                                                        : isResting ? 'bg-amber-500/5'
                                                        : isOdd ? 'bg-white/1.5' : ''
                                                    } ${idx < g.lanes.length - 1 ? `border-r ${headerBorder(lane.isRunning, isResting, lane.finished)}` : ''}`}
                                                >
                                                    {/* Lane header */}
                                                    <div className={`flex flex-col items-center justify-center py-1.5 border-b shrink-0 gap-0.5 ${headerBorder(lane.isRunning, isResting, lane.finished)}`}>
                                                        <span className={`text-sm font-black tracking-widest ${
                                                            lane.finished    ? 'text-emerald-400/70'
                                                            : lane.isRunning ? 'text-blue-300/70'
                                                            : isResting      ? 'text-amber-400/60'
                                                            : 'text-white/20'
                                                        }`}>
                                                            {idx + 1}
                                                        </span>
                                                        {lane.athleteName && (
                                                            <span className={`text-[8px] font-semibold truncate max-w-[52px] text-center leading-tight px-0.5 ${
                                                                lane.finished ? 'text-emerald-300/60' : 'text-white/40'
                                                            }`}>
                                                                {lane.athleteName.split(' ')[0]}
                                                            </span>
                                                        )}
                                                    </div>

                                                    {/* Timer area */}
                                                    <div className="flex-1 flex flex-col items-center justify-center py-3 px-1 gap-0.5 min-h-24">
                                                        {lane.finished && (
                                                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400/60 mb-0.5" />
                                                        )}
                                                        <div className={`font-mono font-bold tabular-nums leading-none text-base ${timerColor(lane.isRunning, isResting, lane.finished, lane.elapsed > 0)}`}>
                                                            {fmt(lane.elapsed)}
                                                        </div>
                                                        {lane.splits.length > 0 && (
                                                            <div className="text-[9px] font-mono tabular-nums text-blue-400/40">
                                                                +{fmt(lapMs)}
                                                            </div>
                                                        )}
                                                        {isResting && lane.restElapsed > 0 && (
                                                            <div className="text-[9px] font-mono tabular-nums text-amber-400/65 font-semibold">
                                                                REST {fmtRest(lane.restElapsed)}
                                                            </div>
                                                        )}
                                                        {lane.splits.slice(-2).map((sp, si) => {
                                                            const ri   = lane.splits.length - lane.splits.slice(-2).length + si;
                                                            const prev = lane.splits[ri - 1] ?? 0;
                                                            return (
                                                                <div key={si} className="text-[8px] font-mono tabular-nums text-center text-white/18">
                                                                    #{ri + 1} {fmt(sp - prev)}
                                                                </div>
                                                            );
                                                        })}
                                                    </div>

                                                    {/* Lane controls */}
                                                    <div className="flex flex-col gap-0.5 px-1 pb-2 shrink-0">
                                                        {!lane.finished ? (
                                                            <>
                                                                <button
                                                                    onClick={() => toggleLane(g.id, idx)}
                                                                    className={`w-full h-7 rounded-xl font-bold flex items-center justify-center transition-all ${playBtnCls(lane.isRunning)}`}
                                                                >
                                                                    {lane.isRunning
                                                                        ? <Pause className="w-2.5 h-2.5" fill="currentColor" />
                                                                        : <Play  className="w-2.5 h-2.5" fill="currentColor" />
                                                                    }
                                                                </button>
                                                                <div className="flex gap-0.5">
                                                                    <button onClick={() => addLaneSplit(g.id, idx)} disabled={lane.elapsed === 0} title="Split" className={`flex-1 h-6 rounded-xl ${iconBtnCls} flex items-center justify-center disabled:opacity-20 transition-all`}>
                                                                        <Flag className="w-2.5 h-2.5" />
                                                                    </button>
                                                                    <button onClick={() => finishLane(g.id, idx)} disabled={lane.elapsed === 0} title="Finish" className="flex-1 h-6 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400/50 hover:text-emerald-300 border border-emerald-400/15 flex items-center justify-center disabled:opacity-20 transition-all">
                                                                        <CheckCircle2 className="w-2.5 h-2.5" />
                                                                    </button>
                                                                </div>
                                                                {isResting && (
                                                                    <div className="flex gap-0.5">
                                                                        <button onClick={() => refreshLane(g.id, idx)} title="Refresh (keep rest)" className="flex-1 h-6 rounded-xl bg-blue-500/10 hover:bg-blue-500/20 text-blue-300/50 hover:text-blue-300 border border-blue-400/12 flex items-center justify-center transition-all">
                                                                            <RotateCcw className="w-2.5 h-2.5" />
                                                                        </button>
                                                                        <button onClick={() => hardResetLane(g.id, idx)} title="Reset all (incl. rest)" className="flex-1 h-6 rounded-xl bg-red-500/8 hover:bg-red-500/15 text-red-400/40 hover:text-red-400 border border-red-400/10 flex items-center justify-center transition-all">
                                                                            <Trash2 className="w-2.5 h-2.5" />
                                                                        </button>
                                                                    </div>
                                                                )}
                                                            </>
                                                        ) : (
                                                            <div className="flex gap-0.5">
                                                                <button onClick={() => refreshLane(g.id, idx)} title="Refresh (keep rest)" className={`flex-1 h-7 rounded-xl ${iconBtnCls} flex items-center justify-center transition-all`}>
                                                                    <RotateCcw className="w-2.5 h-2.5" />
                                                                </button>
                                                                <button onClick={() => hardResetLane(g.id, idx)} title="Reset all (incl. rest)" className="flex-1 h-7 rounded-xl bg-red-500/8 hover:bg-red-500/15 text-red-400/40 hover:text-red-400 border border-red-400/10 flex items-center justify-center transition-all">
                                                                    <Trash2 className="w-2.5 h-2.5" />
                                                                </button>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            );
                        })()}
                    </div>
                )}

                {/* ════════════════════════════════════════════════════════
                    MODE 3 — History
                ════════════════════════════════════════════════════════ */}
                {mode === 'history' && (
                    <div className="flex-1 min-h-0 overflow-y-auto">
                        {sessions.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-full gap-3 text-center px-6">
                                <History className="w-8 h-8 text-white/10" />
                                <p className="text-white/25 text-sm font-semibold">Sem sessões guardadas</p>
                                <p className="text-white/12 text-xs leading-relaxed">
                                    Prima o botão <Save className="w-3 h-3 inline-block mb-0.5" /> em cada grupo para guardar tempo e distância
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-5 pb-4">

                                {/* ── Summary strip ── */}
                                {(() => {
                                    const totalDist  = sessions.reduce((s, r) => s + (r.distance_m ?? 0), 0);
                                    const bestMs     = Math.min(...sessions.map(r => r.elapsed_ms));
                                    return (
                                        <div className="flex gap-2">
                                            <div className="flex-1 rounded-xl border border-white/6 bg-white/[0.02] px-3 py-2 text-center">
                                                <p className="text-[10px] text-white/25 uppercase tracking-wider">Sessões</p>
                                                <p className="text-base font-bold tabular-nums text-white/70 mt-0.5">{sessions.length}</p>
                                            </div>
                                            {totalDist > 0 && (
                                                <div className="flex-1 rounded-xl border border-white/6 bg-white/[0.02] px-3 py-2 text-center">
                                                    <p className="text-[10px] text-white/25 uppercase tracking-wider">Total</p>
                                                    <p className="text-base font-bold tabular-nums text-cyan-400/70 mt-0.5">
                                                        {totalDist >= 1000 ? `${(totalDist / 1000).toFixed(1)}km` : `${totalDist}m`}
                                                    </p>
                                                </div>
                                            )}
                                            <div className="flex-1 rounded-xl border border-white/6 bg-white/[0.02] px-3 py-2 text-center">
                                                <p className="text-[10px] text-white/25 uppercase tracking-wider">Melhor</p>
                                                <p className="text-[13px] font-bold font-mono tabular-nums text-emerald-400/70 mt-0.5">{fmt(bestMs)}</p>
                                            </div>
                                        </div>
                                    );
                                })()}

                                {/* ── Sessions by date ── */}
                                {sortedDates.map(date => (
                                    <div key={date}>
                                        {/* Date header */}
                                        <div className="flex items-center gap-2 px-0.5 mb-1.5">
                                            <span className="text-white/40 text-[11px] font-bold tracking-wider uppercase">
                                                {fmtDate(date)}
                                            </span>
                                            <div className="flex-1 h-px bg-white/6" />
                                            <span className="text-white/20 text-[10px]">
                                                {sessionsByDate[date].length} sessão{sessionsByDate[date].length > 1 ? 'ões' : ''}
                                            </span>
                                        </div>

                                        {/* Session rows */}
                                        <div className="space-y-1.5">
                                            {sessionsByDate[date].map(s => (
                                                <div key={s.id} className="flex items-center gap-3 rounded-xl border border-white/6 bg-white/[0.02] px-3 py-2.5">

                                                    {/* Time */}
                                                    <div className="font-mono font-bold tabular-nums text-sm text-white/80 min-w-[70px]">
                                                        {fmt(s.elapsed_ms)}
                                                    </div>

                                                    {/* Distance + pace */}
                                                    {s.distance_m && s.distance_m > 0 ? (
                                                        <div className="flex flex-col min-w-[46px]">
                                                            <span className="text-[11px] font-bold tabular-nums text-cyan-400/70">{s.distance_m}m</span>
                                                            <span className="text-[9px] font-mono tabular-nums text-white/20">
                                                                {fmtPace(s.elapsed_ms, s.distance_m)}
                                                            </span>
                                                        </div>
                                                    ) : (
                                                        <div className="min-w-[46px]">
                                                            <span className="text-[10px] text-white/15">—</span>
                                                        </div>
                                                    )}

                                                    {/* Group + meta */}
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-[11px] font-bold text-white/55 truncate">{s.group_name}</p>
                                                        <p className="text-[10px] text-white/20 tabular-nums">
                                                            {s.swimmer_count} nadadores
                                                            {s.splits && s.splits.length > 0 ? ` · ${s.splits.length} splits` : ''}
                                                        </p>
                                                    </div>

                                                    {/* Splits mini list (max 3) */}
                                                    {s.splits && s.splits.length > 0 && (
                                                        <div className="hidden sm:flex flex-col gap-0.5 items-end">
                                                            {s.splits.slice(0, 3).map((sp, si) => {
                                                                const prev = s.splits![si - 1] ?? 0;
                                                                return (
                                                                    <span key={si} className="text-[9px] font-mono tabular-nums text-white/18">
                                                                        #{si + 1} +{fmt(sp - prev)}
                                                                    </span>
                                                                );
                                                            })}
                                                            {s.splits.length > 3 && (
                                                                <span className="text-[9px] text-white/12">+{s.splits.length - 3}</span>
                                                            )}
                                                        </div>
                                                    )}

                                                    {/* Delete */}
                                                    <button
                                                        onClick={() => deleteSession(s.id)}
                                                        className="text-white/10 hover:text-red-400 transition-colors ml-1 shrink-0"
                                                        title="Apagar sessão"
                                                    >
                                                        <Trash2 className="w-3 h-3" />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

            </div>

            {/* ════════════════════════════════════════════════════════
                Assignment Panel (coach only) — bottom sheet
            ════════════════════════════════════════════════════════ */}
            {isCoach && assignGroupId !== null && assignGroup && (
                <>
                    <div
                        className="fixed inset-0 bg-black/60 z-40"
                        onClick={() => { setAssignGroupId(null); setAssignPickingLane(null); }}
                    />
                    <div className="fixed bottom-0 left-0 right-0 z-50 bg-[#0a0c12] border-t border-white/10 rounded-t-2xl max-h-[78vh] flex flex-col">

                        {assignPickingLane === null ? (
                            /* ── Main panel ── */
                            <>
                                <div className="flex items-center justify-between px-4 pt-4 pb-3 shrink-0">
                                    <div>
                                        <p className="text-white/80 text-sm font-bold">{assignGroup.name}</p>
                                        <p className="text-white/30 text-xs">Atletas da série</p>
                                    </div>
                                    <button
                                        onClick={() => setAssignGroupId(null)}
                                        className="w-7 h-7 rounded-full bg-white/8 hover:bg-white/15 flex items-center justify-center text-white/40 transition-colors"
                                    >
                                        <X className="w-3.5 h-3.5" />
                                    </button>
                                </div>

                                <div className="overflow-y-auto flex-1 px-4 pb-6 space-y-5">

                                    {/* Link to swim group */}
                                    <div>
                                        <p className="text-white/25 text-[10px] font-bold uppercase tracking-wider mb-2">Ligar grupo de treino</p>
                                        <div className="flex flex-wrap gap-1.5">
                                            {coachGroups.map(sg => (
                                                <button
                                                    key={sg.id}
                                                    onClick={() => linkSwimGroup(assignGroupId, sg)}
                                                    className={`h-7 px-3 rounded-xl text-xs font-semibold border transition-all ${
                                                        assignGroup.swimGroupId === sg.id
                                                            ? 'bg-blue-500/25 text-blue-300 border-blue-400/30'
                                                            : 'bg-white/5 hover:bg-white/10 text-white/50 border-white/8'
                                                    }`}
                                                >
                                                    {sg.name}
                                                    <span className="ml-1 opacity-40">{sg.athletes.length}</span>
                                                </button>
                                            ))}
                                            <div className="flex gap-1.5">
                                                <input
                                                    value={newGroupInput}
                                                    onChange={e => setNewGroupInput(e.target.value)}
                                                    onKeyDown={e => e.key === 'Enter' && createGroupQuick()}
                                                    placeholder="Novo grupo..."
                                                    className="h-7 px-2.5 rounded-xl bg-white/5 border border-white/10 text-white/70 text-xs placeholder-white/20 focus:outline-none focus:border-blue-400/40 w-28"
                                                />
                                                <button
                                                    onClick={createGroupQuick}
                                                    disabled={!newGroupInput.trim()}
                                                    className="h-7 px-2.5 rounded-xl text-xs font-semibold bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 border border-blue-400/20 disabled:opacity-30 transition-all"
                                                >
                                                    Criar
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Lane athlete assignments */}
                                    <div>
                                        <p className="text-white/25 text-[10px] font-bold uppercase tracking-wider mb-2">Nadadores por canaleta</p>
                                        <div className="space-y-1.5">
                                            {assignGroup.lanes.map((lane, idx) => (
                                                <div key={idx} className="flex items-center gap-2 rounded-xl border border-white/6 bg-white/[0.025] px-3 py-2">
                                                    <span className="text-white/25 text-xs font-bold w-5 shrink-0">{idx + 1}</span>
                                                    {lane.athleteName ? (
                                                        <>
                                                            <span className="flex-1 text-white/70 text-sm font-semibold">{lane.athleteName}</span>
                                                            <button
                                                                onClick={() => removeLaneAthlete(assignGroupId, idx)}
                                                                className="text-white/20 hover:text-red-400 transition-colors shrink-0"
                                                            >
                                                                <X className="w-3 h-3" />
                                                            </button>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <span className="flex-1 text-white/18 text-xs italic">sem atleta</span>
                                                            <button
                                                                onClick={() => { setAssignPickingLane(idx); setAssignSearch(''); }}
                                                                className="h-5 px-2 rounded-lg text-[9px] font-semibold bg-blue-500/15 hover:bg-blue-500/25 text-blue-300/70 border border-blue-400/15 transition-all shrink-0"
                                                            >
                                                                + atleta
                                                            </button>
                                                        </>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                </div>
                            </>
                        ) : (
                            /* ── Athlete picker sub-panel ── */
                            <>
                                <div className="flex items-center gap-3 px-4 pt-4 pb-3 shrink-0 border-b border-white/6">
                                    <button
                                        onClick={() => setAssignPickingLane(null)}
                                        className="text-white/40 hover:text-white/70 transition-colors"
                                    >
                                        <ChevronLeft className="w-4 h-4" />
                                    </button>
                                    <p className="text-white/70 text-sm font-semibold">Canaleta {assignPickingLane + 1}</p>
                                </div>

                                <div className="overflow-y-auto flex-1 px-4 pb-6">

                                    {/* Search */}
                                    <div className="sticky top-0 bg-[#0a0c12] py-3">
                                        <input
                                            value={assignSearch}
                                            onChange={e => setAssignSearch(e.target.value)}
                                            placeholder="Pesquisar atleta..."
                                            autoFocus
                                            className="w-full h-9 px-3 rounded-xl bg-white/5 border border-white/10 text-white/70 text-sm placeholder-white/20 focus:outline-none focus:border-blue-400/40"
                                        />
                                    </div>

                                    {/* Athlete list */}
                                    {availableAthletes.length === 0 ? (
                                        <p className="text-white/20 text-xs text-center py-6">
                                            {coachAthletes.length === 0
                                                ? 'Sem atletas criados ainda'
                                                : assignSearch
                                                    ? 'Nenhum resultado'
                                                    : 'Todos os atletas já estão atribuídos'}
                                        </p>
                                    ) : (
                                        <div className="space-y-1">
                                            {availableAthletes.map(a => (
                                                <button
                                                    key={a.id}
                                                    onClick={() => assignLaneAthlete(assignGroupId, assignPickingLane, a)}
                                                    className="w-full flex items-center gap-3 rounded-xl border border-white/6 bg-white/[0.025] hover:bg-white/5 px-3 py-2.5 text-left transition-all"
                                                >
                                                    <div className="w-7 h-7 rounded-full bg-blue-500/15 border border-blue-400/20 flex items-center justify-center shrink-0">
                                                        <span className="text-[10px] font-bold text-blue-300/70">{a.name[0]?.toUpperCase()}</span>
                                                    </div>
                                                    <span className="text-white/70 text-sm font-medium">{a.name}</span>
                                                </button>
                                            ))}
                                        </div>
                                    )}

                                    {/* Quick create athlete */}
                                    <div className="mt-4 pt-3 border-t border-white/6">
                                        <p className="text-white/25 text-[10px] font-bold uppercase tracking-wider mb-2">Criar novo atleta</p>
                                        <div className="flex gap-2">
                                            <input
                                                value={newAthleteInput}
                                                onChange={e => setNewAthleteInput(e.target.value)}
                                                onKeyDown={e => e.key === 'Enter' && createAthleteQuick()}
                                                placeholder="Nome do atleta..."
                                                className="flex-1 h-9 px-3 rounded-xl bg-white/5 border border-white/10 text-white/70 text-sm placeholder-white/20 focus:outline-none focus:border-blue-400/40"
                                            />
                                            <button
                                                onClick={createAthleteQuick}
                                                disabled={!newAthleteInput.trim()}
                                                className="h-9 px-3 rounded-xl text-xs font-semibold bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 border border-blue-400/20 disabled:opacity-30 transition-all flex items-center gap-1.5 shrink-0"
                                            >
                                                <UserPlus className="w-3.5 h-3.5" />
                                                Criar
                                            </button>
                                        </div>
                                    </div>

                                </div>
                            </>
                        )}

                    </div>
                </>
            )}

            {/* ════════════════════════════════════════════════════════
                Save Times Modal (coach only)
            ════════════════════════════════════════════════════════ */}
            {isCoach && saveTimesGroupId !== null && saveTimesGroup && (
                <>
                    <div
                        className="fixed inset-0 bg-black/70 z-40"
                        onClick={() => { if (!saveSuccess) setSaveTimesGroupId(null); }}
                    />
                    <div className="fixed inset-x-4 top-[6%] z-50 bg-[#0a0c12] border border-white/10 rounded-2xl max-h-[88vh] overflow-y-auto">

                        {/* Modal header */}
                        <div className="flex items-center justify-between px-4 py-3.5 border-b border-white/8 sticky top-0 bg-[#0a0c12] rounded-t-2xl z-10">
                            <div>
                                <p className="text-white/80 text-sm font-bold">Guardar tempos</p>
                                <p className="text-white/30 text-xs">{saveTimesGroup.name}</p>
                            </div>
                            <button
                                onClick={() => setSaveTimesGroupId(null)}
                                className="w-7 h-7 rounded-full bg-white/8 hover:bg-white/15 flex items-center justify-center text-white/40 transition-colors"
                            >
                                <X className="w-3.5 h-3.5" />
                            </button>
                        </div>

                        <div className="p-4 space-y-4">

                            {/* Stroke + Distance */}
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="text-white/30 text-[10px] font-bold uppercase tracking-wider block mb-1.5">Nado</label>
                                    <select
                                        value={saveStroke}
                                        onChange={e => setSaveStroke(e.target.value)}
                                        className="w-full h-9 px-3 rounded-xl bg-white/5 border border-white/10 text-white/70 text-sm focus:outline-none focus:border-blue-400/40"
                                    >
                                        {STROKES.map(s => (
                                            <option key={s.value} value={s.value}>{s.label}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="text-white/30 text-[10px] font-bold uppercase tracking-wider block mb-1.5">Distância (m)</label>
                                    <input
                                        type="number"
                                        value={saveDistance}
                                        onChange={e => setSaveDistance(Number(e.target.value))}
                                        min={1}
                                        className="w-full h-9 px-3 rounded-xl bg-white/5 border border-white/10 text-white/70 text-sm focus:outline-none focus:border-blue-400/40"
                                    />
                                </div>
                            </div>

                            {/* Pool length */}
                            <div>
                                <label className="text-white/30 text-[10px] font-bold uppercase tracking-wider block mb-1.5">Piscina</label>
                                <div className="flex gap-1.5">
                                    {(['25m', '50m'] as const).map(pl => (
                                        <button
                                            key={pl}
                                            onClick={() => setSavePoolLength(pl)}
                                            className={`flex-1 h-8 rounded-xl text-xs font-bold border transition-all ${
                                                savePoolLength === pl
                                                    ? 'bg-blue-500/25 text-blue-300 border-blue-400/30'
                                                    : 'bg-white/5 text-white/35 border-white/8 hover:bg-white/8'
                                            }`}
                                        >
                                            {pl}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Lanes list */}
                            <div>
                                <p className="text-white/30 text-[10px] font-bold uppercase tracking-wider mb-2">
                                    Nadadores · seleciona quem guardar
                                </p>
                                {saveLanesWithTimes.length === 0 ? (
                                    <div className="rounded-xl border border-white/6 bg-white/[0.02] px-3 py-5 text-center">
                                        <p className="text-white/25 text-xs">Sem tempos registados nesta série.</p>
                                        <p className="text-white/15 text-[10px] mt-0.5">Inicia e termina as canaletas primeiro.</p>
                                    </div>
                                ) : (
                                    <div className="space-y-1.5">
                                        {saveLanesWithTimes.map(({ l, i }) => (
                                            <button
                                                key={i}
                                                onClick={() => l.athleteId !== null && toggleSaveLane(i)}
                                                disabled={l.athleteId === null}
                                                className={`w-full flex items-center gap-3 rounded-xl border px-3 py-2.5 text-left transition-all ${
                                                    l.athleteId === null
                                                        ? 'border-white/4 bg-white/[0.01] opacity-30 cursor-not-allowed'
                                                        : saveLaneSelected.has(i)
                                                            ? 'border-emerald-400/25 bg-emerald-500/8'
                                                            : 'border-white/6 bg-white/[0.025] opacity-50 hover:opacity-80'
                                                }`}
                                            >
                                                <div className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 transition-all ${
                                                    l.athleteId !== null && saveLaneSelected.has(i)
                                                        ? 'bg-emerald-500/30 border-emerald-400/50'
                                                        : 'border-white/20'
                                                }`}>
                                                    {l.athleteId !== null && saveLaneSelected.has(i) && (
                                                        <CheckCircle2 className="w-2.5 h-2.5 text-emerald-400" />
                                                    )}
                                                </div>
                                                <span className="text-white/25 text-xs w-4 shrink-0 tabular-nums">{i + 1}</span>
                                                <span className="flex-1 text-white/70 text-sm font-semibold">
                                                    {l.athleteName ?? <span className="italic text-white/30 font-normal">sem atleta</span>}
                                                </span>
                                                <span className="font-mono font-bold text-sm tabular-nums text-white/70">{fmt(l.elapsed)}</span>
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Save button */}
                            <button
                                onClick={saveAthletesTimes}
                                disabled={saveLaneSelected.size === 0 || saveDistance <= 0 || saveSuccess}
                                className={`w-full h-10 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all border ${
                                    saveSuccess
                                        ? 'bg-emerald-500/25 text-emerald-300 border-emerald-400/30'
                                        : 'bg-blue-500/20 hover:bg-blue-500/30 text-blue-200 border-blue-400/20 disabled:opacity-30'
                                }`}
                            >
                                {saveSuccess ? (
                                    <><CheckCircle2 className="w-4 h-4" /> Guardado!</>
                                ) : (
                                    <><Save className="w-4 h-4" /> Guardar {saveLaneSelected.size} registo{saveLaneSelected.size !== 1 ? 's' : ''}</>
                                )}
                            </button>

                        </div>
                    </div>
                </>
            )}

        </HomeLayout>
    );
}
