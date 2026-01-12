"use client";
import { usePathname } from "next/navigation";
import { Navbar } from "./Nav";

export function ConditionalNavbar() {
  const pathname = usePathname();

  if (pathname.startsWith("/user") || pathname.startsWith("/admin")) {
    return null;
  }

  return <Navbar />;
}
