import Image from "next/image";
import { cn } from "@/lib/utils";

/** Mote bow logogram (~1.92:1). Pure-black art → inverts to white in dark mode. */
export function LogoMark({
  height = 20,
  white = false,
  className,
}: {
  height?: number;
  white?: boolean;
  className?: string;
}) {
  return (
    <Image
      src={white ? "/brand/logogram-white.png" : "/brand/logogram-black.png"}
      alt="Mote"
      width={Math.round(height * 1.92)}
      height={height}
      className={cn(!white && "dark:invert", className)}
      unoptimized
      priority
    />
  );
}

/** MOTE wordmark (~3.65:1). */
export function Wordmark({
  height = 28,
  white = false,
  className,
}: {
  height?: number;
  white?: boolean;
  className?: string;
}) {
  return (
    <Image
      src={white ? "/brand/logogram-white.png" : "/brand/wordmark-black.png"}
      alt="MOTE"
      width={Math.round(height * 3.65)}
      height={height}
      className={cn(!white && "dark:invert", className)}
      unoptimized
      priority
    />
  );
}
