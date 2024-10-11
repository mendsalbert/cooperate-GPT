import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Search,
  CheckCircle,
  XCircle,
  Download,
  FileText,
  Box,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { motion } from "framer-motion";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  verifyContentOnChain,
  getContentById,
  handleContentPayment,
  getAllContents,
  recordContentUsage,
  getUserIdByEmail,
  getVerifiedContentIds, // Add this import
} from "@/utils/db/actions";
import { ethers, parseEther } from "ethers";
import { usePrivy } from "@privy-io/react-auth";

interface VerificationResult {
  verified: boolean;
  usageRights?: string;
  registrationDate?: string;
  price?: string;
  contentId?: number;
  contentToken?: any;
  ethPrice?: string;
}

interface Content {
  id: number;
  title: string | null;
  contentType: string | null;
  price: string | null;
  contentHash: string | null;
  ipfsUrl: string | null;
  tokenId: string | null;
  createdAt: Date | null;
  description: string | null;
  creatorName: string | null;
  creatorEmail: string | null;
}

// Add this function at the top of the file, outside the component
const renderPreview = (content: Content) => {
  switch (content.contentType?.toLowerCase()) {
    case "image":
      return (
        <img
          src={content.ipfsUrl || ""}
          alt={content.title || "Content preview"}
          className="w-32 h-32 object-cover rounded-md"
        />
      );
    case "audio":
      return (
        <audio
          controls
          src={content.ipfsUrl || ""}
          className="w-32 rounded-md"
        />
      );
    case "video":
      return (
        <video
          controls
          src={content.ipfsUrl || ""}
          className="w-32 h-32 object-cover rounded-md"
        />
      );
    case "text":
      return <FileText className="w-32 h-32 p-2 bg-gray-100 rounded-md" />;
    default:
      return <Box className="w-32 h-32 p-2 bg-gray-100 rounded-md" />;
  }
};

// Add this function to convert USD to ETH
const convertUsdToEth = async (usdAmount: number): Promise<string> => {
  try {
    const response = await fetch(
      "https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd"
    );
    const data = await response.json();
    const ethPrice = data.ethereum.usd;
    const ethAmount = usdAmount / ethPrice;
    return ethAmount.toFixed(6);
  } catch (error) {
    console.error("Error fetching ETH price:", error);
    return "0";
  }
};

