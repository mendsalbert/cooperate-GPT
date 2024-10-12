"use client";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import { useState, useEffect } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { useAuth } from "../contexts/AuthContext";

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const router = useRouter();
  const { isAuthenticated, logout } = useAuth();

  console.log(isAuthenticated);

  const handleLogout = async () => {
    await logout();
    router.push("/");
  };

  const navItems = [
    { href: "/about", label: "About" },
    { href: "/artists", label: "Artist" },
    { href: "/works", label: "Works" },
  ];

  // Add Dashboard link only for authenticated users
  if (isAuthenticated) {
    navItems.push({ href: "/dashboard", label: "Dashboard" });
  } else {
    navItems.push({ href: "/signin", label: "Sign In" });
    navItems.push({ href: "/signup", label: "Sign Up" });
  }

  return (
    <header className="bg-white border-b sticky top-0 z-50">
      <div className="container mx-auto px-6 py-3">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-2 group">
            <Image
              src="/svg/logo.svg"
              width={42}
              height={42}
              alt="logo"
              className="transition-transform group-hover:scale-110"
            />
            <span className="text-xl font-semibold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-500">
              BlockRights
            </span>
          </Link>

          <nav className="hidden md:flex items-center space-x-6">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-gray-600 hover:text-gray-900 transition-colors relative group"
              >
                {item.label}
                <span className="absolute inset-x-0 bottom-0 h-0.5 bg-gray-900 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left"></span>
              </Link>
            ))}
            {isAuthenticated && (
              <Button
                onClick={handleLogout}
                variant="outline"
                className="ml-4 hover:bg-gray-100 transition-colors"
              >
                Sign out
              </Button>
            )}
          </nav>

          <button
            className="md:hidden text-gray-600 hover:text-gray-900 transition-colors"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        <AnimatePresence>
          {isMenuOpen && (
            <motion.nav
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2 }}
              className="mt-4 md:hidden"
            >
              <ul className="flex flex-col space-y-4">
                {navItems.map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className="block text-gray-600 hover:text-gray-900 transition-colors"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
                {isAuthenticated && (
                  <li>
                    <Button
                      onClick={handleLogout}
                      variant="outline"
                      className="w-full mt-2 hover:bg-gray-100 transition-colors"
                    >
                      Sign out
                    </Button>
                  </li>
                )}
              </ul>
            </motion.nav>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
}
