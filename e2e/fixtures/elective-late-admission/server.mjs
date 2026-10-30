import http from 'node:http';
import { createAcademicFixture } from '../academic-module-setup/state.mjs';
import { handleManagers } from '../academic-module-setup/managers.mjs';
import { insightsPermissions } from '../academic-module-setup/insights-permissions.mjs';
import { ids, year, board, medium } from '../academic-module-setup/data.mjs';

const groupId = '77777777-7777-4777-8777-777777777777';
const subjects = [
  { subjectId: '88888888-8888-4888-8888-888888888888', subjectName: 'Computer Science' },
  { subjectId: '99999999-9999-4999-8999-999999999999', subjectName: 'PT' },
];
let fixture;
let records;
let writes;
const admit = () =>
  records.push({
    studentId: 'new-student',
    studentName: 'New Student',
    rollNo: '2',
    isLocked: false,
    selectableSubjects: subjects,
  });
const reset = (options = {}) => {
  fixture = createAcademicFixture({ visited: true });
  records = [
    {
      studentId: 'existing-student',
      studentName: 'Existing Student',
      rollNo: '1',
      selectedSubjectId: subjects[1].subjectId,
      isLocked: true,
      selectableSubjects: subjects,
    },
  ];
  writes = [];
  if (options.admitted) admit();
};
reset();
http
  .createServer(async (req, res) => {
    const send = (status, value) => {
      res.writeHead(status, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(value));
    };
    res.setHeader('Access-Control-Allow-Origin', 'http://127.0.0.1:4488');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Headers', 'authorization,content-type,__tenant');
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,OPTIONS');
    if (req.method === 'OPTIONS') {
      res.writeHead(204);
      res.end();
      return;
    }
    const url = new URL(req.url, 'http://127.0.0.1:4487');
    let raw = '';
    for await (const chunk of req) raw += chunk;
    const body =
      raw && req.headers['content-type']?.includes('application/json') ? JSON.parse(raw) : {};
    if (url.pathname === '/fixture/reset') {
      reset(body);
      send(200, {});
      return;
    }
    if (url.pathname === '/fixture/admit') {
      admit();
      send(200, {});
      return;
    }
    if (url.pathname === '/fixture/context') {
      send(200, { year, board, medium, ids });
      return;
    }
    if (url.pathname === '/fixture/snapshot') {
      send(200, { records, writes });
      return;
    }
    if (url.pathname === '/api/permission-management/permissions') {
      const permissions = [
        ...insightsPermissions(),
        ...(!body.viewOnly && !fixture.state.viewOnly
          ? ['ClassManagement.StudentElectiveAssignment.Add']
          : []),
      ];
      send(200, {
        groups: [{ permissions: permissions.map((name) => ({ name, isGranted: true })) }],
      });
      return;
    }
    if (url.pathname.match(/\/curriculum\/[^/]+\/subject-assignments$/)) {
      send(200, {
        data: {
          items: [
            {
              id: 'allocation',
              subjectType: 1,
              electiveGroupId: groupId,
              electiveGroupName: 'Technology and PE',
            },
          ],
        },
      });
      return;
    }
    if (
      url.pathname === '/api/class-management/student-elective-assignments' &&
      req.method === 'GET'
    ) {
      send(200, {
        totalRecords: records.length,
        isLocked: records.length > 0 && records.every((row) => row.isLocked),
        subjectOptions: subjects,
        records,
      });
      return;
    }
    if (
      url.pathname === '/api/class-management/student-elective-assignments' &&
      req.method === 'PUT'
    ) {
      if (
        body.assignments.some(
          (assignment) => records.find((row) => row.studentId === assignment.studentId)?.isLocked
        )
      ) {
        send(400, { error: { message: 'Locked assignments cannot be modified' } });
        return;
      }
      writes.push(body);
      body.assignments.forEach((assignment) =>
        Object.assign(
          records.find((row) => row.studentId === assignment.studentId),
          { selectedSubjectId: assignment.selectedSubjectId }
        )
      );
      send(200, { success: true });
      return;
    }
    if (url.pathname === '/api/class-management/student-elective-assignments/lock') {
      if (records.some((row) => !row.selectedSubjectId)) {
        send(400, { error: { message: 'Save every selection before locking' } });
        return;
      }
      records.forEach((row) => {
        row.isLocked = true;
      });
      send(200, { success: true });
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
    const upstream = await fetch(`http://127.0.0.1:4489${url.pathname}${url.search}`, {
      method: req.method,
      headers: { ...req.headers, host: '127.0.0.1:4489' },
      ...(!['GET', 'HEAD'].includes(req.method) ? { body: raw } : {}),
    });
    send(upstream.status, await upstream.json());
  })
  .listen(4487, '127.0.0.1', () =>
    process.stdout.write('Elective admission fixture ready on 4487\n')
  );
