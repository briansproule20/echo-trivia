"use client";

import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { Compass } from "lucide-react";
import Link from "next/link";

export default function NotFound() {
  const [isSpinning, setIsSpinning] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  const handleCompassClick = () => {
    setIsSpinning(true);
    audioRef.current?.play();
    setTimeout(() => setIsSpinning(false), 3000);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-6 px-4">
      <h1 className="text-6xl font-bold text-foreground">404</h1>
      <p className="text-xl text-muted-foreground">Not Found</p>

      <motion.button
        onClick={handleCompassClick}
        animate={isSpinning ? { rotate: 1080 } : { rotate: 0 }}
        transition={{ duration: 3, ease: "easeInOut" }}
        className="mt-4 p-4 rounded-full hover:bg-accent transition-colors cursor-pointer"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
      >
        <Compass className="h-12 w-12 text-muted-foreground" />
      </motion.button>

      <audio ref={audioRef} src="/skyrim-i-used-to-be-an-adventure-like-you.mp3" />

      <Link
        href="/"
        className="mt-8 text-sm text-primary hover:underline"
      >
        Back to home
      </Link>
    </div>
  );
}
