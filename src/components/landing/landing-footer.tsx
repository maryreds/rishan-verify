import { ShieldCheck } from "lucide-react";

export default function LandingFooter() {
  return (
    <footer className="border-t border-white/5 py-10 px-6 lg:px-12">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-blue-400" />
          <span className="text-sm font-semibold text-slate-400">
            Rishan Verify
          </span>
        </div>
        <p className="text-xs text-slate-600">
          &copy; {new Date().getFullYear()} Rishan Consulting. All rights
          reserved.
        </p>
        <div className="flex gap-6 text-xs text-slate-500">
          <a href="#" className="hover:text-slate-300 transition-colors">
            Privacy Policy
          </a>
          <a href="#" className="hover:text-slate-300 transition-colors">
            Terms of Service
          </a>
          <a href="#" className="hover:text-slate-300 transition-colors">
            Contact
          </a>
        </div>
      </div>
    </footer>
  );
}
