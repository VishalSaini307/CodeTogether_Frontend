"use client";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";

export default function Navbar() {
  const { user, logout, loading } = useAuth();
  if (loading) return null;
  return (
    <nav className="bg-gray-800 p-4 flex justify-between items-center">
      <div className="text-white font-bold text-xl">CodeTogether</div>
      <div className="space-x-4 flex items-center">
        {user ? (
          <>
            <span className="text-white mr-4">Hello, {user.name}</span>
            <button onClick={logout} className="text-white hover:text-red-400">Logout</button>
          </>
        ) : (
          <>
            <Link href="/login">
              <span className="text-white hover:text-blue-400">Login</span>
            </Link>
            <Link href="/register">
              <span className="text-white hover:text-blue-400">Register</span>
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}
