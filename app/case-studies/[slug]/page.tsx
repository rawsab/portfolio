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
    <div className="min-h-screen bg-[#0d0d0d] text-zinc-300">
      {/* Top Bar - matching main site */}
      <div className="flex items-center justify-between px-8 pt-6 pb-4 border-b border-zinc-800/50 max-w-2xl mx-auto w-full">
        <Link href="/" className="text-sm text-zinc-500 font-mono hover:text-zinc-300 transition-colors">
          @rawsab
        </Link>
        <div className="flex items-center gap-3">
          {/* LinkedIn */}
          <a
            href="https://www.linkedin.com/in/rawsabsaid/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-zinc-500 hover:text-zinc-300 transition-colors"
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

          {/* GitHub */}
          <a
            href="https://github.com/rawsab"
            target="_blank"
            rel="noopener noreferrer"
            className="text-zinc-500 hover:text-zinc-300 transition-colors"
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

          {/* Dribbble */}
          <a
            href="https://dribbble.com/rawsab"
            target="_blank"
            rel="noopener noreferrer"
            className="text-zinc-500 hover:text-zinc-300 transition-colors"
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

      <main className="max-w-2xl mx-auto px-8 py-8">
        {/* Hero Section */}
        <div className="mb-10">
          {/* Breadcrumbs and GitHub Link */}
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
          
          {/* Title and Date */}
          <div>
            <h1 className="text-xl font-semibold text-white mb-1 text-center tracking-tight">
              {data.title}
            </h1>
            <p className="text-[0.95rem] text-zinc-500 font-mono text-center mb-5 tracking-tighter">
              {data.year}
            </p>
          </div>
          
          {/* Hero Image */}
          {data.heroImage && (
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
          )}
          
          {/* Timeline and Overview Row */}
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
          
          {/* Technologies */}
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
        </div>
        
        {/* Table of Contents */}
        {headers.length > 0 && (
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
        )}
        
        {/* MDX Content */}
        <article className="prose prose-lg max-w-none">
          <MDXContentWrapper source={mdxSource} />
        </article>
      </main>
      
      <Footer />
      <CursorFollower />
    </div>
  );
}
