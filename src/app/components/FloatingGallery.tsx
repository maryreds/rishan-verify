"use client";

import Image from "next/image";

const photos = [
  { id: "photo-1573496359142-b8d87734a5a2", w: 180, h: 240, rotate: "-3deg", x: "8%",  delay: "0s",    duration: "14s", scale: 1.0 },
  { id: "photo-1507003211169-0a1dd7228f2d", w: 150, h: 200, rotate: "4deg",  x: "24%", delay: "-4s",   duration: "16s", scale: 0.9 },
  { id: "photo-1580489944761-15a19d654956", w: 200, h: 260, rotate: "-5deg", x: "42%", delay: "-8s",   duration: "13s", scale: 1.1 },
  { id: "photo-1438761681033-6461ffad8d80", w: 155, h: 210, rotate: "2deg",  x: "60%", delay: "-2s",   duration: "17s", scale: 0.85 },
  { id: "photo-1494790108377-be9c29b29330", w: 175, h: 230, rotate: "-6deg", x: "76%", delay: "-10s",  duration: "15s", scale: 1.05 },
  { id: "photo-1522071820081-009f0129c71c", w: 160, h: 215, rotate: "5deg",  x: "15%", delay: "-6s",   duration: "18s", scale: 0.95 },
  { id: "photo-1551434678-e076c223a692",    w: 145, h: 195, rotate: "-2deg", x: "52%", delay: "-12s",  duration: "12s", scale: 0.88 },
  { id: "photo-1573497019940-1c28c88b4f3e", w: 170, h: 225, rotate: "6deg",  x: "86%", delay: "-5s",   duration: "16s", scale: 1.0 },
];

export default function FloatingGallery() {
  return (
    <div className="relative w-full overflow-hidden" style={{ height: "520px", perspective: "800px" }}>
      {/* Dark fade at top and bottom */}
      <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-[#06060f] to-transparent z-10 pointer-events-none" />
      <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-[#06060f] to-transparent z-10 pointer-events-none" />

      {/* Side fades */}
      <div className="absolute top-0 left-0 bottom-0 w-24 bg-gradient-to-r from-[#06060f] to-transparent z-10 pointer-events-none" />
      <div className="absolute top-0 right-0 bottom-0 w-24 bg-gradient-to-l from-[#06060f] to-transparent z-10 pointer-events-none" />

      {photos.map((photo, i) => (
        <div
          key={photo.id}
          className="absolute"
          style={{
            left: photo.x,
            bottom: "-260px",
            width: photo.w,
            animation: `floatUp ${photo.duration} ${photo.delay} linear infinite`,
            transform: `rotate(${photo.rotate}) scale(${photo.scale})`,
            transformOrigin: "center bottom",
          }}
        >
          <div
            className="rounded-2xl overflow-hidden border border-white/10 shadow-2xl"
            style={{
              boxShadow: "0 20px 60px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.05)",
            }}
          >
            <Image
              src={`https://images.unsplash.com/${photo.id}?w=400&h=520&fit=crop&crop=face`}
              alt="Professional"
              width={photo.w}
              height={photo.h}
              className="object-cover w-full"
              style={{ height: photo.h }}
              unoptimized
            />
          </div>
        </div>
      ))}

      <style>{`
        @keyframes floatUp {
          0%   { transform: rotate(var(--rotate, 0deg)) translateY(0px) scale(var(--scale, 1)); opacity: 0; }
          8%   { opacity: 1; }
          92%  { opacity: 1; }
          100% { transform: rotate(var(--rotate, 0deg)) translateY(-820px) scale(var(--scale, 1)); opacity: 0; }
        }
      `}</style>
    </div>
  );
}
