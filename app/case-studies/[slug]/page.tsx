import { Metadata } from 'next';
import Link from 'next/link';
import { serialize } from 'next-mdx-remote/serialize';
import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { notFound } from 'next/navigation';
import { Footer } from '@/components/footer';
import MDXContentWrapper from '@/components/mdx-content-wrapper';
import { CursorFollower } from '@/components/cursor-follower';
import { projects } from '@/data/projects';
import { FadeInSection } from '@/components/fade-in-section';
import { ScrollToTop } from '@/components/scroll-to-top';
import { SiteHeader } from '@/components/site-header';

// Function to extract headers from MDX content
function extractHeaders(content: string) {
  const headerRegex = /^(#{1,3})\s+(.+)$/gm;
  const headers: { level: number; text: string; id: string }[] = [];
  
  let match;
  while ((match = headerRegex.exec(content)) !== null) {
    const level = match[1].length;
    const text = match[2].trim();
    const id = text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
    
    headers.push({ level, text, id });
  }
  
  return headers;
}

// Function to organize headers into sections
function organizeHeaders(headers: { level: number; text: string; id: string }[]) {
  const sections: {
    header: { level: number; text: string; id: string };
    subsections: { level: number; text: string; id: string }[];
  }[] = [];
  
  let currentSection: { level: number; text: string; id: string } | null = null;
  let currentSubsections: { level: number; text: string; id: string }[] = [];
  
  headers.forEach(header => {
    if (header.level === 1 || header.level === 2) {
      // Save previous section if it exists
      if (currentSection) {
        sections.push({
          header: currentSection,
          subsections: currentSubsections
        });
      }
      
      // Start new section
      currentSection = header;
      currentSubsections = [];
    } else if (header.level === 3 && currentSection) {
      // Add to current section's subsections
      currentSubsections.push(header);
    }
  });
  
  // Add the last section
  if (currentSection) {
    sections.push({
      header: currentSection,
      subsections: currentSubsections
    });
  }
  
  return sections;
}

// Collapsible Section Component (Client Component)
function CollapsibleSection({ section }: { 
  section: { 
    header: { level: number; text: string; id: string }; 
    subsections: { level: number; text: string; id: string }[] 
  } 
}) {
  const hasSubsections = section.subsections.length > 0;
  
  return (
    <div>
      <div className="flex items-center">
        <a
          href={`#${section.header.id}`}
          className={`flex-1 text-sm hover:text-white transition-colors ${
            section.header.level === 1 
              ? 'text-white font-medium' 
              : 'text-zinc-400'
          }`}
        >
          {section.header.text}
        </a>
      </div>
      {hasSubsections && (
        <div className="ml-4 mt-2 space-y-1">
          {section.subsections.map((subsection, index) => (
            <a
              key={index}
              href={`#${subsection.id}`}
              className="block text-sm text-zinc-500 hover:text-zinc-300 transition-colors"
            >
              {subsection.text}
            </a>
          ))}
        </div>
      )}
    </div>
  );
}

interface CaseStudyProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateStaticParams() {
  const caseStudiesDir = path.join(process.cwd(), 'app/case-studies');
  
  // Check if directory exists, if not return empty paths
  if (!fs.existsSync(caseStudiesDir)) {
    return [];
  }
  
  const caseStudyFolders = fs.readdirSync(caseStudiesDir).filter((item) => {
    const itemPath = path.join(caseStudiesDir, item);
    return fs.statSync(itemPath).isDirectory();
  });
  
  return caseStudyFolders.map((folder) => ({
    slug: folder,
  }));
}

export async function generateMetadata({ params }: CaseStudyProps): Promise<Metadata> {
  const { slug } = await params;
  const caseStudyPath = path.join(process.cwd(), 'app/case-studies', slug, 'index.mdx');
  
  if (!fs.existsSync(caseStudyPath)) {
    return {
      title: 'Case Study Not Found',
    };
  }
  
  const source = fs.readFileSync(caseStudyPath, 'utf8');
  const { data } = matter(source);
  
  return {
    title: data.title,
    description: data.description,
    openGraph: {
      title: `${data.title} | Rawsab Said`,
      description: data.description,
      type: 'article',
      url: `https://rawsab.com/case-studies/${slug}`,
      images: data.heroImage ? [data.heroImage] : ['/og_image.png'],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${data.title} | Rawsab Said`,
      description: data.description,
      images: data.heroImage ? [data.heroImage] : ['/og_image.png'],
    },
  };
}

export default async function CaseStudy({ params }: CaseStudyProps) {
  const { slug } = await params;
  const caseStudyPath = path.join(process.cwd(), 'app/case-studies', slug, 'index.mdx');
  
  // Check if file exists
  if (!fs.existsSync(caseStudyPath)) {
    notFound();
  }
  
  const source = fs.readFileSync(caseStudyPath, 'utf8');
  const { content, data } = matter(source);
  
  const mdxSource = await serialize(content);
  
  // Extract headers from the content
  const headers = extractHeaders(content);
  
  // Find the corresponding project from projects data
  const projectName = data.title;
  const project = projects.find(p => p.name.includes(projectName.split(' ')[0]) || projectName.includes(p.name.split(' ')[0])) || null;
  
  return (
    <div className="min-h-screen bg-black text-zinc-300">
      <ScrollToTop />
      <SiteHeader brandHref="/" />

      <main className="max-w-site mx-auto px-8 py-8">
        {/* Hero Section */}
        <div className="mb-10">
          {/* Breadcrumbs and GitHub Link */}
          <FadeInSection delay={0.05}>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
            <div className="flex items-center justify-center md:justify-start gap-2 text-xs text-zinc-500 mb-2 md:mb-0">
              <Link href="/" className="text-zinc-500 hover:text-zinc-300 transition-all duration-300 font-mono">HOME</Link>
              <span>&nbsp;›&nbsp;</span>
              <span className="font-mono">CASE STUDIES</span>
              <span>&nbsp;›&nbsp;</span>
              <span className="font-mono">{data.title.toUpperCase()}</span>
            </div>
            {project && (
              <a 
                href={project.link}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center md:justify-start gap-2 text-xs text-zinc-500 font-mono hover:text-zinc-300 transition-colors"
              >
                <span>GITHUB</span>
                <svg
                  className="w-3 h-3"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                  />
                </svg>
              </a>
            )}
          </div>
          </FadeInSection>
          
          {/* Title and Date */}
          <FadeInSection delay={0.1}>
            <div>
            <h1 className="text-xl font-semibold text-white mb-1 text-center tracking-tight">
              {data.title}
            </h1>
            <p className="text-[0.95rem] text-zinc-500 font-mono text-center mb-5 tracking-tighter">
              {data.year}
            </p>
          </div>
          </FadeInSection>
          
          {/* Hero Image */}
          {data.heroImage && (
            <FadeInSection delay={0.15}>
            <div 
              className="w-full rounded-sm mb-9 relative" 
              style={{ aspectRatio: '12/7' }}
            >
              {/* Glow effect */}
              <div className={`absolute inset-0 rounded-sm blur-xl ${data.glowScale || 'scale-110'} opacity-50`}>
                <img 
                  src={data.heroImage} 
                  alt=""
                  className="w-full h-full object-cover rounded-sm"
                />
              </div>
              {/* Main image */}
              <div className="relative w-full h-full rounded-sm overflow-hidden">
                <img 
                  src={data.heroImage} 
                  alt={data.title}
                  className="w-full h-full object-cover"
                  draggable="false"
                />
              </div>
            </div>
            </FadeInSection>
          )}
          
          {/* Timeline and Overview Row */}
          <FadeInSection delay={0.2}>
            <div>
            <div className="flex flex-col md:flex-row gap-6 mb-6">
              <div className="md:w-auto md:pr-2">
                <h3 className="text-xs font-semibold font-mono text-zinc-500 uppercase tracking-tight mb-2">
                  Timeline
                </h3>
                <p className="text-[0.95rem] text-zinc-400">{data.timeline}</p>
              </div>
              <div className="md:flex-1">
                <h3 className="text-xs font-semibold font-mono text-zinc-500 uppercase tracking-tight mb-2">
                  Overview
                </h3>
                <p className="text-[0.95rem] text-zinc-400">{data.description}</p>
              </div>
            </div>
          </div>
          </FadeInSection>
          
          {/* Technologies */}
          <FadeInSection delay={0.25}>
            <div>
            <div className="mb-0">
              <h3 className="text-xs font-semibold font-mono text-zinc-500 uppercase tracking-tight mb-4">
                Technologies
              </h3>
              <div className="flex flex-wrap gap-2">
                {data.technologies?.map((tech: string) => (
                  <span 
                    key={tech}
                    className="px-3 py-1 bg-zinc-900/50 rounded-full text-xs text-zinc-400 border border-zinc-800/50"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </div>
          </div>
          </FadeInSection>
        </div>
        
        {/* Table of Contents */}
        {headers.length > 0 && (
          <FadeInSection delay={0.3}>
          <div className="mb-8 p-6 bg-zinc-900/30 rounded-lg border border-zinc-800/50">
            <h3 className="text-sm font-semibold font-mono text-zinc-500 uppercase tracking-tight mb-4">
              Table of Contents
            </h3>
            <nav className="space-y-2">
              {(() => {
                const sections = organizeHeaders(headers);
                return sections.map((section, index) => (
                  <CollapsibleSection key={index} section={section} />
                ));
              })()}
            </nav>
          </div>
          </FadeInSection>
        )}
        
        {/* MDX Content */}
        <FadeInSection delay={0.35}>
          <article className="prose prose-lg max-w-none">
            <MDXContentWrapper source={mdxSource} />
          </article>
        </FadeInSection>
      </main>
      
      <FadeInSection delay={0.4}>
        <Footer />
      </FadeInSection>
      <CursorFollower />
    </div>
  );
}
