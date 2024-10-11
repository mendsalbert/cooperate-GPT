import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Image,
  Music,
  FileText,
  Video,
  Box,
  Edit,
  Check,
  X,
} from "lucide-react";
import {
  getUserContents,
  updateContent,
  getLicensesByContentId,
  getAllLicenses,
  getUserContents_,
} from "@/utils/db/actions";
import { usePrivy } from "@privy-io/react-auth";

const getTypeIcon = (type: string) => {
  switch (type) {
    case "Image":
      return <Image className="w-5 h-5" />;
    case "Audio":
      return <Music className="w-5 h-5" />;
    case "Text":
      return <FileText className="w-5 h-5" />;
    case "Video":
      return <Video className="w-5 h-5" />;
    case "3D":
      return <Box className="w-5 h-5" />;
    default:
      return null;
  }
};

export default function ContentsContent() {
  const [contents, setContents] = useState<any[]>([]);
  const [editingContent, setEditingContent] = useState<any | null>(null);
  const { user } = usePrivy() as any;
  const [contentLicenses, setContentLicenses] = useState<{
    [key: number]: any[];
  }>({});
  const [allLicenses, setAllLicenses] = useState<any[]>([]);

  useEffect(() => {
    if (user?.email?.address) {
      // fetchUserContents();
      const fetchUsers = async () => {
        let userContents = await getUserContents_(user.email.address);
        setContents(userContents);

        // Fetch licenses for each content
        const licensesPromises = userContents.map((content) =>
          getLicensesByContentId(content.id)
        );
        const licensesResults = await Promise.all(licensesPromises);

        const contentLicensesMap = userContents.reduce(
          (acc, content, index) => {
            acc[content.id] = licensesResults[index];
            return acc;
          },
          {} as { [key: number]: any[] }
        );

        setContentLicenses(contentLicensesMap);
      };
      fetchUsers();
      fetchAllLicenses();
    }
  }, [user]);

  const fetchUserContents = async () => {
    try {
      if (!user?.email?.address) {
        console.error("User email is not available");
        return;
      }
      const userContents = await getUserContents(user.email.address);
      console.log("userContents", user.email.address);

      setContents(userContents);

      // Fetch licenses for each content
      const licensesPromises = userContents.map((content) =>
        getLicensesByContentId(content.id)
      );
      const licensesResults = await Promise.all(licensesPromises);

      const contentLicensesMap = userContents.reduce((acc, content, index) => {
        acc[content.id] = licensesResults[index];
        return acc;
      }, {} as { [key: number]: any[] });

      setContentLicenses(contentLicensesMap);
    } catch (error) {
      console.error("Error fetching user contents:", error);
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

  const handleEdit = (content: any) => {
    setEditingContent({ ...content });
  };

  const handleCancelEdit = () => {
    setEditingContent(null);
  };

  const handleSaveEdit = async () => {
    if (!editingContent) return;
    try {
      const updatedContent = await updateContent(editingContent.id, {
        title: editingContent.title,
        price: editingContent.price.toString(),
        licenseId: parseInt(editingContent.licenseId), // Change licenseType to licenseId
      });
      setContents(
        contents.map((c) => (c.id === updatedContent.id ? updatedContent : c))
      );
      setEditingContent(null);
    } catch (error) {
      console.error("Error updating content:", error);
    }
  };

  const renderPreview = (content: any) => {
    switch (content.contentType) {
      case "image":
        return (
          <img
            src={content.ipfsUrl}
            alt={content.title}
            className="w-32 h-32 object-cover rounded-md"
          />
        );
      case "audio":
        return (
          <audio controls src={content.ipfsUrl} className="w-32 rounded-md" />
        );
      case "video":
        return (
          <video
            controls
            src={content.ipfsUrl}
            className="w-32 h-32 object-cover rounded-md"
          />
        );
      case "text":
        return <FileText className="w-32 h-32 p-2 bg-gray-100 rounded-md" />;
      default:
        return null;
    }
  };

  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle>Your Content</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Preview</TableHead>
              <TableHead>Title</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>License</TableHead>
              <TableHead>Price </TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {contents.map((content) => (
              <TableRow key={content.id}>
                <TableCell className="p-4">{renderPreview(content)}</TableCell>
                <TableCell>
                  {editingContent?.id === content.id ? (
                    <Input
                      value={editingContent.title}
                      onChange={(e) =>
                        setEditingContent({
                          ...editingContent,
                          title: e.target.value,
                        })
                      }
                    />
                  ) : (
                    content.title
                  )}
                </TableCell>
                <TableCell>
                  <Badge variant="secondary">{content.contentType}</Badge>
                </TableCell>
                <TableCell>
                  {editingContent?.id === content.id ? (
                    <Select
                      value={
                        editingContent.licenseId
                          ? editingContent.licenseId.toString()
                          : ""
                      }
                      onValueChange={(value) =>
                        setEditingContent({
                          ...editingContent,
                          licenseId: parseInt(value),
                        })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {allLicenses.map((license) => (
                          <SelectItem
                            key={license.id}
                            value={license.id.toString()}
                          >
                            {license.type} - {license.price} ETH
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <div>
                      <div>
                        {allLicenses.find(
                          (license) => license.id === content.licenseId
                        )?.type || "N/A"}
                      </div>
                      {contentLicenses[content.id] &&
                        contentLicenses[content.id].length > 0 && (
                          <div className="text-sm text-gray-500 mt-1">
                            Additional Licenses:
                            <ul className="list-disc pl-4">
                              {contentLicenses[content.id].map((license) => (
                                <li key={license.id}>
                                  {license.type} - {license.price} ETH
                                  <span className="text-xs ml-1">
                                    ({license.details})
                                  </span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                    </div>
                  )}
                </TableCell>
                <TableCell>
                  {editingContent?.id === content.id ? (
                    <Input
                      type="number"
                      step="0.01"
                      value={editingContent.price}
                      onChange={(e) =>
                        setEditingContent({
                          ...editingContent,
                          price: e.target.value,
                        })
                      }
                    />
                  ) : (
                    content.price || "N/A"
                  )}
                </TableCell>
                <TableCell>
                  {editingContent?.id === content.id ? (
                    <>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleSaveEdit}
                      >
                        <Check className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleCancelEdit}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </>
                  ) : (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(content)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
