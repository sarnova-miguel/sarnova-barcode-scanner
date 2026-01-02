'use client';

import { Heart, ScanBarcode, ShoppingCart, User } from "lucide-react";
import Link from "next/link";
import React, { useState, useCallback } from "react";

interface NavItem {
  href: string;
  label: string;
  icon: React.ReactNode;
}

const SarnovaNav = () => {
  const [activeLink, setActiveLink] = useState("/");

  const navItems: NavItem[] = [
    {
      href: "/",
      label: "Scan",
      icon: <ScanBarcode aria-hidden="true" />,
    },
    {
      href: "/cart",
      label: "Cart",
      icon: <ShoppingCart aria-hidden="true" />,
    },
    {
      href: "/saved",
      label: "Saved",
      icon: <Heart aria-hidden="true" />,
    },
    {
      href: "/profile",
      label: "Profile",
      icon: <User aria-hidden="true" />,
    },
  ];

  // Handle keyboard navigation within the nav
  const handleKeyDown = useCallback((event: React.KeyboardEvent<HTMLUListElement>) => {
    const list = event.currentTarget;
    const links = Array.from(list.querySelectorAll('a'));
    const currentIndex = links.findIndex(link => link === document.activeElement);

    if (currentIndex === -1) return;

    let nextIndex: number | null = null;

    switch (event.key) {
      case 'ArrowRight':
      case 'ArrowDown':
        event.preventDefault();
        nextIndex = (currentIndex + 1) % links.length;
        break;
      case 'ArrowLeft':
      case 'ArrowUp':
        event.preventDefault();
        nextIndex = (currentIndex - 1 + links.length) % links.length;
        break;
      case 'Home':
        event.preventDefault();
        nextIndex = 0;
        break;
      case 'End':
        event.preventDefault();
        nextIndex = links.length - 1;
        break;
    }

    if (nextIndex !== null) {
      links[nextIndex].focus();
    }
  }, []);

  return (
    <nav
      className="w-full border-t border-gray-200 md:border-0"
      role="navigation"
      aria-label="Main navigation"
    >
      <ul
        className="w-full py-4 px-4 sm:px-6 md:px-0 flex justify-between md:gap-2"
        role="menubar"
        aria-label="Site pages"
        onKeyDown={handleKeyDown}
      >
        {navItems.map((item) => {
          const isActive = activeLink === item.href;
          return (
            <li key={item.href} role="none">
              <Link
                href={item.href}
                className={`nav-link ${isActive ? "active" : ""}`}
                onClick={() => setActiveLink(item.href)}
                role="menuitem"
                aria-current={isActive ? "page" : undefined}
                aria-label={`${item.label}${isActive ? " - current page" : ""}`}
              >
                {item.icon}
                <span>{item.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
};

export default SarnovaNav;
