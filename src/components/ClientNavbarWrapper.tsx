"use client";
import Navbar from "@/components/Navbar";
import { AuthProvider } from "@/context/AuthContext";

export default function ClientNavbarWrapper({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <div>
        <div style={{ position: "relative", zIndex: 10 }}>
          <Navbar />
        </div>
        {children}
      </div>
    </AuthProvider>
  );
}
