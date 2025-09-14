import { useEffect, useMemo, useState } from "react";
import { PriceChart } from "./PriceChart";
import { NewsPanel } from "./NewsPanel";
import { SlideOver } from "./SlideOver";
import { TradeButton, TradeType } from "@/TradeButtons.tsx";

type Instrument = {
    id: string;           // unique id
    label: string;        // display name
    symbol: string;       // symbol for data provider (e.g., "aapl", "btcusd")
    group: string;        // e.g., Stocks, Crypto, Forex
    currency?: string;    // e.g., USD
    provider?: "stooq";   // for now
};

type PricePoint = {
    date: string; // ISO date
    open: number;
    high: number;
    low: number;
    close: number;
    volume: number | null;
};

export function MarketDashboard() {
    const [instruments, setInstruments] = useState<Instrument[]>([]);
    const [symbol, setSymbol] = useState<string>("");
    const [days, setDays] = useState(180);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [data, setData] = useState<PricePoint[]>([]);
    const [isMarketNewsOpen, setMarketNewsOpen] = useState(false);
    const [isPoliticalNewsOpen, setPoliticalNewsOpen] = useState(false);

    // Load instruments from server-side YAML
    useEffect(() => {
        (async () => {
            const res = await fetch("/api/instruments");
            const json = (await res.json()) as { instruments?: Instrument[] };
            setInstruments(json.instruments || []);
            const firstSymbol = json.instruments?.[0]?.symbol;
            if (firstSymbol) {
                setSymbol(firstSymbol);
            }
        })();
    }, []);


    useEffect(() => {
        let cancelled = false;
        if (!symbol) return;

        async function load() {
            setLoading(true);
            setError(null);
            try {
                const params = new URLSearchParams({
                    symbol,
                    interval: "d",
                    days: String(days),
                });
                const res = await fetch(`/api/price-history?${params.toString()}`);
                if (!res.ok) throw new Error(`HTTP ${res.status}`);
                const json = (await res.json()) as { symbol: string; points: PricePoint[] };
                if (!cancelled) setData(json.points);
            } catch (e: any) {
                if (!cancelled) {
                    setError(e?.message ?? "Failed to load data");
                    setData([]);
                }
            } finally {
                if (!cancelled) setLoading(false);
            }
        }

        load();
        return () => {
            cancelled = true;
        };
    }, [symbol, days]);

    const grouped = useMemo(() => {
        const map = new Map<string, Instrument[]>();
        for (const i of instruments) {
            const key = i.group || "Other";
            if (!map.has(key)) map.set(key, []);
            map.get(key)!.push(i);
        }
        return Array.from(map.entries());
    }, [instruments]);

    const latest = data.at(-1);
    const prev = data.length > 1 ? data[data.length - 2] : undefined;
    const change = latest && prev ? latest.close - prev.close : 0;
    const changePct = latest && prev ? (change / prev.close) * 100 : 0;

    return (
        <div className="market-dashboard">
            <div className="toolbar">
                <label className="control">
                    <span>Instrument</span>
                    <select
                        value={symbol}
                        onChange={(e) => setSymbol(e.target.value)}
                        className="instrument-select"
                    >
                        {grouped.map(([groupName, list]) => (
                            <optgroup key={groupName} label={groupName}>
                                {list.map((i) => (
                                    <option key={i.symbol} value={i.symbol}>
                                        {i.label}
                                    </option>
                                ))}
                            </optgroup>
                        ))}
                    </select>
                </label>

                <label className="control">
                    <span>Range</span>
                    <select value={days} onChange={(e) => setDays(Number(e.target.value))}>
                        <option value={30}>1M</option>
                        <option value={90}>3M</option>
                        <option value={180}>6M</option>
                        <option value={365}>1Y</option>
                        <option value={730}>2Y</option>
                    </select>
                </label>

                <div className="status">
                    {loading ? "Loading..." : error ? <span className="error">{error}</span> : ""}
                </div>
            </div>

            <div className="content-row">
                <div className="chart-card">
                    <PriceChart data={data} height={440} />
                </div>

                <div className="price-card">
                    <h3>Price</h3>
                    {latest ? (
                        <>
                            <div className="price-line">
                                <span className="price-value">{latest.close.toFixed(2)}</span>
                                <span className={`price-change ${change >= 0 ? "up" : "down"}`}>
                  {change >= 0 ? "▲" : "▼"} {Math.abs(change).toFixed(2)} ({Math.abs(changePct).toFixed(2)}%)
                </span>
                            </div>
                            <div className="price-sub">
                                O {latest.open.toFixed(2)}  H {latest.high.toFixed(2)}  L {latest.low.toFixed(2)}
                            </div>
                        </>
                    ) : (
                        <div className="price-line">No data</div>
                    )}

                    <div className="trade-actions">
                      <TradeButton tradeType={TradeType.BUY} symbol={symbol} />
                      <TradeButton tradeType={TradeType.SELL} symbol={symbol} />
                    </div>

                    <div className="news-actions">
                        <button className="btn secondary" onClick={() => setPoliticalNewsOpen(true)}>
                            Political News
                        </button>
                        <button className="btn secondary" onClick={() => setMarketNewsOpen(true)}>
                            Market News
                        </button>
                    </div>
                </div>
            </div>

            {/* Slide-over panels */}
            <SlideOver
                side="left"
                title="Political News"
                open={isPoliticalNewsOpen}
                onClose={() => setPoliticalNewsOpen(false)}
            >
                <NewsPanel endpoint="/api/news/politics" />
            </SlideOver>

            <SlideOver
                side="right"
                title="Market News"
                open={isMarketNewsOpen}
                onClose={() => setMarketNewsOpen(false)}
            >
                <NewsPanel endpoint="/api/news/market" />
            </SlideOver>
        </div>
    );
}