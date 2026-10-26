/* eslint-disable import/no-extraneous-dependencies, no-restricted-syntax, no-continue */
import path from 'node:path';
import ts from 'typescript';
import { runInNewContext } from 'node:vm';
import { readdirSync, readFileSync } from 'node:fs';
import { it, expect, describe } from 'vitest';

import { hrPaths } from 'src/constants/hr-menus';
import { hrReportPaths } from 'src/constants/hr-report-paths';

type Crumb = { name: string; href?: string; onClick?: () => void };
const root = process.cwd();
const screenRoot = 'src/screens/hr/';
const appRoot = 'src/app/(auth-route)/hr/';
const walk = (dir: string): string[] =>
  readdirSync(path.join(root, dir), { withFileTypes: true }).flatMap((entry) =>
    entry.isDirectory() ? walk(`${dir}${entry.name}/`) : [`${dir}${entry.name}`]
  );

// Inspect the actual props used by each screen, including its loading/error branches.
// Evaluate only the isolated breadcrumb expression, never the owning screen or its API calls.
function trails(file: string, context: Record<string, unknown> = {}): Crumb[][] {
  const source = ts.createSourceFile(
    file,
    readFileSync(path.join(root, file), 'utf8'),
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TSX
  );
  const expressions: ts.Expression[] = [];
  const declarations = new Map<string, ts.Expression>();
  const visit = (node: ts.Node) => {
    if (ts.isVariableDeclaration(node) && ts.isIdentifier(node.name) && node.initializer) {
      declarations.set(node.name.text, node.initializer);
    }
    if (
      (ts.isJsxSelfClosingElement(node) || ts.isJsxOpeningElement(node)) &&
      node.tagName.getText(source) === 'CustomBreadcrumbs'
    ) {
      const prop = node.attributes.properties.find(
        (attr) => ts.isJsxAttribute(attr) && attr.name.getText(source) === 'links'
      );
      if (
        prop &&
        ts.isJsxAttribute(prop) &&
        prop.initializer &&
        ts.isJsxExpression(prop.initializer) &&
        prop.initializer.expression
      )
        expressions.push(prop.initializer.expression);
    }
    ts.forEachChild(node, visit);
  };
  visit(source);
  return expressions.map((expression) => {
    const resolved = ts.isIdentifier(expression) ? declarations.get(expression.text) : expression;
    if (!resolved) throw new Error(`Missing links in ${file}`);
    const code = ts.transpile(`(${resolved.getText(source)})`, { target: ts.ScriptTarget.ES2022 });
    return runInNewContext(code, {
      hrPaths,
      hrReportPaths,
      ancestors: [],
      heading: 'HR Dashboard',
      pageTitle: 'Leave Center',
      isSelfMode: false,
      isSelfContext: false,
      isCreate: false,
      readOnly: false,
      formEmployee: null,
      requestedEditId: '',
      candidateName: 'Review Candidate',
      onBack: () => {},
      goBack: () => {},
      handleClose: () => {},
      detailCloseHandler: { current: () => {} },
      employeeId: 'staff-123',
      salaryStructureHref: (id: string) => `${hrPaths.payroll.structure}?employeeId=${id}`,
      currentTabLabel: 'Work Calendars',
      currentWorkspace: { label: 'Reviews' },
      view: 'history',
      templateArea: false,
      isDesign: false,
      title: 'Reports',
      chooserHref: `${hrReportPaths.choose}?category=staff`,
      savedId: null,
      dialog: { onFalse: () => {} },
      isViewMode: false,
      MY_LEAVE_PATH: '/my-leave',
      viewCalendarView: { onFalse: () => {} },
      ...context,
    }) as Crumb[];
  });
}

const pages = [...walk(appRoot)].filter((file) => file.endsWith('/page.tsx'));
const routePatterns = pages.map((file) => {
  const route = file
    .replace('src/app/(auth-route)', '')
    .replace(/\/\([^/]+\)/g, '')
    .replace(/\/page.tsx$/, '');
  return new RegExp(`^${route.replace(/\[[^\]]+\]/g, '[^/]+')}/?$`);
});

