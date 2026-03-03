export async function action(_: { request: Request; context: Record<string, unknown> }) {
  const headers = new Headers({ 'content-type': 'application/json' });
  // Clear the session cookie by setting Max-Age=0
  headers.set(
    'set-cookie',
    'session_token=; HttpOnly; Path=/; SameSite=Lax; Max-Age=0; expires=Thu, 01 Jan 1970 00:00:00 GMT'
  );
  return new Response(JSON.stringify({ ok: true }), { status: 200, headers });
}
