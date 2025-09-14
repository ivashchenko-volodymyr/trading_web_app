import { useMemo } from "react";

type PricePoint = {
    date: string;
    open: number;
    high: number;
    low: number;
    close: number;
    volume: number | null;
};

export function PriceChart({
                               data,
                               height = 420,
                               padding = { top: 16, right: 32, bottom: 24, left: 44 },
                           }: {
    data: PricePoint[];
    height?: number;
    padding?: { top: number; right: number; bottom: number; left: number };
}) {
    const { pathD, minY, maxY, ticksY, xLabels, viewBox } = useMemo(() => {
        const W = 1800;
        const H = height;
        if (!data?.length) {
            return {
                pathD: "",
                minY: 0,
                maxY: 0,
                ticksY: [] as number[],
                xLabels: [] as { x: number; label: string }[],
                viewBox: `0 0 ${W} ${H}`,
            };
        }

        const { top, right, bottom, left } = padding;

        const ys = data.map((d) => d.close);
        const minYVal = Math.min(...ys);
        const maxYVal = Math.max(...ys);
        const padY = (maxYVal - minYVal || 1) * 0.05;
        const y0 = minYVal - padY;
        const y1 = maxYVal + padY;

        const scaleX = (i: number) =>
            left + ((W - left - right) * i) / Math.max(1, data.length - 1);
        const scaleY = (v: number) =>
            top + (H - top - bottom) * (1 - (v - y0) / Math.max(1e-6, y1 - y0));

        let d = "";
        data.forEach((pt, i) => {
            const x = scaleX(i);
            const y = scaleY(pt.close);
            d += i === 0 ? `M ${x} ${y}` : ` L ${x} ${y}`;
        });

        const ticks = 5;
        const tickVals = Array.from({ length: ticks }, (_, i) => y0 + ((y1 - y0) * i) / (ticks - 1));

        const xTickCount = 5;
        const xLabels = Array.from({ length: xTickCount }, (_, i) => {
            const idxRaw = Math.round((i * (data.length - 1)) / (xTickCount - 1));
            const safeIdx = Math.min(Math.max(idxRaw, 0), Math.max(0, data.length - 1));
            const point = data[safeIdx];
            const dt = new Date(point?.date ?? Date.now());
            const label = dt.toLocaleDateString(undefined, { month: "short", day: "numeric" });
            return { x: scaleX(safeIdx), label };
        });

        return {
            pathD: d,
            minY: y0,
            maxY: y1,
            ticksY: tickVals,
            xLabels,
            viewBox: `0 0 ${W} ${H}`,
        };
    }, [data, height, padding]);

    return (
        <div className="price-chart">
            <svg viewBox={viewBox} preserveAspectRatio="none" style={{ width: "100%", height }}>
                {/* Axes */}
                <g className="axes" stroke="#374151" strokeWidth="1">
                    <line x1="44" y1={height - 24} x2="100%" y2={height - 24} />
                    <line x1="44" y1="0" x2="44" y2={height - 24} />
                </g>

                {/* Y grid + labels */}
                <g className="y-grid">
                    {ticksY.map((v, i) => {
                        const y = 16 + (height - 16 - 24) * (1 - (v - minY) / Math.max(1e-6, maxY - minY));
                        return (
                            <g key={i}>
                                <line x1="44" x2="100%" y1={y} y2={y} stroke="#4B5563" opacity="0.3" />
                                <text x="40" y={y} textAnchor="end" alignmentBaseline="middle" fill="#9CA3AF" fontSize="10">
                                    {formatNumber(v)}
                                </text>
                            </g>
                        );
                    })}
                </g>

                {/* X labels */}
                <g className="x-labels">
                    {xLabels.map((t, i) => (
                        <text key={i} x={t.x} y={height - 8} textAnchor="middle" alignmentBaseline="baseline" fill="#9CA3AF" fontSize="10">
                            {t.label}
                        </text>
                    ))}
                </g>

                {/* Line */}
                <path d={pathD} fill="none" stroke="#60A5FA" strokeWidth="2" vectorEffect="non-scaling-stroke" />

                {/* Area underline */}
                {data.length > 0 && (
                    <path
                        d={`${pathD} L 100% ${height - 24} L 44 ${height - 24} Z`}
                        fill="url(#areaFill)"
                        opacity="0.3"
                    />
                )}

                {/* Gradient */}
                <defs>
                    <linearGradient id="areaFill" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#60A5FA" />
                        <stop offset="100%" stopColor="#111827" />
                    </linearGradient>
                </defs>
            </svg>
        </div>
    );
}

function formatNumber(n: number) {
    const abs = Math.abs(n);
    if (abs >= 1_000_000_000) return (n / 1_000_000_000).toFixed(2) + "B";
    if (abs >= 1_000_000) return (n / 1_000_000).toFixed(2) + "M";
    if (abs >= 1_000) return (n / 1_000).toFixed(2) + "k";
    return n.toFixed(2);
}