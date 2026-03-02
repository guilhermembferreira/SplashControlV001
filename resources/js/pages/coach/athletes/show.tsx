import { Head, Link, useForm, router } from '@inertiajs/react';
import HomeLayout from '@/layouts/home-layout';
import { UserRound, ArrowLeft, Plus, X, Timer, Activity, Calendar, Trophy, Pencil, Check } from 'lucide-react';
import { useState } from 'react';

type SwimRecord = {
    id: number;
    record_type: 'practice' | 'competition';
    stroke: string;
    distance: number;
    time_ms: number;
    pool_length: string;
    date: string;
    formatted_time: string;
    competition_name: string | null;
    competition_location: string | null;
    notes: string | null;
};

type Athlete = {
    id: number;
    name: string;
    date_of_birth: string | null;
    gender: string | null;
    club: string | null;
    started_year: number | null;
    height_cm: number | null;
    weight_kg: number | null;
    swim_groups: { id: number; name: string }[];
    swim_records: SwimRecord[];
};

function formatMs(ms: number): string {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    const centis = Math.floor((ms % 1000) / 10);
    if (minutes > 0) return `${minutes}:${String(seconds).padStart(2, '0')}.${String(centis).padStart(2, '0')}`;
    return `${seconds}.${String(centis).padStart(2, '0')}`;
}

function parseTimeToMs(timeStr: string): number {
    const parts = timeStr.split(':');
    let m = 0, s = 0, ms = 0;
    if (parts.length > 1) {
        m = parseInt(parts[0], 10);
        const secParts = parts[1].split('.');
        s = parseInt(secParts[0], 10);
        ms = secParts.length > 1 ? parseInt(secParts[1].padEnd(3, '0').slice(0, 3), 10) : 0;
    } else {
        const secParts = parts[0].split('.');
        s = parseInt(secParts[0], 10);
        ms = secParts.length > 1 ? parseInt(secParts[1].padEnd(3, '0').slice(0, 3), 10) : 0;
    }
    return (m * 60 * 1000) + (s * 1000) + ms;
}

function getAge(dob: string | null): number | null {
    if (!dob) return null;
    return Math.floor((Date.now() - new Date(dob).getTime()) / (1000 * 60 * 60 * 24 * 365.25));
}

const strokePT: Record<string, string> = {
    Freestyle: 'Crol',
    Backstroke: 'Costas',
    Breaststroke: 'Bruços',
    Butterfly: 'Mariposa',
    'Individual Medley': 'Estilos',
};

