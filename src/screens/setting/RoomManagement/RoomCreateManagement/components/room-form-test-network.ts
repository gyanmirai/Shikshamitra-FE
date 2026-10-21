import { http, HttpResponse } from 'msw';
import { mswServer } from 'src/test/mswServer';
import { _api as iconifyApi } from '@iconify/react';

export function prepareRoomFormNetwork() {
  iconifyApi.setFetch((...args) => fetch(...args));
  mswServer.use(
    http.get('*/api/auth/session', () => HttpResponse.json(null)),
    http.get('*/api/institute-setup/buildings', () =>
      HttpResponse.json([
        { id: 'building-a', buildingName: 'Main', floors: [{ id: 'floor-a', floorName: 'First' }] },
      ])
    ),
    http.get('*/api/app/room-type', () =>
      HttpResponse.json({ items: [{ id: 'type-a', roomTypeName: 'Classroom' }] })
    ),
    http.get('*/api/institute-setup/rooms/features', () =>
      HttpResponse.json({ items: [{ id: 'whiteboard', name: 'Whiteboard' }] })
    ),
    http.get('https://api.iconify.design/:collection', ({ request, params }) =>
      HttpResponse.json({
        prefix: String(params.collection).replace('.json', ''),
        icons: {},
        not_found: new URL(request.url).searchParams.get('icons')?.split(',') ?? [],
      })
    )
  );
}
