"use client";
import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Search,
  Plus,
  FileText,
  Shield,
  DollarSign,
  BarChart2,
  Book,
  Zap,
  Settings,
  Folder,
  Maximize2,
  Minimize2,
  ChevronLeft,
  ChevronRight,
  User,
  Cpu,
} from "lucide-react";

import DashboardContent from "../components/DashboardContent";
import RegisterContent from "../components/RegisterContent";
import VerifyContent from "../components/Verify";
import AIUsageContent from "../components/AIUsageContent";
import SettingsContent from "../components/SettingsContent";
import LicensesContent from "../components/LicensesContent";
import EarningsContent from "../components/EarningsContent";
import ContentsContent from "../components/ContentsContent";
import DashboardSelection from "../components/DashboardSelection";
import { motion, AnimatePresence } from "framer-motion";
import AIUsageContentCompany from "../components/AIUsageContentCompany";
import CreateModelContent from "../components/CreateModelContent";
import ListModelsContent from "../components/ListModelsContent";
import GenerateContentContent from "../components/GenerateContentContent";
import FinetuneModelContent from "../components/FinetuneModelContent";

export default function DashboardPage() {
  const [userType, setUserType] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState("dashboard");
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isNavCollapsed, setIsNavCollapsed] = useState(false);

  useEffect(() => {
    const storedUserType = localStorage.getItem("userType");
    if (storedUserType) {
      setUserType(storedUserType);
      setActiveSection(
        storedUserType === "ai-company" ? "ai-usage" : "dashboard"
      );
    }
  }, []);

  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
        setIsFullscreen(false);
      }
    }
  }, []);

  const toggleNav = () => {
    setIsNavCollapsed(!isNavCollapsed);
  };

  const selectUserType = (type: string) => {
    setUserType(type);
    localStorage.setItem("userType", type);
  };

  const navItems = [
    { name: "Dashboard", icon: BarChart2, section: "dashboard" },
    { name: "Create Model", icon: Plus, section: "create-model" },
    { name: "List Models", icon: Folder, section: "list-models" },
    { name: "Generate Content", icon: Zap, section: "generate-content" },
    { name: "Finetune Model", icon: Cpu, section: "finetune-model" },
    { name: "Settings", icon: Settings, section: "settings" },
  ];

  const filteredNavItems =
    userType === "ai-company"
      ? navItems.filter(
          (item) =>
            item.section === "ai-usage" ||
            item.section === "settings" ||
            item.section === "verify" // Added "verify" section for AI companies
        )
      : navItems;

  const renderContent = () => {
    switch (activeSection) {
      case "dashboard":
        return <DashboardContent />;
      case "create-model":
        return <CreateModelContent />;
      case "list-models":
        return <ListModelsContent />;
      case "generate-content":
        return <GenerateContentContent />;
      case "finetune-model":
        return <FinetuneModelContent />;
      case "settings":
        return <SettingsContent />;
      default:
        return <DashboardContent />;
    }
  };

  if (!userType) {
    return <DashboardSelection onSelect={selectUserType} />;
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.5 }}
        className="min-h-screen bg-background"
      >
        <div className="mx-auto px-7 py-8">
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="flex justify-between items-center mb-6"
          >
            <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
            <Button onClick={toggleFullscreen} variant="outline" size="sm">
              {isFullscreen ? (
                <Minimize2 className="w-4 h-4 mr-2" />
              ) : (
                <Maximize2 className="w-4 h-4 mr-2" />
              )}
              {isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
            </Button>
          </motion.div>

          <div className="flex gap-6">
            <motion.div
              initial={{ x: -50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.5 }}
            >
              <Card
                className={`transition-all duration-300 ${
                  isNavCollapsed ? "w-16" : "w-64"
                }`}
              >
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className={isNavCollapsed ? "hidden" : "block"}>
                    Navigation
                  </CardTitle>
                  <Button variant="ghost" size="sm" onClick={toggleNav}>
                    {isNavCollapsed ? (
                      <ChevronRight size={16} />
                    ) : (
                      <ChevronLeft size={16} />
                    )}
                  </Button>
                </CardHeader>
                <CardContent className="space-y-2">
                  {filteredNavItems.map((item) => (
                    <Button
                      key={item.section}
                      variant={
                        activeSection === item.section ? "default" : "ghost"
                      }
                      className={`w-full justify-start ${
                        isNavCollapsed ? "px-2" : "px-4"
                      } group`}
                      onClick={() => setActiveSection(item.section)}
                    >
                      <item.icon className="w-4 h-4 mr-2" />
                      <span
                        className={`${
                          isNavCollapsed
                            ? "hidden group-hover:block group-hover:absolute left-14 bg-background p-2 rounded-md shadow-md z-10"
                            : "block"
                        }`}
                      >
                        {item.name}
                      </span>
                    </Button>
                  ))}
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ x: 50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.6, duration: 0.5 }}
              className="flex-grow"
            >
              <Card>
                <CardContent>{renderContent()}</CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
