"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
  MessageSquare,
  Globe,
  Database,
  BarChart,
  FileSpreadsheet,
  Building,
  Settings,
} from "lucide-react";
import { motion } from "framer-motion";

// Add this new component for the wavy underline
const WavyUnderline = ({ color = "#8B5CF6", width = 100, height = 10 }) => {
  const generateScribblePath = () => {
    let path = `M0,${height / 2} `;
    const segments = Math.max(5, Math.floor(width / 10)); // Adjust number of segments based on width
    const segmentWidth = width / segments;

    for (let i = 1; i <= segments; i++) {
      const x = i * segmentWidth;
      const y1 = height / 2 + (Math.random() - 0.5) * height * 0.8;
      const y2 = height / 2 + (Math.random() - 0.5) * height * 0.8;
      path += `C${x - segmentWidth * 0.5},${y1} ${
        x - segmentWidth * 0.5
      },${y2} ${x},${height / 2} `;
    }

    return path;
  };

  return (
    <svg
      className="absolute left-0 -bottom-2 w-full"
      viewBox={`0 0 ${width} ${height}`}
      preserveAspectRatio="none"
      style={{ height: "0.5em" }}
    >
      <motion.path
        d={generateScribblePath()}
        stroke={color}
        strokeWidth="2"
        fill="none"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={{ duration: 1.5, ease: "easeInOut" }}
      />
    </svg>
  );
};

const BackgroundAnimation = () => {
  return (
    <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
      <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop
              offset="0%"
              style={{ stopColor: "#ffffff", stopOpacity: 0.2 }}
            />
            <stop
              offset="100%"
              style={{ stopColor: "#ffffff", stopOpacity: 0.2 }}
            />
          </linearGradient>
        </defs>
        <rect width="100%" height="100%" fill="url(#grad1)" />
        {[...Array(20)].map((_, i) => (
          <motion.circle
            key={i}
            r="2"
            fill="#4299e1"
            initial={{
              x: Math.random() * 100 + "%",
              y: Math.random() * 100 + "%",
            }}
            animate={{
              x: [Math.random() * 100 + "%", Math.random() * 100 + "%"],
              y: [Math.random() * 100 + "%", Math.random() * 100 + "%"],
            }}
            transition={{
              duration: Math.random() * 10 + 20,
              repeat: Infinity,
              repeatType: "reverse",
            }}
          />
        ))}
        {[...Array(15)].map((_, i) => (
          <motion.line
            key={i}
            stroke="#4299e1"
            strokeWidth="0.5"
            strokeOpacity="0.2"
            initial={{ x1: "0%", y1: "0%", x2: "100%", y2: "100%" }}
            animate={{
              x1: [Math.random() * 100 + "%", Math.random() * 100 + "%"],
              y1: [Math.random() * 100 + "%", Math.random() * 100 + "%"],
              x2: [Math.random() * 100 + "%", Math.random() * 100 + "%"],
              y2: [Math.random() * 100 + "%", Math.random() * 100 + "%"],
            }}
            transition={{
              duration: Math.random() * 10 + 20,
              repeat: Infinity,
              repeatType: "reverse",
            }}
          />
        ))}
      </svg>
    </div>
  );
};

