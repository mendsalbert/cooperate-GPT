"use client";
import { useState, useEffect, useMemo } from "react";
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
  getAllContents,
  getVerifiedContentIds,
  getLicenses,
  verifyContentOnChain,
  getLicensesByContentId,
} from "@/utils/db/actions";
import { usePrivy } from "@privy-io/react-auth";

interface Usage {
  id: number;
  contentId: number;
  licenseId: number;
  userId: number;
  aiAppId: string;
  usageType: string;
  usageDate: string;
}

interface Content {
  id: number;
  title: string;
  contentType: string | null;
  price: string | null;
  licenseId: number;
}

interface License {
  id: number;
  type: string;
}

export default function AIUsageContentCompany() {
  const { user } = usePrivy();
  console.log("User from Privy:", user);
  const [userId, setUserId] = useState<number | null>(null);
  const [usages, setUsages] = useState<Usage[]>([]);
  const [allContents, setAllContents] = useState<Content[]>([]);
  const [verifiedContents, setVerifiedContents] = useState<Content[]>([]);
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
  const [contentLicenses, setContentLicenses] = useState<License[]>([]);

  useEffect(() => {
    if (user?.email?.address) {
      console.log("Fetching user ID for email:", user.email.address);
      fetchUserId(user.email.address);
    } else {
      console.log("No user email available");
    }
  }, [user]);

  useEffect(() => {
    if (userId) {
      console.log("User ID set, fetching data");
      fetchUsages();
      fetchAllContents();
      fetchVerifiedContents();
      fetchLicenses();
    } else {
      console.log("No user ID available");
    }
  }, [userId]);

  useEffect(() => {
    if (user?.email?.address) {
      fetchVerifiedContents();
    }
  }, [user?.email?.address]);

  useEffect(() => {
    console.log("Verified contents:", verifiedContents);
    console.log("All contents:", allContents);
  }, [verifiedContents, allContents]);

  useEffect(() => {
    fetchAllContents();
  }, []);

  const fetchUserId = async (email: string) => {
    try {
      const id = await getUserIdByEmail(email);
      console.log("Fetched user ID:", id);
      setUserId(id);
    } catch (error) {
      console.error("Error fetching user ID:", error);
    }
  };

  const fetchUsages = async () => {
    if (!userId) {
      console.log("No user ID available for fetching usages");
      return;
    }
    try {
      const fetchedUsages = await getContentUsageHistory(userId);
      console.log("Fetched usages:", fetchedUsages);
      setUsages(
        fetchedUsages.map((usage) => ({
          ...usage,
          contentId: usage.contentId || 0,
          licenseId: usage.licenseId || 0,
          userId: usage.userId || 0,
        }))
      );
    } catch (error) {
      console.error("Error fetching usages:", error);
    }
  };

  const fetchAllContents = async () => {
    try {
      const contents = await getAllContents();

      console.log("Fetched all contents:", contents);
      setAllContents(
        contents.map((content) => ({
          id: content.id,
          title: content.title,
          contentType: content.contentType,
          price: content.price,
          licenseId: content.licenseId,
        }))
      );
    } catch (error) {
      console.error("Error fetching all contents:", error);
    }
  };

  const fetchVerifiedContents = async () => {
    if (!user?.email?.address) return;

    try {
      const verifiedContentIds = await getVerifiedContentIds(
        user.email.address
      );
      console.log("Fetched verified content IDs:", verifiedContentIds);

      // Filter allContents to get only the verified ones
      const verifiedContentsList = allContents.filter((content) =>
        verifiedContentIds.includes(content.id)
      );

      setVerifiedContents(verifiedContentsList);
      console.log("Verified contents:", verifiedContentsList);
    } catch (error) {
      console.error("Error fetching verified contents:", error);
    }
  };

  const fetchLicenses = async () => {
    if (!user?.email?.address) {
      console.log("No user email available for fetching licenses");
      return;
    }
    try {
      const fetchedLicenses = await getLicenses(user.email.address);
      console.log("Fetched licenses:", fetchedLicenses);
      setLicenses(
        fetchedLicenses.map((license) => ({
          id: license.id || 0,
          type: license.type || "",
        }))
      );
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

  const handleSubmit = async () => {
    console.log(newUsage);

    if (!userId) return;
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
      await fetchUsages();
    } catch (error) {
      console.error("Error adding new usage:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleContentSelect = (contentId: string) => {
    console.log("Content selected:", contentId);
    const selectedContent = allContents.find(
      (content) => content.id.toString() === contentId
    );

    if (selectedContent) {
      console.log("Selected Content", selectedContent);

      // Fetch licenses for the selected content
      fetchLicensesForContent(parseInt(contentId));

      setNewUsage((prev) => ({
        ...prev,
        contentId: contentId,
        licenseId: selectedContent.licenseId.toString(),
      }));
    } else {
      console.log("No content found with the given ID");
      setNewUsage((prev) => ({
        ...prev,
        contentId: "",
        licenseId: "",
      }));
    }
  };

  const fetchLicensesForContent = async (contentId: number) => {
    try {
      const licenses = await getLicensesByContentId(contentId);
      setContentLicenses(licenses);
      if (licenses.length > 0) {
        setNewUsage((prev) => ({
          ...prev,
          licenseId: licenses[0].id.toString(),
        }));
      }
    } catch (error) {
      console.error("Error fetching licenses for content:", error);
    }
  };

  const filteredUsages = usages.filter((usage) =>
    usage.aiAppId.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mt-6">
        <h2 className="text-2xl font-bold">AI Usage Tracking</h2>
        <Button onClick={() => setIsModalOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Add New Usage
        </Button>
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
              <Label htmlFor="contentId">Verified Content</Label>
              <Select
                onValueChange={handleContentSelect}
                value={newUsage.contentId}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select verified content" />
                </SelectTrigger>
                <SelectContent>
                  {verifiedContents.map((content) => (
                    <SelectItem key={content.id} value={content.id.toString()}>
                      {content.title}
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
              />
            </div>
            <div>
              <Label htmlFor="usageType">Usage Type</Label>
              <Select
                onValueChange={(value) =>
                  handleSelectChange("usageType", value)
                }
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
              onClick={() => setIsModalOpen(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={isLoading}>
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

      {verifiedContents.length === 0 && (
        <p>
          No verified contents available. Please verify and pay for some content
          first.
        </p>
      )}

      {usages.length === 0 && (
        <p>No usage records found. Add a new usage to see it here.</p>
      )}
    </div>
  );
}
