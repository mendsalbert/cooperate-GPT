"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getArtistById, getArtistWorks } from "@/utils/db/actions";
import SocialMediaLinks from "@/app/components/SocialMediaLinks";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import WorkDetailsModal from "@/app/components/WorkDetailsModal";

interface Artist {
  id: number;
  name: string;
  artistType: string | null;
  artistBio: string | null;
  profileImage: string | null;
  socialMedia?: {
    instagram?: string;
    twitter?: string;
  };
}

interface Work {
  id: number;
  title: string;
  contentType: string;
  price: string;
  ipfsUrl: string | null;
  creatorName: string; // Add this field
}

export default function ArtistPage({ params }: { params: { id: string } }) {
  const [artist, setArtist] = useState<Artist | null>(null);
  const [works, setWorks] = useState<Work[]>([]);
  const [selectedWork, setSelectedWork] = useState<Work | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const artistData = await getArtistById(parseInt(params.id));
        const worksData = await getArtistWorks(parseInt(params.id));
        setArtist(artistData as Artist); // Type assertion
        setWorks(
          worksData.map((work) => ({
            ...work,
            creatorName: artistData.name,
          })) as Work[]
        ); // Add creatorName and type assertion
        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching data:", error);
        setIsLoading(false);
      }
    }
    fetchData();
  }, [params.id]);

  const renderContent = (work: Work) => {
    switch (work.contentType.split("/")[0]) {
      case "image":
        return (
          <div className="relative w-full h-48">
            <Image
              src={
                work.ipfsUrl || `https://picsum.photos/seed/${work.id}/400/300`
              }
              alt={work.title}
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
              src={work.ipfsUrl}
              controls
              className="absolute inset-0 w-full h-full object-cover rounded-t-lg"
            />
          </div>
        );
      case "audio":
        return (
          <div className="w-full h-48 bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 rounded-t-lg flex items-center justify-center p-4">
            <audio src={work.ipfsUrl} controls className="w-full max-w-xs" />
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

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!artist) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100">
        <div className="text-center p-8 bg-white shadow-lg rounded-lg">
          <h2 className="text-3xl font-bold text-gray-800 mb-4">
            Artist Not Found
          </h2>
          <p className="text-gray-600 mb-6">
            We couldn't find the artist you're looking for.
          </p>
          <Link
            href="/artists"
            className="text-indigo-600 hover:text-indigo-800 font-medium"
          >
            Return to Artists
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-8 py-8">
      <Link
        href="/artists"
        className="inline-flex items-center text-indigo-600 hover:text-indigo-800 mb-8 transition duration-300"
      >
        <ArrowLeft className="mr-2" size={20} />
        Back to Artists
      </Link>

      <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-12">
        <div className="md:flex p-8">
          <div className="md:flex-shrink-0 relative w-32 h-32 md:w-48 md:h-48 rounded-full overflow-hidden border-4 border-white shadow-lg">
            <Image
              src={
                artist.profileImage ||
                `https://picsum.photos/seed/${artist.id}/400/400`
              }
              alt={artist.name}
              layout="fill"
              objectFit="cover"
            />
          </div>
          <div className="mt-4 md:mt-0 md:ml-6 flex-grow">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              {artist.name}
            </h1>
            <p className="text-xl text-indigo-600 mb-4">
              {artist.artistType || "Unknown"}
            </p>
            <p className="text-gray-700 mb-6 leading-relaxed">
              {artist.artistBio || "No bio available"}
            </p>
            {artist.socialMedia && (
              <SocialMediaLinks socialMedia={artist.socialMedia} />
            )}
          </div>
        </div>
      </div>

      <h2 className="text-2xl font-bold text-gray-900 mb-4">Featured Works</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {works.map((work) => (
          <Card key={work.id} className="overflow-hidden">
            {renderContent(work)}
            <CardHeader className="p-4">
              <CardTitle className="text-lg">{work.title}</CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <p className="text-sm text-gray-600">Type: {work.contentType}</p>
              <p className="text-sm text-gray-600">Price: {work.price}</p>
            </CardContent>
            <CardFooter className="p-4 pt-0">
              <Button
                variant="outline"
                size="sm"
                className="w-full"
                onClick={() => setSelectedWork(work)}
              >
                View Details
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      {selectedWork && (
        <WorkDetailsModal
          isOpen={!!selectedWork}
          onClose={() => setSelectedWork(null)}
          content={selectedWork}
        />
      )}
    </div>
  );
}
