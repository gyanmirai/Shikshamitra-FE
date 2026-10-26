import type { Plugin } from 'vite';

const defaults = () => ({
  buildings: { buildingName: 0, floorName: 0, description: 0 },
  roomTypes: { roomTypeName: 0, shortName: 0 },
  rooms: { roomName: 0, featureName: 0 },
  shifts: { shiftName: 0 },
  schoolIdentity: { principalName: 0, designation: 0 },
  schoolDocuments: { name: 0, notes: 0 },
});
type Scope = keyof ReturnType<typeof defaults>;
export function instituteFormattingServer(): Plugin {
  let rules = defaults();
  let failNextSave = false;
  const writes: { scope: string; fields: Record<string, number> }[] = [];
  const previews: unknown[] = [];
  return {
    name: 'synthetic-institute-formatting-network',
    configureServer(server) {
      server.middlewares.use((request, response, next) => {
        const route = new URL(request.url ?? '/', 'http://127.0.0.1:4341').pathname;
        if (!route.startsWith('/api/') && !route.startsWith('/fixture/')) {
          next();
          return;
        }
        response.setHeader('Content-Type', 'application/json');
        const send = (data: unknown, status = 200) => {
          response.statusCode = status;
          response.end(JSON.stringify(data));
        };
        if (route === '/fixture/reset') {
          rules = defaults();
          writes.length = 0;
          previews.length = 0;
          failNextSave = false;
          send({ ok: true });
          return;
        }
        if (route === '/fixture/state') {
          send({ rules, writes, previews });
          return;
        }
        if (route === '/fixture/fail-next-save') {
          failNextSave = true;
          send({ ok: true });
          return;
        }
        if (route === '/api/auth/session') {
          send({ accessToken: 'synthetic-local-test' });
          return;
        }
        const match = /^\/api\/app\/institute-field-formatting\/([^/]+)(\/preview)?$/.exec(route);
        const scope = match?.[1] as Scope | undefined;
        if (!scope || !Object.hasOwn(rules, scope)) {
          send({ error: { message: 'Unknown synthetic route.' } }, 404);
          return;
        }
        let raw = '';
        request.on('data', (chunk) => {
          raw += chunk;
        });
        request.on('end', () => {
          const body = raw ? JSON.parse(raw) : {};
          if (match?.[2]) {
            previews.push({ scope, ...body });
            if (body.value === 'école primaire' && body.textCase === 4)
              send({ value: 'ÉCOLE PRIMAIRE' });
            else if (body.value === 'ßeta' && body.textCase === 3) send({ value: 'ßeta' });
            else
              send(
                {
                  error: {
                    message: 'This fixture supports only the listed Unicode preview cases.',
                  },
                },
                400
              );
            return;
          }
          if (request.method === 'GET') {
            send({ fields: rules[scope] });
            return;
          }
          if (request.method === 'PUT') {
            if (failNextSave) {
              failNextSave = false;
              send({ error: { message: 'Synthetic save failure.' } }, 503);
              return;
            }
            rules = { ...rules, [scope]: body.fields };
            writes.push({ scope, fields: body.fields });
            send({ fields: rules[scope] });
            return;
          }
          send({ error: { message: 'Unsupported synthetic request.' } }, 405);
        });
      });
    },
  };
}
