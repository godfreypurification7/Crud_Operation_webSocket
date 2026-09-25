
const { createServer } = require("http");
const { Server } = require("socket.io");

const httpServer = createServer();

const io = new Server(httpServer, {
    cors: {
        origin: "http://localhost:5173",
    },
});

let crudData = [];

io.on("connection", (socket) => {
    console.log("Client connected:", socket.id);

    // Send existing data to newly connected client
    socket.emit("crudData", crudData);

    // =========================
    // ADD
    // =========================
    socket.on("addData", (data) => {
        console.log("Adding:", data);

        crudData.push(data);

        console.log("CRUD Data:", crudData);

        // Send updated data to all clients
        io.emit("crudData", crudData);
    });

    // =========================
    // UPDATE
    // =========================
    socket.on("updateData", (updatedData) => {
        console.log("Updating:", updatedData);

        const index = crudData.findIndex(
            (item) => item.id === updatedData.id
        );

        if (index !== -1) {
            crudData[index] = updatedData;
        }

        console.log("Updated CRUD Data:", crudData);

        // Send updated array to all clients
        io.emit("crudData", crudData);
    });

    // =========================
    // DELETE
    // =========================
    socket.on("deleteData", (id) => {
        console.log("Deleting:", id);

        crudData = crudData.filter(
            (item) => item.id !== id
        );

        console.log("After Delete:", crudData);

        // Send updated array to all clients
        io.emit("crudData", crudData);
    });

    // =========================
    // DISCONNECT
    // =========================
    socket.on("disconnect", () => {
        console.log("Client disconnected:", socket.id);
    });
});

httpServer.listen(3000, () => {
    console.log("Server is running on http://localhost:3000");
});
