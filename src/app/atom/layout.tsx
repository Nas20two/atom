import type { Metadata } from "next";

export const metadata: Metadata = {
  title: {
    template: "%s | Atom — AI Video Generator",
    default: "Atom — AI Video Generator | Create Cinematic 60-Second Shorts",
  },
  description:
    "Atom is an AI video generator for businesses. Pick a template, fill a form, and get a cinematic 60-second video — real estate, wellness, healthcare, and more.",
  openGraph: {
    title: "Atom — AI Video Generator",
    description:
      "Pick a template, fill a form, and get a cinematic 60-second video for your business.",
    url: "https://www.nasyhub.com/atom",
    siteName: "Atom by NaSy Hub",
    images: [
      {
        url: "https://www.nasyhub.com/atom-brand-card.jpg",
        width: 1200,
        height: 630,
        alt: "Atom — AI Video Generator",
      },
    ],
    locale: "en_AU",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Atom — AI Video Generator",
    description:
      "Pick a template, fill a form, and get a cinematic 60-second video for your business.",
    images: ["https://www.nasyhub.com/atom-brand-card.jpg"],
  },
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: "https://www.nasyhub.com/atom",
  },
};

export default function AtomLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
