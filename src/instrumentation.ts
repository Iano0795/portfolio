export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    // Prefer IPv4: some networks advertise DNS64/NAT64 (64:ff9b::/96) addresses that
    // hang until undici's connect timeout, surfacing as UND_ERR_CONNECT_TIMEOUT
    // "fetch failed" errors on Supabase calls.
    const dns = await import('node:dns');
    dns.setDefaultResultOrder('ipv4first');
  }
}
