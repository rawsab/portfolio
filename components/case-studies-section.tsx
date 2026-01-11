"use client";

export function CaseStudiesSection() {
  return (
    <section className="pt-0 pb-10">
      <div className="max-w-2xl mx-auto w-full px-8 space-y-6">
        <div className="space-y-2">
          <h2 className="text-xs font-medium font-mono text-[#686868] uppercase tracking-wider pb-2">
            CASE STUDIES
          </h2>
        </div>
      </div>
      
      {/* Dotted grid background - positioned below the title */}
      <div className="relative w-full">
        {/* Full width grid */}
        <div 
          className="w-full min-h-[260px] opacity-30"
          style={{
            backgroundImage: `radial-gradient(circle, #686868 1px, transparent 1px)`,
            backgroundSize: '12px 12px',
          }}
        />
        
        {/* Left fade overlay - from viewport left to 672px left edge */}
        <div 
          className="absolute top-0 bottom-0 pointer-events-none z-10"
          style={{
            left: 0,
            width: 'max(0px, calc((100vw - 672px) / 2))',
            background: 'linear-gradient(to right, #0D0D0D, transparent)',
          }}
        />
        
        {/* Right fade overlay - from 672px right edge to viewport right */}
        <div 
          className="absolute top-0 bottom-0 pointer-events-none z-10"
          style={{
            right: 0,
            width: 'max(0px, calc((100vw - 672px) / 2))',
            background: 'linear-gradient(to left, #0D0D0D, transparent)',
          }}
        />
      </div>
    </section>
  );
}
