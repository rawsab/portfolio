import Image from "next/image";
import { Mail } from "lucide-react";

const SOCIAL_LINKS = [
  {
    href: "https://www.linkedin.com/in/rawsabsaid/",
    label: "LinkedIn",
    icon: "/icons/linkedin.svg",
  },
  {
    href: "https://github.com/rawsab",
    label: "GitHub",
    icon: "/icons/github.svg",
  },
  {
    href: "https://x.com/r4wsab",
    label: "X",
    icon: "/icons/x-twitter.svg",
  },
  {
    href: "https://se-webring.xyz",
    label: "SE Webring",
    icon: "/icons/sewebring.svg",
  },
] as const;

export function Footer() {
  return (
    <footer className="max-w-site mx-auto pt-5 pb-16 border-t border-zinc-800/50">
      <div className="mx-auto w-full px-8">
        <div className="flex items-center justify-between gap-4 text-sm text-zinc-500">
          <a
            href="mailto:rsaid@uwaterloo.ca"
            className="flex items-center gap-1.5 text-zinc-600 hover:text-white hover:underline transition-colors cursor-pointer group"
          >
            <Mail className="w-4 h-4 text-zinc-600 group-hover:text-white transition-colors" />
            <span>rsaid@uwaterloo.ca</span>
          </a>
          <div className="flex items-center gap-3">
            {SOCIAL_LINKS.map(({ href, label, icon }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="opacity-50 hover:opacity-100 transition-opacity"
                aria-label={label}
              >
                <Image src={icon} alt="" width={18} height={18} className="block" />
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
