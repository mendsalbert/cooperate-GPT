import "./globals.css";
import { Inter } from "next/font/google";
import { cn } from "@/lib/utils";
import Footer from "./components/Footer";
import Header from "./components/Header";
import { config } from "../lib/config";
import { headers } from "next/headers";
import { cookieToInitialState } from "wagmi";
import ClientProviders from "./components/ClientProviders";
import { AuthProvider } from "./contexts/AuthContext";

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const initialState = cookieToInitialState(config, headers().get("cookie"));

  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={cn(
          "min-h-screen bg-background font-sans antialiased",
          inter.className
        )}
      >
        <AuthProvider>
          <ClientProviders initialState={initialState}>
            <div className="flex flex-col min-h-screen">
              <Header />
              <main className="flex-grow">{children}</main>
              <Footer />
            </div>
          </ClientProviders>
        </AuthProvider>
      </body>
    </html>
  );
}
