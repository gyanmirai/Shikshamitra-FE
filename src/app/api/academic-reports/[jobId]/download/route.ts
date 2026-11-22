import { auth } from 'src/auth';
import { academicReportPaths, academicReportIdPattern } from 'src/constants/academic-report-paths';

export const dynamic = 'force-dynamic';

const recoveryCodes = new Set(['Academic:Reports:050001', 'Academic:Reports:050002', 'Academic:Reports:050004']);

interface DownloadRouteContext {
  params: Promise<{ jobId: string }>;
}

export async function GET(_request: Request, context: DownloadRouteContext): Promise<Response> {
  const { jobId } = await context.params;
  if (!academicReportIdPattern.test(jobId)) {
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

  if (!upstream.ok) {
    const content = upstream.headers.get('content-type') ?? '';
    const problem = content.includes('application/problem+json') || content.includes('application/json')
      ? await upstream.json().catch(() => null) : null;
    if (recoveryCodes.has(problem?.errorCode ?? problem?.error?.code)) {
      return new Response(null, {
        status: 303,
        headers: { Location: academicReportPaths.recovery(jobId), 'Cache-Control': 'private, no-store' },
      });
    }
    return new Response('The report could not be downloaded.', { status: upstream.status });
  }
  if (!upstream.body) return new Response('The report file could not be opened.', { status: 502 });

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
