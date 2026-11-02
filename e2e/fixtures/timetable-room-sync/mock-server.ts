import type { Plugin } from 'vite';

export const divisionId = '11111111-1111-4111-8111-111111111111';
export const standardId = '22222222-2222-4222-8222-222222222222';
export const rooms = [
  {
    id: '33333333-3333-4333-8333-333333333333',
    roomName: 'B101',
    floorName: 'First Floor',
    buildingName: 'Main Academic Block',
  },
  {
    id: '44444444-4444-4444-8444-444444444444',
    roomName: 'B2222',
    floorName: 'Second Floor',
    buildingName: 'Main Academic Block',
  },
  {
    id: '55555555-5555-4555-8555-555555555555',
    roomName: 'Science Lab',
    floorName: 'First Floor',
    buildingName: 'Main Academic Block',
  },
];

export function syntheticTimetableServer(): Plugin {
  let roomId: string | null = rooms[0].id;
  return {
    name: 'synthetic-timetable-room-sync',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const url = new URL(req.url ?? '/', 'http://127.0.0.1:4338');
        if (!url.pathname.startsWith('/api/')) return next();
        const send = (value: unknown, status = 200) => {
          res.writeHead(status, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify(value));
        };
        if (url.pathname === '/api/fixture/reset') {
          roomId = rooms[0].id;
          return send({});
        }
        if (url.pathname === `/api/app/division/${divisionId}`) {
          if (req.method === 'PUT') {
            let raw = '';
            for await (const chunk of req) raw += chunk;
            roomId = JSON.parse(raw).roomNumber || null;
          }
          return send({
            id: divisionId,
            standardId,
            name: 'A',
            strength: 40,
            roomId,
            roomNumber: roomId,
          });
        }
        if (url.pathname === '/api/app/room')
          return send({ items: rooms, totalCount: rooms.length });
        if (url.pathname.startsWith('/api/app/room/')) {
          const room = rooms.find((item) => url.pathname.endsWith(item.id));
          return send(room ?? {}, room ? 200 : 404);
        }
        if (url.pathname === '/api/auth/session')
          return send({ accessToken: 'synthetic-local-test' });
        if (url.pathname.endsWith('/subject-assignments')) return send({ data: { items: [] } });
        if (url.pathname.includes('/room-availability'))
          return send(rooms.map((room) => ({ ...room, roomId: room.id, status: 'available' })));
        return send({ error: { message: `Unhandled fixture request: ${url.pathname}` } }, 404);
      });
    },
  };
}
