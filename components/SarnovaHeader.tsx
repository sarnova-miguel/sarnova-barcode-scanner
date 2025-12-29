"use client";

import Image from "next/image";
import { useIsMobile } from "@/hooks/useMobile";
import SarnovaNav from "./SarnovaNav";

const SarnovaHeader = () => {
  const isMobile = useIsMobile();
  const imageWidth = isMobile ? 150 : 200;

  return (
    <header className="p-4 flex flex-col-reverse md:flex-row gap-4 items-center md:justify-between">
      <div>
        <h1 className="text-xl md:text-2xl text-center md:text-left mb-2">
          Sarnova Barcode Scanner
        </h1>
        <div className="hidden md:block">
          <SarnovaNav />
        </div>
      </div>

      <Image
        src="https://www.sarnova.com/uploads/1/3/4/2/134270794/sarnova-logo2.png"
        alt="Sarnova Logo"
        width={imageWidth}
        height={imageWidth}
      />
    </header>
  );
};

export default SarnovaHeader;
