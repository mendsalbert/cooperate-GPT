import { useState } from "react";
import { motion } from "framer-motion";
import { User, Cpu, ArrowRight } from "lucide-react";

interface DashboardSelectionProps {
  onSelect: (type: string) => void;
}

const BackgroundPattern = () => (
  <svg
    className="absolute inset-0 w-full h-full"
    xmlns="http://www.w3.org/2000/svg"
  >
    <defs>
      <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
        <path
          d="M 40 0 L 0 0 0 40"
          fill="none"
          stroke="currentColor"
          strokeWidth="0.5"
          strokeOpacity="0.1"
        />
      </pattern>
      <pattern
        id="circles"
        width="100"
        height="100"
        patternUnits="userSpaceOnUse"
      >
        <circle cx="50" cy="50" r="1" fill="currentColor" fillOpacity="0.1" />
      </pattern>
    </defs>
    <rect width="100%" height="100%" fill="url(#grid)" />
    <rect width="100%" height="100%" fill="url(#circles)" />
  </svg>
);

export default function DashboardSelection({
  onSelect,
}: DashboardSelectionProps) {
  const [hoveredOption, setHoveredOption] = useState<string | null>(null);

  const options = [
    {
      id: "creator",
      title: "Creator",
      icon: User,
      description: "For artists and content creators",
    },
    {
      id: "ai-company",
      title: "AI Company",
      icon: Cpu,
      description: "For AI companies and researchers",
    },
  ];

  return (
    <div className="relative flex flex-col items-center justify-center min-h-screen overflow-hidden bg-gradient-to-br from-background to-accent/10">
      <BackgroundPattern />
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center mb-12 relative z-10"
      >
        <h1 className="text-5xl font-bold text-foreground mb-4">
          Welcome to Your Dashboard
        </h1>
        <p className="text-xl text-muted-foreground">
          Select your profile to get started
        </p>
      </motion.div>
      <div className="flex space-x-8 relative z-10">
        {options.map((option) => (
          <motion.div
            key={option.id}
            className="relative"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{
              duration: 0.5,
              delay: option.id === "creator" ? 0.2 : 0.4,
            }}
            onHoverStart={() => setHoveredOption(option.id)}
            onHoverEnd={() => setHoveredOption(null)}
          >
            <motion.div
              className={`w-64 h-72 rounded-xl bg-card text-card-foreground shadow-lg flex flex-col items-center justify-center p-6 cursor-pointer
                         transition-colors duration-200 ${
                           hoveredOption === option.id
                             ? "bg-primary text-primary-foreground"
                             : ""
                         }`}
              onClick={() => onSelect(option.id)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <option.icon className="w-16 h-16 mb-6" />
              <h2 className="text-2xl font-semibold mb-2">{option.title}</h2>
              <p className="text-sm text-center opacity-80">
                {option.description}
              </p>
              <motion.div
                className="absolute bottom-6 right-6"
                initial={{ opacity: 0, x: -10 }}
                animate={{
                  opacity: hoveredOption === option.id ? 1 : 0,
                  x: hoveredOption === option.id ? 0 : -10,
                }}
                transition={{ duration: 0.2 }}
              >
                <ArrowRight className="w-6 h-6" />
              </motion.div>
            </motion.div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
