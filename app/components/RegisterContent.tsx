import React, { useState, useRef, useCallback, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Upload, Check, Link as LinkIcon, LoaderCircle } from "lucide-react";
import { sha256 } from "js-sha256";
import {
  registerContent,
  getAllLicenses,
  checkArtistOnboarding,
} from "@/utils/db/actions";
import { usePrivy } from "@privy-io/react-auth";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import ArtistOnboarding from "./ArtistOnboarding";

// Add this near the top of your file
console.log("Environment variables in RegisterContent:", {
  ETHEREUM_RPC_URL: process.env.ETHEREUM_RPC_URL,
  CONTRACT_ADDRESS: process.env.CONTRACT_ADDRESS,
  PRIVATE_KEY: process.env.PRIVATE_KEY ? "[REDACTED]" : "Not set",
});

export default function RegisterContent() {
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [fileName, setFileName] = useState("");
  const [cloudinaryUrl, setCloudinaryUrl] = useState("");
  const [contentHash, setContentHash] = useState("");
  const [title, setTitle] = useState("");
  const [contentType, setContentType] = useState("");
  const [isCommercial, setIsCommercial] = useState(false);
  const [price, setPrice] = useState("");
  const [isRegistering, setIsRegistering] = useState(false);
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);
  const { user } = usePrivy();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [allLicenses, setAllLicenses] = useState<any[]>([]);
  const [selectedLicenseId, setSelectedLicenseId] = useState<string>("");

  const [isArtistOnboarded, setIsArtistOnboarded] = useState(false);
  const [showArtistOnboarding, setShowArtistOnboarding] = useState(false);

  useEffect(() => {
    fetchAllLicenses();
    checkArtistOnboardingStatus();
  }, []);

  const checkArtistOnboardingStatus = async () => {
    if (user?.email) {
      const onboardingStatus = await checkArtistOnboarding(user.email.address);
      setIsArtistOnboarded(onboardingStatus);
    }
  };

  const fetchAllLicenses = async () => {
    try {
      const licenses = await getAllLicenses();
      setAllLicenses(licenses);
    } catch (error) {
      console.error("Error fetching all licenses:", error);
    }
  };

  const generateContentHash = useCallback((file: File) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result;
      if (content) {
        const hash = sha256(content as string);
        setContentHash(hash);
      }
    };
    reader.readAsArrayBuffer(file);
  }, []);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setFileName(file.name);
      generateContentHash(file);
      uploadToCloudinary(file);
    }
  };

  const uploadToCloudinary = (file: File) => {
    setIsUploading(true);
    setUploadProgress(0);
    setCloudinaryUrl("");

    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", "blockrights"); // Replace with your Cloudinary upload preset

    const xhr = new XMLHttpRequest();
    xhr.open("POST", `https://api.cloudinary.com/v1_1/dm4pbkgma/auto/upload`); // Replace YOUR_CLOUD_NAME

    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) {
        const progress = Math.round((event.loaded / event.total) * 100);
        setUploadProgress(progress);
      }
    };

    xhr.onload = () => {
      if (xhr.status === 200) {
        const response = JSON.parse(xhr.responseText);
        setCloudinaryUrl(response.secure_url);
        setIsUploading(false);
        setUploadProgress(100);
      } else {
        console.error("Upload failed");
        setIsUploading(false);
      }
    };

    xhr.onerror = () => {
      console.error("Upload failed");
      setIsUploading(false);
    };

    xhr.send(formData);
  };

  const handleDragOver = (event: React.DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
  };

  const handleDrop = (event: React.DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    if (file) {
      setFileName(file.name);
      generateContentHash(file);
      uploadToCloudinary(file);
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!user?.email) {
      console.error("User not authenticated or email not available");
      return;
    }

    setIsRegistering(true);
    try {
      const content = await registerContent(
        user.email.address,
        title,
        contentType,
        contentHash,
        cloudinaryUrl,
        isCommercial,
        parseFloat(price),
        parseInt(selectedLicenseId) // Add this line
      );
      console.log("Content registered:", content);
      setShowSuccessAlert(true);
      // Reset form
      setTitle("");
      setContentType("");
      setIsCommercial(false);
      setPrice("");
      setFileName("");
      setCloudinaryUrl("");
      setContentHash("");
      setUploadProgress(0);
      setSelectedLicenseId(""); // Reset selected license
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (error) {
      console.error("Error registering content:", error);
      // Show error message to user
    } finally {
      setIsRegistering(false);
    }
  };

  const renderPreview = () => {
    if (!cloudinaryUrl) return null;

    switch (contentType) {
      case "image":
        return (
          <img
            src={cloudinaryUrl}
            alt="Preview"
            className="max-w-full h-auto"
          />
        );
      case "audio":
        return <audio controls src={cloudinaryUrl} className="w-full" />;
      case "video":
        return (
          <video controls src={cloudinaryUrl} className="max-w-full h-auto" />
        );
      case "text":
        return <iframe src={cloudinaryUrl} className="w-full h-64 border-0" />;
      default:
        return (
          <a
            href={cloudinaryUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-500 underline"
          >
            View file
          </a>
        );
    }
  };

  const handleArtistOnboardingComplete = () => {
    setIsArtistOnboarded(true);
    setShowArtistOnboarding(false);
  };

  return (
    <div className="w-full flex justify-start">
      <Card className="w-[70%] mt-6">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">
            {isArtistOnboarded ? "Register New Content" : "Artist Onboarding"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {!isArtistOnboarded ? (
            <>
              <p className="mb-4">
                Please complete the artist onboarding process to register
                content.
              </p>
              <Button
                type="button"
                className="w-full"
                onClick={() => setShowArtistOnboarding(true)}
              >
                Start Artist Onboarding
              </Button>
            </>
          ) : (
            <>
              {showSuccessAlert && (
                <Alert className="mb-4">
                  <AlertTitle>Success</AlertTitle>
                  <AlertDescription>
                    Content uploaded successfully!
                  </AlertDescription>
                </Alert>
              )}
              <form className="space-y-6" onSubmit={handleSubmit}>
                <div className="space-y-2">
                  <Label htmlFor="title">Content Title</Label>
                  <Input
                    id="title"
                    placeholder="Enter content title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="type">Content Type</Label>
                  <Select value={contentType} onValueChange={setContentType}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select content type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="image">Image</SelectItem>
                      <SelectItem value="audio">Audio</SelectItem>
                      <SelectItem value="video">Video</SelectItem>
                      <SelectItem value="text">Text</SelectItem>
                      <SelectItem value="3d">3D Model</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="usage">Usage Type</Label>
                  <Select
                    value={isCommercial ? "commercial" : "non-commercial"}
                    onValueChange={(value) =>
                      setIsCommercial(value === "commercial")
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select usage type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="commercial">Commercial</SelectItem>
                      <SelectItem value="non-commercial">
                        Non-Commercial
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="price">Price </Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    placeholder="Enter price"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="license">License</Label>
                  <Select
                    value={selectedLicenseId}
                    onValueChange={setSelectedLicenseId}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a license" />
                    </SelectTrigger>
                    <SelectContent>
                      {allLicenses.map((license) => (
                        <SelectItem
                          key={license.id}
                          value={license.id.toString()}
                        >
                          {license.type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="file">Upload File</Label>
                  <div className="flex items-center justify-center w-full">
                    <label
                      htmlFor="file-upload"
                      className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100"
                      onDragOver={handleDragOver}
                      onDrop={handleDrop}
                    >
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <Upload className="w-8 h-8 mb-3 text-gray-400" />
                        <p className="mb-2 text-sm text-gray-500">
                          <span className="font-semibold">Click to upload</span>{" "}
                          or drag and drop
                        </p>
                        <p className="text-xs text-gray-500">
                          Any file up to 10MB
                        </p>
                      </div>
                      <Input
                        id="file-upload"
                        type="file"
                        className="hidden"
                        onChange={handleFileChange}
                        ref={fileInputRef}
                      />
                    </label>
                  </div>
                  {fileName && (
                    <p className="mt-2 text-sm text-gray-500">
                      Selected file: {fileName}
                    </p>
                  )}
                </div>

                {isUploading && (
                  <div className="space-y-2">
                    <Progress value={uploadProgress} className="w-full" />
                    <p className="text-sm text-gray-500 text-center">
                      Uploading... {uploadProgress}%
                    </p>
                  </div>
                )}

                {uploadProgress === 100 && (
                  <div className="flex items-center justify-center text-green-500">
                    <Check className="w-5 h-5 mr-2" />
                    <span>Upload complete!</span>
                  </div>
                )}

                {cloudinaryUrl && (
                  <div className="mt-4">
                    <h3 className="text-lg font-semibold mb-2">Preview:</h3>
                    {renderPreview()}
                  </div>
                )}

                {contentHash && (
                  <div className="space-y-2">
                    <Label>Content Hash (SHA256)</Label>
                    <Input value={contentHash} readOnly />
                  </div>
                )}

                <Button
                  type="submit"
                  className="w-full"
                  disabled={
                    isUploading ||
                    !cloudinaryUrl ||
                    !contentHash ||
                    isRegistering
                  }
                >
                  {isRegistering ? (
                    <>
                      <LoaderCircle className="mr-2 animate-spin" />
                      Registering...
                    </>
                  ) : (
                    "Register Content"
                  )}
                </Button>
              </form>
            </>
          )}

          {showArtistOnboarding && (
            <ArtistOnboarding
              onClose={() => setShowArtistOnboarding(false)}
              onComplete={handleArtistOnboardingComplete}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
