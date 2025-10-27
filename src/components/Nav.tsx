"use client";

import Link from "next/link";
import { useAuth } from "@/app/AuthProvider";
import { useRouter } from "next/navigation";

export function Navbar() {
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  return (
    <nav>
      <ul className="flex justify-end font-light text-[13px] md:text-sm md:font-extralight mt-2 mr-2 md:mt-10 md:mr-16">
        {!user && (
          <li className="p-2">
            <Link href="/user/signup">SIGN IN</Link>
          </li>
        )}
        {user && (user.role === "admin" || user.role === "superAdmin") && (
          <li className="p-2">
            <Link href="/admin">ADMIN PANEL</Link>
          </li>
        )}
        {user && (
          <li className="p-2 cursor-pointer" onClick={handleLogout}>
            LOG OUT
          </li>
        )}
        <li className="p-2">
          <Link href="/user/cart">CART</Link>
        </li>
      </ul>
      <div className="text-center mt-4 md:text-start md:pl-40">
        <Link href={"/"}>
          <h1 className="font-bold tracking-wider text-2xl antialiased md:text-3xl ">
            TEXTILECOM
          </h1>
        </Link>
      </div>
    </nav>
  );
}
