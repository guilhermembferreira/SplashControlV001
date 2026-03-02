import { Head, Link, useForm } from '@inertiajs/react';
import HomeLayout from '@/layouts/home-layout';
import { Users, Plus, ChevronRight } from 'lucide-react';
import { useState } from 'react';

export default function GroupsIndex({ groups }: { groups: any[] }) {
    const [isAdding, setIsAdding] = useState(false);
    const { data, setData, post, processing, reset } = useForm({
        name: '',
        description: '',
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/coach/groups', {
            onSuccess: () => {
                setIsAdding(false);
                reset();
            }
        });
    };

    return (
        <HomeLayout>
            <Head title="Training Groups" />

            <div className="mx-auto max-w-7xl px-4 py-8 md:px-8">
                <div className="mb-6 flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-white">Training Groups</h1>
                        <p className="mt-1 text-sm text-blue-200/50">Manage your squads and swimming classes</p>
                    </div>
                    <button
                        onClick={() => setIsAdding(!isAdding)}
                        className="flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-[0_0_15px_rgba(37,99,235,0.4)] transition hover:bg-blue-500 hover:shadow-[0_0_20px_rgba(59,130,246,0.6)]"
                    >
                        <Plus className="h-4 w-4" />
                        {isAdding ? 'Cancel' : 'Create Group'}
                    </button>
                </div>

                {isAdding && (
                    <div className="mb-8 overflow-hidden rounded-[22px] border border-blue-400/15 bg-[#111d36]/60 p-5 shadow-[0_0_30px_rgba(59,130,246,0.05)] backdrop-blur-2xl">
                        <h2 className="mb-4 text-lg font-bold text-blue-50">Create New Group</h2>
                        <form onSubmit={submit} className="grid gap-4 md:grid-cols-2">
                            <div className="md:col-span-2">
                                <label className="mb-1 block text-xs font-semibold text-blue-200/60">Group Name</label>
                                <input
                                    type="text"
                                    value={data.name}
                                    onChange={e => setData('name', e.target.value)}
                                    placeholder="e.g. Elite Squad, Beginners 6PM"
                                    className="w-full rounded-xl border border-blue-400/15 bg-[#0b1120]/60 px-4 py-2 text-sm text-blue-50 outline-none transition focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50"
                                    required
                                />
                            </div>
                            <div className="md:col-span-2">
                                <label className="mb-1 block text-xs font-semibold text-blue-200/60">Description (Optional)</label>
                                <textarea
                                    value={data.description}
                                    onChange={e => setData('description', e.target.value)}
                                    className="w-full rounded-xl border border-blue-400/15 bg-[#0b1120]/60 px-4 py-2 text-sm text-blue-50 outline-none transition focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50"
                                    rows={2}
                                />
                            </div>
                            <div className="md:col-span-2">
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-2 text-sm font-bold text-white shadow-[0_0_15px_rgba(59,130,246,0.3)] transition hover:shadow-[0_0_20px_rgba(59,130,246,0.5)] disabled:opacity-50"
                                >
                                    Create Group
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {groups.map(group => (
                        <Link
                            key={group.id}
                            href={`/coach/groups/${group.id}`}
                            className="group flex flex-col justify-between overflow-hidden rounded-[22px] border border-blue-400/10 bg-[#111d36]/50 p-5 shadow-[0_0_30px_rgba(59,130,246,0.03)] backdrop-blur-2xl transition hover:border-blue-400/25 hover:bg-[#111d36]/70"
                        >
                            <div className="flex items-center gap-4">
                                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-blue-400/20 bg-blue-500/10 shadow-[0_0_15px_rgba(59,130,246,0.1)] transition-transform duration-300 group-hover:scale-110">
                                    <Users className="h-5 w-5 text-blue-300 drop-shadow-[0_0_5px_rgba(59,130,246,0.5)]" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-blue-50 leading-tight">{group.name}</h3>
                                    <p className="mt-0.5 text-xs text-blue-200/50">
                                        {group.athletes_count || 0} Athletes enrolled
                                    </p>
                                </div>
                            </div>

                            {group.description && (
                                <p className="mt-4 text-sm text-blue-200/60 line-clamp-2">
                                    {group.description}
                                </p>
                            )}

                            <div className="mt-5 flex items-center justify-end border-t border-blue-400/10 pt-4">
                                <div className="flex items-center gap-1.5 text-xs font-semibold text-blue-300 transition group-hover:text-amber-400">
                                    <span>Manage Squad</span>
                                    <ChevronRight className="h-4 w-4" />
                                </div>
                            </div>
                        </Link>
                    ))}
                    {groups.length === 0 && !isAdding && (
                        <div className="col-span-full py-12 text-center">
                            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-blue-400/10 bg-blue-500/5">
                                <Users className="h-6 w-6 text-blue-300/40" />
                            </div>
                            <h3 className="mt-4 text-lg font-bold text-blue-100">No groups yet</h3>
                            <p className="mt-1 text-sm text-blue-200/40">Create a group to organize your athletes for relay or training.</p>
                        </div>
                    )}
                </div>
            </div>
        </HomeLayout>
    );
}
