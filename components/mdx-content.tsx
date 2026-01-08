"use client";

import React from 'react';
import { MDXRemote, MDXRemoteSerializeResult } from 'next-mdx-remote';
import ImageWithCaptionComponent from './image-with-caption';
import * as LucideIcons from 'lucide-react';

// Custom components for MDX
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const components: Record<string, React.ComponentType<any>> = {
  h1: (props: React.ComponentPropsWithoutRef<'h1'>) => {
    const id = props.children?.toString().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
    return (
      <h1 id={id} className="text-2xl font-semibold text-white tracking-tight mb-6 mt-8 first:mt-0 scroll-mt-20" {...props} />
    );
  },
  h2: (props: React.ComponentPropsWithoutRef<'h2'>) => {
    const id = props.children?.toString().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
    return (
      <h2 id={id} className="text-xl font-semibold text-white tracking-tight mb-4 mt-8 scroll-mt-20" {...props} />
    );
  },
  h3: (props: React.ComponentPropsWithoutRef<'h3'>) => {
    const id = props.children?.toString().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
    return (
      <h3 id={id} className="text-lg font-medium text-white tracking-tight mb-3 mt-6 scroll-mt-20" {...props} />
    );
  },
  p: (props: React.ComponentPropsWithoutRef<'p'>) => (
    <p className="text-[0.95rem] text-[#8F8F8F] leading-relaxed mb-4 [&>strong]:text-zinc-200 [&>strong]:font-normal" {...props} />
  ),
  ul: (props: React.ComponentPropsWithoutRef<'ul'>) => (
    <ul className="list-disc list-outside text-[0.95rem] text-[#8F8F8F] mb-4 space-y-2 pl-5 [&>li>strong]:text-zinc-200 [&>li>strong]:font-normal" {...props} />
  ),
  ol: (props: React.ComponentPropsWithoutRef<'ol'>) => (
    <ol className="list-decimal list-outside text-[0.95rem] text-[#8F8F8F] mb-4 space-y-2 pl-5 [&>li>strong]:text-zinc-200 [&>li>strong]:font-normal" {...props} />
  ),
  li: (props: React.ComponentPropsWithoutRef<'li'>) => (
    <li className="text-[0.95rem] text-[#8F8F8F]" {...props} />
  ),
  blockquote: (props: React.ComponentPropsWithoutRef<'blockquote'>) => (
    <blockquote className="border-l-4 border-zinc-800/50 pl-4 italic text-[0.95rem] text-[#8F8F8F] mb-4" {...props} />
  ),
  code: (props: React.ComponentPropsWithoutRef<'code'>) => (
    <code className="bg-zinc-900/50 px-2 py-1 rounded text-[0.95rem] font-mono text-[#8F8F8F] border border-zinc-800/50" {...props} />
  ),
  pre: (props: React.ComponentPropsWithoutRef<'pre'>) => (
    <pre className="bg-zinc-900/50 p-4 rounded-sm overflow-x-auto mb-4 text-[#8F8F8F] font-mono text-[0.95rem] border border-zinc-800/50" {...props} />
  ),
  img: (props: React.ComponentPropsWithoutRef<'img'>) => (
    <img className="w-full h-auto rounded-sm mb-6" alt="" {...props} />
  ),
  a: (props: React.ComponentPropsWithoutRef<'a'>) => (
    <a className="text-white hover:text-zinc-300 underline" {...props} />
  ),
  hr: (props: React.ComponentPropsWithoutRef<'hr'>) => (
    <hr className="border-none h-px bg-zinc-800 my-8" {...props} />
  ),
  FeatureGrid: (props: React.ComponentPropsWithoutRef<'div'>) => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6" {...props}>
      {props.children}
    </div>
  ),
  FeatureCard: ({ icon, title, children, ...props }: { icon: string; title?: string; children: React.ReactNode } & React.ComponentPropsWithoutRef<'div'>) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const IconComponent = (LucideIcons as unknown as Record<string, React.ComponentType<any>>)[icon] as React.ComponentType<{ className?: string }> | undefined;
    return (
      <div className="relative pt-4 px-4 border border-zinc-800/50 rounded-sm bg-zinc-900/30" {...props}>
        <div className="absolute top-4 left-4 text-zinc-500">
          {IconComponent ? <IconComponent className="w-5 h-5" /> : icon}
        </div>
        <div className="pt-8 text-xs text-[#8F8F8F] [&>strong]:text-zinc-200 [&>strong]:font-normal">
          {title && (
            <h4 className="font-medium text-white mb-1 text-[0.95rem]">
              {title}
            </h4>
          )}
          <div className={title ? 'text-[0.95rem]' : ''}>
            {children}
          </div>
        </div>
      </div>
    );
  },
  ImageWithCaption: ImageWithCaptionComponent,
};

interface MDXContentProps {
  source: MDXRemoteSerializeResult;
}

export default function MDXContent({ source }: MDXContentProps) {
  return <MDXRemote {...source} components={components} />;
}
