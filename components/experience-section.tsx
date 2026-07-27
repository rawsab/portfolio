import { experiences } from "@/data/experience";
// import { Divider } from "./divider";
import { ExperienceThumbnail } from "./experience-thumbnail";

export function ExperienceSection() {
  return (
    <section id="experience" className="scroll-mt-24 pt-6 pb-16">
      <div className="max-w-site mx-auto w-full px-8 space-y-6">
        {/* <Divider label="experience" className="mb-8" /> */}

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {experiences.map((exp) => (
            <a
              key={`${exp.company}-${exp.year}-${exp.period}`}
              href={exp.link}
              target="_blank"
              rel="noopener noreferrer"
              className="group block space-y-3"
            >
              <ExperienceThumbnail
                company={exp.company}
                thumbnail={exp.thumbnail}
                videoThumbnail={exp.videoThumbnail}
              />

              <div className="space-y-1">
                <p className="text-sm text-white">
                  {exp.company} – {exp.year}
                </p>
                {exp.shortDescription ? (
                  <p className="text-sm text-zinc-500 leading-normal">
                    {exp.shortDescription}
                  </p>
                ) : null}
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
