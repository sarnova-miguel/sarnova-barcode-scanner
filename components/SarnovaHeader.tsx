"use client";

import Image from "next/image";
import { useIsMobile } from "@/hooks/useMobile";
import SarnovaNav from "./SarnovaNav";
import Link from "next/link";

const SarnovaHeader = () => {
  const isMobile = useIsMobile();
  const imageWidth = isMobile ? 150 : 200;

  return (
    <header
      className="p-4 flex flex-col md:flex-row gap-4 items-center md:justify-between"
      role="banner"
    >
      {/* Skip navigation link for keyboard users - WCAG 2.4.1 */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-white focus:text-black focus:border focus:border-gray-300 focus:rounded-md focus:shadow-lg"
      >
        Skip to main content
      </a>

      <Link href="/" aria-label="Sarnova - Go to homepage">
        <Image
          src="https://www.sarnova.com/uploads/1/3/4/2/134270794/sarnova-logo2.png"
          alt="Sarnova company logo"
          width={imageWidth}
          height={imageWidth}
          priority
        />
      </Link>

      <div className="hidden md:block">
        <SarnovaNav />
      </div>
    </header>
  );
};

export default SarnovaHeader;
