import { Head, Link, useForm } from '@inertiajs/react';
import HomeLayout from '@/layouts/home-layout';
import { UserRound, Plus, ChevronRight } from 'lucide-react';
import { useState } from 'react';

export default function AthletesIndex({ athletes }: { athletes: any[] }) {
    const [isAdding, setIsAdding] = useState(false);
    const { data, setData, post, processing, reset } = useForm({
        name: '',
        date_of_birth: '',
        gender: '',
        club: '',
        started_year: '',
        height_cm: '',
        weight_kg: '',
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/coach/athletes', {
            onSuccess: () => {
                setIsAdding(false);
                reset();
            }
        });
    };

    return (
        <HomeLayout>
            <Head title="Os meus atletas" />

            <div className="mx-auto max-w-7xl px-4 py-8 md:px-8">
                <div className="mb-6 flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-white">Os meus atletas</h1>
                        <p className="mt-1 text-sm text-blue-200/50">Gere os teus atletas e acompanha a sua evolução</p>
                    </div>
                    <button
                        onClick={() => setIsAdding(!isAdding)}
                        className="flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-[0_0_15px_rgba(37,99,235,0.4)] transition hover:bg-blue-500 hover:shadow-[0_0_20px_rgba(59,130,246,0.6)]"
                    >
                        <Plus className="h-4 w-4" />
                        {isAdding ? 'Cancelar' : 'Adicionar atleta'}
                    </button>
                </div>

                {isAdding && (
                    <div className="mb-8 overflow-hidden rounded-[22px] border border-blue-400/15 bg-[#111d36]/60 p-5 shadow-[0_0_30px_rgba(59,130,246,0.05)] backdrop-blur-2xl">
                        <h2 className="mb-4 text-lg font-bold text-blue-50">Novo atleta</h2>
                        <form onSubmit={submit} className="grid gap-4 md:grid-cols-3">
                            {/* Row 1 */}
                            <div>
                                <label className="mb-1 block text-xs font-semibold text-blue-200/60">Nome completo *</label>
                                <input
                                    type="text"
                                    value={data.name}
                                    onChange={e => setData('name', e.target.value)}
                                    className="w-full rounded-xl border border-blue-400/15 bg-[#0b1120]/60 px-4 py-2 text-sm text-blue-50 outline-none transition focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50"
                                    required
                                />
                            </div>
                            <div>
                                <label className="mb-1 block text-xs font-semibold text-blue-200/60">Data de nascimento</label>
                                <input
                                    type="date"
                                    value={data.date_of_birth}
                                    onChange={e => setData('date_of_birth', e.target.value)}
                                    className="w-full rounded-xl border border-blue-400/15 bg-[#0b1120]/60 px-4 py-2 text-sm text-blue-50 outline-none transition focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50"
                                    style={{ colorScheme: 'dark' }}
                                />
                            </div>
                            <div>
                                <label className="mb-1 block text-xs font-semibold text-blue-200/60">Género</label>
                                <select
                                    value={data.gender}
                                    onChange={e => setData('gender', e.target.value)}
                                    className="w-full rounded-xl border border-blue-400/15 bg-[#0b1120]/60 px-4 py-2 text-sm text-blue-50 outline-none transition focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50"
                                >
                                    <option value="">—</option>
                                    <option value="Masculino">Masculino</option>
                                    <option value="Feminino">Feminino</option>
                                </select>
                            </div>
                            {/* Row 2 */}
                            <div>
                                <label className="mb-1 block text-xs font-semibold text-blue-200/60">Clube</label>
                                <input
                                    type="text"
                                    value={data.club}
                                    onChange={e => setData('club', e.target.value)}
                                    placeholder="Ex: Sporting CP"
                                    className="w-full rounded-xl border border-blue-400/15 bg-[#0b1120]/60 px-4 py-2 text-sm text-blue-50 outline-none transition focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50"
                                />
                            </div>
                            <div>
                                <label className="mb-1 block text-xs font-semibold text-blue-200/60">Início na natação (ano)</label>
                                <input
                                    type="number"
                                    value={data.started_year}
                                    onChange={e => setData('started_year', e.target.value)}
                                    placeholder={String(new Date().getFullYear())}
                                    min={1950}
                                    max={new Date().getFullYear()}
                                    className="w-full rounded-xl border border-blue-400/15 bg-[#0b1120]/60 px-4 py-2 text-sm text-blue-50 outline-none transition focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                                <div>
                                    <label className="mb-1 block text-xs font-semibold text-blue-200/60">Altura (cm)</label>
                                    <input
                                        type="number"
                                        value={data.height_cm}
                                        onChange={e => setData('height_cm', e.target.value)}
                                        placeholder="170"
                                        min={50} max={250}
                                        className="w-full rounded-xl border border-blue-400/15 bg-[#0b1120]/60 px-4 py-2 text-sm text-blue-50 outline-none transition focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50"
                                    />
                                </div>
                                <div>
                                    <label className="mb-1 block text-xs font-semibold text-blue-200/60">Peso (kg)</label>
                                    <input
                                        type="number"
                                        value={data.weight_kg}
                                        onChange={e => setData('weight_kg', e.target.value)}
                                        placeholder="65"
                                        min={10} max={200} step={0.1}
                                        className="w-full rounded-xl border border-blue-400/15 bg-[#0b1120]/60 px-4 py-2 text-sm text-blue-50 outline-none transition focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50"
                                    />
                                </div>
                            </div>
                            <div className="md:col-span-3">
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-2 text-sm font-bold text-white shadow-[0_0_15px_rgba(59,130,246,0.3)] transition hover:shadow-[0_0_20px_rgba(59,130,246,0.5)] disabled:opacity-50"
                                >
                                    Criar atleta
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {athletes.map(athlete => (
                        <Link
                            key={athlete.id}
                            href={`/coach/athletes/${athlete.id}`}
                            className="group flex flex-col justify-between overflow-hidden rounded-[22px] border border-blue-400/10 bg-[#111d36]/50 p-5 shadow-[0_0_30px_rgba(59,130,246,0.03)] backdrop-blur-2xl transition hover:border-blue-400/25 hover:bg-[#111d36]/70"
                        >
                            <div className="flex items-center gap-4">
                                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-amber-400/20 bg-gradient-to-br from-amber-500/10 to-orange-500/10 shadow-[0_0_15px_rgba(251,191,36,0.1)] transition-transform duration-300 group-hover:scale-110">
                                    <UserRound className="h-5 w-5 text-amber-300 drop-shadow-[0_0_5px_rgba(251,191,36,0.5)]" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-blue-50 leading-tight">{athlete.name}</h3>
                                    <p className="mt-0.5 text-xs text-blue-200/50">
                                        {athlete.club && <span className="mr-2">{athlete.club}</span>}
                                        {athlete.swim_records_count || 0} registos
                                    </p>
                                </div>
                            </div>

                            <div className="mt-5 flex items-center justify-between border-t border-blue-400/10 pt-4">
                                <div className="flex items-center gap-3">
                                    {athlete.swim_groups?.length > 0 && (
                                        <div className="flex -space-x-2">
                                            {athlete.swim_groups.slice(0, 3).map((g: any, i: number) => (
                                                <div key={i} className="flex h-6 w-6 items-center justify-center rounded-full border border-[#111d36] bg-blue-500/20 text-[9px] font-bold text-blue-200" title={g.name}>
                                                    {g.name.charAt(0)}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                    {athlete.started_year && (
                                        <span className="text-[10px] text-blue-200/30">desde {athlete.started_year}</span>
                                    )}
                                </div>
                                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-500/10 text-blue-300 transition group-hover:bg-blue-500 group-hover:text-white group-hover:shadow-[0_0_15px_rgba(59,130,246,0.5)]">
                                    <ChevronRight className="h-4 w-4" />
                                </div>
                            </div>
                        </Link>
                    ))}
                    {athletes.length === 0 && !isAdding && (
                        <div className="col-span-full py-12 text-center">
                            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-blue-400/10 bg-blue-500/5">
                                <UserRound className="h-6 w-6 text-blue-300/40" />
                            </div>
                            <h3 className="mt-4 text-lg font-bold text-blue-100">Nenhum atleta ainda</h3>
                            <p className="mt-1 text-sm text-blue-200/40">Começa por adicionar o teu primeiro atleta.</p>
                        </div>
                    )}
                </div>
            </div>
        </HomeLayout>
    );
}
