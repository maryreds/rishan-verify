import { ShieldCheck } from "lucide-react";
import Link from "next/link";

export default function ProfileNotFound() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-6">
      <div className="text-center max-w-md">
        <ShieldCheck className="w-12 h-12 text-gray-300 mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Profile Not Found</h1>
        <p className="text-gray-500 mb-6">
          This verification profile doesn&apos;t exist or the candidate hasn&apos;t been
          verified yet.
        </p>
        <Link
          href="/"
          className="inline-block px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
        >
          Go to Rishan Verify
        </Link>
      </div>
    </div>
  );
}
