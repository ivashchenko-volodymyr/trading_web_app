import { useEffect, useState } from "react";

type NewsItem = {
    title: string;
    url: string;
    source?: string;
    time?: string; // ISO or text
};

export function NewsPanel({ endpoint }: { endpoint: string }) {
    const [items, setItems] = useState<NewsItem[]>([]);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let cancel = false;
        (async () => {
            try {
                const res = await fetch(endpoint);
                if (!res.ok) throw new Error(`HTTP ${res.status}`);
                const data = (await res.json()) as { items: NewsItem[] };
                if (!cancel) setItems(data.items || []);
            } catch (e: any) {
                if (!cancel) setError(e?.message ?? "Failed to load news");
            }
        })();
        return () => {
            cancel = true;
        };
    }, [endpoint]);

    if (error) return <div className="news-error">{error}</div>;
    if (!items.length) return <div className="news-empty">No news available.</div>;

    return (
        <ul className="news-list">
            {items.map((n, i) => (
                <li key={i} className="news-item">
                    <a href={n.url} target="_blank" rel="noreferrer">
                        <span className="news-title">{n.title}</span>
                        {n.source && <span className="news-source"> • {n.source}</span>}
                    </a>
                    {n.time && <div className="news-time">{n.time}</div>}
                </li>
            ))}
        </ul>
    );
}