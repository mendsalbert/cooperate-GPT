"use client";
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getAllContents } from "@/utils/db/actions";
import Image from "next/image";
import WorkDetailsModal from "@/app/components/WorkDetailsModal";

interface Content {
  id: number;
  title: string;
  contentType: string;
  price: string;
  creatorName: string | null;
  ipfsUrl: string;
}

export default function Works() {
  const [contents, setContents] = useState<Content[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedContent, setSelectedContent] = useState<Content | null>(null);
  const worksPerPage = 12;

  useEffect(() => {
    async function fetchContents() {
      try {
        const fetchedContents = await getAllContents();
        setContents(fetchedContents);
        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching contents:", error);
        setIsLoading(false);
      }
    }
    fetchContents();
  }, []);

  const filteredWorks = contents.filter(
    (content) =>
      content.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      content.creatorName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      content.contentType.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const indexOfLastWork = currentPage * worksPerPage;
  const indexOfFirstWork = indexOfLastWork - worksPerPage;
  const currentWorks = filteredWorks.slice(indexOfFirstWork, indexOfLastWork);

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  const renderContentPreview = (content: Content) => {
    switch (content.contentType.split("/")[0]) {
      case "image":
        return (
          <div className="relative w-full h-48">
            <Image
              src={content.ipfsUrl || `/fallback-image.jpg`}
              alt={content.title}
              layout="fill"
              objectFit="cover"
              className="rounded-t-lg"
            />
          </div>
        );
      case "video":
        return (
          <div className="relative w-full h-48">
            <video
              src={content.ipfsUrl}
              controls
              className="absolute inset-0 w-full h-full object-cover rounded-t-lg"
            />
          </div>
        );
      case "audio":
        return (
          <div className="w-full h-48 bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 rounded-t-lg flex items-center justify-center p-4">
            <audio src={content.ipfsUrl} controls className="w-full max-w-xs" />
          </div>
        );
      default:
        return (
          <div className="w-full h-48 flex items-center justify-center bg-gray-200 rounded-t-lg">
            <p className="text-gray-600">Preview not available</p>
          </div>
        );
    }
  };

  const handleViewDetails = (content: Content) => {
    setSelectedContent(content);
  };

  const closeModal = () => {
    setSelectedContent(null);
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto px-8 py-8">
      <h1 className="text-3xl font-bold mb-8">Works</h1>

      <div className="mb-6">
        <Input
          type="text"
          placeholder="Search works..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-md"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {currentWorks.map((content) => (
          <Card key={content.id} className="overflow-hidden">
            {renderContentPreview(content)}
            <CardHeader className="p-4">
              <CardTitle className="text-lg">{content.title}</CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <p className="text-sm text-gray-600">
                Artist: {content.creatorName || "Unknown"}
              </p>
              <p className="text-sm text-gray-600">
                Type: {content.contentType}
              </p>
              <p className="text-sm text-gray-600">Price: {content.price}</p>
            </CardContent>
            <CardFooter className="p-4 pt-0">
              <Button
                variant="outline"
                size="sm"
                className="w-full"
                onClick={() => handleViewDetails(content)}
              >
                View Details
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      {selectedContent && (
        <WorkDetailsModal
          isOpen={!!selectedContent}
          onClose={closeModal}
          content={selectedContent}
        />
      )}
    </div>
  );
}
