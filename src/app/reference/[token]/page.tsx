import { createClient } from "@/lib/supabase-server";
import { QuestionnaireForm } from "@/components/reference/questionnaire-form";

interface ReferencePageProps {
  params: Promise<{ token: string }>;
}

export default async function ReferencePage({ params }: ReferencePageProps) {
  const { token } = await params;
  const supabase = await createClient();

  // Fetch the reference by token
  const { data: reference, error: refError } = await supabase
    .from("references")
    .select("*, profiles(full_name)")
    .eq("token", token)
    .single();

  if (refError || !reference) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-4">
        <div className="text-center max-w-md">
          <h1 className="text-2xl font-bold text-foreground mb-2">
            Reference Not Found
          </h1>
          <p className="text-muted-foreground">
            This reference link is invalid or has expired. Please check the link
            and try again.
          </p>
        </div>
      </div>
    );
  }

  if (reference.status === "completed") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-4">
        <div className="text-center max-w-md">
          <h1 className="text-2xl font-bold text-foreground mb-2">
            Already Completed
          </h1>
          <p className="text-muted-foreground">
            This reference has already been submitted. Thank you for your
            feedback!
          </p>
        </div>
      </div>
    );
  }

  // Fetch active reference questions
  const { data: questions } = await supabase
    .from("reference_questions")
    .select("*")
    .eq("is_active", true)
    .order("sort_order", { ascending: true });

  const candidateName = reference.profiles?.full_name || "the candidate";

  return (
    <div className="min-h-screen bg-background py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <QuestionnaireForm
          token={token}
          candidateName={candidateName}
          refereeName={reference.referee_name}
          questions={questions || []}
        />
      </div>
    </div>
  );
}
