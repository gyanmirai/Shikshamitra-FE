import { http, HttpResponse } from 'msw';

export const iconApiHandlers = [
  http.get(/^https:\/\/api\.(iconify.design|simplesvg.com|unisvg.com)\//, ({ request }) => {
    const url = new URL(request.url);
    return HttpResponse.json({
      prefix: url.pathname.slice(1, -5),
      icons: {},
      not_found: url.searchParams.get('icons')?.split(',') || [],
    });
  }),
];
