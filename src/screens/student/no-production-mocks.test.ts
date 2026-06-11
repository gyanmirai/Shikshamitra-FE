import fs from 'node:fs';
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
  /\bclassDummyData\b/,
  /\bmockIssuedBooks\b/,
  /\bJohn Doe\d*\b/,
  /\bJane Smith\b/,
  /\bMike Johnson\b/,
  /\bAlice Johnson\b/,
  /\bSarah Smith\b/,
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

describe('student production surfaces', () => {
  it('do not import JSON fixtures or mock row collections', () => {
    const offenders = productionRoots.flatMap(collectSourceFiles).flatMap((filePath) => {
      const source = fs.readFileSync(filePath, 'utf8');
      return blockedPatterns
        .filter((pattern) => pattern.test(source))
        .map((pattern) => `${path.relative(repoRoot, filePath)} matched ${pattern}`);
    });

    expect(offenders).toEqual([]);
  });
});
