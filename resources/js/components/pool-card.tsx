import { Star } from 'lucide-react';

interface PoolCardProps {
    image: string;
    name: string;
    rating: number;
    priceMin: number;
    priceMax: number;
    pricePer: string;
}

export function PoolCard({ image, name, rating, priceMin, priceMax, pricePer }: PoolCardProps) {
    return (
        <div className="group relative overflow-hidden rounded-[28px] border border-blue-400/10 shadow-[0_0_40px_rgba(59,130,246,0.06),0_8px_40px_rgba(0,0,0,0.4)]">
            {/* Full image */}
            <div className="aspect-[16/10] w-full overflow-hidden">
                <img
                    src={image}
                    alt={name}
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
            </div>

            {/* Gradient overlay — from dark navy bottom */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#0b1120] via-[#0b1120]/50 to-transparent" />

            {/* Blue glow edge at bottom */}
            <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-blue-400/30 to-transparent" />

            {/* Rating badge */}
            <div className="absolute top-4 left-4 flex items-center gap-1.5 rounded-2xl border border-blue-300/20 bg-[#111d36]/70 px-3.5 py-1.5 text-sm font-bold text-blue-100 backdrop-blur-xl">
                <span>{rating.toFixed(1)}</span>
                <Star className="h-3.5 w-3.5 fill-blue-300 text-blue-300 drop-shadow-[0_0_6px_rgba(147,197,253,0.6)]" />
            </div>

            {/* Bottom content */}
            <div className="absolute inset-x-0 bottom-0 p-5">
                <h3 className="text-xl font-bold tracking-tight text-blue-50">
                    {name}
                </h3>
                <div className="mt-2 flex items-center justify-between">
                    <p className="text-sm text-blue-200/60">
                        <span className="font-bold text-blue-100">₹ {priceMin.toLocaleString()}</span>
                        <span className="mx-1 text-blue-300/30">-</span>
                        <span className="font-bold text-blue-100">₹ {priceMax.toLocaleString()}</span>
                        <span className="ml-1.5 text-blue-200/40">{pricePer}</span>
                    </p>
                    <button className="rounded-2xl border border-blue-400/20 bg-blue-500/15 px-5 py-2.5 text-xs font-bold tracking-wide text-blue-200 shadow-[0_0_20px_rgba(59,130,246,0.1)] backdrop-blur-xl transition-all duration-300 hover:bg-blue-500/25 hover:shadow-[0_0_30px_rgba(59,130,246,0.2)] active:scale-95">
                        Get More Info
                    </button>
                </div>
            </div>
        </div>
    );
}
