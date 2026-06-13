import Image from "next/image";

/** Mote bow logogram (~1.92:1). */
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
      className={className}
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
      className={className}
      unoptimized
      priority
    />
  );
}
