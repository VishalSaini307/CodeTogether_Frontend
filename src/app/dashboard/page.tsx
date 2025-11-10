"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Toaster, toast } from "react-hot-toast";
import { createRoom, getRooms } from "@/services/auth";

export default function DashboardPage() {
  const router = useRouter();
  const [roomName, setRoomName] = useState("");
  const [description, setDescription] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [joinRoomId, setJoinRoomId] = useState("");
  const [joinCode, setJoinCode] = useState("");
  const [joining, setJoining] = useState(false);
  const [createdRooms, setCreatedRooms] = useState<
    { _id: string; name: string; code?: string; owner: string }[]
  >([]);
  const [joinedRooms, setJoinedRooms] = useState<
    { _id: string; name: string; code?: string; owner: string }[]
  >([]);
  const [userId, setUserId] = useState<string>("");

  // Fetch rooms created/joined by user
  useEffect(() => {
    (async () => {
      try {
        const userId = localStorage.getItem("userId");
        if (!userId) return;
        setUserId(userId);
        const rooms = await getRooms();
        setCreatedRooms(rooms.filter((r: any) => r.owner === userId));
        setJoinedRooms(
          rooms.filter(
            (r: any) =>
              r.owner !== userId &&
              Array.isArray(r.participants) &&
              r.participants.includes(userId)
          )
        );
      } catch (err) {}
    })();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("jwtToken");
      if (!token) {
        toast.error("Please login first!");
        return;
      }

      const room = await createRoom({ name: roomName, description });
      toast.success(`Room "${room.name}" created!`);
      setRoomName("");
      setDescription("");
      setFile(null);
      router.push(`/rooms/${room._id}`);
    } catch (err: any) {
      toast.error(err.message || "Room creation failed!");
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white">
      <Toaster position="top-right" />
      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Header */}
        <header className="mb-10">
          <h1 className="text-4xl font-bold text-center">Dashboard</h1>
          <p className="text-center text-gray-400 mt-2">
            Manage your rooms – create, join, or access them easily
          </p>
        </header>

        {/* Create & Join Section */}
        <div className="grid md:grid-cols-2 gap-8">
          {/* Create Room */}
          <form
            onSubmit={handleSubmit}
            className="bg-gray-800/70 backdrop-blur-md p-8 rounded-2xl shadow-lg border border-gray-700 hover:shadow-xl transition"
          >
            <h2 className="text-2xl font-semibold mb-6">Create a Room</h2>
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Room Name"
                className="w-full px-4 py-2 rounded-lg bg-gray-700 text-white focus:ring-2 focus:ring-blue-500 outline-none"
                value={roomName}
                onChange={(e) => setRoomName(e.target.value)}
                required
              />
              <textarea
                placeholder="Description"
                className="w-full px-4 py-2 rounded-lg bg-gray-700 text-white focus:ring-2 focus:ring-blue-500 outline-none"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
              />
              <input
                type="file"
                className="w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4
                  file:rounded-lg file:border-0
                  file:text-sm file:font-semibold
                  file:bg-blue-600 file:text-white
                  hover:file:bg-blue-700"
                onChange={(e) => e.target.files && setFile(e.target.files[0])}
              />
              <button
                type="submit"
                className="w-full py-2 rounded-lg bg-blue-600 hover:bg-blue-700 font-medium transition"
              >
                Create Room
              </button>
            </div>
          </form>

          {/* Join Room */}
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              setJoining(true);
              try {
                const token = localStorage.getItem("jwtToken");
                if (!token) {
                  toast.error("Please login first!");
                  setJoining(false);
                  return;
                }
                const mutation = `mutation JoinRoomWithCode($roomId: String!, $inviteCode: String!) {
                  joinRoomWithCode(roomId: $roomId, inviteCode: $inviteCode) {
                    _id name code
                  }
                }`;
                const res = await fetch("http://localhost:5000/graphql", {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                  },
                  body: JSON.stringify({
                    query: mutation,
                    variables: { roomId: joinRoomId, inviteCode: joinCode },
                  }),
                });
                const data = await res.json();
                if (data.errors) throw new Error(data.errors[0].message);
                const room = data.data?.joinRoomWithCode;
                toast.success(`Joined room: ${room?.name}`);
                router.push(`/rooms/${room?._id}`);
              } catch (err: any) {
                toast.error(err.message || "Invalid code or room ID");
              }
              setJoining(false);
            }}
            className="bg-gray-800/70 backdrop-blur-md p-8 rounded-2xl shadow-lg border border-gray-700 hover:shadow-xl transition"
          >
            <h2 className="text-2xl font-semibold mb-6">Join a Room</h2>
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Room ID"
                className="w-full px-4 py-2 rounded-lg bg-gray-700 text-white focus:ring-2 focus:ring-green-500 outline-none"
                value={joinRoomId}
                onChange={(e) => setJoinRoomId(e.target.value)}
                required
              />
              <input
                type="text"
                placeholder="Invite Code"
                className="w-full px-4 py-2 rounded-lg bg-gray-700 text-white focus:ring-2 focus:ring-green-500 outline-none"
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value)}
                required
              />
              <button
                type="submit"
                disabled={joining}
                className="w-full py-2 rounded-lg bg-green-600 hover:bg-green-700 font-medium transition disabled:opacity-50"
              >
                {joining ? "Joining..." : "Join Room"}
              </button>
            </div>
          </form>
        </div>

        {/* Room Lists */}
        <section className="mt-14">
          <h2 className="text-2xl font-bold mb-6">Your Rooms</h2>
          <div className="grid md:grid-cols-2 gap-8">
            {/* Created Rooms */}
            <div>
              <h3 className="text-xl font-semibold mb-4">Created Rooms</h3>
              {createdRooms.length === 0 ? (
                <p className="text-gray-400">No created rooms found.</p>
              ) : (
                <ul className="space-y-3">
                  {createdRooms.map((room) => (
                    <li
                      key={room._id}
                      className="flex items-center justify-between p-4 bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition"
                    >
                      <div>
                        <p className="font-semibold">{room.name}</p>
                        {room.code && (
                          <p className="text-xs text-gray-400">
                            Code: {room.code}
                          </p>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <button
                          className="px-3 py-1 bg-blue-600 hover:bg-blue-700 rounded text-sm"
                          onClick={() => router.push(`/rooms/${room._id}`)}
                        >
                          Open
                        </button>
                        <button
                          className="px-3 py-1 bg-red-600 hover:bg-red-700 rounded text-sm"
                          onClick={async () => {
                            try {
                              const mutation = `mutation DeleteRoom($roomId: String!) { deleteRoom(roomId: $roomId) }`;
                              const token = localStorage.getItem("jwtToken");
                              await fetch("http://localhost:5000/graphql", {
                                method: "POST",
                                headers: {
                                  "Content-Type": "application/json",
                                  Authorization: `Bearer ${token}`,
                                },
                                body: JSON.stringify({
                                  query: mutation,
                                  variables: { roomId: room._id },
                                }),
                              });
                              toast.success("Room deleted!");
                              setCreatedRooms((prev) =>
                                prev.filter((r) => r._id !== room._id)
                              );
                            } catch (err) {
                              toast.error("Failed to delete room");
                            }
                          }}
                        >
                          Delete
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Joined Rooms */}
            <div>
              <h3 className="text-xl font-semibold mb-4">Joined Rooms</h3>
              {joinedRooms.length === 0 ? (
                <p className="text-gray-400">No joined rooms found.</p>
              ) : (
                <ul className="space-y-3">
                  {joinedRooms.map((room) => (
                    <li
                      key={room._id}
                      className="flex items-center justify-between p-4 bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition"
                    >
                      <div>
                        <p className="font-semibold">{room.name}</p>
                        {room.code && (
                          <p className="text-xs text-gray-400">
                            Code: {room.code}
                          </p>
                        )}
                      </div>
                      <button
                        className="px-3 py-1 bg-blue-600 hover:bg-blue-700 rounded text-sm"
                        onClick={() => router.push(`/rooms/${room._id}`)}
                      >
                        Open
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

