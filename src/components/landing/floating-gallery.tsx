"use client";

import Image from "next/image";

const profiles = [
  // Individual professional headshots — names matched to appearance
  { id: "photo-1494790108377-be9c29b29330", name: "Rachel Williams", role: "Frontend Developer",    rotate: "-3deg", x: "3%",  delay: "0s",   duration: "14s", scale: 1.0  },
  { id: "photo-1507003211169-0a1dd7228f2d", name: "Marcus Thompson", role: "Lead Backend Engineer", rotate: "4deg",  x: "16%", delay: "-4s",  duration: "16s", scale: 0.9  },
  { id: "photo-1580489944761-15a19d654956", name: "Aisha Davis",     role: "Product Designer",      rotate: "-5deg", x: "29%", delay: "-8s",  duration: "13s", scale: 1.05 },
  { id: "photo-1438761681033-6461ffad8d80", name: "Jenny Liu",       role: "Data Scientist",        rotate: "2deg",  x: "42%", delay: "-2s",  duration: "17s", scale: 0.88 },
  { id: "photo-1573496359142-b8d87734a5a2", name: "Sofia Rivera",    role: "UX / UI Designer",      rotate: "-4deg", x: "58%", delay: "-10s", duration: "15s", scale: 1.0  },
  { id: "photo-1531123897727-8f129e1688ce", name: "Imani Carter",    role: "DevSecOps Engineer",    rotate: "5deg",  x: "73%", delay: "-6s",  duration: "18s", scale: 0.92 },
  { id: "photo-1519085360753-af0119f7cbe7", name: "Arjun Patel",     role: "Cloud Architect",       rotate: "-2deg", x: "85%", delay: "-14s", duration: "15s", scale: 0.85 },
  { id: "photo-1506794778202-cad84cf45f1d", name: "Ryan Mitchell",   role: "ML Engineer",           rotate: "3deg",  x: "10%", delay: "-12s", duration: "16s", scale: 0.95 },
  { id: "photo-1472099645785-5658abf4ff4e", name: "James O'Brien",   role: "Site Reliability Eng.", rotate: "-6deg", x: "22%", delay: "-9s",  duration: "14s", scale: 1.0  },
  { id: "photo-1573497019940-1c28c88b4f3e", name: "Natalia Gomez",   role: "Engineering Manager",   rotate: "2deg",  x: "36%", delay: "-3s",  duration: "17s", scale: 0.9  },
  { id: "photo-1567532939604-b6b5b0db2604", name: "Priya Sharma",    role: "Sr. DevOps Engineer",   rotate: "-3deg", x: "49%", delay: "-7s",  duration: "15s", scale: 1.05 },
  { id: "photo-1560250097-0b93528c311a",    name: "Kevin Park",      role: "Solutions Architect",   rotate: "4deg",  x: "62%", delay: "-11s", duration: "13s", scale: 0.88 },
  { id: "photo-1534528741775-53994a69daeb", name: "Emma Scott",      role: "Product Manager",       rotate: "-1deg", x: "75%", delay: "-5s",  duration: "16s", scale: 0.92 },
  { id: "photo-1539571696357-5a69c17a67c6", name: "Vikram Nair",     role: "Full-Stack Engineer",   rotate: "6deg",  x: "88%", delay: "-16s", duration: "14s", scale: 0.95 },
];

const CARD_W = 148;
const CARD_H = 196;

export default function FloatingGallery() {
  return (
    <div className="relative w-full overflow-hidden" style={{ height: "520px" }}>
      {/* Fades */}
      <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-[#06060f] to-transparent z-10 pointer-events-none" />
      <div className="absolute bottom-0 left-0 right-0 h-44 bg-gradient-to-t from-[#06060f] to-transparent z-10 pointer-events-none" />
      <div className="absolute top-0 left-0 bottom-0 w-24 bg-gradient-to-r from-[#06060f] to-transparent z-10 pointer-events-none" />
      <div className="absolute top-0 right-0 bottom-0 w-24 bg-gradient-to-l from-[#06060f] to-transparent z-10 pointer-events-none" />

      {profiles.map((p) => (
        <div
          key={p.id}
          className="absolute"
          style={{
            left: p.x,
            bottom: "-300px",
            width: CARD_W,
            animation: `floatUp ${p.duration} ${p.delay} linear infinite`,
            "--rotate": p.rotate,
            "--scale": p.scale,
          } as React.CSSProperties}
        >
          {/* Badge-style card — full photo with overlay */}
          <div
            className="relative rounded-2xl overflow-hidden"
            style={{
              width: CARD_W,
              height: CARD_H,
              boxShadow: "0 20px 50px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.08)",
            }}
          >
            <Image
              src={`https://images.unsplash.com/${p.id}?w=320&h=400&fit=crop&crop=face`}
              alt={p.name}
              width={CARD_W}
              height={CARD_H}
              className="object-cover w-full h-full"
              unoptimized
            />
            {/* Gradient overlay */}
            <div
              className="absolute inset-0"
              style={{ background: "linear-gradient(to top, rgba(4,4,18,0.92) 0%, rgba(4,4,18,0.3) 45%, transparent 70%)" }}
            />
            {/* ✓ VERIFIED chip — top right */}
            <div
              className="absolute top-2.5 right-2.5 flex items-center gap-1 rounded px-1.5 py-0.5"
              style={{ background: "#22c55e", boxShadow: "0 0 8px rgba(34,197,94,0.4)" }}
            >
              <svg width="7" height="7" viewBox="0 0 9 9" fill="none">
                <path d="M1.5 4.5L3.5 6.5L7.5 2.5" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span style={{ fontSize: 7, fontWeight: 800, color: "white", letterSpacing: "0.06em" }}>VERIFIED</span>
            </div>
            {/* Name + role overlaid at bottom */}
            <div className="absolute bottom-0 left-0 right-0 px-3 py-2.5">
              <p className="text-white font-bold leading-tight truncate" style={{ fontSize: 12 }}>{p.name}</p>
              <p className="text-white/55 leading-tight mt-0.5 truncate" style={{ fontSize: 10 }}>{p.role}</p>
            </div>
          </div>
        </div>
      ))}

      <style>{`
        @keyframes floatUp {
          0%   { transform: rotate(var(--rotate)) translateY(0px)    scale(var(--scale)); opacity: 0; }
          8%   { opacity: 1; }
          92%  { opacity: 1; }
          100% { transform: rotate(var(--rotate)) translateY(-860px) scale(var(--scale)); opacity: 0; }
        }
      `}</style>
    </div>
  );
}
