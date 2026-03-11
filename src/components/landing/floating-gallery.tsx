"use client";

import Image from "next/image";
import { ShieldCheck } from "lucide-react";
import { motion } from "framer-motion";

const profiles = [
  { id: "photo-1494790108377-be9c29b29330", name: "Rachel Williams", role: "Frontend Developer" },
  { id: "photo-1507003211169-0a1dd7228f2d", name: "Marcus Thompson", role: "Lead Backend Engineer" },
  { id: "photo-1580489944761-15a19d654956", name: "Aisha Davis", role: "Product Designer" },
  { id: "photo-1438761681033-6461ffad8d80", name: "Jenny Liu", role: "Data Scientist" },
  { id: "photo-1573496359142-b8d87734a5a2", name: "Sofia Rivera", role: "UX / UI Designer" },
  { id: "photo-1531123897727-8f129e1688ce", name: "Imani Carter", role: "DevSecOps Engineer" },
  { id: "photo-1519085360753-af0119f7cbe7", name: "Arjun Patel", role: "Cloud Architect" },
  { id: "photo-1506794778202-cad84cf45f1d", name: "Ryan Mitchell", role: "ML Engineer" },
  { id: "photo-1472099645785-5658abf4ff4e", name: "James O'Brien", role: "Site Reliability Eng." },
  { id: "photo-1573497019940-1c28c88b4f3e", name: "Natalia Gomez", role: "Engineering Manager" },
  { id: "photo-1567532939604-b6b5b0db2604", name: "Priya Sharma", role: "Sr. DevOps Engineer" },
  { id: "photo-1560250097-0b93528c311a", name: "Kevin Park", role: "Solutions Architect" },
  { id: "photo-1534528741775-53994a69daeb", name: "Emma Scott", role: "Product Manager" },
  { id: "photo-1539571696357-5a69c17a67c6", name: "Vikram Nair", role: "Full-Stack Engineer" },
];

export default function FloatingGallery() {
  return (
    <div className="relative w-full overflow-hidden">
      {/* Fade edges */}
      <div className="absolute top-0 left-0 bottom-0 w-16 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none" />
      <div className="absolute top-0 right-0 bottom-0 w-16 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none" />

      <div className="flex gap-5 px-6 overflow-x-auto scrollbar-hide pb-4">
        {profiles.map((p, i) => (
          <motion.div
            key={p.id}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ delay: i * 0.05, duration: 0.4 }}
            className="flex-shrink-0 w-[180px]"
          >
            <div className="rounded-2xl overflow-hidden border border-border bg-card shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300">
              <div className="relative">
                <Image
                  src={`https://images.unsplash.com/${p.id}?w=320&h=400&fit=crop&crop=face`}
                  alt={p.name}
                  width={180}
                  height={220}
                  className="w-full h-[220px] object-cover"
                  unoptimized
                />
                {/* Verified badge */}
                <div className="absolute top-2.5 right-2.5 flex items-center gap-1 bg-emerald-500 rounded px-1.5 py-0.5">
                  <ShieldCheck className="w-3 h-3 text-white" />
                  <span className="text-[8px] font-bold text-white tracking-wide">VERIFIED</span>
                </div>
              </div>
              <div className="p-3">
                <p className="text-sm font-semibold text-foreground truncate">{p.name}</p>
                <p className="text-xs text-muted-foreground truncate mt-0.5">{p.role}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <style>{`
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
}
