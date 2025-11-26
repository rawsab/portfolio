import { HeroSection } from "@/components/hero-section";
import { ExperienceSection } from "@/components/experience-section";
import { ProjectsSection } from "@/components/projects-section";
import { TestimonialsSection } from "@/components/testimonials-section";
import { BottomBlurOverlay } from "@/components/bottom-blur-overlay";

export default function Home() {
  return (
    <>
      <HeroSection />
      <ExperienceSection />
      <ProjectsSection />
      <TestimonialsSection />
      <BottomBlurOverlay />
    </>
  );
}
