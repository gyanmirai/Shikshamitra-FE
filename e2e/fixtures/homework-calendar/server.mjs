import http from 'node:http';
import { createAcademicFixture } from '../academic-module-setup/state.mjs';
import { handleManagers } from '../academic-module-setup/managers.mjs';
import { insightsPermissions } from '../academic-module-setup/insights-permissions.mjs';
import { ids, year, board, medium } from '../academic-module-setup/data.mjs';

const subjectId = '77777777-7777-4777-8777-777777777777';
const typeId = '88888888-8888-4888-8888-888888888888';
const calendarId = '99999999-9999-4999-8999-999999999999';
let fixture;
let tasks;
let writes;
let blockedDate;
const reset = () => {
  fixture = createAcademicFixture({ visited: true });
  tasks = [];
  writes = [];
  blockedDate = null;
};
reset();
http
  .createServer(async (req, res) => {
    const send = (status, value) => {
      res.writeHead(status, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(value));
    };
    res.setHeader('Access-Control-Allow-Origin', 'http://127.0.0.1:4498');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Headers', 'authorization,content-type,__tenant');
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,OPTIONS');
    if (req.method === 'OPTIONS') {
      res.writeHead(204);
      res.end();
      return;
    }
    const url = new URL(req.url, 'http://127.0.0.1:4497');
    const chunks = [];
    for await (const chunk of req) chunks.push(chunk);
    const raw = Buffer.concat(chunks);
    const contentType = req.headers['content-type'] ?? '';
    let body = {};
    if (raw.length && contentType.includes('application/json')) body = JSON.parse(raw.toString());
    if (raw.length && contentType.includes('multipart/form-data'))
      body = Object.fromEntries(
        await new Response(raw, { headers: { 'Content-Type': contentType } }).formData()
      );
    if (url.pathname === '/fixture/reset') {
      reset();
      send(200, {});
      return;
    }
    if (url.pathname === '/fixture/mode') {
      blockedDate = body.blockedDate ?? null;
      send(200, {});
      return;
    }
    if (url.pathname === '/fixture/context') {
      send(200, { year, board, medium, ids });
      return;
    }
    if (url.pathname === '/fixture/snapshot') {
      send(200, { tasks, writes });
      return;
    }
    if (url.pathname === '/api/permission-management/permissions') {
      send(200, {
        groups: [
          {
            permissions: [
              ...insightsPermissions(),
              'Academics.HomeworkAndAssignment.LearningTasks.Add',
            ].map((name) => ({ name, isGranted: true })),
          },
        ],
      });
      return;
    }
    if (url.pathname.match(/\/curriculum\/[^/]+\/subject-assignments$/)) {
      send(200, {
        data: {
          items: [
            {
              id: 'allocation',
              status: 1,
              subjectType: 0,
              subjects: [{ subjectId, subjectName: 'Mathematics', subjectCode: 'MATH' }],
            },
          ],
        },
      });
      return;
    }
    if (url.pathname === '/api/homework-type') {
      send(200, { data: [{ id: typeId, homeworkTypeName: 'Revision', status: 0 }] });
      return;
    }
    if (url.pathname === '/api/academic/calendars') {
      send(200, {
        items: [
          {
            id: calendarId,
            academicMediumId: ids.medium,
            name: 'School calendar',
            status: 2,
            startDate: year.startDate,
            endDate: year.endDate,
          },
        ],
      });
      return;
    }
    if (url.pathname === `/api/academic/calendars/${calendarId}/days`) {
      send(200, {
        items: [
          {
            id: 'diwali',
            date: '2026-11-07T00:00:00Z',
            dayType: 3,
            title: 'Diwali vacation',
            appliesToAll: false,
            standardId: ids.standard,
            divisionId: ids.division,
            status: 1,
          },
        ],
      });
      return;
    }
    if (url.pathname.includes('/rubrics')) {
      send(200, []);
      return;
    }
    if (url.pathname === '/api/academic/homeworks' && req.method === 'POST') {
      writes.push(body);
      const dueAt = body['DivisionSchedules[0].DueAt'];
      const schoolDate = new Date(new Date(dueAt).getTime() + 330 * 60000)
        .toISOString()
        .slice(0, 10);
      if (schoolDate === blockedDate) {
        const date = schoolDate.split('-').reverse().join('/');
        send(400, {
          status: 400,
          title: 'Business rule violated',
          detail: `Due Date ${date} for A is blocked by the academic calendar entry "Diwali vacation". Choose another due date.`,
        });
        return;
      }
      const task = {
        id: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
        title: body.Title,
        description: body.Description,
        standardId: ids.standard,
        subjectId,
        subjectName: 'Mathematics',
        homeworkTypeId: typeId,
        homeworkTypeName: 'Revision',
        submissionType: 0,
        status: 0,
        divisionSchedules: [
          {
            divisionId: ids.division,
            divisionName: 'A',
            publishAt: body['DivisionSchedules[0].PublishAt'],
            dueAt,
            isPublished: false,
          },
        ],
      };
      tasks.push(task);
      send(201, { data: task });
      return;
    }
    if (url.pathname.match(/\/academic\/homeworks\/[^/]+\/status$/)) {
      tasks[0].status = body.status;
      tasks[0].divisionSchedules[0].isPublished = body.status === 1;
      send(200, { currentStatus: body.status });
      return;
    }
    if (url.pathname === '/api/academic/homeworks') {
      send(200, { items: tasks, totalCount: tasks.length });
      return;
    }
    if (url.pathname.match(/\/academic\/homeworks\/[^/]+$/)) {
      send(200, { data: tasks[0] });
      return;
    }
    if (await fixture.handle(url, req.method, body, send)) return;
    const token = req.headers.authorization?.split('.')[1];
    const claims = token ? JSON.parse(Buffer.from(token, 'base64url').toString()) : {};
    if (await handleManagers(url, req.method, body, send, fixture, claims)) return;
    if (
      url.pathname.startsWith('/api/') &&
      !['/api/host/session-context', '/api/abp/application-configuration'].includes(url.pathname)
    ) {
      send(200, { items: [], totalCount: 0 });
      return;
    }
    const upstream = await fetch(`http://127.0.0.1:4499${url.pathname}${url.search}`, {
      method: req.method,
      headers: { ...req.headers, host: '127.0.0.1:4499' },
      ...(!['GET', 'HEAD'].includes(req.method) ? { body: raw } : {}),
    });
    send(upstream.status, await upstream.json());
  })
  .listen(4497, '127.0.0.1', () =>
    process.stdout.write('Homework calendar fixture ready on4497\n')
  );
