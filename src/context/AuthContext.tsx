"use client";
import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useRouter } from "next/navigation";
import { loginUser, registerUser as registerUser } from "@/services/auth";
import api from '@/services/api'; 

export type User = { id: string; name: string; email: string; userName?: string; role?: string } | null;

export interface AuthContextProps {
  user: User;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (userName: string, name: string, phone: string, email: string, password: string, role: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Safely load user from localStorage on client only
  useEffect(() => {
    const token = localStorage.getItem('jwtToken');
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        setUser({
          id: payload.sub || payload.id,
          name: payload.name || "",
          email: payload.email,
          userName: payload.userName,
          role: payload.role,
        });
      } catch {
        setUser(null);
      }
    } else {
      setUser(null);
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    const LOGIN_MUTATION = `
      mutation Login($input: LoginInput!) {
        login(input: $input) {
          token
          user {
            _id
            userName
            name
            email
            role
          }
        }
      }
    `;

    try {
      const res = await api.post('', {
        query: LOGIN_MUTATION,
        variables: { input: { email, password } },
      });

      if (res.data.errors) {
        throw new Error(res.data.errors[0].message);
      }

      const { token, user } = res.data.data.login;

      // Save token and user
      localStorage.setItem('jwtToken', token);
      if (user?._id) {
        localStorage.setItem('userId', user._id);
      }
      setUser({
        id: user._id,
        name: user.name,
        email: user.email,
        userName: user.userName,
        role: user.role,
      });
  } catch (err: unknown) {
      if (err instanceof Error) {
        throw new Error(err.message || 'Login failed');
      } else {
        throw new Error('Login failed');
      }
    }
  };

  const register = async (userName: string, name: string, phone: string, email: string, password: string, role: string) => {
    try {
      await registerUser({ userName, name, phone: phone, email, password, role });
      router.push("/login");
    } catch (err) {
      console.error("Register failed", err);
      throw err;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('jwtToken');
    router.push("/login");
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
};