export default function VerifyPage() {
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationResult, setVerificationResult] =
    useState<VerificationResult | null>(null);
  const [isPaying, setIsPaying] = useState(false);
  const { user } = usePrivy();
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [allContents, setAllContents] = useState<Content[]>([]);
  const [verifiedContents, setVerifiedContents] = useState<number[]>([]);
  const [filter, setFilter] = useState("");
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
  const [verifyingContentId, setVerifyingContentId] = useState<number | null>(
    null
  );
  const [error, setError] = useState<string | null>(null);
  const [ethPrice, setEthPrice] = useState<string>("0");

  useEffect(() => {
    fetchAllContents();
    if (user?.email?.address) {
      fetchVerifiedContents();
    }
  }, [user?.email?.address]);

  useEffect(() => {
    console.log("allContents state updated:", allContents);
  }, [allContents]);

  const fetchAllContents = async () => {
    try {
      console.log("Fetching contents...");
      const contents = await getAllContents();
      console.log("Fetched contents:", contents);
      console.log("Number of contents fetched:", contents.length);
      setAllContents(contents);
      setError(null);
    } catch (error) {
      console.error("Error fetching contents:", error);
      setError("Failed to fetch contents. Please try again later.");
    }
  };

  const fetchVerifiedContents = async () => {
    if (!user?.email?.address) return;

    try {
      const verifiedContentIds = await getVerifiedContentIds(
        user.email.address
      );
      setVerifiedContents(verifiedContentIds);
      console.log("Fetched verified contents:", verifiedContentIds);
    } catch (error) {
      console.error("Error fetching verified contents:", error);
    }
  };

  const handleVerifyAndUse = async (content: Content) => {
    if (verifyingContentId !== null) return;
    setVerifyingContentId(content.id);
    setIsVerifying(true);
    try {
      const isVerified = await verifyContentOnChain(
        content.tokenId, // Pass the content ID as the userId (this might need to be adjusted based on your actual user ID)
        content.contentHash || "" // Use contentHash instead of tokenId
      );
      if (isVerified) {
        const ethAmount = await convertUsdToEth(
          parseFloat(content.price || "0")
        );
        setEthPrice(ethAmount);
        setVerificationResult({
          verified: true,
          usageRights: "Non-Commercial",
          registrationDate: content.createdAt
            ? new Date(content.createdAt).toISOString().split("T")[0]
            : "Unknown",
          price: content.price || "0",
          contentId: content.id,
          contentToken: content.tokenId || "",
          ethPrice: ethAmount,
        });
        setIsPaymentDialogOpen(true);
      } else {
        setVerificationResult({ verified: false });
      }
    } catch (error) {
      console.error("Verification failed:", error);
      setVerificationResult({ verified: false });
    } finally {
      setIsVerifying(false);
      setVerifyingContentId(null);
    }
  };

  const handlePayment = async () => {
    setIsPaying(true);
    console.log(verificationResult?.ethPrice);

    try {
      const userId = await getUserIdByEmail(user.email.address);

      if (!userId) {
        throw new Error("User not found");
      }

      const result = await handleContentPayment(
        verificationResult.contentId,
        walletAddress,
        verificationResult?.ethPrice,
        // ethers.parseUnits(verificationResult.ethPrice || "0", "ether"),
        verificationResult.contentToken
      );

      if (result.success) {
        setVerifiedContents((prev) => {
          const newVerifiedContents = [...prev, verificationResult.contentId!];
          console.log("Updated verifiedContents:", newVerifiedContents);
          return newVerifiedContents;
        });
        console.log("Payment successful:", result);
        await fetchAllContents();
      } else {
        throw new Error("Payment failed");
      }
    } catch (error) {
      console.error("Payment failed:", error);
    } finally {
      setIsPaying(false);
      setIsPaymentDialogOpen(false);
    }
  };

  const filteredContents = allContents.filter(
    (content) =>
      content.title?.toLowerCase().includes(filter.toLowerCase()) ||
      content.contentType?.toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <div className="w-full flex justify-start">
      <Card className="w-full mt-6">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Verify Content</CardTitle>
        </CardHeader>
        <CardContent>
          {error && <div className="text-red-500 mb-4">{error}</div>}
          <div className="mb-4">
            <Input
              placeholder="Filter contents..."
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            />
          </div>
          {allContents.length === 0 ? (
            <div>No contents available. Please check back later.</div>
          ) : (
            <>
              {console.log("Rendering table with contents:", allContents)}
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Preview</TableHead>
                    <TableHead>Title</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredContents.map((content) => (
                    <TableRow key={content.id}>
                      <TableCell className="p-4">
                        {renderPreview(content)}
                      </TableCell>
                      <TableCell>{content.title || "Untitled"}</TableCell>
                      <TableCell>{content.contentType || "Unknown"}</TableCell>
                      <TableCell>${content.price || "0"}</TableCell>
                      <TableCell>
                        <Button
                          size="sm"
                          onClick={() => handleVerifyAndUse(content)}
                          disabled={
                            isVerifying ||
                            verifiedContents.includes(content.id) ||
                            verifyingContentId !== null
                          }
                        >
                          {verifiedContents.includes(content.id)
                            ? "Verified"
                            : verifyingContentId === content.id
                            ? "Verifying..."
                            : "Verify and Use"}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </>
          )}

          <Dialog
            open={isPaymentDialogOpen}
            onOpenChange={setIsPaymentDialogOpen}
          >
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle className="text-2xl font-bold text-center">
                  Verify and Pay
                </DialogTitle>
              </DialogHeader>
              {verificationResult && (
                <div className="py-6">
                  <div className="flex items-center justify-center mb-6">
                    <CheckCircle className="w-16 h-16 text-green-500" />
                  </div>
                  <p className="text-center text-xl font-semibold mb-6">
                    Content verified successfully!
                  </p>
                  <div className="space-y-4 bg-gray-100 p-4 rounded-lg">
                    <p className="flex justify-between">
                      <span className="font-semibold">Usage Rights:</span>
                      <span>{verificationResult.usageRights}</span>
                    </p>
                    <p className="flex justify-between">
                      <span className="font-semibold">Registration Date:</span>
                      <span>{verificationResult.registrationDate}</span>
                    </p>
                    <p className="flex justify-between">
                      <span className="font-semibold">Price in USD:</span>
                      <span>${verificationResult.price}</span>
                    </p>
                    <p className="flex justify-between">
                      <span className="font-semibold">Price in ETH:</span>
                      <span>{verificationResult.ethPrice} ETH</span>
                    </p>
                  </div>
                </div>
              )}
              <DialogFooter className="flex justify-end space-x-2 mt-6">
                <Button
                  variant="outline"
                  onClick={() => setIsPaymentDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handlePayment}
                  disabled={isPaying}
                  className="bg-green-500 hover:bg-green-600"
                >
                  {isPaying
                    ? "Processing Payment..."
                    : `Pay ${verificationResult?.ethPrice} ETH`}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </CardContent>
      </Card>
    </div>
  );
}
