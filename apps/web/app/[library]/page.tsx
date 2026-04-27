import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getIconsByLibrary, getLibraries } from "@/lib/manifest-server";

interface Props {
  params: { library: string };
}

export async function generateStaticParams() {
  const libs = await getLibraries();
  return libs.map((l) => ({ library: l.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const icons = await getIconsByLibrary(params.library);
  if (icons.length === 0) return { title: "Not found" };
  const label = icons[0].libraryLabel;
  const license = icons[0].license;
  const ogImage = `/og/${params.library}.png`;
  return {
    title: `${label} icons — ${icons.length.toLocaleString()} free SVGs | sant.icons`,
    description: `Browse all ${icons.length.toLocaleString()} ${label} icons. Free, ${license}-licensed SVG icons. Copy SVG, JSX, or Vue. Download PNG. Zero login.`,
    alternates: { canonical: `https://icons.sant.co.nz/${params.library}` },
    openGraph: {
      title: `${label} — sant.icons`,
      description: `${icons.length.toLocaleString()} free ${label} SVG icons.`,
      url: `https://icons.sant.co.nz/${params.library}`,
      type: "website",
      images: [{ url: ogImage, width: 1200, height: 630, alt: `${label} icons on sant.icons` }],
    },
    twitter: {
      card: "summary_large_image",
      title: `${label} — sant.icons`,
      description: `${icons.length.toLocaleString()} free ${label} SVG icons.`,
      images: [ogImage],
    },
  };
}

export default async function LibraryPage({ params }: Props) {
  const icons = await getIconsByLibrary(params.library);
  if (icons.length === 0) notFound();
  const label = icons[0].libraryLabel;
  const license = icons[0].license;

  return (
    <div className="min-h-screen bg-bg-base">
      <div className="border-b border-border-subtle px-6 py-3 flex items-center gap-4">
        <Link href="/" className="text-[13px] font-bold tracking-tightest">
          <span className="text-accent">sant</span>
          <span className="text-text-muted">.icons</span>
        </Link>
        <span className="text-text-faint">/</span>
        <span className="text-text-secondary text-[12px]">{label}</span>
      </div>
      <header className="px-6 py-8 border-b border-border-subtle">
        <h1 className="text-text-primary text-[20px] font-medium">{label}</h1>
        <p className="text-text-muted text-[11px] mt-1 tracking-wider2">
          {icons.length.toLocaleString()} icons · {license} licensed
        </p>
      </header>
      <div
        className="bg-border-subtle"
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(100px, 1fr))",
          gap: "1px",
        }}
      >
        {icons.map((icon) => (
          <Link
            key={icon.id}
            href={`/${icon.library}/${icon.name}`}
            className="group flex items-center justify-center bg-bg-base hover:bg-bg-hover h-[100px] text-text-secondary hover:text-accent transition-colors"
            title={icon.name}
          >
            <span
              className={`icon-svg ${icon.style}`}
              dangerouslySetInnerHTML={{ __html: icon.svg }}
            />
          </Link>
        ))}
      </div>
      <footer className="px-6 py-4 text-text-faint text-[10px] tracking-wider2 border-t border-border-subtle">
        built by{" "}
        <a href="https://sant.co.nz" className="hover:text-text-muted" target="_blank" rel="noreferrer">
          sant.co.nz
        </a>
      </footer>
    </div>
  );
}
