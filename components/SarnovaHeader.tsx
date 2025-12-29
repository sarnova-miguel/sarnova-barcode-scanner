"use client";

import Image from "next/image";
import { useIsMobile } from "@/hooks/useMobile";
import SarnovaNav from "./SarnovaNav";

const SarnovaHeader = () => {
  const isMobile = useIsMobile();
  const imageWidth = isMobile ? 150 : 200;

  return (
    <header className="p-4 flex flex-col md:flex-row gap-4 items-center md:justify-between">
      <Image
        src="https://www.sarnova.com/uploads/1/3/4/2/134270794/sarnova-logo2.png"
        alt="Sarnova Logo"
        width={imageWidth}
        height={imageWidth}
      />

      <div className="hidden md:block">
        <SarnovaNav />
      </div>
    </header>
  );
};

export default SarnovaHeader;
