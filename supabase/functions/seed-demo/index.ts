import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  const supabaseAdmin = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );

  const DEMO_EMAIL = "demo@healthkey.in";
  const DEMO_PASSWORD = "demo123456";

  try {
    // Check if demo user exists
    const { data: existingUsers } = await supabaseAdmin.auth.admin.listUsers();
    const existingDemo = existingUsers?.users?.find(u => u.email === DEMO_EMAIL);

    let userId: string;

    if (existingDemo) {
      userId = existingDemo.id;
    } else {
      // Create demo auth user
      const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
        email: DEMO_EMAIL,
        password: DEMO_PASSWORD,
        email_confirm: true,
      });
      if (authError) throw authError;
      userId = authData.user.id;
    }

    // Check if patient record exists
    const { data: existingPatient } = await supabaseAdmin
      .from("patients")
      .select("id")
      .eq("user_id", userId)
      .single();

    if (!existingPatient) {
      // Create patient record
      const { data: patient, error: patientError } = await supabaseAdmin
        .from("patients")
        .insert({
          user_id: userId,
          healthkey_id: "HK-2847-NKGP",
          name: "Snigdha Chaudhari",
          age: 28,
          gender: "Female",
          phone: "+91-98765-43210",
          email: DEMO_EMAIL,
          blood: "A+",
          state: "Maharashtra",
          allergies: ["Penicillin", "Peanuts", "Sulfa drugs"],
          medications: ["Lisinopril 10mg", "Metformin 500mg"],
          conditions: ["Hypertension", "Type 2 Diabetes"],
          surgeries: [{ name: "Appendectomy", date: "March 2023" }],
          emergency_contacts: [
            { name: "Vijay Chaudhari", relation: "Father", phone: "+91-98XXX-XXXXX" },
            { name: "Meena Chaudhari", relation: "Mother", phone: "+91-97XXX-XXXXX" },
          ],
          privacy_toggles: { allergies: true, medications: true, conditions: true, surgeries: true },
        })
        .select()
        .single();

      if (patientError) throw patientError;

      // Seed demo documents
      await supabaseAdmin.from("documents").insert([
        { patient_id: patient.id, user_id: userId, name: "City_Hospital_Discharge_Jan2026.pdf", upload_date: "Jan 15, 2026", status: "Processed", lang: "English" },
        { patient_id: patient.id, user_id: userId, name: "Prescription_Feb2026.jpg", upload_date: "Feb 10, 2026", status: "Processed", lang: "Marathi → English" },
        { patient_id: patient.id, user_id: userId, name: "BloodReport_Dec2025.pdf", upload_date: "Dec 5, 2025", status: "Processed", lang: "English" },
      ]);

      // Seed demo audit logs
      await supabaseAdmin.from("audit_logs").insert([
        { patient_id: patient.id, doctor_name: "Dr. Ramesh Patil", hospital: "AIIMS Nagpur", purpose: "Emergency Treatment", duration: "30 min", status: "Expired" },
        { patient_id: patient.id, doctor_name: "Dr. Priya Sharma", hospital: "Wockhardt Hospital, Mumbai", purpose: "OPD Consultation", duration: "30 min", status: "Expired" },
        { patient_id: patient.id, doctor_name: "Dr. Anil Mehta", hospital: "Apollo Hospitals, Nagpur", purpose: "Pre-surgery Review", duration: "30 min", status: "Expired" },
      ]);
    }

    return new Response(
      JSON.stringify({ success: true, message: "Demo account seeded", userId }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
