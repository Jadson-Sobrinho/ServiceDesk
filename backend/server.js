const app = require("./app");
const ConnectToDataBase = require("./api/config/db");

const PORT = 3001;

async function startServer() {
    await ConnectToDataBase();

    app.listen(PORT, () => {
        console.log(`Servidor Rodando em http://localhost:${PORT}`);
    });
}

startServer();