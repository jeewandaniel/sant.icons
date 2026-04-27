import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/"],
      },
    ],
    sitemap: "https://icons.sant.co.nz/sitemap.xml",
    host: "https://icons.sant.co.nz",
  };
}
