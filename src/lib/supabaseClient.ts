type ContactMessageInsert = {
  name: string;
  email: string;
  message: string;
};

type SupabaseErrorResponse = {
  message?: string;
  error?: string;
};

function getSupabaseConfig() {
  const supabaseUrl = import.meta.env.SUPABASE_URL ?? import.meta.env.PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = import.meta.env.SUPABASE_ANON_KEY ?? import.meta.env.PUBLIC_SUPABASE_ANON_KEY;
  const contactTable = import.meta.env.SUPABASE_CONTACT_TABLE ?? 'contact_messages';

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Supabase environment variables are missing.');
  }

  return { supabaseUrl, supabaseAnonKey, contactTable };
}

export async function insertContactMessage(payload: ContactMessageInsert) {
  const { supabaseUrl, supabaseAnonKey, contactTable } = getSupabaseConfig();
  const endpoint = `${supabaseUrl}/rest/v1/${contactTable}`;

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      apikey: supabaseAnonKey,
      Authorization: `Bearer ${supabaseAnonKey}`,
      Prefer: 'return=minimal',
    },
    body: JSON.stringify(payload),
  });

  if (response.ok) {
    return { ok: true as const };
  }

  let message = 'Supabase insert failed.';
  try {
    const body = (await response.json()) as SupabaseErrorResponse;
    message = body.message ?? body.error ?? message;
  } catch {
    // Keep default fallback message if response is not JSON.
  }

  return {
    ok: false as const,
    status: response.status,
    message,
  };
}
