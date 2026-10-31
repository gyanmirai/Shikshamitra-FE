import type { ReactNode } from 'react';

import fs from 'node:fs';
import path from 'node:path';
import ts from 'typescript';
import { render, screen } from '@testing-library/react';
import { it, vi, expect, describe, beforeEach } from 'vitest';
import StudentLayout from 'src/app/(auth-route)/student/layout';
import OverviewLayout from 'src/app/(auth-route)/student/overview/layout';
import AdmissionsLayout from 'src/app/(auth-route)/student/admissions/layout';
import AttendanceLayout from 'src/app/(auth-route)/student/attendance/layout';
import SiblingLayout from 'src/app/(auth-route)/student/student-sibling/layout';
import FormLayout from 'src/app/(auth-route)/student/admissions/settings/forms/layout';
import ApplicantLayout from 'src/app/(auth-route)/student/admissions/applicants/layout';
import CycleLayout from 'src/app/(auth-route)/student/admissions/settings/cycles/layout';
import UploadPhotoLayout from 'src/app/(auth-route)/student/upload-student-photo/layout';
import OfferingLayout from 'src/app/(auth-route)/student/admissions/settings/offerings/layout';
import WorkflowLayout from 'src/app/(auth-route)/student/admissions/settings/workflows/layout';
import UploadDocumentsLayout from 'src/app/(auth-route)/student/upload-student-documents/layout';
import AttendanceDashboardLayout from 'src/app/(auth-route)/student/attendance/dashboard/layout';
import IntakeLayout from 'src/app/(auth-route)/student/admissions/settings/intake-assignment/layout';
import PublicInquiryLinksLayout from 'src/app/(auth-route)/student/admissions/settings/public-inquiry-links/layout';

const auth = vi.hoisted(() => ({
  permissions: [] as { name: string; isGranted: boolean }[],
  loading: false,
  permissionsInitialized: true,
  user: { roles: ['Teacher'], classTeacherAssignments: ['class-1'] },
}));
vi.mock('react-redux', () => ({ useSelector: (select: any) => select({ auth }) }));
vi.mock('src/sections/error', () => ({ View403: () => <div>Access denied</div> }));
vi.mock('src/components/loading-screen', () => ({ SplashScreen: () => <div>Loading permissions</div> }));

const routes: [string, (props: { children: ReactNode }) => ReactNode, string][] = [
  ['Applicant profiles', ApplicantLayout, 'Students.Admissions.Applicants.View'],
  ['Admission periods', CycleLayout, 'Students.Admissions.View'],
  ['Offerings', OfferingLayout, 'Students.Admissions.Offerings.View'],
  ['Intake assignment', IntakeLayout, 'Students.Admissions.Offerings.View'],
  ['Public inquiry links', PublicInquiryLinksLayout, 'Students.Admissions.Offerings.View'],
  ['Workflows', WorkflowLayout, 'Students.Admissions.Workflows.View'],
  ['Forms', FormLayout, 'Students.Admissions.Forms.View'],
  ['Upload photo', UploadPhotoLayout, 'Students.Records.StudentList.View'],
  ['Upload documents', UploadDocumentsLayout, 'Students.Records.StudentList.View'],
  ['Siblings', SiblingLayout, 'Students.Records.StudentList.View'],
  ['Overview', OverviewLayout, 'Students.Dashboard.View'],
  ['Attendance dashboard', AttendanceDashboardLayout, 'Students.Attendance.MarkAttendance.View'],
];

beforeEach(() => {
  auth.permissions = [];
  auth.loading = false;
  auth.permissionsInitialized = true;
});

describe('Student direct route access', () => {
  it.each(routes)('%s requires its exact View grant even for an assigned teacher', (_, Layout, permission) => {
    const mounted = render(<Layout><div>Protected workspace</div></Layout>);
    expect(screen.getByText('Access denied')).toBeVisible();
    auth.permissions = [{ name: permission.replace(/\.View$/, '.Add'), isGranted: true }];
    mounted.rerender(<Layout><div>Protected workspace</div></Layout>);
    expect(screen.queryByText('Protected workspace')).not.toBeInTheDocument();
    auth.permissions = [{ name: permission, isGranted: true }];
    mounted.rerender(<Layout><div>Protected workspace</div></Layout>);
    expect(screen.getByText('Protected workspace')).toBeVisible();
    auth.permissions[0].isGranted = false;
    mounted.rerender(<Layout><div>Protected workspace</div></Layout>);
    expect(screen.getByText('Access denied')).toBeVisible();
  });

  it('keeps the module and Admissions guards active outside production', () => {
    const mounted = render(<StudentLayout><AdmissionsLayout>Admissions workspace</AdmissionsLayout></StudentLayout>);
    expect(screen.getByText('Access denied')).toBeVisible();
    auth.permissions = [{ name: 'ShikshaMitra.Module.Students', isGranted: true }];
    mounted.rerender(<StudentLayout><AdmissionsLayout>Admissions workspace</AdmissionsLayout></StudentLayout>);
    expect(screen.getByText('Access denied')).toBeVisible();
    auth.permissions.push({ name: 'Students.Admissions.Inquiries.View', isGranted: true });
    mounted.rerender(<StudentLayout><AdmissionsLayout>Admissions workspace</AdmissionsLayout></StudentLayout>);
    expect(screen.getByText('Admissions workspace')).toBeVisible();
    auth.permissionsInitialized = false;
    mounted.rerender(<StudentLayout><AdmissionsLayout>Admissions workspace</AdmissionsLayout></StudentLayout>);
    expect(screen.getByText('Loading permissions')).toBeVisible();
  });

  it('allows the notification workspace through its URL parent without granting Attendance', () => {
    auth.permissions = [{ name: 'Students.Notification.AttendanceManagement.View', isGranted: true }];
    render(<AttendanceLayout><div>Notification workspace</div></AttendanceLayout>);
    expect(screen.getByText('Notification workspace')).toBeVisible();
  });
});

