// socketClient.js
const { io } = require("socket.io-client");

// 🔹 URL du serveur distant Socket.IO
const SOCKET_URL = process.env.SOCKET_URL || "https://gateway.tsirylab.com/serviceflotte";

// 🔹 Connexion au socket distant
const socket = io(SOCKET_URL, {
  path: "/serviceflotte/socket.io", // même path que le serveur
  query: {
    userId: process.env.USER_ID || "550e8400-e29b-41d4-a716-446655440000", // à adapter
  },
  transports: ["websocket"],
  secure: true,
});

// 🔹 Quand on est connecté
socket.on("connect", () => {
  console.log("✅ Connecté au socket distant avec id:", socket.id);

  // Exemple : envoyer un ping au serveur distant
  socket.emit("ping", { msg: "Hello depuis mon backend !" });
});

// 🔹 Réception d'événements depuis le serveur distant
socket.on("notification", (data) => {
  console.log("📩 Notification reçue :", data);
});

// 🔹 Événement en cas d'erreur de connexion
socket.on("connect_error", (err) => {
  console.error("❌ Erreur de connexion au socket :", err.message);
});

// 🔹 Méthode pour envoyer un événement vers le socket distant
function sendNotification(event, payload) {
  if (socket.connected) {
    socket.emit(event, payload);
    console.log(`📤 Événement "${event}" envoyé`, payload);
  } else {
    console.warn("⚠️ Socket non connecté, impossible d'envoyer le message");
  }
}

// 🔹 Exporter la fonction pour l'utiliser depuis d'autres fichiers
module.exports = { sendNotification, socket };
