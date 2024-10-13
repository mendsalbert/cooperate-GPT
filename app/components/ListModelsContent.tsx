import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import axios from "axios";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, Edit, Trash2 } from "lucide-react";
import { IconBrandGoogleFilled, IconBrandOpenai } from "@tabler/icons-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";

interface Model {
  _id: string;
  name: string;
  provider: string;
  apiKey: string;
  createdAt: string;
}

const ListModelsContent = () => {
  const [models, setModels] = useState<Model[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState("");
  const [editingModel, setEditingModel] = useState<Model | null>(null);
  const { data: session } = useSession() as any;

  useEffect(() => {
    fetchModels();
  }, [session]);

  const fetchModels = async () => {
    if (!session?.accessToken) return;

    try {
      const response = await axios.get("/api/models", {
        headers: {
          Authorization: `Bearer ${session.accessToken}`,
        },
      });
      setModels(response.data);
      setIsLoading(false);
    } catch (err) {
      setError("Failed to fetch models");
      console.error("Error fetching models:", err);
      setIsLoading(false);
    }
  };

  const handleEdit = async (model: Model) => {
    setEditingModel(model);
  };

  const handleUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editingModel) return;

    setIsUpdating(true);
    try {
      await axios.put(
        `/api/models?id=${editingModel._id}`,
        {
          name: editingModel.name,
          provider: editingModel.provider,
          apiKey: editingModel.apiKey,
        },
        {
          headers: {
            Authorization: `Bearer ${session.accessToken}`,
          },
        }
      );
      setEditingModel(null);
      fetchModels();
      toast({
        title: "Success",
        description: "Model updated successfully",
      });
    } catch (err) {
      console.error("Error updating model:", err);
      toast({
        title: "Error",
        description: "Failed to update model",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await axios.delete(`/api/models?id=${id}`, {
        headers: {
          Authorization: `Bearer ${session.accessToken}`,
        },
      });
      fetchModels();
      toast({
        title: "Success",
        description: "Model deleted successfully",
      });
    } catch (err) {
      console.error("Error deleting model:", err);
      toast({
        title: "Error",
        description: "Failed to delete model",
        variant: "destructive",
      });
    }
  };

  const getProviderIcon = (provider: string) => {
    switch (provider) {
      case "OpenAI":
        return <IconBrandOpenai className="w-6 h-6 text-green-500" />;
      case "Gemini":
        return <IconBrandGoogleFilled className="w-6 h-6 text-blue-500" />;
      case "Claude":
        return <IconBrandOpenai className="w-6 h-6 text-purple-500" />;
      default:
        return null;
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  if (error) {
    return <div className="text-red-500 text-center">{error}</div>;
  }

  if (models.length === 0) {
    return (
      <div className="text-center">
        No models found. Create a new model to get started!
      </div>
    );
  }

  return (
    <div className="grid gap-6 mt-4 md:grid-cols-2 lg:grid-cols-3">
      {models.map((model) => (
        <Card key={model._id} className="overflow-hidden">
          <CardHeader className="bg-gray-100 flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{model.name}</CardTitle>
            {getProviderIcon(model.provider)}
          </CardHeader>
          <CardContent className="pt-4">
            <p className="text-xs text-gray-500 mb-2">
              Created: {new Date(model.createdAt).toLocaleDateString()}
            </p>
            <div className="flex justify-between mt-4">
              <Dialog>
                <DialogTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(model)}
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    Edit
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Edit Model</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleUpdate} className="space-y-4">
                    <div>
                      <Label htmlFor="name">Name</Label>
                      <Input
                        id="name"
                        value={editingModel?.name || ""}
                        onChange={(e) =>
                          setEditingModel((prev) =>
                            prev ? { ...prev, name: e.target.value } : null
                          )
                        }
                      />
                    </div>
                    <div>
                      <Label htmlFor="provider">Provider</Label>
                      <Input
                        id="provider"
                        value={editingModel?.provider || ""}
                        onChange={(e) =>
                          setEditingModel((prev) =>
                            prev ? { ...prev, provider: e.target.value } : null
                          )
                        }
                      />
                    </div>
                    <div>
                      <Label htmlFor="apiKey">API Key</Label>
                      <Input
                        id="apiKey"
                        type="password"
                        value={editingModel?.apiKey || ""}
                        onChange={(e) =>
                          setEditingModel((prev) =>
                            prev ? { ...prev, apiKey: e.target.value } : null
                          )
                        }
                      />
                    </div>
                    <Button type="submit" disabled={isUpdating}>
                      {isUpdating ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Updating...
                        </>
                      ) : (
                        "Update Model"
                      )}
                    </Button>
                  </form>
                </DialogContent>
              </Dialog>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => handleDelete(model._id)}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default ListModelsContent;
