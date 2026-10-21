import { randomUUID } from 'node:crypto';

const year = '11111111-1111-1111-1111-111111111111';
const columns = (fields) => fields.map((field) => ({ id: field.split(':')[0], label: field.split(':')[1] }));
const hierarchy = ['year:Academic year', 'board:Board', 'medium:Medium', 'stage:Stage', 'standard:Standard', 'division:Division'];
const reportTypes = [
  { id: 'academic-hierarchy', label: 'Academic hierarchy', academic: true, columns: columns(hierarchy) },
  { id: 'class-division-summary', label: 'Class division summary', academic: true, columns: columns([...hierarchy.slice(0, -1), 'divisionCount:Permitted division count', 'divisions:Permitted divisions']) },
  { id: 'division-capacity', label: 'Division capacity and room mapping', academic: true, columns: columns([...hierarchy, 'capacity:Configured capacity', 'room:Room', 'roomAssignment:Room assignment', 'shift:Shift']) },
  { id: 'rooms-inventory', label: 'Rooms and buildings inventory', academic: false, columns: columns(['building:Building', 'floor:Floor', 'room:Room', 'roomType:Room type', 'capacity:Capacity', 'benches:Benches', 'benchCapacity:Seats per bench', 'features:Features']) },
  { id: 'shift-register', label: 'Shift register', academic: false, columns: columns(['shift:Shift', 'start:Start time', 'end:End time', 'totalHours:Total hours']) },
  { id: 'school-document-register', label: 'School document register', academic: false, columns: columns(['name:Document name', 'category:Category', 'attachmentCount:Attachment count', 'sizeBytes:Total size (bytes)', 'fileNames:File names', 'uploadedBy:Uploaded by', 'createdAt:Created at', 'notes:Notes']) },
  { id: 'school-document-counts', label: 'School document counts', academic: false, columns: columns(['category:Category', 'documentCount:Document count', 'attachmentCount:Attachment count', 'sizeBytes:Total size (bytes)']) },
  { id: 'school-identity-register', label: 'School identity configuration', academic: false, columns: columns(['scope:Scope', ...hierarchy.slice(0, 3), 'organization:Organization', 'logoMode:Logo selection', 'bannerMode:Letterhead selection']) },
  { id: 'school-identity-counts', label: 'School identity profile counts', academic: false, columns: columns(['scope:Scope', 'profileCount:Configured profiles', 'customLogoCount:Custom logo selections', 'customBannerCount:Custom letterhead selections']) },
  { id: 'school-identity-signatures', label: 'School identity signature configuration', academic: false, columns: columns(['scope:Scope', 'signatureMode:Signature selection', 'principalName:Principal name', 'designation:Designation']) },
].map((report) => ({ ...report, requiredPermissions: report.id.startsWith('school-document-') ? ['InstituteSetup.SchoolDocuments.View']
  : report.id.startsWith('school-identity-') ? ['InstituteSetup.SchoolIdentity.View', ...(report.id.endsWith('signatures') ? ['InstituteSetup.SchoolIdentity.AccessSignature'] : [])]
    : report.id === 'shift-register' ? ['InstituteSetup.ShiftManagement.View'] : report.id === 'rooms-inventory' ? ['InstituteSetup.RoomManagement.View', 'InstituteSetup.BuildingManagement.View', 'InstituteSetup.RoomTypeManagement.View']
      : report.id === 'division-capacity' ? ['InstituteSetup.AcademicSetup.View', 'InstituteSetup.RoomManagement.View', 'InstituteSetup.ShiftManagement.View'] : ['InstituteSetup.AcademicSetup.View'] }));
