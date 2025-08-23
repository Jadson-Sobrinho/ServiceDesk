// api/socket/chat.js
const mongoose = require('mongoose');
const chatModel = require("../models/chat");

module.exports = (io) => {
  io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

    socket.on("joinRoom", (conversationId) => {
      if (!conversationId) return;
      socket.join(conversationId);
      console.log(`User ${socket.id} entered room ${conversationId}`);
    });

    // Recebe: (payload, callback?)
    socket.on("chatMessage", async (payload, callback) => {
      // payload esperado: { conversationId, sender, content }
      console.log("chatMessage recebido no servidor:", payload);

      const { conversationId, sender, content } = payload || {};

      if (!conversationId) {
        console.warn("chatMessage sem conversationId");
        if (typeof callback === 'function') callback({ message: "missing conversationId" });
        return;
      }
      if (!content || typeof content !== "string") {
        console.warn("chatMessage sem content válido");
        if (typeof callback === 'function') callback({ message: "missing content" });
        return;
      }

      // Normaliza role, aceita tanto sender.role quanto sender.rule
      let senderRole = "client";
      if (typeof sender === "string") {
        senderRole = "client";
      } else if (sender && typeof sender === "object") {
        senderRole = (sender.role || sender.rule || "client").toString().toLowerCase();
      }

      const senderObjForSave = { rule: senderRole }; // mantenho 'rule' se seu schema atual usa 'rule'
      if (sender && typeof sender === "object" && sender.id) {
        if (mongoose.isValidObjectId(sender.id)) {
          senderObjForSave.id = new mongoose.Types.ObjectId(sender.id);
        } else {
          // se id não é ObjectId (string qualquer), pode salvar como está
          senderObjForSave.id = sender.id;
        }
      }

      if (sender && typeof sender === "object" && sender.name) {
        senderObjForSave.name = sender.name;
      }

      // Mensagem que será salva (created_at pelo servidor)
      const messageToSave = {
        sender: senderObjForSave,
        content,
        created_at: new Date()
      };

      try {
        // upsert: cria a conversa se não existir e adiciona a mensagem
        const updated = await chatModel.findOneAndUpdate(
          { _id: conversationId },
          {
            $push: { messages: messageToSave },
            $setOnInsert: { created_at: new Date(), status: "open" }
          },
          { new: true, upsert: true, setDefaultsOnInsert: true }
        );

        if (!updated) {
          console.warn(`Conversa ${conversationId} não encontrada nem criada.`);
          if (typeof callback === 'function') callback({ message: "failed to save message" });
          return;
        }

        // O subdocumento salvo estará no array messages do documento retornado.
        // Pegamos a última mensagem (a que acabamos de inserir).
        const savedMessages = updated.messages || [];
        const savedMessage = savedMessages[savedMessages.length - 1];

        // Normaliza sender para emitir ao cliente (converte ObjectId para string)
        const emittedSender = { ...(savedMessage.sender || {}) };
        if (emittedSender.id && emittedSender.id.toString) {
          emittedSender.id = emittedSender.id.toString();
        }

        // Mensagem final que será emitida e enviada no ack
        const serverMessage = {
          _id: savedMessage._id,           // id do subdocumento (gerado pelo mongoose)
          sender: emittedSender,
          content: savedMessage.content,
          created_at: savedMessage.created_at
        };

        // Emite para a sala (todos conectados)
        io.to(conversationId).emit("message", serverMessage);

        console.log(`Mensagem salva e emitida na conversa ${conversationId}`);

        // Ack para o emissor (se forneceu callback)
        if (typeof callback === 'function') callback(null, serverMessage);
      } catch (err) {
        console.error("Erro ao salvar mensagem:", err);
        if (typeof callback === 'function') callback({ message: "internal_error", error: String(err) });
      }
    });

    socket.on("disconnect", () => {
      console.log("User disconnected", socket.id);
    });
  });
};
