import { serve, type WebSocketHandler } from "bun";
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
    console.log("WebSocket connection closed", { code, message });
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
  },
  websocket: websocketHandler,
  development: process.env.NODE_ENV !== "production" && {
    // Enable browser hot reloading in development
    hmr: true,

    // Echo console logs from the browser to the server
    console: true,
  },
});

console.log(`🚀 Server running at ${server.url}`);
