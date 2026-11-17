import fs from 'node:fs';
import ts from 'typescript';
import path from 'node:path';
import { it, expect, describe } from 'vitest';

const repoRoot = path.resolve(__dirname, '../../..');
const productionRoots = [
  path.join(repoRoot, 'src/screens/student'),
  path.join(repoRoot, 'src/components/studentProfile'),
  path.join(repoRoot, 'src/app/(auth-route)/student'),
];
const blockedPatterns = [
  /from ['"]src\/json\/student\//,
  /from ['"]src\/json\/examination\//,
  /\bdummyData\b/,
  /\bmockData\b/,
  /\bmock\b/i,
  /\bclassDummyData\b/,
  /\bkpiData\b/,
  /\bKPI_DATA\b/,
  /\bstudentKpiData\b/,
  /\bhouseData\b/,
  /\bsubjectPerformances\b/,
  /\bexamNotificationsData\b/,
  /\battendanceNotificationsData\b/,
  /\benrollmentNotificationsData\b/,
  /\bmockIssuedBooks\b/,
  /\bJohn Doe\d*\b/,
  /\bJane Smith\b/,
  /\bMike Johnson\b/,
  /\bAlice Johnson\b/,
  /\bSarah Smith\b/,
  /\bSolanki Mayur\b/,
  /\bKanwar Rajan\b/,
  /\bJinjala Dharmik\b/,
  /\bMakvana Vishal\b/,
  /\bDoctors Appointment\b/,
  /\bTraffic\b/,
  /\bMedical Appointment\b/,
  /\bPersonal Work\b/,
  /\b22 Working Days\b/,
  /\bGood Attendance\b/,
  /\bAnnual Sports Day\b/,
  /\bMathematics Exam Schedule\b/,
  /\bUnit Test 3\b/,
  /\bEnhanced Mock Data\b/,
  /\bPending Fee\b/,
  /\b1,250\b/,
  /\b3,500\b/,
  /\b2\.4L\b/,
  /\bGR2025\d+\b/,
  /\b9876\d+\b/,
  /\bVishal Rameshbhai Patel\b/,
  /\bRahul Singh\b/,
  /\bPriya Sharma\b/,
  /\bAmit Patel\b/,
  /\bSneha Gupta\b/,
  /\bAarav Mehta\b/,
  /\bRahul Trivedi\b/,
  /\bRajesh Kumar\b/,
];

function collectSourceFiles(dir: string): string[] {
  if (!fs.existsSync(dir)) return [];

  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) return collectSourceFiles(fullPath);
    if (!/\.(ts|tsx)$/.test(entry.name) || /\.test\.(ts|tsx)$/.test(entry.name)) return [];
    return [fullPath];
  });
}

const testSupportSuffix = /[.-]test-(?:fixture|harness)\.tsx?$/;
const testLibraryImport = /^(?:vitest(?:\/|$)|@testing-library\/|msw(?:\/|$)|src\/test\/)/;

function moduleImports(source: string): string[] {
  const imports: string[] = [];
  const ast = ts.createSourceFile(
    'surface.tsx',
    source,
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TSX
  );
  const visit = (node: ts.Node) => {
    if (
      (ts.isImportDeclaration(node) || ts.isExportDeclaration(node)) &&
      node.moduleSpecifier &&
      ts.isStringLiteral(node.moduleSpecifier)
    ) {
      imports.push(node.moduleSpecifier.text);
    } else if (
      ts.isCallExpression(node) &&
      (node.expression.kind === ts.SyntaxKind.ImportKeyword ||
        (ts.isIdentifier(node.expression) && node.expression.text === 'require')) &&
      node.arguments[0] &&
      ts.isStringLiteral(node.arguments[0])
    ) {
      imports.push(node.arguments[0].text);
    }
    ts.forEachChild(node, visit);
  };
  visit(ast);
  return imports;
}

function isTestSupportFile(filePath: string): boolean {
  return testSupportSuffix.test(filePath);
}

function productionTestImports(source: string) {
  return moduleImports(source).filter(
    (specifier) =>
      testLibraryImport.test(specifier) ||
      /(?:[.-]test-(?:fixture|harness)|\.test)(?:\.tsx?)?$/.test(specifier)
  );
}

describe('student production surfaces', () => {
  it('do not import JSON fixtures or mock row collections', () => {
    const sources = new Map(
      productionRoots
        .flatMap(collectSourceFiles)
        .map((filePath) => [filePath, fs.readFileSync(filePath, 'utf8')])
    );
    const offenders = [...sources].flatMap(([filePath, source]) => {
      if (isTestSupportFile(filePath)) return [];
      const relativePath = path.relative(repoRoot, filePath);
      return [
        ...blockedPatterns
          .filter((pattern) => pattern.test(source))
          .map((pattern) => `${relativePath} matched ${pattern}`),
        ...productionTestImports(source).map(
          (specifier) => `${relativePath} imports test-only module ${specifier}`
        ),
      ];
    });

    expect(offenders).toEqual([]);
  });
});

describe('production source classification', () => {
  it.each([
    'document-test-fixture.tsx',
    'dashboard-test-harness.tsx',
    'document-condition-test-fixture.ts',
    'use-admission-draft-guard.test-fixture.tsx',
  ])('classifies the strictly named render or data helper %s as test support', (name) => {
    expect(isTestSupportFile(path.resolve(repoRoot, name))).toBe(true);
  });

  it.each(['StudentSummaryPanel.tsx', 'production-fixture.tsx', 'production-test-helper.tsx'])(
    'continues scanning %s even when it imports a test library',
    (name) => {
      const filePath = path.resolve(repoRoot, name);
      const source = "import { vi } from 'vitest'; const mockData = [{ name: 'Student' }];";
      expect(isTestSupportFile(filePath)).toBe(false);
      expect(blockedPatterns.some((pattern) => pattern.test(source))).toBe(true);
      expect(productionTestImports(source)).toEqual(['vitest']);
    }
  );

  it.each([
    "import { rows } from './document-test-fixture';",
    "export { rows } from './document-test-fixture';",
    "const rows = import('./document-test-fixture');",
    "const rows = require('./document-test-fixture');",
    "import { rows } from 'src/screens/student/document-test-fixture.tsx';",
    "import { renderUi } from './use-admission-draft-guard.test-fixture';",
    "export { renderUi } from './use-admission-draft-guard.test-fixture';",
    "const renderUi = import('./use-admission-draft-guard.test-fixture');",
    "const renderUi = require('./use-admission-draft-guard.test-fixture.tsx');",
  ])('rejects production dependencies on excluded helpers: %s', (source) => {
    expect(productionTestImports(source)).toHaveLength(1);
  });
});
