"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getAllArtists } from "@/utils/db/actions";

interface Artist {
  id: number;
  name: string;
  artistType: string;
  artistBio: string;
  profileImage: string;
  socialMedia?: {
    instagram?: string;
    twitter?: string;
  };
}

export default function ArtistsPage() {
  const [artists, setArtists] = useState<Artist[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const artistsPerPage = 12;

  useEffect(() => {
    async function fetchArtists() {
      try {
        const fetchedArtists = await getAllArtists();
        // Filter out duplicate artists based on their name and bio
        const uniqueArtists = Array.from(
          new Map(
            fetchedArtists.map((artist) => [
              `${artist.name}-${artist.artistBio}`,
              artist,
            ])
          ).values()
        );
        setArtists(uniqueArtists);
        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching artists:", error);
        setIsLoading(false);
      }
    }
    fetchArtists();
  }, []);

  const filteredArtists = artists.filter(
    (artist) =>
      artist.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      artist.artistType.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const indexOfLastArtist = currentPage * artistsPerPage;
  const indexOfFirstArtist = indexOfLastArtist - artistsPerPage;
  const currentArtists = filteredArtists.slice(
    indexOfFirstArtist,
    indexOfLastArtist
  );

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto px-8 py-8">
      <h1 className="text-3xl font-bold mb-8">Our Talented Artists</h1>

      <div className="mb-6">
        <Input
          type="text"
          placeholder="Search artists..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-md"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {currentArtists.map((artist) => (
          <Card key={artist.id} className="overflow-hidden">
            <div className="relative h-48 w-full">
              <Image
                src={
                  artist.profileImage ||
                  `https://picsum.photos/seed/${artist.id}/400/300`
                }
                alt={artist.name}
                layout="fill"
                objectFit="cover"
                className="rounded-t-lg"
              />
            </div>
            <CardHeader className="p-4">
              <CardTitle className="text-lg">{artist.name}</CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <p className="text-sm text-gray-600">Type: {artist.artistType}</p>
              <p className="text-sm text-gray-600 line-clamp-2">
                {artist.artistBio}
              </p>
            </CardContent>
            <CardFooter className="p-4 pt-0 flex justify-between">
              {artist.socialMedia?.instagram && (
                <a
                  href={`https://instagram.com/${artist.socialMedia.instagram}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-pink-500 hover:text-pink-600"
                >
                  Instagram
                </a>
              )}
              {artist.socialMedia?.twitter && (
                <a
                  href={`https://twitter.com/${artist.socialMedia.twitter}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-400 hover:text-blue-500"
                >
                  Twitter
                </a>
              )}
              <Link href={`/artists/${artist.id}`}>
                <Button variant="outline" size="sm">
                  View Profile
                </Button>
              </Link>
            </CardFooter>
          </Card>
        ))}
      </div>

      {/* Add pagination here if needed */}
    </div>
  );
}
