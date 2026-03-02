import { Head, Link, useForm, router } from '@inertiajs/react';
import HomeLayout from '@/layouts/home-layout';
import { Users, UserRound, ArrowLeft, Plus, X } from 'lucide-react';
import { useState } from 'react';

export default function GroupShow({ group, availableAthletes }: { group: any, availableAthletes: any[] }) {
    const [isAdding, setIsAdding] = useState(false);
    const { data, setData, post, processing, reset } = useForm({
        athlete_id: '',
    });

    const submitAdd = (e: React.FormEvent) => {
        e.preventDefault();
        post(`/coach/groups/${group.id}/add-athlete`, {
            onSuccess: () => {
                setIsAdding(false);
                reset();
            }
        });
    };

    const removeAthlete = (athleteId: number) => {
        if (confirm('Are you sure you want to remove this athlete from the group?')) {
            router.delete(`/coach/groups/${group.id}/remove-athlete/${athleteId}`);
        }
    };

    const destroyGroup = () => {
        if (confirm('Are you sure you want to completely delete this group?')) {
            router.delete(`/coach/groups/${group.id}`);
        }
    };

    return (
        <HomeLayout>
            <Head title={group.name} />

            <div className="mx-auto max-w-7xl px-4 py-8 md:px-8">
                {/* Header */}
                <div className="mb-6 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href="/coach/groups" className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10 text-blue-300 transition hover:bg-blue-500/20">
                            <ArrowLeft className="h-5 w-5" />
                        </Link>
                        <div>
                            <h1 className="text-2xl font-bold text-white tracking-tight">{group.name}</h1>
                            <p className="mt-1 text-sm text-blue-200/50">
                                {group.athletes?.length || 0} Athletes enrolled
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={destroyGroup}
                        className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-2 text-sm font-medium text-red-400 transition hover:bg-red-500/20 hover:text-red-300"
                    >
                        Delete Group
                    </button>
                </div>

                {/* Info Card */}
                <div className="mb-8 overflow-hidden rounded-[22px] border border-blue-400/10 bg-[#111d36]/50 p-6 shadow-[0_0_30px_rgba(59,130,246,0.03)] backdrop-blur-2xl">
                    <div className="flex items-start gap-5">
                        <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl border border-blue-400/20 bg-blue-500/10 shadow-[0_0_20px_rgba(59,130,246,0.15)]">
                            <Users className="h-7 w-7 text-blue-300" />
                        </div>
                        <div>
                            <h3 className="text-[13px] font-semibold text-blue-200/50">Description</h3>
                            <p className="mt-1 text-sm leading-relaxed text-blue-50">{group.description || 'No description provided.'}</p>
                        </div>
                    </div>
                </div>

                {/* Athletes List */}
                <div className="mt-10">
                    <div className="mb-6 flex items-center justify-between">
                        <h2 className="text-xl font-bold text-blue-50">Squad Members</h2>
                        <button
                            onClick={() => setIsAdding(!isAdding)}
                            className="flex items-center gap-1.5 rounded-lg bg-blue-500/10 px-3 py-1.5 text-xs font-semibold text-blue-300 transition hover:bg-blue-500 border border-blue-400/20 hover:text-white"
                        >
                            <Plus className="h-3.5 w-3.5" />
                            {isAdding ? 'Cancel' : 'Add to Squad'}
                        </button>
                    </div>

                    {isAdding && (
                        <div className="mb-6 overflow-hidden rounded-[18px] border border-blue-400/15 bg-[#111d36]/60 p-4 shadow-[0_0_20px_rgba(59,130,246,0.05)] backdrop-blur-xl">
                            <form onSubmit={submitAdd} className="flex flex-col gap-3 sm:flex-row sm:items-end">
                                <div className="flex-1">
                                    <label className="mb-1 block text-xs font-semibold text-blue-200/60">Select Athlete (not in group)</label>
                                    <select
                                        value={data.athlete_id}
                                        onChange={e => setData('athlete_id', e.target.value)}
                                        className="w-full rounded-xl border border-blue-400/15 bg-[#0b1120]/60 px-4 py-2.5 text-sm text-blue-50 outline-none transition focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50"
                                        required
                                    >
                                        <option value="">Choose an athlete...</option>
                                        {availableAthletes.map(a => (
                                            <option key={a.id} value={a.id}>{a.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <button
                                    type="submit"
                                    disabled={processing || !data.athlete_id}
                                    className="rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-2.5 text-sm font-bold text-white shadow-[0_0_15px_rgba(59,130,246,0.3)] transition hover:shadow-[0_0_20px_rgba(59,130,246,0.5)] disabled:opacity-50"
                                >
                                    Add
                                </button>
                            </form>
                        </div>
                    )}

                    <div className="grid gap-3">
                        {group.athletes?.map((athlete: any) => (
                            <div key={athlete.id} className="flex flex-col gap-4 sm:flex-row sm:items-center justify-between overflow-hidden rounded-[18px] border border-blue-400/8 bg-[#111d36]/40 p-4 shadow-[0_0_20px_rgba(59,130,246,0.02)] backdrop-blur-xl transition hover:border-blue-400/20">
                                <div className="flex items-center gap-4">
                                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-amber-400/20 bg-gradient-to-br from-amber-500/10 to-orange-500/10 shadow-[0_0_10px_rgba(251,191,36,0.1)]">
                                        <UserRound className="h-4 w-4 text-amber-300" />
                                    </div>
                                    <div>
                                        <Link href={`/coach/athletes/${athlete.id}`} className="text-base font-bold text-blue-50 hover:text-blue-300 hover:underline">{athlete.name}</Link>
                                        <p className="mt-0.5 flex gap-2 text-xs text-blue-200/40">
                                            {athlete.gender && <span>{athlete.gender}</span>}
                                        </p>
                                    </div>
                                </div>

                                <button
                                    onClick={() => removeAthlete(athlete.id)}
                                    className="flex items-center justify-center rounded-xl bg-red-500/10 px-3 py-1.5 text-xs font-semibold text-red-400 transition hover:bg-red-500 hover:text-white"
                                >
                                    <X className="mr-1 h-3.5 w-3.5" />
                                    Remove
                                </button>
                            </div>
                        ))}

                        {group.athletes?.length === 0 && (
                            <div className="rounded-[18px] border border-blue-400/5 bg-[#111d36]/20 p-8 text-center backdrop-blur-sm">
                                <p className="text-sm font-medium text-blue-200/40">No athletes in this squad yet.</p>
                            </div>
                        )}
                    </div>
                </div>

            </div>
        </HomeLayout>
    );
}
