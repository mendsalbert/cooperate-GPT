"use client";

import { Instagram, Twitter } from "lucide-react";

interface SocialMediaProps {
  socialMedia: {
    instagram?: string;
    twitter?: string;
  };
}

export default function SocialMediaLinks({ socialMedia }: SocialMediaProps) {
  return (
    <div className="flex space-x-4">
      <a
        href={
          socialMedia?.instagram
            ? `https://instagram.com/${socialMedia.instagram}`
            : "#"
        }
        target="_blank"
        rel="noopener noreferrer"
        className={`text-pink-500 hover:text-pink-600 transition-colors duration-300 ${
          !socialMedia?.instagram && "cursor-not-allowed opacity-50"
        }`}
        onClick={(e) => !socialMedia?.instagram && e.preventDefault()}
      >
        <Instagram size={24} />
      </a>
      <a
        href={
          socialMedia?.twitter
            ? `https://twitter.com/${socialMedia.twitter}`
            : "#"
        }
        target="_blank"
        rel="noopener noreferrer"
        className={`text-blue-400 hover:text-blue-500 transition-colors duration-300 ${
          !socialMedia?.twitter && "cursor-not-allowed opacity-50"
        }`}
        onClick={(e) => !socialMedia?.twitter && e.preventDefault()}
      >
        <Twitter size={24} />
      </a>
    </div>
  );
}
