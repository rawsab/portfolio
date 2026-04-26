import Link from "next/link";

type SiteHeaderProps = {
  /** When set, the @rawsab label links here (e.g. `/` on inner pages). */
  brandHref?: string;
};

export function SiteHeader({ brandHref }: SiteHeaderProps = {}) {
  const brandClassName = "text-sm text-white/50 font-mono";
  const brand = brandHref ? (
    <Link
      href={brandHref}
      className={`${brandClassName} hover:text-white/90 transition-colors`}
    >
      @rawsab
    </Link>
  ) : (
    <div className={brandClassName}>@rawsab</div>
  );

  return (
    <>
      <header className="fixed inset-x-0 top-0 z-[100] w-full bg-black/50 backdrop-blur-xl backdrop-saturate-150">
        <div className="flex items-center justify-between px-8 pt-6 pb-4 border-b border-zinc-800/50 max-w-site mx-auto w-full">
          {brand}
          <div className="flex items-center gap-3">
            <a
              href="https://www.linkedin.com/in/rawsabsaid/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-white/50 hover:text-white/90 transition-colors"
              aria-label="LinkedIn"
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 32 32"
                fill="currentColor"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M28.778 1.004h-25.56c-0.008-0-0.017-0-0.027-0-1.199 0-2.172 0.964-2.186 2.159v25.672c0.014 1.196 0.987 2.161 2.186 2.161 0.010 0 0.019-0 0.029-0h25.555c0.008 0 0.018 0 0.028 0 1.2 0 2.175-0.963 2.194-2.159l0-0.002v-25.67c-0.019-1.197-0.994-2.161-2.195-2.161-0.010 0-0.019 0-0.029 0h0.001zM9.9 26.562h-4.454v-14.311h4.454zM7.674 10.293c-1.425 0-2.579-1.155-2.579-2.579s1.155-2.579 2.579-2.579c1.424 0 2.579 1.154 2.579 2.578v0c0 0.001 0 0.002 0 0.004 0 1.423-1.154 2.577-2.577 2.577-0.001 0-0.002 0-0.003 0h0zM26.556 26.562h-4.441v-6.959c0-1.66-0.034-3.795-2.314-3.795-2.316 0-2.669 1.806-2.669 3.673v7.082h-4.441v-14.311h4.266v1.951h0.058c0.828-1.395 2.326-2.315 4.039-2.315 0.061 0 0.121 0.001 0.181 0.003l-0.009-0c4.5 0 5.332 2.962 5.332 6.817v7.855z" />
              </svg>
            </a>

            <a
              href="https://github.com/rawsab"
              target="_blank"
              rel="noopener noreferrer"
              className="text-white/50 hover:text-white/90 transition-colors"
              aria-label="GitHub"
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 20 20"
                fill="currentColor"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M10,0 C4.477,0 0,4.484 0,10.017 C0,14.425 2.865,18.18 6.839,19.49 C7.339,19.581 7.521,19.272 7.521,19.006 C7.521,18.722 7.512,17.988 7.507,17.192 C4.726,17.69 4.139,15.97 4.139,15.97 C3.685,14.83 3.029,14.5 3.029,14.5 C2.121,13.88 3.097,13.895 3.097,13.895 C4.101,13.965 4.629,14.93 4.629,14.93 C5.521,16.367 6.97,15.937 7.539,15.737 C7.631,15.134 7.889,14.771 8.175,14.577 C5.954,14.329 3.62,13.448 3.62,9.582 C3.62,8.469 4.01,7.577 4.649,6.894 C4.546,6.602 4.203,5.567 4.747,4.18 C4.747,4.18 5.586,3.905 7.496,5.207 C8.295,4.98 9.15,4.866 10,4.862 C10.85,4.866 11.705,4.98 12.504,5.207 C14.414,3.905 15.253,4.18 15.253,4.18 C15.797,5.567 15.454,6.602 15.351,6.894 C15.99,7.577 16.38,8.469 16.38,9.582 C16.38,13.455 14.041,14.33 11.817,14.576 C12.172,14.833 12.482,15.397 12.482,16.279 C12.482,17.559 12.469,18.524 12.469,19.006 C12.469,19.27 12.649,19.577 13.155,19.481 C17.135,18.175 20,14.421 20,10.017 C20,4.484 15.522,0 10,0" />
              </svg>
            </a>

            <a
              href="https://dribbble.com/rawsab"
              target="_blank"
              rel="noopener noreferrer"
              className="text-white/50 hover:text-white/90 transition-colors"
              aria-label="Dribbble"
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.91"
                strokeLinecap="round"
                strokeLinejoin="round"
                xmlns="http://www.w3.org/2000/svg"
              >
                <circle cx="12" cy="12" r="10.5" />
                <path d="M8.12,2.24A32.47,32.47,0,0,1,12.8,9.13a33.23,33.23,0,0,1,1.58,3.56,36.16,36.16,0,0,1,2.15,8.79" />
                <path d="M19.67,4.82A18.16,18.16,0,0,1,12.8,9.13,28,28,0,0,1,1.55,11" />
                <path d="M22.42,13.21a16.66,16.66,0,0,0-8-.52A13,13,0,0,0,5.09,19.9" />
              </svg>
            </a>
          </div>
        </div>
      </header>
      <div className="h-[61px] w-full shrink-0" aria-hidden />
    </>
  );
}
