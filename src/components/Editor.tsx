"use client";
import { useEffect, useState } from "react";
import { getSocket } from "@/services/socket";

export default function Chat({ roomId }) {
  const socket = getSocket();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");

  useEffect(() => {
    socket.on("chatMessage", (msg) => {
      if (msg.roomId === roomId) setMessages((prev) => [...prev, msg]);
    });
  }, [roomId]);

  const sendMessage = () => {
    if (input.trim()) {
      socket.emit("chatMessage", { roomId, text: input });
      setInput("");
    }
  };

  return (
    <div className="h-60 overflow-y-auto bg-gray-800 p-2 text-white">
      {messages.map((m, i) => (
        <div key={i}>{m.text}</div>
      ))}
      <input
        value={input}
        onChange={(e) => setInput(e.target.value)}
        className="w-full p-1 mt-2 text-black"
        placeholder="Type a message"
      />
      <button onClick={sendMessage} className="bg-blue-600 p-1 mt-1 w-full">Send</button>
    </div>
  );
}