const values = {
  documentCategory: ['GovernmentApproval:Government approval', 'PermissionNoc:Permission / NOC', 'BoardAffiliation:Board affiliation', 'Registration:Registration', 'Other:Other'].map((item) => ({ value: item.split(':')[0], label: item.split(':')[1] })),
  identityScope: ['school:School', 'board:Board', 'medium:Medium', 'organization:Organization'].map((item) => ({ value: item.split(':')[0], label: item.split(':')[1] })),
};
const choice = (id, name, parentId) => ({ id, name, parentId });
const choices = {
  academicYearId: [choice(year, '2026-2027')], boardId: [choice('board', 'CBSE', year)], mediumId: [choice('medium', 'English', 'board')],
  stageId: [choice('stage', 'Primary', 'medium')], standardId: [choice('standard', 'Class 1', 'stage')], divisionId: [choice('division', 'A', 'standard')],
  buildingId: [choice('building', 'Main Building')], floorId: [choice('floor', 'Ground Floor', 'building')], roomTypeId: [choice('type', 'Classroom')], shiftId: [choice('shift', 'Morning')],
};
let jobs = [];
let failPreview = false;
let failDownload = false;
const requestPlan = (type = 'rooms-inventory') => ({ reportType: type, format: 'pdf', page: 1, pageSize: 25, filters: ['academic-hierarchy', 'class-division-summary'].includes(type) ? { academicYearId: year } : {}, columns: [], conditions: type === 'class-division-summary' ? [{ field: 'divisionCount', operator: 'eq', value: '1' }] : [], descending: false });
const moduleRows = (request) => {
  const { reportType, filters } = request;
  if (reportType === 'school-document-counts') {
    const category = values.documentCategory.find((value) => value.value === filters.documentCategory)?.label;
    const rows = values.documentCategory.filter((value) => !category || value.label === category).map((value) => ({ category: value.label, documentCount: ['GovernmentApproval', 'PermissionNoc'].includes(value.value) ? '1' : '0', attachmentCount: value.value === 'GovernmentApproval' ? '2' : value.value === 'PermissionNoc' ? '1' : '0', sizeBytes: value.value === 'GovernmentApproval' ? '20' : value.value === 'PermissionNoc' ? '10' : '0' }));
    return [{ category: 'All categories', documentCount: category ? rows[0].documentCount : '2', attachmentCount: category ? rows[0].attachmentCount : '3', sizeBytes: category ? rows[0].sizeBytes : '30' }, ...rows];
  }
  if (reportType === 'school-document-register') return [{ name: 'School approval', category: 'Government approval', attachmentCount: '2', sizeBytes: '20', fileNames: 'approval.pdf, annexure.pdf', uploadedBy: 'Synthetic uploader', createdAt: '2026-10-21 08:00:00Z', notes: 'Synthetic fixture' }];
  if (reportType === 'school-identity-counts') return [{ scope: 'All scopes', profileCount: '2', customLogoCount: '1', customBannerCount: '0' }, ...values.identityScope.map((value) => ({ scope: value.label, profileCount: ['school','board'].includes(value.value) ? '1' : '0', customLogoCount: value.value === 'school' ? '1' : '0', customBannerCount: '0' }))];
  if (reportType === 'school-identity-signatures') return [{ scope: 'School', signatureMode: 'Custom', principalName: 'Synthetic principal', designation: 'Principal' }];
  if (reportType === 'school-identity-register') return [{ scope: 'School', year: '', board: '', medium: '', organization: '', logoMode: 'Custom', bannerMode: 'Inherit' }, { scope: 'Board', year: '2026-2027', board: 'CBSE', medium: '', organization: '', logoMode: 'Inherit', bannerMode: 'Hidden' }];
  return null;
};
const preview = (request) => {
  const definition = reportTypes.find((item) => item.id === request.reportType);
  const all = moduleRows(request) ?? (request.reportType === 'class-division-summary' ? [{ year: '2026-2027', board: 'CBSE', medium: 'English', stage: 'Primary', standard: 'Class 2', divisionCount: '1', divisions: 'A' }]
    : request.reportType === 'shift-register' && request.columns.includes('totalHours') ? [
      { shift: 'Morning', start: '07:00', end: '12:00', totalHours: '5' }, { shift: 'Night', start: '22:00', end: '06:00', totalHours: '8' },
    ] : Array.from({ length: 31 }, (_, index) => ({ year: '2026-2027', board: 'CBSE', medium: 'English', stage: 'Primary', standard: 'Class 1', division: String.fromCharCode(65 + index % 26),
      building: 'Main Building', floor: 'Ground Floor', room: `Room ${index + 1}`, roomType: 'Classroom', capacity: '30', benches: '10', benchCapacity: '3', features: 'Projector', shift: 'Morning', start: '08:00', end: '12:00', totalHours: '4', roomAssignment: 'assigned' })));
  return { reportType: definition.label, columns: request.columns.length ? definition.columns.filter((column) => request.columns.includes(column.id)) : definition.columns, rows: all.slice((request.page - 1) * request.pageSize, request.page * request.pageSize), totalCount: all.length, page: request.page, pageSize: request.pageSize, filterSummary: request.reportType === 'class-division-summary' ? 'Permitted academic hierarchy: 2026-2027. Division counts include only permitted divisions.' : request.reportType === 'shift-register' ? 'School-wide catalogue. Total hours is elapsed time rounded to two decimal places, without break deductions. An earlier end time means the next day; equal times mean zero hours.' : definition.academic ? 'Permitted academic hierarchy: 2026-2027' : 'School-wide catalogue', generatedAtUtc: new Date().toISOString() };
};
export function reportFixtureApi() {
  return { name: 'institute-reports-fixture-api', configureServer(server) {
    server.middlewares.use(async (req, res, next) => {
      const path = req.url.split('?')[0];
      if (!path.startsWith('/api/') && !path.startsWith('/fixture/')) return next();
      const chunks = []; for await (const chunk of req) chunks.push(chunk);
      const body = chunks.length ? JSON.parse(Buffer.concat(chunks).toString()) : {};
      const send = (value, status = 200) => { res.statusCode = status; res.setHeader('Content-Type', 'application/json'); res.end(JSON.stringify(value)); };
      if (path === '/api/auth/session') return send(null);
      if (path === '/fixture/reset') { jobs = []; return send({}); }
      if (path === '/fixture/fail-preview') { failPreview = true; return send({}); }
      if (path === '/fixture/fail-download') { failDownload = true; return send({}); }
      const route = path.replace('/api/app/institute-setup-report', '');
      if (route === '/options') return send({ reportTypes, choices, values });
      if (route === '/exports' && req.method === 'GET') return send(jobs.map((job) => ({ ...job, status: Date.now() - job.started > 1500 ? 'Completed' : 'Processing', completedAt: new Date().toISOString() })));
      if (route === '/preview' || route === '/ai/preview') {
        if (failPreview) { failPreview = false; return send({ error: { message: 'Synthetic preview failure. Please retry.' } }, 503); }
        return send(preview(body.plan ?? body));
      }
      if (route === '/ai/plan') {
        if (body.prompt === 'synthetic empty AI response') return send({ error: { code: 'InstituteReports:AiInvalidResponse', message: 'ShikshaMitra AI did not return a usable Institute Setup report plan. Retry or choose a predefined report.' } }, 400);
        if (body.prompt.includes('ambiguous') && !body.clarificationAnswers.length) return send({ status: 'NeedsClarification', summary: '', plan: null, approvalToken: null, clarificationQuestions: [{ id: 'type', question: 'Which setup data do you need?', options: ['Rooms', 'Shifts'], recommendedOption: 'Rooms' }] });
        const prompt = body.prompt.toLowerCase();
        const plan = requestPlan(prompt.includes('school document') ? (/count|how many/.test(prompt) ? 'school-document-counts' : 'school-document-register')
          : prompt.includes('school identity') ? (/count|how many/.test(prompt) ? 'school-identity-counts' : prompt.includes('signature') ? 'school-identity-signatures' : 'school-identity-register')
            : prompt.includes('only one division') ? 'class-division-summary' : prompt.includes('shift') ? 'shift-register' : 'rooms-inventory');
        if (plan.reportType === 'shift-register' && body.prompt.toLowerCase().includes('total hours')) plan.columns = ['shift', 'start', 'end', 'totalHours'];
        return send({ status: 'Ready', summary: plan.reportType === 'school-document-counts' ? 'Count active library entries and attachments by category.' : plan.reportType === 'school-identity-counts' ? 'Count permitted configured identity profiles by scope.' : plan.reportType === 'class-division-summary' ? 'Classes with exactly one permitted division.' : plan.columns.includes('totalHours') ? 'List shifts with start time, end time and calculated total hours.' : 'List permitted setup records using the selected output format.', plan, approvalToken: 'synthetic-approval', clarificationQuestions: [] });
      }
      if ((route === '/exports' || route === '/ai/exports') && req.method === 'POST') {
        const request = body.plan ?? body;
        const job = { id: randomUUID(), reportType: reportTypes.find((item) => item.id === request.reportType).label, format: request.format, request, status: 'Queued', isDynamic: route.includes('/ai/'),
          creationTime: new Date().toISOString(), expiresAt: new Date(Date.now() + 604800000).toISOString(), fileName: `Institute_Setup_Report.${request.format === 'excel' ? 'xlsx' : request.format}`, started: Date.now() };
        jobs.unshift(job); return send(job);
      }
      if (route.endsWith('/download')) {
        if (failDownload) { failDownload = false; return send({ detail: 'Synthetic download failure. Please retry.' }, 503); }
        res.setHeader('Content-Type', 'application/octet-stream'); return res.end('Synthetic browser download. File rendering is covered by backend API tests.');
      }
      return send({ error: { message: 'Fixture route not found.' } }, 404);
    });
  } };
}
