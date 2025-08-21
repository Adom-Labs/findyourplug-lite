import Link from "next/link";
import Image from "next/image";

interface LogoProps {
  className?: string;
  height?: number;
}

export function Logo({ className, height = 28 }: LogoProps) {
  return (
    <Link href="/" className={className} aria-label="Home">
      <Image
        src="https://digemart.com/logo.png"
        alt="Digemart"
        width={height * 4}
        height={height}
        priority
        unoptimized
      />
    </Link>
  );
}