export default function AthleteShow({ athlete, personalBests }: { athlete: Athlete; personalBests: SwimRecord[] }) {
    const [isAddingRecord, setIsAddingRecord] = useState(false);
    const [isEditingProfile, setIsEditingProfile] = useState(false);
    const [timeInput, setTimeInput] = useState('');
    const [showCompetitionFields, setShowCompetitionFields] = useState(false);

    const recordForm = useForm({
        athlete_id: athlete.id,
        record_type: 'practice' as string,
        stroke: '',
        distance: '',
        time_ms: '',
        pool_length: '25m',
        date: new Date().toISOString().split('T')[0],
        competition_name: '',
        competition_location: '',
        notes: '',
    });

    const profileForm = useForm({
        name: athlete.name,
        date_of_birth: athlete.date_of_birth?.split('T')[0] ?? '',
        gender: athlete.gender ?? '',
        club: athlete.club ?? '',
        started_year: athlete.started_year ? String(athlete.started_year) : '',
        height_cm: athlete.height_cm ? String(athlete.height_cm) : '',
        weight_kg: athlete.weight_kg ? String(athlete.weight_kg) : '',
    });

    const submitRecord = (e: React.FormEvent) => {
        e.preventDefault();
        const ms = parseTimeToMs(timeInput);
        recordForm.setData('time_ms', String(ms));
        recordForm.post('/coach/records', {
            onSuccess: () => {
                setIsAddingRecord(false);
                setTimeInput('');
                setShowCompetitionFields(false);
                recordForm.reset('stroke', 'distance', 'time_ms', 'competition_name', 'competition_location', 'notes');
            }
        });
    };

    const submitProfile = (e: React.FormEvent) => {
        e.preventDefault();
        profileForm.put(`/coach/athletes/${athlete.id}`, {
            onSuccess: () => setIsEditingProfile(false),
        });
    };

    const removeRecord = (recordId: number) => {
        if (confirm('Tens a certeza que queres apagar este registo?')) {
            router.delete(`/coach/records/${recordId}`);
        }
    };

    const destroyAthlete = () => {
        if (confirm('Tens a certeza que queres apagar este atleta? Esta ação é irreversível.')) {
            router.delete(`/coach/athletes/${athlete.id}`);
        }
    };

    const pbIds = new Set(personalBests.map(r => r.id));

    return (
        <HomeLayout>
            <Head title={athlete.name} />

            <div className="mx-auto max-w-7xl px-4 py-8 md:px-8">
                {/* Header */}
                <div className="mb-6 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href="/coach/athletes" className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10 text-blue-300 transition hover:bg-blue-500/20">
                            <ArrowLeft className="h-5 w-5" />
                        </Link>
                        <div>
                            <h1 className="text-2xl font-bold text-white tracking-tight">{athlete.name}</h1>
                            <div className="mt-1 flex flex-wrap gap-x-3 gap-y-0.5 text-sm text-blue-200/50">
                                {athlete.date_of_birth && <span>{getAge(athlete.date_of_birth)} anos</span>}
                                {athlete.gender && <span>&bull; {athlete.gender}</span>}
                                {athlete.club && <span>&bull; {athlete.club}</span>}
                                {athlete.started_year && <span>&bull; na natação desde {athlete.started_year}</span>}
                            </div>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={() => setIsEditingProfile(!isEditingProfile)}
                            className="flex items-center gap-1.5 rounded-xl border border-blue-400/20 bg-blue-500/10 px-3 py-2 text-sm font-medium text-blue-300 transition hover:bg-blue-500/20"
                        >
                            <Pencil className="h-4 w-4" />
                            <span className="hidden sm:inline">Editar perfil</span>
                        </button>
                        <button
                            onClick={destroyAthlete}
                            className="flex h-10 w-10 items-center justify-center rounded-xl border border-red-500/20 bg-red-500/10 text-red-400 transition hover:bg-red-500/20"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    </div>
                </div>

                {/* Profile edit form */}
                {isEditingProfile && (
                    <div className="mb-6 overflow-hidden rounded-[22px] border border-blue-400/15 bg-[#111d36]/60 p-5 shadow-[0_0_30px_rgba(59,130,246,0.05)] backdrop-blur-2xl">
                        <h2 className="mb-4 text-base font-bold text-blue-50">Editar perfil do atleta</h2>
                        <form onSubmit={submitProfile} className="grid gap-4 sm:grid-cols-2 md:grid-cols-4">
                            <div className="sm:col-span-2">
                                <label className="mb-1 block text-xs font-semibold text-blue-200/60">Nome *</label>
                                <input type="text" value={profileForm.data.name} onChange={e => profileForm.setData('name', e.target.value)} required
                                    className="w-full rounded-xl border border-blue-400/15 bg-[#0b1120]/60 px-4 py-2 text-sm text-blue-50 outline-none transition focus:border-blue-500/50" />
                            </div>
                            <div>
                                <label className="mb-1 block text-xs font-semibold text-blue-200/60">Data de nascimento</label>
                                <input type="date" value={profileForm.data.date_of_birth} onChange={e => profileForm.setData('date_of_birth', e.target.value)}
                                    className="w-full rounded-xl border border-blue-400/15 bg-[#0b1120]/60 px-4 py-2 text-sm text-blue-50 outline-none transition focus:border-blue-500/50"
                                    style={{ colorScheme: 'dark' }} />
                            </div>
                            <div>
                                <label className="mb-1 block text-xs font-semibold text-blue-200/60">Género</label>
                                <select value={profileForm.data.gender} onChange={e => profileForm.setData('gender', e.target.value)}
                                    className="w-full rounded-xl border border-blue-400/15 bg-[#0b1120]/60 px-4 py-2 text-sm text-blue-50 outline-none transition focus:border-blue-500/50">
                                    <option value="">—</option>
                                    <option value="Masculino">Masculino</option>
                                    <option value="Feminino">Feminino</option>
                                </select>
                            </div>
                            <div>
                                <label className="mb-1 block text-xs font-semibold text-blue-200/60">Clube</label>
                                <input type="text" value={profileForm.data.club} onChange={e => profileForm.setData('club', e.target.value)} placeholder="Ex: Sporting CP"
                                    className="w-full rounded-xl border border-blue-400/15 bg-[#0b1120]/60 px-4 py-2 text-sm text-blue-50 outline-none transition focus:border-blue-500/50" />
                            </div>
                            <div>
                                <label className="mb-1 block text-xs font-semibold text-blue-200/60">Ano de início</label>
                                <input type="number" value={profileForm.data.started_year} onChange={e => profileForm.setData('started_year', e.target.value)}
                                    placeholder={String(new Date().getFullYear())} min={1950} max={new Date().getFullYear()}
                                    className="w-full rounded-xl border border-blue-400/15 bg-[#0b1120]/60 px-4 py-2 text-sm text-blue-50 outline-none transition focus:border-blue-500/50" />
                            </div>
                            <div>
                                <label className="mb-1 block text-xs font-semibold text-blue-200/60">Altura (cm)</label>
                                <input type="number" value={profileForm.data.height_cm} onChange={e => profileForm.setData('height_cm', e.target.value)}
                                    placeholder="170" min={50} max={250}
                                    className="w-full rounded-xl border border-blue-400/15 bg-[#0b1120]/60 px-4 py-2 text-sm text-blue-50 outline-none transition focus:border-blue-500/50" />
                            </div>
                            <div>
                                <label className="mb-1 block text-xs font-semibold text-blue-200/60">Peso (kg)</label>
                                <input type="number" value={profileForm.data.weight_kg} onChange={e => profileForm.setData('weight_kg', e.target.value)}
                                    placeholder="65" min={10} max={200} step={0.1}
                                    className="w-full rounded-xl border border-blue-400/15 bg-[#0b1120]/60 px-4 py-2 text-sm text-blue-50 outline-none transition focus:border-blue-500/50" />
                            </div>
                            <div className="sm:col-span-2 md:col-span-4 flex gap-3">
                                <button type="submit" disabled={profileForm.processing}
                                    className="flex items-center gap-1.5 rounded-xl bg-linear-to-r from-blue-600 to-indigo-600 px-5 py-2 text-sm font-bold text-white disabled:opacity-50">
                                    <Check className="h-4 w-4" /> Guardar
                                </button>
                                <button type="button" onClick={() => setIsEditingProfile(false)}
                                    className="rounded-xl border border-blue-400/15 px-5 py-2 text-sm font-medium text-blue-300 transition hover:bg-blue-500/10">
                                    Cancelar
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                {/* Info Card */}
                <div className="mb-8 overflow-hidden rounded-[22px] border border-blue-400/10 bg-[#111d36]/50 p-6 shadow-[0_0_30px_rgba(59,130,246,0.03)] backdrop-blur-2xl">
                    <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
                        <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full border border-amber-400/20 bg-amber-500/10 shadow-[0_0_20px_rgba(251,191,36,0.15)]">
                            <UserRound className="h-7 w-7 text-amber-300" />
                        </div>
                        <div className="flex-1 grid gap-4 sm:grid-cols-2">
                            {(athlete.height_cm || athlete.weight_kg) && (
                                <div>
                                    <p className="text-[11px] font-semibold uppercase tracking-wider text-blue-200/40">Físico</p>
                                    <div className="mt-1.5 flex gap-4">
                                        {athlete.height_cm && (
                                            <span className="text-sm font-bold text-blue-100">{athlete.height_cm} <span className="text-xs font-normal text-blue-200/50">cm</span></span>
                                        )}
                                        {athlete.weight_kg && (
                                            <span className="text-sm font-bold text-blue-100">{athlete.weight_kg} <span className="text-xs font-normal text-blue-200/50">kg</span></span>
                                        )}
                                    </div>
                                </div>
                            )}
                            <div>
                                <p className="text-[11px] font-semibold uppercase tracking-wider text-blue-200/40">Grupos de treino</p>
                                {athlete.swim_groups?.length > 0 ? (
                                    <div className="mt-1.5 flex flex-wrap gap-2">
                                        {athlete.swim_groups.map(g => (
                                            <span key={g.id} className="rounded-lg border border-blue-400/10 bg-blue-500/8 px-2.5 py-1 text-xs font-semibold text-blue-100">
                                                {g.name}
                                            </span>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="mt-1 text-sm text-blue-200/30">Sem grupos atribuídos.</p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Personal Bests */}
                {personalBests.length > 0 && (
                    <div className="mb-10">
                        <h2 className="mb-4 flex items-center gap-2 text-xl font-bold text-blue-50">
                            <Trophy className="h-5 w-5 text-amber-400" />
                            Recordes Pessoais
                        </h2>
                        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                            {personalBests.map(pb => (
                                <div key={pb.id} className="flex items-center justify-between rounded-2xl border border-amber-400/15 bg-amber-500/5 px-4 py-3">
                                    <div>
                                        <p className="text-sm font-bold text-blue-50">{pb.distance}m {strokePT[pb.stroke] ?? pb.stroke}</p>
                                        <p className="text-[11px] text-blue-200/40">{pb.pool_length} &bull; {new Date(pb.date).toLocaleDateString('pt-PT')}</p>
                                    </div>
                                    <span className="font-mono text-lg font-bold text-amber-300 drop-shadow-[0_0_8px_rgba(251,191,36,0.4)]">
                                        {pb.formatted_time || formatMs(pb.time_ms)}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Records Section */}
                <div>
                    <div className="mb-6 flex items-center justify-between">
                        <h2 className="text-xl font-bold text-blue-50">Histórico de tempos</h2>
                        <button
                            onClick={() => setIsAddingRecord(!isAddingRecord)}
                            className="flex items-center gap-1.5 rounded-lg bg-blue-500/10 px-3 py-1.5 text-xs font-semibold text-blue-300 transition hover:bg-blue-500 border border-blue-400/20 hover:text-white"
                        >
                            <Plus className="h-3.5 w-3.5" />
                            {isAddingRecord ? 'Cancelar' : 'Registar tempo'}
                        </button>
                    </div>

                    {isAddingRecord && (
                        <div className="mb-6 overflow-hidden rounded-[18px] border border-blue-400/15 bg-[#111d36]/60 p-5 shadow-[0_0_20px_rgba(59,130,246,0.05)] backdrop-blur-xl">
                            <form onSubmit={submitRecord} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5 items-end">
                                <div>
                                    <label className="mb-1 block text-[11px] font-bold uppercase tracking-wider text-blue-200/50">Tipo</label>
                                    <select value={recordForm.data.record_type}
                                        onChange={e => {
                                            recordForm.setData('record_type', e.target.value);
                                            setShowCompetitionFields(e.target.value === 'competition');
                                        }}
                                        className="w-full rounded-xl border border-blue-400/15 bg-[#0b1120]/60 px-3 py-2 text-sm text-blue-50 outline-none transition focus:border-blue-500/50">
                                        <option value="practice">Treino</option>
                                        <option value="competition">Competição</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="mb-1 block text-[11px] font-bold uppercase tracking-wider text-blue-200/50">Estilo</label>
                                    <select value={recordForm.data.stroke} onChange={e => recordForm.setData('stroke', e.target.value)}
                                        className="w-full rounded-xl border border-blue-400/15 bg-[#0b1120]/60 px-3 py-2 text-sm text-blue-50 outline-none transition focus:border-blue-500/50" required>
                                        <option value="">Escolher...</option>
                                        <option value="Freestyle">Crol</option>
                                        <option value="Backstroke">Costas</option>
                                        <option value="Breaststroke">Bruços</option>
                                        <option value="Butterfly">Mariposa</option>
                                        <option value="Individual Medley">Estilos</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="mb-1 block text-[11px] font-bold uppercase tracking-wider text-blue-200/50">Distância (m)</label>
                                    <input type="number" value={recordForm.data.distance} onChange={e => recordForm.setData('distance', e.target.value)}
                                        placeholder="50, 100..." required
                                        className="w-full rounded-xl border border-blue-400/15 bg-[#0b1120]/60 px-3 py-2 text-sm text-blue-50 outline-none transition focus:border-blue-500/50" />
                                </div>
                                <div>
                                    <label className="mb-1 block text-[11px] font-bold uppercase tracking-wider text-blue-200/50">Tempo (mm:ss.cs)</label>
                                    <input type="text" value={timeInput} onChange={e => setTimeInput(e.target.value)}
                                        placeholder="1:05.42" required
                                        className="w-full rounded-xl border border-blue-400/15 bg-[#0b1120]/60 px-3 py-2 text-sm font-mono text-amber-200 outline-none transition focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/50" />
                                </div>
                                <div>
                                    <label className="mb-1 block text-[11px] font-bold uppercase tracking-wider text-blue-200/50">Piscina & Data</label>
                                    <div className="flex gap-2">
                                        <select value={recordForm.data.pool_length} onChange={e => recordForm.setData('pool_length', e.target.value)}
                                            className="w-20 rounded-xl border border-blue-400/15 bg-[#0b1120]/60 px-2 py-2 text-xs text-blue-50 outline-none transition focus:border-blue-500/50">
                                            <option value="25m">25m</option>
                                            <option value="50m">50m</option>
                                        </select>
                                        <input type="date" value={recordForm.data.date} onChange={e => recordForm.setData('date', e.target.value)}
                                            required style={{ colorScheme: 'dark' }}
                                            className="w-full rounded-xl border border-blue-400/15 bg-[#0b1120]/60 px-2 py-2 text-xs text-blue-50 outline-none transition focus:border-blue-500/50" />
                                    </div>
                                </div>

                                {showCompetitionFields && (
                                    <>
                                        <div className="sm:col-span-2 lg:col-span-2">
                                            <label className="mb-1 block text-[11px] font-bold uppercase tracking-wider text-blue-200/50">Nome da competição</label>
                                            <input type="text" value={recordForm.data.competition_name} onChange={e => recordForm.setData('competition_name', e.target.value)}
                                                placeholder="Ex: Campeonato Nacional"
                                                className="w-full rounded-xl border border-amber-400/20 bg-[#0b1120]/60 px-3 py-2 text-sm text-blue-50 outline-none transition focus:border-amber-500/50" />
                                        </div>
                                        <div className="sm:col-span-2 lg:col-span-2">
                                            <label className="mb-1 block text-[11px] font-bold uppercase tracking-wider text-blue-200/50">Local</label>
                                            <input type="text" value={recordForm.data.competition_location} onChange={e => recordForm.setData('competition_location', e.target.value)}
                                                placeholder="Ex: Lisboa"
                                                className="w-full rounded-xl border border-amber-400/20 bg-[#0b1120]/60 px-3 py-2 text-sm text-blue-50 outline-none transition focus:border-amber-500/50" />
                                        </div>
                                    </>
                                )}

                                <div className="sm:col-span-2 lg:col-span-5">
                                    <label className="mb-1 block text-[11px] font-bold uppercase tracking-wider text-blue-200/50">Notas (opcional)</label>
                                    <input type="text" value={recordForm.data.notes} onChange={e => recordForm.setData('notes', e.target.value)}
                                        placeholder="Ex: boa viragem, partida forte..."
                                        className="w-full rounded-xl border border-blue-400/15 bg-[#0b1120]/60 px-3 py-2 text-sm text-blue-50 outline-none transition focus:border-blue-500/50" />
                                </div>

                                <div className="sm:col-span-2 lg:col-span-5">
                                    <button type="submit" disabled={recordForm.processing}
                                        className="w-full rounded-xl bg-linear-to-r from-blue-600 to-indigo-600 px-6 py-2.5 text-sm font-bold text-white shadow-[0_0_15px_rgba(59,130,246,0.3)] transition hover:shadow-[0_0_20px_rgba(59,130,246,0.5)] disabled:opacity-50">
                                        Guardar registo
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}

                    <div className="grid gap-3">
                        {athlete.swim_records?.map(record => (
                            <div key={record.id} className={`group flex items-center justify-between overflow-hidden rounded-[18px] border p-3 sm:p-4 backdrop-blur-xl transition ${pbIds.has(record.id) ? 'border-amber-400/20 bg-amber-500/5' : 'border-blue-400/8 bg-[#111d36]/40 hover:border-blue-400/20'}`}>
                                <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                                    <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full border ${record.record_type === 'competition' ? 'border-amber-400/30 bg-amber-500/10' : 'border-blue-400/20 bg-blue-500/10'}`}>
                                        {pbIds.has(record.id)
                                            ? <Trophy className="h-4 w-4 text-amber-400" />
                                            : <Activity className={`h-4 w-4 ${record.record_type === 'competition' ? 'text-amber-300' : 'text-blue-300'}`} />
                                        }
                                    </div>
                                    <div className="min-w-0">
                                        <p className="flex flex-wrap items-center gap-1.5 text-sm font-bold text-blue-50">
                                            {record.distance}m {strokePT[record.stroke] ?? record.stroke}
                                            {pbIds.has(record.id) && <span className="rounded bg-amber-500/20 px-1.5 py-0.5 text-[9px] font-bold uppercase text-amber-300">RP</span>}
                                            {record.record_type === 'competition' && !pbIds.has(record.id) && <span className="rounded bg-amber-500/15 px-1.5 py-0.5 text-[9px] font-bold uppercase text-amber-400/70">Comp.</span>}
                                        </p>
                                        <div className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[11px] text-blue-200/40">
                                            <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />{new Date(record.date).toLocaleDateString('pt-PT')}</span>
                                            <span>{record.pool_length}</span>
                                            {record.competition_name && <span className="text-amber-300/60">{record.competition_name}{record.competition_location ? `, ${record.competition_location}` : ''}</span>}
                                            {record.notes && <span className="italic text-blue-200/30 truncate max-w-50">{record.notes}</span>}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3 shrink-0">
                                    <span className="font-mono text-lg font-bold text-amber-200 drop-shadow-[0_0_8px_rgba(251,191,36,0.4)] tracking-wider">
                                        {record.formatted_time || formatMs(record.time_ms)}
                                    </span>
                                    <button onClick={() => removeRecord(record.id)}
                                        className="flex h-7 w-7 items-center justify-center rounded-full bg-red-500/10 text-red-400 transition hover:bg-red-500 hover:text-white sm:opacity-0 sm:group-hover:opacity-100">
                                        <X className="h-3.5 w-3.5" />
                                    </button>
                                </div>
                            </div>
                        ))}

                        {athlete.swim_records?.length === 0 && (
                            <div className="rounded-[18px] border border-blue-400/5 bg-[#111d36]/20 p-8 text-center backdrop-blur-sm">
                                <Timer className="mx-auto h-8 w-8 text-blue-300/20" />
                                <p className="mt-3 text-sm font-medium text-blue-200/40">Ainda sem registos. Começa por registar um tempo!</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </HomeLayout>
    );
}
