"use client";

import Link from "next/link";
import { useAuth } from "@/app/AuthProvider";
import { useCart } from "@/app/CartProvider";
import { useRouter } from "next/navigation";

export function Navbar() {
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
            <Link href="/">SETTINGS</Link>
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
          <h1 className="font-serif font-bold tracking-wider text-2xl antialiased md:text-3xl ">
            TEXTILECOM
          </h1>
        </Link>
      </div>
    </nav>
  );
}
