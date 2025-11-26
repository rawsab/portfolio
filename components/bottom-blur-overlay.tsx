"use client";

export function BottomBlurOverlay() {
  return (
    <div className="fixed bottom-0 left-0 right-0 h-6 pointer-events-none z-50">
      <div
        className="absolute inset-0"
        style={{
          backdropFilter: "blur(10px) saturate(180%)",
          WebkitBackdropFilter: "blur(10px) saturate(180%)",
          maskImage: "linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.1) 20%, rgba(0,0,0,0.4) 50%, rgba(0,0,0,0.8) 80%, black 100%)",
          WebkitMaskImage: "linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.1) 20%, rgba(0,0,0,0.4) 50%, rgba(0,0,0,0.8) 80%, black 100%)",
        }}
      />
      <div
        className="absolute inset-0"
        style={{
          background: "linear-gradient(to bottom, transparent 0%, rgba(13, 13, 13, 0.05) 30%, rgba(13, 13, 13, 0.15) 70%, rgba(13, 13, 13, 0.3) 100%)",
        }}
      />
    </div>
  );
}

