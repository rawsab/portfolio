import Link from "next/link";
import Image from "next/image";

type SiteHeaderProps = {
  /** When set, the home label links here (e.g. `/` on inner pages). */
  brandHref?: string;
};

export function SiteHeader({ brandHref }: SiteHeaderProps = {}) {
  const navClassName = "text-sm text-white/50";
  const homeItem = brandHref ? (
    <Link
      href={brandHref}
      className={`${navClassName} hover:text-white/90 transition-colors`}
    >
      home
    </Link>
  ) : (
    <a href="#" className={`${navClassName} hover:text-white/90 transition-colors`}>
      home
    </a>
  );

  return (
    <>
      <header className="fixed inset-x-0 top-0 z-100 w-full bg-black/50 backdrop-blur-xl backdrop-saturate-150">
        <div className="flex items-center justify-between px-8 pt-6 pb-4 border-b border-zinc-800/50 max-w-site mx-auto w-full">
          <nav className="flex items-center gap-4" aria-label="Main navigation">
            {homeItem}
            <Link href="/blog" className={`${navClassName} hover:text-white/90 transition-colors`}>
              blog
            </Link>
            <Link href="/gallery" className={`${navClassName} hover:text-white/90 transition-colors`}>
              gallery
            </Link>
          </nav>
          <div className="flex items-center gap-3">
            <a
              href="https://se-webring.xyz"
              target="_blank"
              rel="noopener noreferrer"
              className="opacity-50 hover:opacity-100 transition-opacity"
              aria-label="SE Webring"
            >
              <Image src="/icons/sewebring.svg" alt="SE Webring" width={18} height={18} className="block" />
            </a>
            <a
              href="https://github.com/rawsab"
              target="_blank"
              rel="noopener noreferrer"
              className="opacity-50 hover:opacity-100 transition-opacity"
              aria-label="GitHub"
            >
              <Image src="/icons/github.svg" alt="GitHub" width={18} height={18} className="block" />
            </a>
          </div>
        </div>
      </header>
      <div className="h-[61px] w-full shrink-0" aria-hidden />
    </>
  );
}
