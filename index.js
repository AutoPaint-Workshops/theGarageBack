import http from "http";
import { Server } from "socket.io";

import { configuration } from "./app/config.js";
import { app } from "./app/index.js";
import { connect } from "./app/database.js";
const { port } = configuration.server;

// Connect to database
connect();

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

io.on("connection", (socket) => {
  console.log(`-->  user connected ${socket.id}`);

  socket.on("disconnect", () => {
    console.log(`-->  user disconnected ${socket.id}`);
  });

  socket.on("mensaje", (payload) => {
    io.emit("mensaje", payload);
  });
  socket.on("notificacion", (payload) => {
    io.emit("notificacion", payload);
  });
});

server.listen(port, () => {
  console.log(`Server running at ${port} port`);
});