export default function Home() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
    },
  };

  const featureColors = {
    blue: "bg-blue-50 text-blue-600 text-blue-700",
    green: "bg-green-50 text-green-600 text-green-700",
    purple: "bg-purple-50 text-purple-600 text-purple-700",
    orange: "bg-orange-50 text-orange-600 text-orange-700",
  };

  const dataSourceColors = {
    blue: "bg-blue-100 text-blue-600",
    purple: "bg-purple-100 text-purple-600",
    green: "bg-green-100 text-green-600",
    orange: "bg-orange-100 text-orange-600",
  };

  return (
    <>
      <BackgroundAnimation />
      <motion.main
        className="container mx-auto px-4 py-16 max-w-5xl relative z-10"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        <motion.div
          className="flex items-center justify-center mb-6"
          variants={itemVariants}
        >
          <motion.h1
            className="text-5xl sm:text-6xl font-extrabold text-center leading-tight"
            variants={itemVariants}
          >
            Empower Your{" "}
            <span className="relative inline-block pb-2">
              Business
              <WavyUnderline width={130} />
            </span>{" "}
            with{" "}
            <span className="relative inline-block pb-2">
              Cooperate GPT
              <WavyUnderline width={180} />
            </span>
          </motion.h1>
        </motion.div>

        <motion.p
          className="text-xl sm:text-xl mb-8 text-center text-gray-600 max-w-3xl mx-auto"
          variants={itemVariants}
        >
          Access a powerful AI-driven system to query, analyze, and visualize
          your corporate data in both Chinese and English.
        </motion.p>

        <motion.div
          className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4 mb-12"
          variants={itemVariants}
        >
          <Button
            asChild
            size="lg"
            className="w-full sm:w-auto bg-gray-900 hover:bg-gray-800 text-white font-medium py-3 px-6 rounded-md text-base transition-colors duration-300 shadow-sm"
          >
            <Link href="/dashboard">Try Cooperate GPT</Link>
          </Button>
          <Button
            asChild
            size="lg"
            className="w-full sm:w-auto bg-transparent hover:bg-gray-100 text-gray-900 font-medium py-3 px-6 rounded-md text-base transition-colors duration-300 border border-gray-300"
          >
            <Link href="/about">Learn More</Link>
          </Button>
        </motion.div>

        <motion.div
          className="bg-white shadow-sm rounded-lg p-8 mb-12"
          variants={itemVariants}
        >
          <h2 className="text-3xl sm:text-4xl font-bold mb-6 text-gray-800">
            Revolutionize Corporate Data Management with AI
          </h2>
          <p className="text-lg mb-8 text-gray-600">
            Cooperate GPT leverages advanced AI technology to provide seamless
            access to your company's data. Query information, generate reports,
            and visualize data effortlessly in both Chinese and English.
          </p>
          <motion.div
            className="grid grid-cols-1 sm:grid-cols-2 gap-6"
            variants={containerVariants}
          >
            {[
              {
                icon: MessageSquare,
                title: "Natural Language Queries",
                color: "blue",
              },
              { icon: Globe, title: "Bilingual Support", color: "green" },
              {
                icon: Database,
                title: "Multi-Source Data Integration",
                color: "purple",
              },
              { icon: BarChart, title: "Data Visualization", color: "orange" },
            ].map((feature, index) => (
              <motion.div
                key={index}
                className={`${
                  featureColors[
                    feature.color as keyof typeof featureColors
                  ].split(" ")[0]
                } p-6 rounded-lg flex items-start`}
                variants={itemVariants}
              >
                <feature.icon
                  className={`${
                    featureColors[
                      feature.color as keyof typeof featureColors
                    ].split(" ")[1]
                  } w-8 h-8 mr-4 flex-shrink-0`}
                />
                <div>
                  <h3
                    className={`text-xl font-semibold mb-3 ${
                      featureColors[
                        feature.color as keyof typeof featureColors
                      ].split(" ")[2]
                    }`}
                  >
                    {feature.title}
                  </h3>
                  <p className="text-gray-600">{/* Feature description */}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>

        <motion.div
          className="bg-gray-50 rounded-lg p-8 mb-12"
          variants={itemVariants}
        >
          <h3 className="text-2xl font-bold text-center text-gray-800 mb-6">
            Seamless Integration with Various Data Sources
          </h3>
          <motion.div
            className="grid grid-cols-2 sm:grid-cols-4 gap-6"
            variants={containerVariants}
          >
            {[
              { icon: Database, title: "SQL Databases", color: "blue" },
              { icon: Database, title: "MongoDB", color: "green" },
              { icon: Globe, title: "API Integration", color: "purple" },
              {
                icon: FileSpreadsheet,
                title: "Excel/CSV Export",
                color: "orange",
              },
            ].map((source, index) => (
              <motion.div
                key={index}
                className="flex flex-col items-center"
                variants={itemVariants}
              >
                <div
                  className={`${
                    dataSourceColors[
                      source.color as keyof typeof dataSourceColors
                    ].split(" ")[0]
                  } p-4 rounded-full mb-3`}
                >
                  <source.icon
                    className={`w-10 h-10 ${
                      dataSourceColors[
                        source.color as keyof typeof dataSourceColors
                      ].split(" ")[1]
                    }`}
                  />
                </div>
                <span className="text-gray-700 text-sm font-medium text-center">
                  {source.title}
                </span>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>

        <motion.div
          className="bg-white shadow-sm rounded-lg p-8"
          variants={itemVariants}
        >
          <h3 className="text-2xl font-bold text-center text-gray-800 mb-6">
            Key Features for Corporate Success
          </h3>
          <ul className="list-disc pl-6 space-y-2 text-gray-600">
            <li>Natural language processing for user-friendly queries</li>
            <li>Bilingual support in Chinese and English</li>
            <li>Real-time data updates from multiple corporate sources</li>
            <li>
              Customizable data visualizations and reports for decision-making
            </li>
            <li>Export data in Excel, CSV, or graph image formats</li>
            <li>Multi-department support with easy adaptation</li>
            <li>
              Model selection and fine-tuning capabilities for specific business
              needs
            </li>
          </ul>
        </motion.div>
      </motion.main>
    </>
  );
}
