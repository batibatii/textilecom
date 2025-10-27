"use client";

import Link from "next/link";
import { useAuth } from "@/app/AuthProvider";
import { useRouter } from "next/navigation";

export function AdminNavbar() {
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  return (
    <nav className="flex flex-col gap-6 lg:gap-0">
      <ul className="flex flex-wrap lg:justify-end gap-1 font-light text-[11x] justify-center md:text-sm md:font-extralight mt-2  lg:mt-10 lg:mr-16">
        <li className="px-1.5 py-2 md:px-2">
          <Link href="/admin/products/new">ADD PRODUCT</Link>
        </li>
        <li className="px-1.5 py-2 md:px-2">
          <Link href="/admin">PRODUCTS</Link>
        </li>
        <li className="px-1.5 py-2 md:px-2">
          <Link href="/">DASHBOARD</Link>
        </li>
        <li className="px-1.5 py-2 md:px-2">
          <Link href="/">SETTINGS</Link>
        </li>
        {user && (
          <li
            className="px-1.5 py-2 md:px-2 cursor-pointer"
            onClick={handleLogout}
          >
            LOG OUT
          </li>
        )}
      </ul>
      <div className="text-center mt-4 lg:text-start lg:pl-20 xl:pl-40">
        <Link href={"/"}>
          <h1 className="font-bold tracking-wider text-2xl antialiased md:text-3xl ">
            TEXTILECOM
          </h1>
        </Link>
      </div>
    </nav>
  );
}
