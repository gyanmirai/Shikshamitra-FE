import http from 'node:http';
import { createAcademicFixture } from '../academic-module-setup/state.mjs';
import { handleManagers } from '../academic-module-setup/managers.mjs';
import {
  ids,
  year,
  board,
  medium,
  standard,
  permissionNames,
} from '../academic-module-setup/data.mjs';

standard.name = 'Std 4';
board.name = 'GSEB';
const otherClass = { ...standard, id: '77777777-7777-4777-8777-777777777777', name: 'Std 5' };
medium.educationMediumStages[0].standards.push(otherClass);
let fixture;
let weekly;
const slots = {
  id: '88888888-8888-4888-8888-888888888888',
  standardId: ids.standard,
  standardName: standard.name,
  activeDaysCount: 6,
  teachingSlotsPerDay: 7,
  weeklyTeachingCapacity: 39,
  status: 'PendingWeeklyLectures',
  slotConfigurations: [],
};
const reset = () => {
  fixture = createAcademicFixture({ visited: true });
  weekly = [];
  fixture.state.settings['lecture-slots'] = [slots];
};
reset();
http
  .createServer(async (req, res) => {
    const send = (status, value) => {
      res.writeHead(status, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(value));
    };
    res.setHeader('Access-Control-Allow-Origin', 'http://127.0.0.1:4478');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Headers', 'authorization,content-type,__tenant');
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,OPTIONS');
    if (req.method === 'OPTIONS') {
      res.writeHead(204);
      res.end();
      return;
    }
    const url = new URL(req.url, 'http://127.0.0.1:4477');
    let raw = '';
    for await (const chunk of req) raw += chunk;
    const body =
      raw && req.headers['content-type']?.includes('application/json') ? JSON.parse(raw) : {};
    if (url.pathname === '/fixture/reset') {
      reset();
      send(200, {});
      return;
    }
    if (url.pathname === '/fixture/context') {
      send(200, { year, board, medium, ids });
      return;
    }
    if (url.pathname === '/fixture/snapshot') {
      send(200, { weekly });
      return;
    }
    if (url.pathname === '/api/permission-management/permissions') {
      send(200, {
        groups: [{ permissions: permissionNames.map((name) => ({ name, isGranted: true })) }],
      });
      return;
    }
    if (url.pathname === '/api/academics/timetable/settings/weekly-lecture-slots') {
      if (req.method === 'POST') {
        const totalLectures = body.subjects.reduce(
          (sum, subject) => sum + subject.weeklyLectures,
          0
        );
        weekly.push({
          ...body,
          id: '99999999-9999-4999-8999-999999999999',
          standardName: standard.name,
          subjects: body.subjects.map((subject) => ({ ...subject, subjectName: 'Mathematics' })),
          totalLectures,
          availableTeachingCapacity: 39,
          difference: 39 - totalLectures,
          status: 'FreeSlotsAvailable',
        });
        fixture.state.settings['weekly-lectures'] = weekly;
        send(200, weekly.at(-1));
      } else send(200, { items: weekly, totalCount: weekly.length });
      return;
    }
    const subjects = url.pathname.match(/\/curriculum\/([^/]+)\/subject-assignments$/);
    if (subjects) {
      const items =
        subjects[1] === ids.standard
          ? [
              {
                id: 'published-math',
                status: 1,
                subjectType: 0,
                color: '',
                subjects: [
                  {
                    subjectId: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
                    subjectName: 'Mathematics',
                    subjectCode: 'MATH',
                  },
                ],
              },
            ]
          : [];
      send(200, { data: { items, totalCount: items.length } });
      return;
    }
    if (await fixture.handle(url, req.method, body, send)) return;
    const token = req.headers.authorization?.split('.')[1];
    const claims = token ? JSON.parse(Buffer.from(token, 'base64url').toString()) : {};
    if (await handleManagers(url, req.method, body, send, fixture, claims)) return;
    if (
      url.pathname.startsWith('/api/') &&
      ![
        '/api/host/session-context',
        '/api/abp/application-configuration',
        '/api/permission-management/permissions',
      ].includes(url.pathname)
    ) {
      send(200, { items: [], totalCount: 0 });
      return;
    }
    const upstream = await fetch(`http://127.0.0.1:4479${url.pathname}${url.search}`, {
      method: req.method,
      headers: { ...req.headers, host: '127.0.0.1:4479' },
      ...(!['GET', 'HEAD'].includes(req.method) ? { body: raw } : {}),
    });
    send(upstream.status, await upstream.json());
  })
  .listen(4477, '127.0.0.1', () =>
    process.stdout.write('Weekly lecture regression API ready on 4477\n')
  );
