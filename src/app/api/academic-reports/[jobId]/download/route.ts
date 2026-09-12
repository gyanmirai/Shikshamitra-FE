import { auth } from 'src/auth';

export const dynamic = 'force-dynamic';

const JOB_ID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

interface DownloadRouteContext {
  params: Promise<{ jobId: string }>;
}

export async function GET(_request: Request, context: DownloadRouteContext): Promise<Response> {
  const { jobId } = await context.params;
  if (!JOB_ID_PATTERN.test(jobId)) {
    return new Response('Invalid report identifier.', { status: 400 });
  }

  const session = (await auth()) as { accessToken?: string } | null;
  if (!session?.accessToken) {
    return new Response('Authentication is required.', { status: 401 });
  }

  const apiUrl = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, '');
  if (!apiUrl) {
    return new Response('The report service is not configured.', { status: 503 });
  }

  const upstream = await fetch(`${apiUrl}/api/app/academic-report/exports/${jobId}/download`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${session.accessToken}`,
      Accept: 'application/pdf, application/octet-stream',
    },
    cache: 'no-store',
  });

  if (!upstream.ok || !upstream.body) {
    return new Response('The report could not be downloaded.', { status: upstream.status });
  }

  const headers = new Headers({
    'Cache-Control': 'private, no-store',
    'Content-Type': upstream.headers.get('content-type') || 'application/pdf',
    'Content-Disposition':
      upstream.headers.get('content-disposition') || 'attachment; filename="academic-report.pdf"',
    'X-Content-Type-Options': 'nosniff',
  });
  const contentLength = upstream.headers.get('content-length');
  if (contentLength) headers.set('Content-Length', contentLength);

  return new Response(upstream.body, { status: 200, headers });
}
