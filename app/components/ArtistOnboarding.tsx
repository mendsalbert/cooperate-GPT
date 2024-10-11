"use client";
import React, { useState } from "react";
import { usePrivy } from "@privy-io/react-auth";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { onboardArtist } from "@/utils/db/actions"; // We'll create this function next

interface ArtistOnboardingProps {
  onClose: () => void;
  onComplete: () => void;
}

export default function ArtistOnboarding({ onClose, onComplete }: ArtistOnboardingProps) {
  const { user } = usePrivy();
  const [name, setName] = useState("");
  const [artistBio, setArtistBio] = useState("");
  const [profileImage, setProfileImage] = useState("");
  const [website, setWebsite] = useState("");
  const [socialMedia, setSocialMedia] = useState({
    twitter: "",
    instagram: "",
    facebook: "",
  });
  const [artistType, setArtistType] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!user?.email) {
      console.error("User not authenticated or email not available");
      return;
    }

    setIsSubmitting(true);
    try {
      await onboardArtist(
        user.email.address,
        name,
        artistBio,
        profileImage,
        website,
        socialMedia,
        artistType
      );
      setShowSuccessAlert(true);
      setTimeout(() => {
        onClose();
        onComplete(); // Call this new function after successful onboarding
      }, 3000);
    } catch (error) {
      console.error("Error onboarding artist:", error);
      // Show error message to user
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form className="space-y-6" onSubmit={handleSubmit}>
      <h2 className="text-2xl font-bold">Artist Onboarding</h2>
      {showSuccessAlert && (
        <Alert className="mb-4">
          <AlertTitle>Success</AlertTitle>
          <AlertDescription>
            You have successfully onboarded as an artist!
          </AlertDescription>
        </Alert>
      )}
      <div className="space-y-2">
        <Label htmlFor="name">Name</Label>
        <Input
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="artistBio">Artist Bio</Label>
        <Textarea
          id="artistBio"
          value={artistBio}
          onChange={(e) => setArtistBio(e.target.value)}
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="profileImage">Profile Image URL</Label>
        <Input
          id="profileImage"
          value={profileImage}
          onChange={(e) => setProfileImage(e.target.value)}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="website">Website</Label>
        <Input
          id="website"
          value={website}
          onChange={(e) => setWebsite(e.target.value)}
        />
      </div>
      <div className="space-y-2">
        <Label>Social Media</Label>
        <Input
          placeholder="Twitter"
          value={socialMedia.twitter}
          onChange={(e) =>
            setSocialMedia({ ...socialMedia, twitter: e.target.value })
          }
        />
        <Input
          placeholder="Instagram"
          value={socialMedia.instagram}
          onChange={(e) =>
            setSocialMedia({ ...socialMedia, instagram: e.target.value })
          }
        />
        <Input
          placeholder="Facebook"
          value={socialMedia.facebook}
          onChange={(e) =>
            setSocialMedia({ ...socialMedia, facebook: e.target.value })
          }
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="artistType">Artist Type</Label>
        <Select value={artistType} onValueChange={setArtistType}>
          <SelectTrigger>
            <SelectValue placeholder="Select artist type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="visual">Visual Artist</SelectItem>
            <SelectItem value="musician">Musician</SelectItem>
            <SelectItem value="writer">Writer</SelectItem>
            <SelectItem value="photographer">Photographer</SelectItem>
            <SelectItem value="other">Other</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="flex justify-between">
        <Button type="button" variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Submitting..." : "Submit"}
        </Button>
      </div>
    </form>
  );
}
