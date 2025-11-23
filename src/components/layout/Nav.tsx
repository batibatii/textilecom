"use client";

import React from "react";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { useCart } from "@/contexts/CartContext";
import { useRouter } from "next/navigation";
import { H1 } from "@/components/ui/headings";

export const Navbar = React.memo(function Navbar() {
  const { user, logout } = useAuth();
  const { getItemCount } = useCart();
  const router = useRouter();
  const cartCount = getItemCount();

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  return (
    <nav>
      <ul className="flex justify-center md:justify-end font-light text-[13px] md:text-sm md:font-extralight mt-2 mr-2 md:mt-10 md:mr-16">
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
          <li className="p-2">
            <Link href="/profile">PROFILE</Link>
          </li>
        )}
        <li className="p-2 relative">
          <Link href="/cart">
            CART
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-black text-white text-[10px] font-bold rounded-full h-5 w-5 flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </Link>
        </li>
        {user && (
          <li className="p-2 cursor-pointer" onClick={handleLogout}>
            LOG OUT
          </li>
        )}
      </ul>
      <div className="text-center mt-4 md:text-start md:pl-40">
        <Link href={"/"}>
          <H1 className="tracking-wider text-2xl md:text-3xl">TEXTILECOM</H1>
        </Link>
      </div>
    </nav>
  );
});
