'use client';

import { Heart, ScanBarcode, ShoppingCart, User } from "lucide-react";
import Link from "next/link";
import React, { useState } from "react";

const SarnovaNav = () => {
  const [activeLink, setActiveLink] = useState("/");

  return (
    <nav className="w-full">
      <ul className="w-full py-4 px-4 sm:px-6 md:px-0 flex justify-between md:gap-2">
        <li>
          <Link
            href="/"
            className={`nav-link ${activeLink === "/" ? "active" : ""}`}
            onClick={() => setActiveLink("/")}
          >
            <ScanBarcode />
            Scan
          </Link>
        </li>
        <li>
          <Link
            href="/cart"
            className={`nav-link ${activeLink === "/cart" ? "active" : ""}`}
            onClick={() => setActiveLink("/cart")}
          >
            <ShoppingCart />
            Cart
          </Link>
        </li>
        <li>
          <Link
            href="/saved"
            className={`nav-link ${activeLink === "/saved" ? "active" : ""}`}
            onClick={() => setActiveLink("/saved")}
          >
            <Heart />
            Saved
          </Link>
        </li>
        <li>
          <Link
            href="/profile"
            className={`nav-link ${activeLink === "/profile" ? "active" : ""}`}
            onClick={() => setActiveLink("/profile")}
          >
            <User />
            Profile
          </Link>
        </li>
      </ul>
    </nav>
  );
};

export default SarnovaNav;