describe('Student page guard inventory', () => {
  it.each([
    ['rendered guarded wrapper', '<AdmissionSettingsLayout>{children}</AdmissionSettingsLayout>', true, true],
    ['unused guarded import', '<>{children}</>', true, false],
    ['rendered unguarded wrapper', '<AdmissionSettingsLayout>{children}</AdmissionSettingsLayout>', false, false],
    ['unguarded sibling content', '<><AdmissionSettingsLayout />{children}</>', true, false],
  ] as const)('recognizes %s by the rendered composition', (_, returned, targetGuarded, expected) => {
    const root = path.resolve('inventory-fixture');
    const files = new Map([
      [path.join(root, 'layout.tsx'), `
        import AdmissionSettingsLayout from './guarded';
        export default function Layout({ children }) { return ${returned}; }
      `],
      [path.join(root, 'guarded.tsx'), `
        import StudentPermissionGuard from 'src/components/student-permission-guard';
        export default function Layout({ children }) {
          return ${targetGuarded
            ? '<StudentPermissionGuard permissionKey="Students.Admissions.Offerings.View">{children}</StudentPermissionGuard>'
            : '<>{children}</>'};
        }
      `],
    ]);
    expect(hasFeatureGuard(path.join(root, 'layout.tsx'), (file) => files.get(file))).toBe(expected);
  });

  it('keeps every operational page under a feature guard or guarded redirect', () => {
    const root = path.resolve(__dirname, '../app/(auth-route)/student');
    const pages = fs.readdirSync(root, { recursive: true }).map(String).filter((file) => file.endsWith('page.tsx'));
    expect(pages.length).toBeGreaterThan(50);
    pages.forEach((file) => {
      const page = fs.readFileSync(path.join(root, file), 'utf8');
      if (/redirect\(/.test(page)) return;
      let dir = path.dirname(file);
      let guarded = /StudentPermissionGuard/.test(page);
      while (!guarded && dir !== '.') {
        const layout = path.join(root, dir, 'layout.tsx');
        if (fs.existsSync(layout)) {
          // Broad module parents alone do not prove the feature page has a View gate.
          if (!['admissions', 'attendance', 'onboarding'].includes(dir.replaceAll('\\', '/')))
            guarded = hasFeatureGuard(layout);
        }
        dir = path.dirname(dir);
      }
      expect(guarded, `Missing feature permission guard: ${file}`).toBe(true);
    });
  });
});

// Follow a rendered layout composition, not merely an import or a known filename.
function hasFeatureGuard(
  file: string,
  readSource: (sourcePath: string) => string | undefined = (sourcePath) =>
    fs.existsSync(sourcePath) ? fs.readFileSync(sourcePath, 'utf8') : undefined,
  visited = new Set<string>()
): boolean {
  if (visited.has(file)) return false;
  visited.add(file);
  const source = readSource(file);
  if (!source) return false;
  const ast = ts.createSourceFile(file, source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  const imports = new Map<string, string>();
  ast.statements.forEach((statement) => {
    if (
      ts.isImportDeclaration(statement) &&
      ts.isStringLiteral(statement.moduleSpecifier) &&
      statement.importClause?.name
    ) {
      imports.set(statement.importClause.name.text, statement.moduleSpecifier.text);
    }
  });
  let directGuard = false;
  const visit = (node: ts.Node) => {
    if (
      ts.isJsxElement(node) &&
      imports.get(node.openingElement.tagName.getText(ast)) === 'src/components/student-permission-guard' &&
      node.openingElement.attributes.properties.some(
        (attribute) => ts.isJsxAttribute(attribute) && attribute.name.getText(ast) === 'permissionKey'
      )
    ) directGuard = true;
    // The Documents layout intentionally permits either of its two exact action checks.
    if (
      ts.isCallExpression(node) && ts.isIdentifier(node.expression) &&
      node.expression.text === 'hasGrantedPermission' && node.arguments.length === 2
    ) directGuard = true;
    ts.forEachChild(node, visit);
  };
  visit(ast);
  if (directGuard) return true;
  return ast.statements.some((statement) => {
    if (
      !ts.isFunctionDeclaration(statement) ||
      !statement.modifiers?.some((modifier) => modifier.kind === ts.SyntaxKind.DefaultKeyword)
    ) return false;
    return statement.body?.statements.some((bodyStatement) => {
      if (!ts.isReturnStatement(bodyStatement) || !bodyStatement.expression) return false;
      let expression = bodyStatement.expression;
      while (ts.isParenthesizedExpression(expression)) expression = expression.expression;
      if (!ts.isJsxElement(expression)) return false;
      const child = expression.children.filter((node) => !ts.isJsxText(node) || node.text.trim());
      if (
        child.length !== 1 || !ts.isJsxExpression(child[0]) ||
        !child[0].expression || !ts.isIdentifier(child[0].expression) ||
        child[0].expression.text !== 'children'
      ) return false;
      const modulePath = imports.get(expression.openingElement.tagName.getText(ast));
      if (!modulePath?.startsWith('.')) return false;
      const resolved = path.resolve(path.dirname(file), `${modulePath}.tsx`);
      return hasFeatureGuard(resolved, readSource, visited);
    }) ?? false;
  });
}
