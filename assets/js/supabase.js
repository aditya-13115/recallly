const SUPABASE_URL =
  "https://zwcmxdkjkpmnizrxewnm.supabase.co";

const SUPABASE_KEY =
  "sb_publishable_vaYuEv8nPHFfo1NuUFjcYQ_wtCqh38I";

const supabase = window.supabase.createClient(
  SUPABASE_URL,
  SUPABASE_KEY
);

/* ---------------------------------------------------------------------- */
/* Auth helpers                                                           */
/* This file contains ONLY Supabase client logic — no DOM access, no UI.  */
/* app.js calls these functions and decides what to render.               */
/* ---------------------------------------------------------------------- */

async function signup(email, password) {
  const { data, error } = await supabase.auth.signUp({ email, password });
  if (error) throw error;
  return data;
}

async function login(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data;
}

async function logout() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
  return true;
}

async function forgotPassword(email) {
  const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: window.location.origin + window.location.pathname
  });
  if (error) throw error;
  return data;
}

async function getSession() {
  const { data, error } = await supabase.auth.getSession();
  if (error) throw error;
  return data.session;
}

async function currentUser() {
  const session = await getSession();
  return session ? session.user : null;
}

/* Resolves to the current user, or null if nobody is logged in.
   app.js uses this at startup to decide whether to show the auth dialog. */
async function requireLogin() {
  const user = await currentUser();
  return user || null;
}

/* -------------------------- profiles table ----------------------------- */

async function fetchProfile(userId) {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();
  if (error) throw error;
  return data;
}

async function upsertProfile(userId, displayName) {
  const { data, error } = await supabase
    .from("profiles")
    .upsert({ user_id: userId, display_name: displayName }, { onConflict: "user_id" })
    .select()
    .single();
  if (error) throw error;
  return data;
}

/* --------------------------- topics table ------------------------------- */

async function fetchTopics(userId) {
  const { data, error } = await supabase
    .from("topics")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: true });
  if (error) throw error;
  return data;
}

async function insertTopic(userId, topic) {
  const { data, error } = await supabase
    .from("topics")
    .insert({ ...topic, user_id: userId })
    .select()
    .single();
  if (error) throw error;
  return data;
}

async function updateTopic(id, patch) {
  const { data, error } = await supabase
    .from("topics")
    .update(patch)
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

async function deleteTopic(id) {
  const { error } = await supabase.from("topics").delete().eq("id", id);
  if (error) throw error;
  return true;
}

async function deleteTopics(ids) {
  const { error } = await supabase.from("topics").delete().in("id", ids);
  if (error) throw error;
  return true;
}

async function bulkInsertTopics(userId, topics) {
  if (!topics.length) return [];
  const rows = topics.map(t => ({ ...t, user_id: userId }));
  const { data, error } = await supabase.from("topics").insert(rows).select();
  if (error) throw error;
  return data;
}