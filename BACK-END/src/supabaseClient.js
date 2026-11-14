
const { createClient } = require("@supabase/supabase-js");

const supabaseKey = process.env.SUPABASE_SECRET_KEY
  || process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabaseUrl = process.env.SUPABASE_URL;

if (!supabaseUrl || !supabaseKey) {
  throw new Error(
    "SUPABASE_URL and SUPABASE_SECRET_KEY must be configured in .env."
  );
}

const usesSecretKeyFormat = supabaseKey.startsWith("sb_secret_");
const usesLegacyServiceRoleFormat = supabaseKey.startsWith("eyJ");

if (!usesSecretKeyFormat && !usesLegacyServiceRoleFormat) {
  throw new Error(
    "Invalid Supabase API key. Copy the Secret key (sb_secret_...) or legacy " +
    "service-role key from Supabase Project Settings > API."
  );
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function runQuery(query) {
  let result;

  try {
    result = await query;
  } catch (error) {
    const queryError = new Error(`Could not connect to Supabase: ${error.message}`);
    queryError.code = error.cause?.code || error.code || "SUPABASE_CONNECTION";
    queryError.status = 502;
    throw queryError;
  }

  const { data, error } = result;

  if (error) {
    const queryError = new Error(`Supabase request failed: ${error.message}`);
    queryError.code = error.code;
    queryError.status = 502;
    throw queryError;
  }

  return data;
}

module.exports = {
  supabase,
  runQuery
};
