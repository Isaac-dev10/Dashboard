import * as Data from '@/app/lib/data';

export const dynamic = 'force-static';

export async function GET() {
  try {
    return Response.json(await Data.fetchLatestInvoices());
  } catch (error) {
    return Response.json({ error }, { status: 500 });
  }
}
