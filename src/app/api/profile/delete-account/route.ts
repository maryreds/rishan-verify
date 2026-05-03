import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/api-auth";
import { createAdminClient } from "@/lib/supabase-admin";

export async function POST() {
  try {
    const auth = await requireAuth();
    if (!auth.ok) return auth.response;

    const userId = auth.userId;
    const admin = createAdminClient();

    // (a) Best-effort delete storage objects from photos and resumes buckets.
    // Files are stored under `${userId}/...` per upload-photo route convention.
    for (const bucket of ["photos", "resumes"]) {
      try {
        const { data: files } = await admin.storage
          .from(bucket)
          .list(userId, { limit: 1000 });

        if (files && files.length > 0) {
          const paths = files.map((f) => `${userId}/${f.name}`);
          await admin.storage.from(bucket).remove(paths);
        }
      } catch (err) {
        // Best-effort — log and continue.
        console.warn(`Storage cleanup failed for bucket ${bucket}:`, err);
      }
    }

    // (b) Delete the profile row. Cascading FKs should clean up child tables.
    const { error: profileError } = await admin
      .from("profiles")
      .delete()
      .eq("id", userId);

    if (profileError) {
      console.error("Profile delete failed:", profileError);
      return NextResponse.json(
        { error: "Couldn't delete profile data. Contact support." },
        { status: 500 }
      );
    }

    // (c) Delete the auth user. ONLY for the authenticated caller's own ID.
    const { error: authError } = await admin.auth.admin.deleteUser(userId);

    if (authError) {
      console.error("Auth user delete failed:", authError);
      return NextResponse.json(
        { error: "Couldn't delete auth account. Contact support." },
        { status: 500 }
      );
    }

    // Sign the caller's session out so the cookies are cleared on the client.
    try {
      await auth.supabase.auth.signOut();
    } catch {
      // Ignore — user is already gone in the auth system.
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("delete-account error:", error);
    return NextResponse.json(
      { error: "Failed to delete account" },
      { status: 500 }
    );
  }
}
