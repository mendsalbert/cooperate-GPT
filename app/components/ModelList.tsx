import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import axios from "axios";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface Model {
  id: string;
  name: string;
  provider: string;
  createdAt: string;
}

const ModelList = () => {
  const [models, setModels] = useState<Model[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const { data: session } = useSession() as any;

  useEffect(() => {
    const fetchModels = async () => {
      if (!session?.accessToken) return;

      try {
        const response = await axios.get("/api/models", {
          headers: {
            Authorization: `Bearer ${session.accessToken}`,
          },
        });
        setModels(response.data);
      } catch (err) {
        setError("Failed to fetch models");
        console.error("Error fetching models:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchModels();
  }, [session]);

  if (isLoading) return <div>Loading models...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {models.map((model) => (
        <Card key={model.id}>
          <CardHeader>
            <CardTitle>{model.name}</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Provider: {model.provider}</p>
            <p>Created: {new Date(model.createdAt).toLocaleDateString()}</p>
            <div className="mt-4 space-x-2">
              <Button variant="outline" size="sm">
                Edit
              </Button>
              <Button variant="destructive" size="sm">
                Delete
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default ModelList;
