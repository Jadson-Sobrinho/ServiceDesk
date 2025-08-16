const app = require("./app");
const ConnectToDataBase = require("./api/config/db");

const PORT = 3000;

async function startServer() {
    await ConnectToDataBase();

    app.listen(PORT, () => {
        console.log(`Servidor Rodando em https://localhost:${PORT}`);
    });
}

startServer();