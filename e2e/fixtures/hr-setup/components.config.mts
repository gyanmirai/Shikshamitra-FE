import type { Plugin } from 'vite';

import base from './vite.config.mts';

// Browser interaction coverage only: no application database or payroll calculation engine.
let earnings: any[] = [];
let deductions: any[] = [];
let templates: any[] = [];
let failDeduction = false;
let failCatalog = false;
let updates: any[] = [];
let classificationBlock = false;
let treatmentSaves: any[] = [];
let previewRequests: any[] = [];
let seededTreatments: any[] = [];
const treatmentFor = (componentId: string, month: string) =>
  [...seededTreatments, ...treatmentSaves]
    .flatMap((save, order) =>
      (save.treatments ?? []).map((item: any) => ({
        ...item,
        effectiveMonth: save.effectiveMonth,
        order,
      }))
    )
    .filter((item) => item.componentId === componentId && item.effectiveMonth <= month)
    .sort(
      (left, right) =>
        right.effectiveMonth.localeCompare(left.effectiveMonth) || right.order - left.order
    )[0]?.treatment ?? 'Unclassified';
const year = {
  id: 'synthetic-year',
  name: '2026-27',
  startDate: '2026-04-01',
  endDate: '2027-03-31',
};
const fixture: Plugin = {
  name: 'synthetic-salary-components',
  configureServer(server) {
    server.middlewares.use(async (request, response, next) => {
      const url = new URL(request.url!, 'http://127.0.0.1:4496');
      const path = url.pathname;
      if (!path.startsWith('/api/') && !path.startsWith('/fixture/')) return next();
      const send = (data: unknown, status = 200) => {
        response.statusCode = status;
        response.setHeader('Content-Type', 'application/json');
        response.end(JSON.stringify(data));
      };
      let body: any = {};
      if (request.method === 'POST' || request.method === 'PUT') {
        let raw = '';
        for await (const chunk of request) raw += chunk;
        body = raw ? JSON.parse(raw) : {};
      }
      if (path === '/fixture/context')
        return send({
          actorId: 'synthetic-operator',
          tenantId: 'synthetic-school',
          year,
          synthetic: true,
        });
      if (path === '/fixture/reset') {
        earnings = [];
        deductions = [];
        templates = [];
        failDeduction = false;
        failCatalog = false;
        updates = [];
        classificationBlock = false;
        treatmentSaves = [];
        previewRequests = [];
        seededTreatments = [];
        return send({ ok: true });
      }
      if (path === '/fixture/seed') {
        earnings = Array.from({ length: body.earnings || 0 }, (_, index) => ({
          id: `earning-${index + 1}`,
          earningComponentName: body.earningNames?.[index] ?? `Earning ${index + 1}`,
          earningType: 'Fixed',
          calculationType: 'Amount',
          amount: 100,
          visibleInPayslip: true,
          isActive: true,
        }));
        deductions = Array.from({ length: body.deductions || 0 }, (_, index) => ({
          id: `deduction-${index + 1}`,
          deductionComponentName: `Deduction ${index + 1}`,
          deductionType: 'Fixed',
          calculationType: 'Amount',
          amount: 100,
          visibleInPayslip: true,
          isActive: true,
        }));
        seededTreatments = body.treatments ?? [];
        return send({ ok: true });
      }
      if (path === '/fixture/control') {
        failDeduction = Boolean(body.failDeduction);
        failCatalog = Boolean(body.failCatalog);
        classificationBlock = Boolean(body.classificationBlock);
        return send({ ok: true });
      }
      if (path === '/fixture/state')
        return send({ earnings, deductions, templates, updates, treatmentSaves, previewRequests });
      if (path === '/api/payroll/statutory-schemes/esi/configuration') {
        if (request.method === 'PUT') treatmentSaves.push(body);
        return send({
          hasSchoolWideScope: true,
          suggestedEffectiveMonth: '2026-11',
          history: [],
          current: {
            id: 'synthetic-config',
            effectiveMonth: '1900-01',
            enabled: true,
            concurrencyStamp: 'synthetic-stamp',
          },
        });
      }
      if (path === '/api/payroll/statutory-schemes/esi/component-treatments')
        return send(
          earnings.map((earning) => ({
            componentId: earning.id,
            componentName: earning.earningComponentName,
            treatment: treatmentFor(earning.id, url.searchParams.get('effectiveOn')!.slice(0, 7)),
          }))
        );
      if (path === '/api/hr/setup-readiness')
        return send({
          academicYearId: year.id,
          availableYears: [year],
          isReady: templates.length > 0,
          checks: [
            {
              code: 'shift',
              step: 'staff',
              state: 'ready',
              reason: 'Synthetic shift ready.',
              canConfigure: true,
            },
            {
              code: 'calendar',
              step: 'policies',
              state: 'ready',
              reason: 'Synthetic calendar ready.',
              canConfigure: true,
            },
            {
              code: 'earnings',
              step: 'earnings',
              state: earnings.length ? 'ready' : 'missing',
              reason: 'Configure earning components.',
              canConfigure: true,
            },
            {
              code: 'salary-template',
              step: 'salary',
              state: templates.length ? 'ready' : 'missing',
              reason: 'Configure a salary template.',
              canConfigure: true,
            },
          ],
        });
      if (
        path === '/api/payroll/earning-components' ||
        path === '/api/payroll/deduction-components'
      ) {
        const earning = path.includes('earning-components');
        const rows = earning ? earnings : deductions;
        if (request.method === 'POST') {
          if (!earning && failDeduction)
            return send({ error: { message: 'Synthetic deduction save failed. Retry.' } }, 503);
          const row = {
            ...body,
            id: `${earning ? 'earning' : 'deduction'}-${rows.length + 1}`,
            isActive: true,
          };
          rows.push(row);
          return send(row);
        }
        const page = Number(url.searchParams.get('page') || 1);
        const pageSize = Number(url.searchParams.get('pageSize') || 20);
        const search = (url.searchParams.get('search') || '').toLowerCase();
        const matches = rows.filter((row) =>
          String(row.earningComponentName || row.deductionComponentName)
            .toLowerCase()
            .includes(search)
        );
        return send({
          items: matches.slice((page - 1) * pageSize, page * pageSize),
          totalCount: matches.length,
        });
      }
      const componentRecord =
        /^\/api\/payroll\/(earning|deduction)-components\/([^/]+)(\/update-impact-preview)?$/.exec(
          path
        );
      if (componentRecord) {
        const rows = componentRecord[1] === 'earning' ? earnings : deductions;
        const row = rows.find((item) => item.id === componentRecord[2]);
        if (!row) return send({ error: { message: 'Synthetic component not found.' } }, 404);
        if (componentRecord[3])
          return send({
            previewHash: 'synthetic-impact-proof',
            effectiveMonth: '2026-10',
            syncedEmployeeCount: 0,
            manualOverrideEmployeeCount: 0,
          });
        if (request.method === 'PUT') {
          Object.assign(row, body);
          updates.push({ id: row.id, body });
        }
        return send(row);
      }
      if (path === '/api/payroll/salary-templates/component-catalog') {
        if (failCatalog)
          return send({ error: { message: 'Synthetic catalogue unavailable.' } }, 503);
        return send({
          items: [
            ...earnings.map((row) => ({
              componentId: row.id,
              name: row.earningComponentName,
              lineKind: 'EARNING',
            })),
            ...deductions.map((row) => ({
              componentId: row.id,
              name: row.deductionComponentName,
              lineKind: 'DEDUCTION',
            })),
          ],
        });
      }
      if (path === '/api/payroll/salary-templates/preview') {
        previewRequests.push(body);
        const month = body.effectiveMonth.slice(0, 7);
        const missing = (body.rules ?? [])
          .filter(
            (rule: any) =>
              rule.lineKind === 'EARNING' &&
              treatmentFor(rule.componentId, month) === 'Unclassified'
          )
          .map((rule: any) => ({
            componentId: rule.componentId,
            name:
              earnings.find((earning) => earning.id === rule.componentId)?.earningComponentName ??
              rule.code,
          }));
        if (classificationBlock && missing.length)
          return send(
            {
              errorCode: 'HR:Payroll:SalaryTemplateSampleBlocked',
              detail: 'One or more business rules were violated.',
              data: {
                issues: ['ESI_WAGE_CLASSIFICATION_REQUIRED'],
                effectiveMonth: month,
                unclassifiedEarnings: missing,
                message: 'Resolve the statutory blockers before calculating this sample.',
              },
            },
            400
          );
        return send({
          previewToken: 'synthetic-preview-proof',
          expiresAt: new Date(Date.now() + 300000).toISOString(),
          isSample: true,
          calculation: {
            grossSalary: classificationBlock ? 10000 : 50000,
            totalDeductions: classificationBlock ? 75 : 1000,
            netSalary: classificationBlock ? 9925 : 49000,
            employerContributionTotal: classificationBlock ? 325 : 0,
            employerCost: classificationBlock ? 10325 : 50000,
            targetResult: { difference: 0, isExact: true },
            employeeStateInsurance: {
              managementMode: 'OUTSIDE_PLATFORM',
              coverageDecision: 'NOT_APPLICABLE',
            },
            earnings: [],
            deductions: [],
            employerContributions: [],
            warnings: [],
          },
        });
      }
      if (path === '/api/payroll/salary-templates') {
        if (request.method === 'POST') {
          const row = {
            ...body,
            id: 'template-1',
            status: 'ACTIVE',
            editableVersion: { ...body, id: 'version-1', versionNumber: 1, status: 'ACTIVE' },
          };
          templates.push(row);
          return send(row);
        }
        return send({ items: templates });
      }
      if (path.includes('/esi/policies'))
        return send(
          classificationBlock
            ? [
                {
                  id: 'synthetic-policy',
                  name: 'Synthetic ESIC',
                  isDefault: true,
                  isArchived: false,
                  versions: [
                    {
                      version: 1,
                      effectiveFrom: '2026-01-01',
                      employeePercentage: 0.75,
                      employerPercentage: 3.25,
                    },
                  ],
                },
              ]
            : []
        );
      return send({ items: [], totalCount: 0 });
    });
  },
};

export default {
  ...base,
  cacheDir: './.artifacts/vite/salary-components',
  plugins: [fixture],
  server: { ...base.server, port: 4496, proxy: undefined },
};
