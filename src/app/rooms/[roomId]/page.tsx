"use client";
import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { getRoomDetails, runCodeApi } from "@/services/api";
import { fetchChatMessages } from "@/services/chat";
import { connectSocket } from "@/services/socket";
import { useAuth } from "@/context/AuthContext";

const MonacoEditor = dynamic(() => import("@monaco-editor/react"), { ssr: false });

type ChatMsg = {
  user?: { name?: string };
  message: string;
  isDM?: boolean;
  timestamp?: number;
};

export default function RoomWorkspacePage({ params }: { params: { roomId: string } }) {
  const { roomId } = params;
  const { user, loading } = useAuth();
  const router = useRouter();

  const [socket, setSocket] = useState<ReturnType<typeof connectSocket> | null>(null);
  const [roomName, setRoomName] = useState("");
  const [inviteCode, setInviteCode] = useState("");
  const [roomError, setRoomError] = useState("");

  const [code, setCode] = useState("");
  const [language, setLanguage] = useState("javascript");
  const [output, setOutput] = useState("");

  const [messages, setMessages] = useState<ChatMsg[]>([]);
  const [input, setInput] = useState("");
  const [participants, setParticipants] = useState<{ userId: string; userName: string; role: string }[]>([]);
  const [selectedParticipant, setSelectedParticipant] = useState("");

  const [showCopyTab, setShowCopyTab] = useState(false);

  // ---------------------- AUTH REDIRECT ----------------------
  useEffect(() => {
    if (!loading && !user) {
      router.push(`/login?redirect=/rooms/${roomId}`);
    }
  }, [loading, user, router, roomId]);

  // ---------------------- ROOM INIT ----------------------
  useEffect(() => {
    if (!user) return;

    let sock: ReturnType<typeof connectSocket> | null = null;

    (async () => {
      try {
        const room = await getRoomDetails(roomId);
        if (!room) {
          setRoomError("Room not found or you are not allowed to view this room.");
          return;
        }
        setRoomName(room.name || "Room");
        setInviteCode(room.code || "");
        setRoomError("");

        const chatHistory = await fetchChatMessages(roomId);
        setMessages(
          chatHistory.map((msg: any) => ({
            user: { name: msg.userName },
            message: msg.message,
            timestamp: msg.timestamp,
          }))
        );
      } catch (err) {
        setRoomError("Failed to load room details.");
      }
    })();

    sock = connectSocket();
    setSocket(sock);

    const userNameToSend = user?.userName || user?.name || "Guest";
    sock.emit("joinRoom", { roomId, userId: user?.id, userName: userNameToSend });

    // listeners
    sock.on("codeUpdate", ({ code }) => setCode(code));
    sock.on("newMessage", (msg) => {
      setMessages((prev) => {
        if (prev.some((m) => m.message === msg.message && m.user?.name === msg.user?.name && m.timestamp === msg.timestamp)) {
          return prev;
        }
        return [...prev, msg];
      });
    });
    sock.on("directMessage", (msg) => {
      setMessages((prev) => [...prev, { ...msg, isDM: true }]);
    });
    sock.on("participantsUpdate", ({ participants }) => setParticipants(participants));

    return () => {
      sock?.emit("leaveRoom", { roomId, userId: user?.id });
      sock?.disconnect();
    };
  }, [roomId, user]);

  // ---------------------- CODE ----------------------
  const handleCodeChange = (val: string | undefined) => {
    if (typeof val === "string") {
      setCode(val);
      socket?.emit("codeChange", { roomId, code: val });
    }
  };

  const runCode = async () => {
    if (!code.trim()) return setOutput("No code to run.");
    if (language === "javascript") {
      try {
        let result = "";
        const log = (...args: any[]) => (result += args.join(" ") + "\n");
        // eslint-disable-next-line no-new-func
        new Function("log", `(function(){ const console={log}; ${code} })()`)(
          log
        );
        setOutput(result || "No output.");
      } catch (err: any) {
        setOutput("Error: " + err.message);
      }
    } else {
      try {
        setOutput("Running...");
        const result = await runCodeApi(language, code);
        setOutput(result);
      } catch (err: any) {
        setOutput("Error: " + err.message);
      }
    }
  };

  // ---------------------- CHAT ----------------------
  const sendMessage = () => {
    if (!input.trim() || !socket) return;
    const payload = {
      roomId,
      message: input,
      user,
      ...(selectedParticipant ? { to: selectedParticipant } : {}),
    };
    socket.emit(selectedParticipant ? "sendDirectMessage" : "sendMessage", payload);
    setInput("");
  };

  const copyRoomLink = () => {
    if (inviteCode) {
      navigator.clipboard.writeText(inviteCode);
      setShowCopyTab(true);
      setTimeout(() => setShowCopyTab(false), 3000);
    }
  };

  // ---------------------- LOADING ----------------------
  if (loading || !user) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-lg">Loading...</div>
      </div>
    );
  }

  // ---------------------- UI ----------------------
  return (
    <div className="min-h-screen bg-gray-900 flex flex-col">
      {showCopyTab && (
        <div className="fixed top-5 right-5 bg-gray-800 text-white p-4 rounded-lg shadow-lg">
          <div className="font-bold">Room Code Copied!</div>
          <div>Room: {roomName}</div>
          <div>Invite Code: {inviteCode}</div>
        </div>
      )}

      <header className="bg-gray-800 p-4 flex justify-between items-center">
        <div>
          <h1 className="text-xl font-bold text-white">Room: {roomName || roomError}</h1>
          <p className="text-gray-300">Invite Code: {inviteCode || "N/A"}</p>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-white">Participants: {participants.length}</span>
          <button onClick={copyRoomLink} className="bg-blue-600 px-3 py-1 rounded text-white" disabled={!inviteCode}>
            Copy Code
          </button>
          <button onClick={() => router.push("/dashboard")} className="bg-green-600 px-3 py-1 rounded text-white">
            Dashboard
          </button>
        </div>
      </header>

      <main className="flex flex-1">
        {/* Editor */}
        <section className="flex-1 p-4 overflow-auto">
          <div className="flex items-center gap-4 mb-3">
            <select value={language} onChange={(e) => setLanguage(e.target.value)} className="bg-gray-700 text-white p-2 rounded">
              <option value="javascript">JavaScript</option>
              <option value="python">Python</option>
              <option value="typescript">TypeScript</option>
              <option value="java">Java</option>
              <option value="c">C</option>
              <option value="cpp">C++</option>
              <option value="go">Go</option>
              <option value="ruby">Ruby</option>
            </select>
            <button onClick={runCode} className="bg-green-600 px-3 py-1 rounded text-white">
              Run
            </button>
          </div>
          <MonacoEditor
            height="60vh"
            defaultLanguage={language}
            value={code}
            onChange={handleCodeChange}
            theme="vs-dark"
          />
          <div className="mt-4 bg-gray-800 p-4 rounded text-white">
            <h2 className="font-bold">Output:</h2>
            <pre className="whitespace-pre-wrap">{output}</pre>
          </div>
        </section>

        {/* Chat */}
        <aside className="bg-gray-800 p-4 w-96 flex flex-col">
          <div className="flex justify-between mb-2">
            <span className="font-bold text-white">Chat</span>
            <button
              onClick={() => setMessages([])}
              className="bg-red-600 text-white px-2 py-1 rounded text-sm"
            >
              Clear
            </button>
          </div>
          <div className="flex-1 overflow-y-auto bg-gray-900 p-2 rounded">
            {messages.length === 0 ? (
              <div className="text-gray-400 text-center">No messages yet.</div>
            ) : (
              messages.map((m, i) => {
                const isMe = m.user?.name === user?.name;
                return (
                  <div key={i} className={`mb-2 flex ${isMe ? "justify-end" : "justify-start"}`}>
                    <div className={`px-3 py-2 rounded-lg ${isMe ? "bg-blue-600" : "bg-gray-700"} text-white`}>
                      <span className="font-semibold">{m.isDM ? "[DM]" : ""} {isMe ? "Me" : m.user?.name}:</span> {m.message}
                    </div>
                  </div>
                );
              })
            )}
          </div>
          <div className="flex gap-2 mt-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              className="flex-1 bg-gray-700 text-white p-2 rounded"
              placeholder="Type a message..."
            />
            <button onClick={sendMessage} className="bg-blue-600 px-3 py-1 rounded text-white">
              Send
            </button>
          </div>
          <div className="mt-3">
            <label className="text-white">Direct Message:</label>
            <select value={selectedParticipant} onChange={(e) => setSelectedParticipant(e.target.value)} className="w-full bg-gray-700 text-white p-2 rounded">
              <option value="">Everyone</option>
              {participants.map((p) => (
                <option key={p.userId} value={p.userName || p.userId}>
                  {p.userName || p.userId} ({p.role})
                </option>
              ))}
            </select>
          </div>
        </aside>
      </main>
    </div>
  );
}
