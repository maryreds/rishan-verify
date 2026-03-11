import { ShieldCheck } from "lucide-react";

const footerLinks = {
  Features: [
    { label: "Verified Badge", href: "#features" },
    { label: "Profile Builder", href: "#features" },
    { label: "AI Resume Parser", href: "#features" },
  ],
  Resources: [
    { label: "How It Works", href: "#how-it-works" },
    { label: "Help Center", href: "#" },
    { label: "FAQ", href: "#" },
  ],
  Company: [
    { label: "About Us", href: "#" },
    { label: "Privacy", href: "#" },
    { label: "Terms", href: "#" },
  ],
};

export default function LandingFooter() {
  return (
    <footer className="border-t border-border">
      <div className="max-w-7xl mx-auto px-6 lg:px-12 py-16">
        {/* Top: logo + columns */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <ShieldCheck className="w-5 h-5 text-emerald-500" />
              <span className="text-sm font-semibold">Rishan Verify</span>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed max-w-[200px]">
              The trusted platform for verified professionals in the staffing industry.
            </p>
          </div>

          {/* Link columns */}
          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-4">
                {title}
              </h4>
              <ul className="space-y-2.5">
                {links.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom divider with name */}
        <div className="mt-16 pt-8 border-t border-border flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold tracking-tight">Rishan</span>
            <span className="text-muted-foreground/40 select-none">——</span>
            <span className="text-sm font-semibold tracking-tight">Verify</span>
          </div>
          <p className="text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} Rishan Consulting. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
