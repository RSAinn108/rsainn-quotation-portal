/* RSAinn shared authentication guard — development */
(function () {
  "use strict";
  const url = "https://xhxwjaobubxbretiqwsr.supabase.co";
  const key = "sb_publishable_dN3KP37RRjRY-_0SFCYPkA_lsszaNoH";
  const loginUrl = "index.html";
  const overlay = document.getElementById("rsainn-auth-check");
  function message(value) { if (overlay) overlay.textContent = value; }
  function redirect() { window.location.replace(loginUrl); }
  async function start() {
    if (!window.supabase || !window.supabase.createClient) {
      message("Unable to load authentication. Check your internet connection and refresh.");
      return;
    }
    const authClient = window.supabase.createClient(url, key, {auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}});
    try {
      const { data, error } = await authClient.auth.getUser();
      if (error || !data || !data.user) { redirect(); return; }
      const { data: permitted, error: permissionError } = await authClient.rpc("is_rsainn_staff");
      if (permissionError) throw permissionError;
      if (permitted !== true) { await authClient.auth.signOut(); redirect(); return; }
      // Run original page code only after a verified staff session.
      const original = document.getElementById("rsainn-protected-page-code");
      if (!original) throw new Error("Protected page script missing");
      const script = document.createElement("script");
      script.textContent = original.textContent;
      document.body.appendChild(script);
      document.documentElement.classList.add("rsainn-authenticated");
      if (overlay) overlay.remove();
    } catch (err) {
      console.error("RSAinn access verification failed:", err);
      message("Unable to verify staff access. Please refresh or return to the login page.");
      if (overlay) {
        const link = document.createElement("a"); link.href = loginUrl; link.textContent = " Open login";
        overlay.appendChild(link);
      }
    }
  }
  start();
})();
