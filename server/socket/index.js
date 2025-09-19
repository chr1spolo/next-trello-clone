/** 
 * This module handles WebSocket connections using Socket.IO.
 * It listens for incoming connections and manages real-time events.
 * @param {import("socket.io").Socket} socket - The connected socket instance.
 * @param {import("socket.io").Server} io - The Socket.IO server instance.
 * @returns {void}
 */
const socketHandler = (socket, io) => {
  console.log("A user connected:", socket.id);

  socket.on("sendMessage", (message) => {
    console.log("Received message via WebSocket:", message);
    socket.broadcast.emit("sendMessage", message);
  });

  socket.on("update-task", (updatedTaskString) => {
    console.log("Received updated task via WebSocket:", updatedTaskString);
    socket.broadcast.emit("update-task", updatedTaskString);
  });

  socket.on("disconnect", () => {
    console.log("A user disconnected:", socket.id);
  });
};

export default socketHandler;
