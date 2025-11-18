import type { Metadata } from "next";
import { Playfair_Display, Merriweather } from "next/font/google";
import "./globals.css";
import { ConditionalNavbar } from "../components/ConditionalNavbar";
import { AuthProvider } from "./AuthProvider";
import { CartProvider } from "./CartProvider";

const playfairDisplay = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
});

const merriweather = Merriweather({
  variable: "--font-merriweather",
  subsets: ["latin"],
  weight: ["300", "400", "700", "900"],
});

export const metadata: Metadata = {
  title: "textileCom",
  description: "everyday clothing",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${playfairDisplay.variable} ${merriweather.variable} antialiased font-extralight`}
      >
        <AuthProvider>
          <CartProvider>
            <ConditionalNavbar />
            {children}
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
