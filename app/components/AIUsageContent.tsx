"use client";
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, Plus, Zap, Loader2, CheckCircle, XCircle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  recordContentUsage,
  getContentUsageHistory,
  getUserIdByEmail,
  getUserContents,
  getLicenses,
  verifyContentOnChain,
} from "@/utils/db/actions";
import { usePrivy } from "@privy-io/react-auth";

interface Usage {
  id: number;
  contentId: number;
  licenseId: number;
  userId: number;
  aiAppId: string;
  usageType: string;
  transactionHash: string | null;
  usageDate: string;
}

interface Content {
  id: number;
  title: string;
}

interface License {
  id: number;
  type: string;
}

export default function AIUsageContent() {
  const { user } = usePrivy();
  const [userId, setUserId] = useState<number | null>(null);
  const [usages, setUsages] = useState<Usage[]>([]);
  const [contents, setContents] = useState<Content[]>([]);
  const [licenses, setLicenses] = useState<License[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newUsage, setNewUsage] = useState({
    contentId: "",
    licenseId: "",
    aiAppId: "",
    usageType: "",
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [contentHash, setContentHash] = useState("");

  useEffect(() => {
    if (user?.email?.address) {
      fetchUserId(user.email.address);
    }
  }, [user]);

  useEffect(() => {
    if (userId) {
      fetchUsages();
      fetchContents();
      fetchLicenses();
    }
  }, [userId]);

  const fetchUserId = async (email: string) => {
    try {
      const id = await getUserIdByEmail(email);
      setUserId(id);
    } catch (error) {
      console.error("Error fetching user ID:", error);
    }
  };

  const fetchUsages = async () => {
    if (!userId) return;
    try {
      const fetchedUsages = await getContentUsageHistory(userId);
      setUsages(fetchedUsages);
    } catch (error) {
      console.error("Error fetching usages:", error);
    }
  };

  const fetchContents = async () => {
    if (!user?.email?.address) return;
    try {
      const fetchedContents = await getUserContents(user.email.address);
      setContents(fetchedContents);
    } catch (error) {
      console.error("Error fetching contents:", error);
    }
  };

  const fetchLicenses = async () => {
    if (!user?.email?.address) return;
    try {
      const fetchedLicenses = await getLicenses(user.email.address);
      setLicenses(fetchedLicenses);
    } catch (error) {
      console.error("Error fetching licenses:", error);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewUsage((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setNewUsage((prev) => ({ ...prev, [name]: value }));
  };

  const handleVerifyContent = async () => {
    if (!newUsage.contentId || !contentHash) {
      alert("Please select a content and enter a hash to verify");
      return;
    }

    setIsVerifying(true);
    try {
      const isVerified = await verifyContentOnChain(
        parseInt(newUsage.contentId),
        contentHash
      );
      setIsVerified(isVerified);
      if (!isVerified) {
        alert(
          "Content verification failed. Please ensure you have the right to use this content and that the hash is correct."
        );
      }
    } catch (error) {
      console.error("Error verifying content:", error);
      alert("An error occurred while verifying the content.");
    } finally {
      setIsVerifying(false);
    }
  };

  const handleSubmit = async () => {
    if (!userId || !isVerified) return;
    setIsLoading(true);
    try {
      await recordContentUsage(
        parseInt(newUsage.contentId),
        parseInt(newUsage.licenseId),
        userId,
        newUsage.aiAppId,
        newUsage.usageType
      );
      setIsModalOpen(false);
      setNewUsage({
        contentId: "",
        licenseId: "",
        aiAppId: "",
        usageType: "",
      });
      setIsVerified(false);
      setContentHash("");
      await fetchUsages();
    } catch (error) {
      console.error("Error adding new usage:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredUsages = usages.filter((usage) =>
    usage.aiAppId.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mt-6">
        <h2 className="text-2xl font-bold">AI Usage Tracking</h2>
        {/* <Button onClick={() => setIsModalOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Add New Usage
        </Button> */}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Usage Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold">{usages.length}</p>
              <p className="text-sm text-gray-500">Total Usages</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold">
                {new Set(usages.map((u) => u.aiAppId)).size}
              </p>
              <p className="text-sm text-gray-500">Unique AI Apps</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold">
                {new Set(usages.map((u) => u.usageType)).size}
              </p>
              <p className="text-sm text-gray-500">Usage Types</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Usage List</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4 flex space-x-2">
            <Input
              placeholder="Search usages..."
              className="flex-grow"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Button variant="outline">
              <Search className="w-4 h-4 mr-2" />
              Search
            </Button>
          </div>
          <ul className="space-y-4">
            {filteredUsages.map((usage) => (
              <li
                key={usage.id}
                className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg shadow-sm"
              >
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                    <Zap className="w-6 h-6 text-purple-600" />
                  </div>
                  <div>
                    <p className="font-medium">Content ID: {usage.contentId}</p>
                    <p className="text-sm text-gray-500">{usage.aiAppId}</p>
                  </div>
                </div>
                <div className="text-right">
                  <Badge variant="outline" className="mb-1">
                    {usage.usageType}
                  </Badge>
                  <p className="text-sm">
                    {new Date(usage.usageDate).toLocaleDateString()}
                  </p>
                  <p className="font-medium">License ID: {usage.licenseId}</p>
                </div>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New AI Usage</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="contentId">Content</Label>
              <Select
                onValueChange={(value) => {
                  handleSelectChange("contentId", value);
                  setIsVerified(false);
                  setContentHash("");
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select content" />
                </SelectTrigger>
                <SelectContent>
                  {contents.map((content) => (
                    <SelectItem key={content.id} value={content.id.toString()}>
                      {content.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="contentHash">Content Hash</Label>
              <Input
                id="contentHash"
                value={contentHash}
                onChange={(e) => setContentHash(e.target.value)}
                placeholder="Enter content hash for verification"
              />
            </div>
            <div>
              <Button
                onClick={handleVerifyContent}
                disabled={!newUsage.contentId || !contentHash || isVerifying}
                className="w-full"
              >
                {isVerifying ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : isVerified ? (
                  <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
                ) : (
                  <XCircle className="mr-2 h-4 w-4 text-red-500" />
                )}
                {isVerifying ? "Verifying..." : "Verify Content"}
              </Button>
            </div>
            <div>
              <Label htmlFor="licenseId">License</Label>
              <Select
                onValueChange={(value) =>
                  handleSelectChange("licenseId", value)
                }
                disabled={!isVerified}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select license" />
                </SelectTrigger>
                <SelectContent>
                  {licenses.map((license) => (
                    <SelectItem key={license.id} value={license.id.toString()}>
                      {license.type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="aiAppId">AI Application</Label>
              <Input
                id="aiAppId"
                name="aiAppId"
                value={newUsage.aiAppId}
                onChange={handleInputChange}
                disabled={!isVerified}
              />
            </div>
            <div>
              <Label htmlFor="usageType">Usage Type</Label>
              <Select
                onValueChange={(value) =>
                  handleSelectChange("usageType", value)
                }
                disabled={!isVerified}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select usage type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Training">Training</SelectItem>
                  <SelectItem value="Reference">Reference</SelectItem>
                  <SelectItem value="Analysis">Analysis</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsModalOpen(false);
                setIsVerified(false);
                setContentHash("");
              }}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={isLoading || !isVerified}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Adding...
                </>
              ) : (
                "Add Usage"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
