import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Image, Music, FileText, Video, Box, File } from "lucide-react";
// import { getDashboardMetrics } from "@/utils/db/actions";
import { usePrivy } from "@privy-io/react-auth";

// Add this function at the top of the file, outside the component
function formatAmount(amount: number): string {
  if (amount >= 1000000) {
    return `$${(amount / 1000000).toFixed(1)}M`;
  } else if (amount >= 1000) {
    return `$${(amount / 1000).toFixed(1)}K`;
  } else {
    return `$${amount.toFixed(2)}`;
  }
}

export default function DashboardContent() {
  const [metrics, setMetrics] = useState({
    totalEarnings: 0,
    registeredContent: 0,
    aiUsage: 0,
    recentContents: [] as any[],
    recentActivity: [] as any[],
    aiUsageTracking: [] as any[],
    monthlyEarnings: [] as any[],
  });

  const { user } = usePrivy();

  // useEffect(() => {
  //   async function fetchMetrics() {
  //     try {
  //       const data = await getDashboardMetrics(user?.email?.address || "");
  //       console.log(data);

  //       setMetrics(data);
  //     } catch (error) {
  //       console.error("Error fetching dashboard metrics:", error);
  //     }
  //   }
  //   if (user?.email?.address) {
  //     fetchMetrics();
  //   }
  // }, [user?.email?.address]);

  const getTypeIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case "image":
        return <Image className="w-5 h-5" />;
      case "audio":
        return <Music className="w-5 h-5" />;
      case "text":
        return <FileText className="w-5 h-5" />;
      case "video":
        return <Video className="w-5 h-5" />;
      case "3d":
        return <Box className="w-5 h-5" />;
      default:
        return <File className="w-5 h-5" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
        <Card>
          <CardHeader>
            <CardTitle>Total Earnings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {typeof metrics.totalEarnings === "number"
                ? formatAmount(metrics.totalEarnings)
                : "$0.00"}
            </div>
            <p className="text-sm text-gray-500">Lifetime earnings</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Registered Content</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {metrics.registeredContent}
            </div>
            <p className="text-sm text-gray-500">Total registered items</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>AI Usage</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{metrics.aiUsage}</div>
            <p className="text-sm text-gray-500">Total AI interactions</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Earnings Over Time</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={metrics.monthlyEarnings}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="earnings" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Your Content</CardTitle>
          <Link
            href="/content"
            className="text-sm text-blue-600 hover:underline"
          >
            View All
          </Link>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <Input placeholder="Search your content..." className="w-full" />
          </div>
          <ul className="space-y-3">
            {metrics.recentContents.map((item) => (
              <li
                key={item.id}
                className="flex justify-between items-center p-3 bg-white border border-gray-100 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200"
              >
                <div className="flex items-center space-x-3">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      item.contentType.toLowerCase() === "image"
                        ? "bg-purple-100 text-purple-600"
                        : item.contentType.toLowerCase() === "audio"
                        ? "bg-green-100 text-green-600"
                        : item.contentType.toLowerCase() === "text"
                        ? "bg-blue-100 text-blue-600"
                        : item.contentType.toLowerCase() === "video"
                        ? "bg-red-100 text-red-600"
                        : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {getTypeIcon(item.contentType)}
                  </div>
                  <div>
                    <span className="font-medium text-gray-800">
                      {item.title}
                    </span>
                    <Badge variant="secondary" className="ml-2 text-xs">
                      {item.contentType}
                    </Badge>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <span className="text-sm font-semibold text-gray-700">
                    ${parseFloat(item.price).toFixed(2)}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-4">
              {metrics.recentActivity.map((activity) => (
                <li key={activity.id} className="flex items-center space-x-3">
                  <div className="flex-shrink-0 w-2 h-2 bg-blue-500 rounded-full"></div>
                  <div className="flex-grow">
                    <p className="text-sm">
                      Content {activity.contentId} was {activity.usageType}
                    </p>
                    <span className="text-xs text-gray-400">
                      {new Date(activity.usageDate).toLocaleString()}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>AI Usage Tracking</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-4">
              {metrics.aiUsageTracking.map((usage) => (
                <li
                  key={usage.id}
                  className="flex items-center justify-between"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                      <span className="text-xs font-medium">
                        {usage.aiAppId.slice(0, 2)}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm font-medium">{usage.aiAppId}</p>
                      <span className="text-xs text-gray-400">
                        Content {usage.contentId}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge variant="outline" className="mb-1">
                      {usage.usageType}
                    </Badge>
                  </div>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