describe('HR breadcrumb route contract', () => {
  for (const file of [...walk(screenRoot), ...walk(appRoot)].filter(
    (name) => name.endsWith('.tsx') && !name.includes('.test.')
  )) {
    const source = readFileSync(path.join(root, file), 'utf8');
    if (!source.includes('<CustomBreadcrumbs')) continue;
    it(`${file} has navigable ancestors, no artificial root, and current-page text`, () => {
      expect(source).not.toContain('HR/Staff');
      for (const links of trails(file)) {
        expect(links.length).toBeGreaterThan(0);
        expect(new Set(links.map((link) => link.name)).size).toBe(links.length);
        expect(links.at(-1)?.href).toBeUndefined();
        expect(links.at(-1)?.onClick).toBeUndefined();
        const destinations = links.flatMap((link) => (link.href ? [link.href] : []));
        expect(new Set(destinations).size).toBe(destinations.length);
        for (const ancestor of links.slice(0, -1)) {
          expect(Boolean(ancestor.href || ancestor.onClick)).toBe(true);
          if (ancestor.href?.startsWith('/hr/')) {
            const pathname = ancestor.href.split('?')[0];
            expect(
              routePatterns.some((pattern) => pattern.test(pathname)),
              ancestor.href
            ).toBe(true);
          }
        }
      }
    });
  }

  it('matches the verified Run Payroll hierarchy and overview destination', () => {
    expect(trails(`${screenRoot}payroll/run-payroll/runPayroll.tsx`)[0]).toEqual([
      { name: 'Payroll Management', href: '/hr/payroll' },
      { name: 'Run Payroll' },
    ]);
  });

  it.each([
    ['new', true, false, 'Create'],
    ['template-123', false, false, 'Edit'],
    ['template-123', false, true, 'View'],
  ])(
    'keeps salary template %s meaningful without exposing its ID',
    (_id, isCreate, readOnly, current) => {
      const links = trails(`${screenRoot}payroll/setting/salary-template-editor.tsx`, {
        isCreate,
        readOnly,
      })[0];
      expect(links.map((link) => link.name)).toEqual([
        'Payroll Management',
        'Salary Templates',
        current,
      ]);
      expect(links[1].href).toBe('/hr/payroll/setting/salary-templates');
    }
  );

  it('retains the staff-specific salary return destination', () => {
    const links = trails(`${screenRoot}payroll/structure/salary-editor-screen.tsx`)[0];
    expect(links).toEqual([
      { name: 'Payroll Management', href: '/hr/payroll' },
      { name: 'Payroll Structure', href: '/hr/payroll/structure?employeeId=staff-123' },
      { name: 'Edit Salary' },
    ]);
  });

  it.each([
    [null, '', 'Add Staff'],
    [null, 'staff-123', 'Update Staff'],
    [
      { id: 'staff-123', fullName: 'Review Candidate' },
      'staff-123',
      'Update Staff (Review Candidate)',
    ],
  ])(
    'describes staff create/edit state while data loads',
    (formEmployee, requestedEditId, current) => {
      const links = trails(`${screenRoot}employee/employee.tsx`, {
        formEmployee,
        requestedEditId,
      })[0];
      expect(links.map((link) => link.name)).toEqual(['Staff Directory', current]);
      expect(links[0].onClick).toBeTypeOf('function');
    }
  );

  it('includes the nested ESIC policies location', () => {
    const links = trails(
      `${appRoot}(Payroll-Management)/payroll/setting/statutory-schemes/page.tsx`,
      { view: 'policies' }
    )[0];
    expect(links).toEqual([
      { name: 'Payroll Management', href: '/hr/payroll' },
      { name: 'Statutory Schemes', href: '/hr/payroll/setting/statutory-schemes' },
      { name: 'ESIC Policies' },
    ]);
  });

  it('links performance setup to its real settings ancestor', () => {
    const links = trails(`${screenRoot}professional-management/index.tsx`, {
      currentWorkspace: { label: 'Setup & Readiness', parentLabel: 'Settings' },
    })[0];
    expect(links).toEqual([
      { name: 'Performance Management', href: '/hr/professional-management' },
      { name: 'Settings', href: '/hr/professional-management/settings' },
      { name: 'Setup & Readiness' },
    ]);
  });

  it('shows loaded onboarding application context after its guarded list ancestor', () => {
    const links = trails(`${screenRoot}employee-onboarding/index.tsx`)[1];
    expect(links.map((link) => link.name)).toEqual([
      'Staff Onboarding',
      'Review Candidate Application',
    ]);
    expect(links[0].onClick).toBeTypeOf('function');
  });

  it.each(['history', 'templates', 'choose', 'generate', 'design', 'result'])(
    'handles the %s report route including deep links',
    (view) => {
      const title = {
        history: 'Reports',
        templates: 'Report templates',
        choose: 'Choose report template',
        generate: 'Report options',
        design: 'Edit template',
        result: 'Generated report',
      }[view];
      const links = trails(`${screenRoot}reports/index.tsx`, {
        view,
        title,
        isDesign: view === 'design',
        templateArea: ['design', 'templates'].includes(view),
      })[0];
      expect(links.at(-1)).toEqual({ name: title });
      if (view !== 'history') expect(links[0]).toEqual({ name: 'Reports', href: '/hr/reports' });
      if (view === 'generate') expect(links[1].href).toBe('/hr/reports/generate?category=staff');
    }
  );

  it('preserves self-service navigation outside the HR context', () => {
    const links = trails(`${screenRoot}leave-request/apply-leave.tsx`, { isSelfMode: true });
    expect(links[1]).toEqual([{ name: 'Dashboard', href: '/dashboard/' }, { name: 'My Leave' }]);
    expect(links[0].map((link) => link.name)).toEqual(['Dashboard', 'My Leave', 'Leave Calendar']);
  });
});
