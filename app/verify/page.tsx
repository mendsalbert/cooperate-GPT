import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function VerifyPage() {
  return (
    <div className="container mx-auto px-4 py-16">
      <h1 className="text-3xl font-bold mb-6">Verify Content</h1>
      <form className="space-y-4 max-w-md">
        <div>
          <label htmlFor="contentHash" className="block mb-2">
            Content Hash
          </label>
          <Input id="contentHash" placeholder="Enter content hash" />
        </div>
        <Button type="submit">Verify Content</Button>
      </form>
    </div>
  );
}
