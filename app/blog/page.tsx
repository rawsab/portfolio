import { BottomBlurOverlay } from "@/components/bottom-blur-overlay";
import { CursorFollower } from "@/components/cursor-follower";
import { FadeInSection } from "@/components/fade-in-section";
import { Footer } from "@/components/footer";
import { ScrollToTop } from "@/components/scroll-to-top";
import { SiteHeader } from "@/components/site-header";

export default function BlogPage() {
  return (
    <>
      <ScrollToTop />
      <div className="min-h-screen flex flex-col">
        <SiteHeader brandHref="/" />
        <main className="max-w-site mx-auto w-full flex-1 px-8 py-12 text-zinc-300">
          <FadeInSection delay={0.05}>
            <p className="font-mono text-sm text-zinc-500">nothing to see yet...</p>
          </FadeInSection>
        </main>
        <FadeInSection delay={0.25}>
          <Footer />
        </FadeInSection>
      </div>
      <BottomBlurOverlay />
      <CursorFollower />
    </>
  );
}
