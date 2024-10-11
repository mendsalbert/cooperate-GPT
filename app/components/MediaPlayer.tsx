"use client";

import { useState } from "react";
import Image from "next/image";
import { Play, X } from "lucide-react";

interface MediaPlayerProps {
  work: {
    id: number;
    title: string;
    ipfsUrl: string;
    contentType: string;
  };
}

export default function MediaPlayer({ work }: MediaPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);

  const handlePlay = () => setIsPlaying(true);
  const handleClose = () => setIsPlaying(false);

  const renderThumbnail = () => (
    <div className="relative w-full h-full group" onClick={handlePlay}>
      <Image
        src={`https://picsum.photos/seed/${work.id}/300/200`}
        alt={work.title}
        layout="fill"
        objectFit="cover"
        className="transition-all duration-300 group-hover:scale-110"
      />
      <div className="absolute inset-0 flex items-center justify-center">
        <Play className="w-12 h-12 text-white opacity-80 group-hover:opacity-100 transition-opacity duration-300" />
      </div>
    </div>
  );

  const renderPlayer = () => (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
      <div className="relative bg-white p-4 rounded-lg max-w-3xl w-full">
        <button
          onClick={handleClose}
          className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
        >
          <X size={24} />
        </button>
        <h3 className="text-xl font-semibold mb-4">{work.title}</h3>
        {work.contentType === "video" && (
          <video src={work.ipfsUrl} controls className="w-full" />
        )}
        {work.contentType === "audio" && (
          <audio src={work.ipfsUrl} controls className="w-full" />
        )}
      </div>
    </div>
  );

  return (
    <>
      {renderThumbnail()}
      {isPlaying && renderPlayer()}
    </>
  );
}
