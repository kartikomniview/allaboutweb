"use client";

import { useEffect, useState } from "react";

export default function RotatingWords({
  words,
  interval = 2200,
  className = "",
}: {
  words: string[];
  interval?: number;
  className?: string;
}) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setIndex((i) => (i + 1) % words.length);
    }, interval);
    return () => clearInterval(id);
  }, [words.length, interval]);

  const longest = words.reduce((a, b) => (b.length > a.length ? b : a), "");

  return (
    <span
      aria-hidden="true"
      className={`relative block overflow-hidden ${className}`}
    >
      <span className="invisible">{longest}</span>
      <span
        key={index}
        className="animate-rotate-word absolute inset-0 text-primary"
      >
        {words[index]}
      </span>
    </span>
  );
}
