"use client";
import React, { createContext, useContext } from "react";
import { useSession, signOut } from "next-auth/react";
import api from "../utils/api";

interface AuthContextType {
  isAuthenticated: boolean;
  logout: () => Promise<void>;
  forgotPassword: (email: string) => Promise<void>;
  resetPassword: (resetToken: string, newPassword: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { data: session, status } = useSession();

  const logout = async () => {
    await signOut();
  };

  const forgotPassword = async (email: string) => {
    try {
      await api.post("/auth/forgotpassword", { email });
    } catch (error) {
      console.error("Error in forgotPassword:", error);
      throw error;
    }
  };

  const resetPassword = async (resetToken: string, newPassword: string) => {
    try {
      await api.post("/auth/resetpassword", {
        resetToken,
        password: newPassword,
      });
    } catch (error) {
      console.error("Error in resetPassword:", error);
      throw error;
    }
  };

  const value = {
    isAuthenticated: status === "authenticated",
    logout,
    forgotPassword,
    resetPassword,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
