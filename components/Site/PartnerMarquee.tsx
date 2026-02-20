'use client';

interface Partner {
  name: string;
  logo: string;
}

export default function PartnerMarquee({ partners }: { partners: Partner[] }) {
  // Double the list for seamless loop
  const items = [...partners, ...partners];

  return (
    <div className="relative overflow-hidden">
      {/* Fade edges */}
      <div className="absolute inset-y-0 left-0 w-16 bg-gradient-to-r from-bg to-transparent z-10" />
      <div className="absolute inset-y-0 right-0 w-16 bg-gradient-to-l from-bg to-transparent z-10" />

      <div className="flex items-center gap-16 animate-marquee hover:[animation-play-state:paused]">
        {items.map((p, i) => (
          <img
            key={`${p.name}-${i}`}
            src={p.logo}
            alt={p.name}
            title={p.name}
            loading="lazy"
            className="h-10 sm:h-12 object-contain flex-shrink-0 grayscale opacity-40 hover:grayscale-0 hover:opacity-100 transition-all duration-500"
          />
        ))}
      </div>
    </div>
  );
}
