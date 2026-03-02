import { Star, ShieldCheck, Globe } from 'lucide-react';

interface PoolCardSmallProps {
    image: string;
    name: string;
    type: 'Private Pool' | 'Public Pool';
    category: string;
    rating: number;
    reviews: number;
    priceMin: number;
    priceMax: number;
    pricePer: string;
}

export function PoolCardSmall({
    image,
    name,
    type,
    category,
    rating,
    reviews,
    priceMin,
    priceMax,
    pricePer,
}: PoolCardSmallProps) {
    const isPrivate = type === 'Private Pool';

    return (
        <div className="group cursor-pointer overflow-hidden rounded-[22px] border border-blue-400/10 bg-[#111d36]/60 shadow-[0_0_24px_rgba(59,130,246,0.04),0_4px_20px_rgba(0,0,0,0.3)] backdrop-blur-xl transition-all duration-500 hover:border-blue-400/20 hover:shadow-[0_0_40px_rgba(59,130,246,0.08)]">
            {/* Image */}
            <div className="relative aspect-[4/3] overflow-hidden">
                <img
                    src={image}
                    alt={name}
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0b1120]/60 to-transparent" />

                {/* Badge */}
                <div className="absolute top-3 left-3 flex items-center gap-1 rounded-2xl border border-blue-300/15 bg-[#111d36]/70 px-2.5 py-1 text-[11px] font-bold text-blue-100 backdrop-blur-xl">
                    {isPrivate ? (
                        <ShieldCheck className="h-3 w-3 text-blue-300 drop-shadow-[0_0_4px_rgba(147,197,253,0.5)]" />
                    ) : (
                        <Globe className="h-3 w-3 text-blue-300 drop-shadow-[0_0_4px_rgba(147,197,253,0.5)]" />
                    )}
                    <span>{type}</span>
                </div>
            </div>

            {/* Content */}
            <div className="p-3.5">
                {/* Blue glow line */}
                <div className="-mt-3.5 mb-3 h-px bg-gradient-to-r from-transparent via-blue-400/20 to-transparent" />

                <h4 className="truncate text-sm font-bold text-blue-100">
                    {name}
                </h4>
                <div className="mt-1 flex items-center gap-1 text-xs text-blue-200/30">
                    <span>{category}:</span>
                    <span className="font-semibold text-blue-200/60">{rating.toFixed(1)}</span>
                    <Star className="h-3 w-3 fill-blue-300/80 text-blue-300/80" />
                    <span>({reviews})</span>
                </div>
                <p className="mt-2 text-xs">
                    <span className="font-bold text-blue-300/80">₹{priceMin.toLocaleString()}</span>
                    <span className="text-blue-300/20"> - </span>
                    <span className="font-bold text-blue-300/80">₹{priceMax.toLocaleString()}</span>
                    <span className="ml-1 text-blue-200/25">{pricePer}</span>
                </p>
            </div>
        </div>
    );
}
