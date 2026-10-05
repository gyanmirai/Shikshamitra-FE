import fs from 'node:fs';
import path from 'node:path';
import { it, expect, describe } from 'vitest';

const drawerSource = fs.readFileSync(path.join(__dirname, 'HrAiReportDrawer.tsx'), 'utf8');
const screenSource = fs.readFileSync(path.join(__dirname, '..', 'index.tsx'), 'utf8');
const apiSource = fs.readFileSync(
  path.join(__dirname, '..', '..', '..', '..', 'redux', 'hr', 'hrReportsApi.ts'),
  'utf8'
);

describe('HR AI report workspace', () => {
  it('plans, previews, approves, and queues through the HR report engine', () => {
    expect(screenSource).toContain('<HrAiReportDrawer');
    expect(screenSource).toContain('reportPermissions.canBuild');
    expect(screenSource).toContain('reportPermissions.canExport');
    expect(drawerSource).toContain('Approve &amp; generate');
    expect(drawerSource).toContain('current tenant and permitted staff scope');
    expect(apiSource).toContain("url: '/hr/reports/ai/plan'");
    expect(apiSource).toContain("url: '/hr/reports/preview'");
    expect(apiSource).toContain("url: '/hr/reports/exports'");
  });
});
