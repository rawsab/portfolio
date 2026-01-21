import { HeroSection } from "@/components/hero-section";
import { ExperienceSection } from "@/components/experience-section";
import { ProjectsSection } from "@/components/projects-section";
import { CaseStudiesSection } from "@/components/case-studies-section";
import { TechnologiesSection } from "@/components/technologies-section";
import { TestimonialsSection } from "@/components/testimonials-section";
import { BottomBlurOverlay } from "@/components/bottom-blur-overlay";
import { Footer } from "@/components/footer";
import { CursorFollower } from "@/components/cursor-follower";
import { FadeInSection } from "@/components/fade-in-section";
import { ScrollToTop } from "@/components/scroll-to-top";

export default function Home() {
  return (
    <>
      <ScrollToTop />
      <FadeInSection delay={0}>
        <HeroSection />
      </FadeInSection>
      <FadeInSection delay={0.05}>
        <ExperienceSection />
      </FadeInSection>
      <FadeInSection delay={0.1}>
        <ProjectsSection />
      </FadeInSection>
      {/* <CaseStudiesSection /> */}
      <FadeInSection delay={0.15}>
        <TechnologiesSection />
      </FadeInSection>
      <FadeInSection delay={0.2}>
        <TestimonialsSection />
      </FadeInSection>
      <FadeInSection delay={0.25}>
        <Footer />
      </FadeInSection>
      <BottomBlurOverlay />
      <CursorFollower />
    </>
  );
}
