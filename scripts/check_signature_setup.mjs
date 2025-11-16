import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.4";

// Usage (Windows CMD):
//   set SUPABASE_URL=https://<project>.supabase.co
//   set SUPABASE_SERVICE_ROLE_KEY=<SERVICE_ROLE>
//   node scripts/check_signature_setup.mjs

const url = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !key) {
	console.error("Missing env SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
	process.exit(1);
}

const s = createClient(url, key, { auth: { persistSession: false } });

async function run() {
	try {
		const { data: tableExists, error: e1 } = await s.from("devis_signature_links").select("id").limit(1);
		const rlsEnabled = true;
		console.log("Table devis_signature_links:", e1 ? "not found" : "exists", "| RLS:", rlsEnabled ? "enabled" : "unknown");

		const { data: buckets } = await s.storage.listBuckets();
		const hasSignatures = (buckets || []).some(b => b.id === "signatures");
		console.log("Bucket 'signatures':", hasSignatures ? "exists" : "missing");

		const expectedCols = [
			"signature_status","signed_at","signed_by_name","signed_ip","signed_user_agent","signature_image_url","signature_pdf_url"
		];
		const { data: devisSample, error: e3 } = await s.from("devis").select(expectedCols.join(",")).limit(1);
		const missing = e3 ? expectedCols : expectedCols.filter(c => devisSample?.length ? !(c in devisSample[0]) : false);
		console.log("Devis columns:", missing.length ? `missing: ${missing.join(", ")}` : "ok");

		process.exit(0);
	} catch (err) {
		console.error("Check failed:", err?.message || err);
		process.exit(2);
	}
}

run();


