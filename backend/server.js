const app = require("./app");
require('dotenv').config();
const ConnectToDataBase = require("./api/config/db");

const http = require("http");
const { Server } = require("socket.io");
const chatSocket = require("./api/socket/chat");

const PORT = process.env.PORT;

async function startServer() {
    await ConnectToDataBase();

    // Cria servidor HTTP a partir do app Express
    const server = http.createServer(app);

    // Inicializa Socket.IO
    const io = new Server(server, { cors: { origin: "*" } });

    // Configura chat em tempo real
    chatSocket(io);

    server.listen(PORT, () => {
        console.log(`Servidor Rodando em http://localhost:${PORT}`);
    });
}

startServer();