"use client";

import Link from "next/link";
import { useAuth } from "@/app/AuthProvider";
import { useRouter } from "next/navigation";
import { H1 } from "@/components/ui/headings";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";

export function AdminNavbar() {
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  return (
    <nav className="flex flex-col gap-6 lg:gap-0">
      <div className="flex flex-wrap lg:justify-end gap-1 font-light text-[13px] justify-center md:text-sm md:font-extralight mt-2  lg:mt-10 lg:mr-16">
        <div className="px-1.5 py-2 md:px-2">
          <Link href="/admin/products/new">ADD PRODUCT</Link>
        </div>
        <NavigationMenu>
          <NavigationMenuList>
            <NavigationMenuItem className="px-1.5 py-2 md:px-2">
              <NavigationMenuTrigger className="bg-transparent hover:bg-transparent focus:bg-transparent data-[state=open]:bg-transparent data-[active]:bg-transparent h-auto px-0 py-0 font-light text-[13px] md:text-sm md:font-extralight cursor-pointer">
                PRODUCTS
              </NavigationMenuTrigger>
              <NavigationMenuContent>
                <ul className="w-[200px] p-2">
                  <li>
                    <NavigationMenuLink asChild>
                      <Link
                        href="/admin/products/archive"
                        className="block select-none  p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground font-light text-[13px] md:text-sm"
                      >
                        Approved Products
                      </Link>
                    </NavigationMenuLink>
                  </li>
                </ul>
              </NavigationMenuContent>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>
        <div className="px-1.5 py-2 md:px-2">
          <Link href="/">DASHBOARD</Link>
        </div>
        <div className="px-1.5 py-2 md:px-2">
          <Link href="/profile">PROFILE</Link>
        </div>
        {user && (
          <div
            className="px-1.5 py-2 md:px-2 cursor-pointer"
            onClick={handleLogout}
          >
            LOG OUT
          </div>
        )}
      </div>
      <div className="text-center mt-4 lg:text-start lg:pl-20 xl:pl-40">
        <Link href={"/"}>
          <H1 className="tracking-wider text-2xl md:text-3xl">TEXTILECOM</H1>
        </Link>
      </div>
    </nav>
  );
}
