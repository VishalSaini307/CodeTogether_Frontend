"use client";
import dynamic from "next/dynamic";
import { useEffect } from "react";
import { getSocket } from "@/services/socket";

const MonacoEditor = dynamic(() => import("@monaco-editor/react"), { ssr: false });

export default function Editor({ roomId, value, language = "javascript" }) {
  const socket = getSocket();

  const handleChange = (val: string | undefined) => {
    if (val) socket.emit("codeChange", { roomId, code: val });
  };

  useEffect(() => {
    socket.on("codeUpdate", (data) => {
      if (data.roomId === roomId) {
        // update editor content
      }
    });
  }, [roomId]);

  return <MonacoEditor height="80vh" defaultLanguage={language} value={value} onChange={handleChange} />;
}
