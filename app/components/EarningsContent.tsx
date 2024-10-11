import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Image, Music, Video, FileText, Box } from "lucide-react";
import { getEarnings } from "@/utils/db/actions";
import { usePrivy } from "@privy-io/react-auth";

// Updated helper function to get the appropriate icon for each content type
const getContentTypeIcon = (contentType: string) => {
  switch (contentType) {
    case "Image":
      return <Image className="w-5 h-5" />;
    case "Audio":
      return <Music className="w-5 h-5" />;
    case "Video":
      return <Video className="w-5 h-5" />;
    case "Docs":
      return <FileText className="w-5 h-5" />;
    case "3D":
      return <Box className="w-5 h-5" />;
    default:
      return null;
  }
};

export default function EarningsContent() {
  const [currentPage, setCurrentPage] = useState(1);
  const [filter, setFilter] = useState("all");
  const [earnings, setEarnings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const itemsPerPage = 10;
  const { user } = usePrivy();

  useEffect(() => {
    async function fetchEarnings() {
      if (user?.email?.address) {
        setLoading(true);
        try {
          const fetchedEarnings = await getEarnings(user.email.address);
          setEarnings(fetchedEarnings);
        } catch (error) {
          console.error("Error fetching earnings:", error);
        }
        setLoading(false);
      }
    }

    fetchEarnings();
  }, [user]);

  // Filter earnings based on selected time range
  const filterEarnings = () => {
    const now = new Date();
    switch (filter) {
      case "day":
        return earnings.filter(
          (e) => new Date(e.date).toDateString() === now.toDateString()
        );
      case "week":
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        return earnings.filter((e) => new Date(e.date) >= weekAgo);
      case "month":
        return earnings.filter(
          (e) => new Date(e.date).getMonth() === now.getMonth()
        );
      default:
        return earnings;
    }
  };

  const filteredEarnings = filterEarnings();
  const totalPages = Math.ceil(filteredEarnings.length / itemsPerPage);
  const displayedEarnings = filteredEarnings.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const totalEarnings = filteredEarnings.reduce(
    (sum, earning) => sum + earning.amount,
    0
  );
  const averageEarning =
    filteredEarnings.length > 0 ? totalEarnings / filteredEarnings.length : 0;

  console.log(earnings);

  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle>Earnings</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-4 grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader>
              <CardTitle>Total Earnings</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">${totalEarnings.toFixed(2)}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Average Earning</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">${averageEarning.toFixed(2)}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Total Transactions</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{filteredEarnings.length}</p>
            </CardContent>
          </Card>
        </div>
        <div className="mb-4">
          <Select onValueChange={(value) => setFilter(value)}>
            <SelectTrigger>
              <SelectValue placeholder="Filter by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Time</SelectItem>
              <SelectItem value="day">Today</SelectItem>
              <SelectItem value="week">This Week</SelectItem>
              <SelectItem value="month">This Month</SelectItem>
            </SelectContent>
          </Select>
        </div>
        {loading ? (
          <p>Loading earnings data...</p>
        ) : (
          <>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Content Type</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Amount Earned</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {displayedEarnings.map((earning) => (
                  <TableRow key={earning.id}>
                    <TableCell>{earning.date}</TableCell>
                    <TableCell className="flex items-center space-x-2">
                      {getContentTypeIcon(earning.contentType)}
                      <span>{earning.contentType}</span>
                    </TableCell>
                    <TableCell>{earning.title}</TableCell>
                    <TableCell>${earning.price}</TableCell>
                    <TableCell>${earning.amount.toFixed(2)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <div className="mt-4 flex justify-between items-center">
              <Button
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
              >
                Previous
              </Button>
              <span>
                Page {currentPage} of {totalPages}
              </span>
              <Button
                onClick={() =>
                  setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                }
                disabled={currentPage === totalPages}
              >
                Next
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
