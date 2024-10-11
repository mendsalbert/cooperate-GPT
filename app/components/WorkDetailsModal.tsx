import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import Image from "next/image";

interface Content {
  id: number;
  title: string;
  contentType: string;
  price: string;
  creatorName: string | null;
  ipfsUrl: string;
  description?: string;
  createdAt?: string;
}

interface WorkDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  content: Content;
}

const WorkDetailsModal: React.FC<WorkDetailsModalProps> = ({
  isOpen,
  onClose,
  content,
}) => {
  const renderContent = () => {
    switch (content.contentType.split("/")[0]) {
      case "image":
        return (
          <div className="relative w-full h-64">
            <Image
              src={content.ipfsUrl || `/fallback-image.jpg`}
              alt={content.title}
              layout="fill"
              objectFit="contain"
            />
          </div>
        );
      case "video":
        return (
          <video src={content.ipfsUrl} controls className="w-full max-h-64" />
        );
      case "audio":
        return <audio src={content.ipfsUrl} controls className="w-full" />;
      default:
        return <p>Preview not available</p>;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{content.title}</DialogTitle>
          <DialogDescription>
            By {content.creatorName || "Unknown Artist"}
          </DialogDescription>
        </DialogHeader>
        <div className="mt-4">{renderContent()}</div>
        <div className="mt-4">
          <p>
            <strong>Type:</strong> {content.contentType}
          </p>
          <p>
            <strong>Price:</strong> {content.price}
          </p>
          {content.description && (
            <p>
              <strong>Description:</strong> {content.description}
            </p>
          )}
          {content.createdAt && (
            <p>
              <strong>Created:</strong>{" "}
              {new Date(content.createdAt).toLocaleDateString()}
            </p>
          )}
        </div>
        <div className="mt-4 flex justify-end">
          <Button onClick={onClose}>Close</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default WorkDetailsModal;
