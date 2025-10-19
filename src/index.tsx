import {serve, type WebSocketHandler} from "bun";
import index from "./index.html";

const websocketHandler: WebSocketHandler = {
  message(ws, message) {
    // Echo the message back to the client
    ws.send(message);
  },
  open(ws) {
    console.log("WebSocket connection opened");
  },
  close(ws, code, message) {
    console.log("WebSocket connection closed", {code, message});
  }
};

const server = serve({
  routes: {
    // Serve index.html for all unmatched routes.
    "/*": index,

    "/api/hello": {
      async GET(req) {
        return Response.json({
          message: "Hello, world!",
          method: "GET",
        });
      },
      async PUT(req) {
        return Response.json({
          message: "Hello, world!",
          method: "PUT",
        });
      },
    },

    "/api/hello/:name": async req => {
      const name = req.params.name;
      return Response.json({
        message: `Hello, ${name}!`,
      });
    },
    "/api/instruments": async () => {
      try {
        const file = Bun.file("./src/data/instruments.yaml");
        const text = await file.text();
        const yaml = await import("js-yaml");
        const parsed = yaml.load(text) as any;
        const instruments = Array.isArray(parsed?.instruments) ? parsed.instruments : [];
        return Response.json({instruments});
      } catch (err: any) {
        return new Response(JSON.stringify({
          instruments: [],
          error: err?.message ?? "Failed to load instruments"
        }), {status: 500});
      }
    },

    // New endpoints: news from YAML
    "/api/news/market": async () => {
      try {
        const file = Bun.file("./src/data/market_news.yaml");
        const text = await file.text();
        const yaml = await import("js-yaml");
        const parsed = yaml.load(text) as any;
        const items = Array.isArray(parsed?.items) ? parsed.items : [];
        return Response.json({items});
      } catch (err: any) {
        return new Response(JSON.stringify({
          items: [],
          error: err?.message ?? "Failed to load market news"
        }), {status: 500});
      }
    },

    "/api/news/politics": async () => {
      try {
        const file = Bun.file("./src/data/political_news.yaml");
        const text = await file.text();
        const yaml = await import("js-yaml");
        const parsed = yaml.load(text) as any;
        const items = Array.isArray(parsed?.items) ? parsed.items : [];
        return Response.json({items});
      } catch (err: any) {
        return new Response(JSON.stringify({
          items: [],
          error: err?.message ?? "Failed to load political news"
        }), {status: 500});
      }
    },

    // Historical prices via stooq CSV proxy
    "/api/price-history": async (req) => {
      try {
        const url = new URL(req.url);
        const symbol = (url.searchParams.get("symbol") ?? "").toLowerCase();
        const interval = (url.searchParams.get("interval") ?? "d").toLowerCase(); // d, w, m
        const daysParam = parseInt(url.searchParams.get("days") ?? "180", 10);
        const days = Number.isFinite(daysParam) && daysParam > 0 ? daysParam : 180;

        if (!symbol) {
          return new Response(JSON.stringify({error: "Missing 'symbol' query param"}), {status: 400});
        }

        const stooqUrl = `https://stooq.com/q/d/l/?s=${encodeURIComponent(symbol)}&i=${encodeURIComponent(interval)}`;
        const stooqRes = await fetch(stooqUrl);
        if (!stooqRes.ok) {
          return new Response(JSON.stringify({error: `Upstream error: ${stooqRes.status}`}), {status: 502});
        }
        const csv = await stooqRes.text();

        const lines = csv.trim().split(/\r?\n/);
        if (lines.length === 0) {
          return Response.json({ symbol, points: [] });
        }
        const [headerLine, ...rows] = lines;
        if (!headerLine) {
          return Response.json({ symbol, points: [] });
        }
        const header = headerLine.split(",");
        const idx = {
          date: header.indexOf("Date"),
          open: header.indexOf("Open"),
          high: header.indexOf("High"),
          low: header.indexOf("Low"),
          close: header.indexOf("Close"),
          volume: header.indexOf("Volume"),
        };

        const points = rows
          .filter((line) => line.trim().length > 0)
          .map((line) => {
            const cols = line.split(",");
            return {
              date: cols[idx.date] ?? "",
              open: parseFloat(cols[idx.open] ?? "NaN"),
              high: parseFloat(cols[idx.high] ?? "NaN"),
              low: parseFloat(cols[idx.low] ?? "NaN"),
              close: parseFloat(cols[idx.close] ?? "NaN"),
              volume: cols[idx.volume] ? Number(cols[idx.volume]) : null,
            };
          })
          .filter((p) => Number.isFinite(p.close));

        const sliced = points.slice(Math.max(0, points.length - days));
        return Response.json({ symbol, points: sliced });
      } catch (err: any) {
        return new Response(JSON.stringify({error: err?.message ?? "Unexpected error"}), {status: 500});
      }
    },
  },
  websocket:
  websocketHandler,
  development:
    process.env.NODE_ENV !== "production" && {
// Enable browser hot reloading in development
      hmr: true,

// Echo console logs from the browser to the server
      console: true,
    },
});

console.log(` Server running at ${server.url}`);
