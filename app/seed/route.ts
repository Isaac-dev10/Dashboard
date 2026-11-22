export const dynamic = 'force-static';

export async function GET() {
  return Response.json({
    message: 'Database seeding disabled for static builds.',
  });
}
