import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export default function RegisterPage() {
  return (
    <div className="container mx-auto px-4 py-16">
      <h1 className="text-3xl font-bold mb-6">Register Content</h1>
      <form className="space-y-4 max-w-md">
        <div>
          <label htmlFor="title" className="block mb-2">
            Title
          </label>
          <Input id="title" placeholder="Enter content title" />
        </div>
        <div>
          <label htmlFor="description" className="block mb-2">
            Description
          </label>
          <Textarea id="description" placeholder="Enter content description" />
        </div>
        <div>
          <label htmlFor="file" className="block mb-2">
            Upload File
          </label>
          <Input id="file" type="file" />
        </div>
        <Button type="submit">Register Content</Button>
      </form>
    </div>
  );
}
