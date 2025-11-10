"use client";
import Link from "next/link";

export default function Home() {
  return (
    <main className="flex flex-col items-center justify-center h-screen bg-gray-900 text-center px-6">
      <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-4">
        Welcome to <span className="text-blue-500">CodeTogether!</span>
      </h1>
      <p className="text-gray-300 text-lg md:text-xl max-w-2xl mb-8">
        Collaborate, code, and build projects together in real time. 
        Share your workspace, chat, and code seamlessly with your team.
      </p>

      <div className="flex gap-4">
        <Link
          href="/register"
          className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg text-white font-medium transition"
        >
          Get Started
        </Link>
        <Link
          href="/login"
          className="px-6 py-3 bg-gray-700 hover:bg-gray-600 rounded-lg text-white font-medium transition"
        >
          Login
        </Link>
      </div>

      <footer className="absolute bottom-6 text-gray-500 text-sm">
        © {new Date().getFullYear()} CodeTogether. All rights reserved.
      </footer>
    </main>
  );
}
