"use client";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Menu, X, Bell } from "lucide-react";
import { useState, useEffect } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { usePrivy, useWallets } from "@privy-io/react-auth";
import { saveUserData } from "@/utils/db/actions";
import { useWeb3Modal } from "@web3modal/wagmi/react";
import { useAccount } from "wagmi";

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const { login, logout, authenticated, user } = usePrivy();
  const { wallets } = useWallets();
  const { address, isConnected } = useAccount();
  const { open } = useWeb3Modal();

  useEffect(() => {
    if (authenticated && user) {
      const walletAddress = address || wallets[0]?.address;
      saveUserData(user?.email?.address, walletAddress);
    }
  }, [authenticated, user, wallets, address]);

  const handleAuthAction = async () => {
    if (authenticated) {
      logout();
    } else {
      open();
      login();
    }
  };

  console.log(user);
  console.log(wallets);

  // Mock notification count (replace with actual data later)
  const notificationCount = 3;

  const navItems = [
    { href: "/about", label: "About" },
    // { href: "/pricing", label: "Pricing" },
    { href: "/artists", label: "Artist" },
    { href: "/works", label: "Works" }, // Add this new item
  ];

  // Add Dashboard link only for authenticated users
  if (authenticated) {
    navItems.push({ href: "/dashboard", label: "Dashboard" });
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
            {authenticated && <div className="relative"></div>}
            <Button
              onClick={handleAuthAction}
              variant="outline"
              className="ml-4 hover:bg-gray-100 transition-colors"
            >
              {authenticated ? "Sign out" : "Connect Wallet"}
            </Button>
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
                {authenticated && <li></li>}
                <li>
                  <Button
                    onClick={() => {
                      authenticated ? logout() : login();
                      setIsMenuOpen(false);
                    }}
                    variant="outline"
                    className="w-full mt-2 hover:bg-gray-100 transition-colors"
                  >
                    {authenticated ? "Sign out" : "Sign in"}
                  </Button>
                </li>
              </ul>
            </motion.nav>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
}
