"use client";
import { useState } from "react";
import { Toaster, toast } from "react-hot-toast";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { registerUser } from "@/services/auth";

export default function RegisterPage() {
  const [userName, setUserName] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("customer");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Simple client-side validation
    if (!/^\d{10}$/.test(phone)) {
      setError("Phone must be 10 digits.");
      toast.error("Invalid phone number");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      toast.error("Weak password");
      return;
    }

    try {
      setLoading(true);
      await registerUser({ userName, name, phone: String(phone), email, password, role });
      toast.success("Registration successful! Please login.");
      router.push("/login");
    } catch (err: any) {
      let errorMsg = "Registration failed";

      if (err?.response?.data?.errors && Array.isArray(err.response.data.errors)) {
        const duplicateError = err.response.data.errors.find(
          (e: any) => e.extensions?.code === "DUPLICATE_USER"
        );
        if (duplicateError) {
          errorMsg = duplicateError.message || "User with this email or phone already exists.";
        } else {
          errorMsg = err.response.data.errors[0]?.message || errorMsg;
        }
      } else if (err?.message) {
        errorMsg = err.message;
      }

      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center h-screen bg-gray-900">
      <Toaster position="top-right" />
      <form
        onSubmit={handleSubmit}
        className="bg-gray-800 p-8 rounded-lg shadow-md w-96"
      >
        <h1 className="text-2xl font-bold text-white mb-4">Register</h1>

        {error && (
          <div className="mb-4 text-red-400 text-sm bg-red-900/30 p-2 rounded">
            {error}
          </div>
        )}

        <input
          type="text"
          placeholder="Username"
          className="w-full p-2 mb-3 rounded bg-gray-700 text-white focus:ring-2 focus:ring-blue-500 outline-none"
          value={userName}
          onChange={(e) => setUserName(e.target.value)}
          required
        />
        <input
          type="text"
          placeholder="Name"
          className="w-full p-2 mb-3 rounded bg-gray-700 text-white focus:ring-2 focus:ring-blue-500 outline-none"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <input
          type="tel"
          placeholder="Phone (10 digits)"
          className="w-full p-2 mb-3 rounded bg-gray-700 text-white focus:ring-2 focus:ring-blue-500 outline-none"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          required
        />
        <input
          type="email"
          placeholder="Email"
          className="w-full p-2 mb-3 rounded bg-gray-700 text-white focus:ring-2 focus:ring-blue-500 outline-none"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password (min 6 chars)"
          className="w-full p-2 mb-3 rounded bg-gray-700 text-white focus:ring-2 focus:ring-blue-500 outline-none"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <select
          className="w-full p-2 mb-3 rounded bg-gray-700 text-white focus:ring-2 focus:ring-blue-500 outline-none"
          value={role}
          onChange={(e) => setRole(e.target.value)}
        >
          <option value="customer">Customer</option>
          <option value="vendor">Vendor</option>
          <option value="admin">Admin</option>
        </select>

        <button
          type="submit"
          disabled={loading}
          className={`w-full py-2 rounded text-white transition ${
            loading
              ? "bg-blue-400 cursor-not-allowed"
              : "bg-blue-600 hover:bg-blue-700"
          }`}
        >
          {loading ? "Registering..." : "Register"}
        </button>

        <div className="mt-4 text-center">
          <Link href="/login" className="text-blue-400 hover:underline">
            Already have an account? Login
          </Link>
        </div>
      </form>
    </div>
  );
}
