import { HeroSection } from "@/components/hero-section";
import { ExperienceSection } from "@/components/experience-section";
import { ProjectsSection } from "@/components/projects-section";
import { TechnologiesSection } from "@/components/technologies-section";
import { TestimonialsSection } from "@/components/testimonials-section";
import { BottomBlurOverlay } from "@/components/bottom-blur-overlay";
import { Footer } from "@/components/footer";
import { CursorFollower } from "@/components/cursor-follower";

export default function Home() {
  return (
    <>
      <HeroSection />
      <ExperienceSection />
      <ProjectsSection />
      <TechnologiesSection />
      <TestimonialsSection />
      <Footer />
      <BottomBlurOverlay />
      <CursorFollower />
    </>
  );
}
