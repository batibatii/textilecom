import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "6yvzp6pqojf1qsgp.public.blob.vercel-storage.com",
        port: "",
        pathname: "/**",
      },
    ],
  },
  experimental: {
    serverActions: {
      bodySizeLimit: "5mb",
    },
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "Content-Security-Policy",
            value: [
              // Default: only allow resources from same origin
              "default-src 'self'",

              // Scripts: allow Next.js, Firebase, Stripe, and eval for development
              "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://apis.google.com https://*.firebase.google.com https://js.stripe.com",

              // Styles: allow inline styles (Next.js uses them), Google Fonts
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",

              // Images: allow same origin, data URIs, Vercel Blob, Firebase
              "img-src 'self' data: blob: https://6yvzp6pqojf1qsgp.public.blob.vercel-storage.com https://*.googleapis.com https://*.google.com",

              // Fonts: allow same origin, data URIs, Google Fonts
              "font-src 'self' data: https://fonts.gstatic.com",

              // Connections (fetch, XHR, WebSocket): allow Firebase, Stripe, Vercel
              "connect-src 'self' https://*.firebase.google.com https://*.firebaseio.com https://api.stripe.com https://*.vercel-storage.com https://*.google.com https://*.googleapis.com wss://*.firebaseio.com",

              // Frames: allow Stripe for payment elements
              "frame-src 'self' https://js.stripe.com https://hooks.stripe.com",

              // Objects: block plugins (Flash, Java, etc.)
              "object-src 'none'",

              // Base URI: restrict base tag to same origin
              "base-uri 'self'",

              // Forms: only allow form submissions to same origin
              "form-action 'self'",

              // Upgrade insecure requests to HTTPS in production
              "upgrade-insecure-requests",
            ]
              .join("; ")
              .replace(/\s+/g, " "),
          },
          {
            key: "X-Frame-Options",
            value: "SAMEORIGIN",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            key: "X-XSS-Protection",
            value: "1; mode=block",
          },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
