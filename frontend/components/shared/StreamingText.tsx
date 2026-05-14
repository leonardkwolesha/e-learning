"use client";
import { useEffect, useState } from "react";

interface Props {
  text: string;
  speed?: number;
  onDone?: () => void;
}

export default function StreamingText({ text, speed = 15, onDone }: Props) {
  const [displayed, setDisplayed] = useState("");

  useEffect(() => {
    setDisplayed("");
    let i = 0;
    const timer = setInterval(() => {
      if (i < text.length) {
        setDisplayed(text.slice(0, i + 1));
        i++;
      } else {
        clearInterval(timer);
        onDone?.();
      }
    }, speed);
    return () => clearInterval(timer);
  }, [text, speed, onDone]);

  return (
    <span>
      {displayed}
      {displayed.length < text.length && (
        <span className="cursor-blink ml-0.5 inline-block w-0.5 h-4 bg-purple-400 align-text-bottom" />
      )}
    </span>
  );
}
