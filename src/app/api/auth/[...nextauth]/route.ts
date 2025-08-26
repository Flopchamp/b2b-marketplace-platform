// This file is disabled - using dev auth service instead
export function GET() {
  return Response.json({ error: 'NextAuth is disabled' }, { status: 404 });
}
