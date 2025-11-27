import { Mail } from "lucide-react";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="max-w-2xl mx-auto pt-5 pb-6 border-t border-zinc-800/50">
      <div className="mx-auto w-full px-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-zinc-500">
          <div className="font-mono">
            © {currentYear} Rawsab Said
          </div>
          <a
            href="mailto:rsaid@uwaterloo.ca"
            className="flex items-center gap-1.5 text-zinc-600 hover:text-white hover:underline transition-colors cursor-pointer group"
          >
            <Mail className="w-4 h-4 text-zinc-600 group-hover:text-white transition-colors" />
            <span>rsaid@uwaterloo.ca</span>
          </a>
        </div>
      </div>
    </footer>
  );
}

