// src/lib/socket.js
import { io } from "socket.io-client"

let socket = null

export function getSocket() {
  if (!socket) {
    socket = io(process.env.NEXT_PUBLIC_CHAT_URL, {
      withCredentials: true,
      transports: ["websocket"],
      autoConnect: true,
    })
  }
  return socket
}

export function disconnectSocket() {
  if (socket) {
    socket.disconnect()
    socket = null
  }
}