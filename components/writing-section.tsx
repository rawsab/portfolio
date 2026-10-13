import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { writingPosts } from "@/data/writing";
import { isBlogEnabled } from "@/lib/flags";
import { Divider } from "./divider";

export function WritingSection() {
  if (!isBlogEnabled() || writingPosts.length === 0) return null;

  return (
    <section id="writing" className="scroll-mt-24 pt-2 pb-2">
      <div className="mx-auto w-full max-w-site px-8">
        <Divider label="writing" className="mb-4" />
        <ul className="divide-y divide-white/10 pb-6">
          {writingPosts.map((post) => (
            <li key={post.href}>
              <Link
                href={post.href}
                className="group flex items-center justify-between gap-4 py-3 text-base text-zinc-300 transition-colors duration-200 hover:text-white"
              >
                <span className="min-w-0 bg-[linear-gradient(currentColor,currentColor)] bg-size-[0%_1px] bg-position-[0_100%] bg-no-repeat transition-[background-size] duration-250 ease-out group-hover:bg-size-[100%_1px]">
                  {post.title}
                </span>
                <ArrowUpRight
                  className="h-4 w-4 shrink-0 text-zinc-500 transition-all duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-zinc-300"
                  aria-hidden
                />
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
