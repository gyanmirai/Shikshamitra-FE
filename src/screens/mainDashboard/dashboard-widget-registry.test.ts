import fs from 'node:fs';
import path from 'node:path';
import { it, expect, describe } from 'vitest';
import { hrPermissions } from 'src/constants/hr-menus';
import { studentPermissions } from 'src/constants/student-menu';
import { financePermissions } from 'src/constants/finance-menu';
import { academicPermissions } from 'src/constants/academic-menu';
import { calendarPermissions } from 'src/constants/calendar-menu';
import { transportPermissions } from 'src/constants/transport-menu';
import { instituteSetupPermissions } from 'src/constants/institute-setup';
import { communicationPermissions } from 'src/constants/comminication-menu';
import { securityGuardPermissions } from 'src/constants/security-gaurd-menu';

import { dashboardMockDataByTemplate } from './dashboard-mock-data';
import {
  dashboardWidgetRegistry,
  enrichDashboardDataFromRegistry,
  buildMissingDashboardRegistryCoverage,
} from './dashboard-widget-registry';

type BackendDashboardWidgetDefinition = {
  id: string;
  zone: string;
  drilldownUrl: string;
  requiredPermissions: string[];
  owner?: string;
};

const BACKEND_PERMISSION_ROOT = 'ShikshaMitra.Module';
const backendZoneAliases: Record<string, string> = {
  Kpis: 'kpis',
  Actions: 'actions',
  Risks: 'risks',
  Modules: 'modules',
  Calendar: 'calendar',
  Announcements: 'announcements',
};
const backendRepoRoot =
  process.env.DASHBOARD_BACKEND_REPO_ROOT ?? path.resolve(process.cwd(), '..', 'Shikshamitra-BE');
const backendDashboardWidgetCatalogPath = path.resolve(
  backendRepoRoot,
  'src',
  'ShikshaMitra.Application',
  'Dashboard',
  'DashboardWidgetCatalog.cs'
);
const backendContractIt = fs.existsSync(backendDashboardWidgetCatalogPath) ? it : it.skip;

const collectPageRoutes = (directory: string, routeSegments: string[] = []): string[] => {
  if (!fs.existsSync(directory)) {
    return [];
  }

  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const entryPath = path.join(directory, entry.name);

    if (entry.isDirectory()) {
      const isRouteGroup = entry.name.startsWith('(') && entry.name.endsWith(')');
      return collectPageRoutes(
        entryPath,
        isRouteGroup ? routeSegments : [...routeSegments, entry.name]
      );
    }

    if (entry.isFile() && entry.name === 'page.tsx') {
      return [`/${routeSegments.join('/')}`.replace(/\/$/, '') || '/'];
    }

    return [];
  });
};

const collectPageRouteGuardSources = (
  directory: string,
  routeSegments: string[] = [],
  inheritedGuardSources: string[] = []
): Map<string, string[]> => {
  if (!fs.existsSync(directory)) {
    return new Map();
  }

  const guardSources = [...inheritedGuardSources];
  const layoutPath = path.join(directory, 'layout.tsx');

  if (fs.existsSync(layoutPath)) {
    const layoutSource = fs.readFileSync(layoutPath, 'utf8');

    [...layoutSource.matchAll(/permissionKey=\{([^}]+)\}/g)].forEach(([, permissionSource]) =>
      guardSources.push(permissionSource.trim())
    );
    [...layoutSource.matchAll(/perm\.name\s*===\s*([A-Za-z0-9_.]+(?:\.[A-Za-z0-9_]+)*)/g)].forEach(
      ([, permissionSource]) => guardSources.push(permissionSource.trim())
    );
    [...layoutSource.matchAll(/hasGrantedPermission\([^,]+,\s*([^)]+)\)/g)].forEach(
      ([, permissionSource]) => guardSources.push(permissionSource.trim())
    );
  }

  const routeGuards = new Map<string, string[]>();
  const pagePath = path.join(directory, 'page.tsx');

  if (fs.existsSync(pagePath)) {
    routeGuards.set(`/${routeSegments.join('/')}`.replace(/\/$/, '') || '/', [
      ...new Set(guardSources),
    ]);
  }

  fs.readdirSync(directory, { withFileTypes: true }).forEach((entry) => {
    if (!entry.isDirectory()) {
      return;
    }

    const isRouteGroup = entry.name.startsWith('(') && entry.name.endsWith(')');
    collectPageRouteGuardSources(
      path.join(directory, entry.name),
      isRouteGroup ? routeSegments : [...routeSegments, entry.name],
      guardSources
    ).forEach((sources, route) => routeGuards.set(route, sources));
  });

  return routeGuards;
};

const permissionSourceRoots = {
  academicPermissions,
  calendarPermissions,
  communicationPermissions,
  financePermissions,
  hrPermissions,
  instituteSetupPermissions,
  securityGuardPermissions,
  studentPermissions,
  transportPermissions,
};

const resolveObjectPath = (source: string): string | string[] | undefined => {
  const [rootName, ...pathSegments] = source.split('.');
  let value = permissionSourceRoots[rootName as keyof typeof permissionSourceRoots] as unknown;

  pathSegments.forEach((segment) => {
    value =
      value && typeof value === 'object' ? (value as Record<string, unknown>)[segment] : undefined;
  });

  return typeof value === 'string' || Array.isArray(value) ? value : undefined;
};

const resolveRoutePermissionSource = (source: string): string[] => {
  const trimmedSource = source.trim();

  if (trimmedSource.startsWith('[')) {
    return trimmedSource
      .replace(/^\[/, '')
      .replace(/\]$/, '')
      .split(',')
      .flatMap((item) => resolveRoutePermissionSource(item));
  }

  const resolvedValue = resolveObjectPath(trimmedSource);

  return Array.isArray(resolvedValue) ? resolvedValue : resolvedValue ? [resolvedValue] : [];
};

const readBackendFile = (...segments: string[]) =>
  fs.readFileSync(path.resolve(backendRepoRoot, ...segments), 'utf8');

const resolveLegacySubModulePermission = (expression: string) => {
  const constantName = expression.replace('ShikshaMitraSubModulePermissions.', '');
  const legacySource = readBackendFile(
    'src',
    'ShikshaMitra.Domain.Shared',
    'Constants',
    'Permissions',
    'ShikshaMitraSubModulePermissions.cs'
  );
  const constantPattern = new RegExp(
    `public const string ${constantName}\\s*=\\s*\\$"\\{ShikshaMitraModulePermissions\\.([^}]+)\\}([^"]*)"`,
    'm'
  );
  const match = legacySource.match(constantPattern);

  if (!match) {
    throw new Error(`Unable to resolve backend dashboard permission: ${expression}`);
  }

  return `${BACKEND_PERMISSION_ROOT}.${match[1]}${match[2]}`;
};

const resolveBackendPermissionExpression = (expression: string) => {
  if (expression.startsWith('ShikshaMitraModulePermissions.')) {
    return `${BACKEND_PERMISSION_ROOT}.${expression.replace('ShikshaMitraModulePermissions.', '')}`;
  }

  if (expression.startsWith('ShikshaMitraSubModulePermissions.')) {
    return resolveLegacySubModulePermission(expression);
  }

  const nestedPermissionMatch = expression.match(
    /^ShikshaMitraSubmodulePermissions\.([^.]+)\.(.+)\.([^.]+)$/
  );

  if (nestedPermissionMatch) {
    const [, moduleName, submodulePath, action] = nestedPermissionMatch;
    return `${BACKEND_PERMISSION_ROOT}.${moduleName}.${submodulePath.replaceAll('_', '.')}.${action}`;
  }

  throw new Error(`Unable to resolve backend dashboard permission: ${expression}`);
};

const resolveBackendPermissionExpressions = (source: string) => {
  const permissionExpressionMatches = source.matchAll(
    /ShikshaMitra(?:ModulePermissions|SubModulePermissions|SubmodulePermissions)(?:\.[A-Za-z0-9_]+)+/g
  );

  return [
    ...new Set(
      [...permissionExpressionMatches].map(([expression]) =>
        resolveBackendPermissionExpression(expression)
      )
    ),
  ];
};

const parseBackendPermissionAliases = (backendReaderSource: string) => {
  const aliasMatches = backendReaderSource.matchAll(
    /(?:private|public|internal) static readonly string\[\]\s+([A-Za-z0-9_]+)\s*=\s*\[([\s\S]*?)\];/gm
  );

  return new Map(
    [...aliasMatches].map(([, name, source]) => [name, resolveBackendPermissionExpressions(source)])
  );
};

const parseBackendDashboardWidgetDefinitions = (): BackendDashboardWidgetDefinition[] => {
  const backendReaderSource = readBackendFile(
    'src',
    'ShikshaMitra.Application',
    'Dashboard',
    'DashboardWidgetCatalog.cs'
  );
  const permissionAliases = parseBackendPermissionAliases(backendReaderSource);
  const widgetDefinitionMatches = backendReaderSource.matchAll(
    /^\s*\["([^"]+)"\]\s*=\s*new\(\s*([A-Za-z0-9_]+),\s*"([^"]+)",\s*(\[[\s\S]*?\]|[A-Za-z0-9_]+)(?:,\s*"([^"]+)")?\s*\),?/gm
  );

  return [...widgetDefinitionMatches].map(
    ([, id, zoneAlias, drilldownUrl, permissionsSource, owner]) => {
      const zone = backendZoneAliases[zoneAlias];
      if (!zone) {
        throw new Error(`Unable to resolve backend dashboard widget zone: ${id}`);
      }

      const requiredPermissions = permissionsSource.startsWith('[')
        ? resolveBackendPermissionExpressions(permissionsSource)
        : permissionAliases.get(permissionsSource);

      if (!requiredPermissions?.length) {
        throw new Error(`Unable to resolve backend dashboard widget permissions: ${id}`);
      }

      return { id, zone, drilldownUrl, requiredPermissions, owner };
    }
  );
};

const normalizeViewPermission = (permission: string) => {
  const withoutRoot = permission.startsWith(`${BACKEND_PERMISSION_ROOT}.`)
    ? permission.slice(`${BACKEND_PERMISSION_ROOT}.`.length)
    : permission;

  return withoutRoot.endsWith('.View') ? withoutRoot.slice(0, -'.View'.length) : withoutRoot;
};

const frontendPermissionMatchesBackend = (
  frontendPermission: string,
  backendPermission: string
) => {
  const frontend = normalizeViewPermission(frontendPermission);
  const backend = normalizeViewPermission(backendPermission);

  return frontend === backend || frontend.startsWith(`${backend}.`);
};

const toPermissionArray = (requiredPermissions: string | string[]) =>
  Array.isArray(requiredPermissions) ? requiredPermissions : [requiredPermissions];

const mustHaveWidgetIdsByTemplate = {
  leadership: [
    'leadership-total-students',
    'leadership-fee-collection',
    'leadership-attendance',
    'leadership-compliance',
    'leadership-academic-health',
  ],
  principalAdmin: [
    'principal-student-attendance',
    'principal-teacher-attendance',
    'principal-curriculum',
    'principal-pending-admissions',
    'principal-academic-dashboard',
  ],
  teacher: [
    'teacher-classes',
    'teacher-homework',
    'teacher-exam-evaluation',
    'teacher-attendance',
    'teacher-class-performance',
  ],
  financeHr: [
    'finance-collection',
    'finance-dues',
    'hr-payroll-readiness',
    'hr-staff-attendance',
    'finance-reconciliation',
    'hr-leave-approvals',
    'finance-dashboard',
    'hr-dashboard',
  ],
  studentParent: [
    'student-attendance',
    'student-assignments',
    'student-fee-status',
    'student-document-update',
    'student-academic-summary',
  ],
};

describe('dashboard widget registry', () => {
  it('registers every mock dashboard widget id in the expected zone', () => {
    Object.values(dashboardMockDataByTemplate).forEach((templateData) => {
      const missingCoverage = buildMissingDashboardRegistryCoverage(templateData);

      Object.values(missingCoverage).forEach((missingIds) => {
        expect(missingIds).toEqual([]);
      });
    });
  });

  it('applies registry metadata over mock widget metadata', () => {
    const templateData = dashboardMockDataByTemplate.financeHr;
    const enrichedData = enrichDashboardDataFromRegistry({
      ...templateData,
      kpiCards: [
        {
          ...templateData.kpiCards[0],
          drilldownUrl: '/wrong',
          requiredPermissions: 'Wrong.Permission',
        },
      ],
    });

    expect(enrichedData.kpiCards[0].drilldownUrl).toBe(
      dashboardWidgetRegistry['finance-collection'].drilldownUrl
    );
    expect(enrichedData.kpiCards[0].requiredPermissions).toBe(
      dashboardWidgetRegistry['finance-collection'].requiredPermissions
    );
  });

  it('keeps registered widgets actionable through drilldown or owner metadata', () => {
    Object.values(dashboardWidgetRegistry).forEach((entry) => {
      expect(Boolean(entry.drilldownUrl || entry.owner), entry.id).toBe(true);
    });
  });

  it('keeps must-have template anchors registered and actionable in the frontend fallback registry', () => {
    Object.entries(mustHaveWidgetIdsByTemplate).forEach(([template, widgetIds]) => {
      widgetIds.forEach((widgetId) => {
        const entry = dashboardWidgetRegistry[widgetId];

        expect(entry, `${template} should register ${widgetId}`).toBeDefined();
        expect(Boolean(entry.drilldownUrl || entry.owner), widgetId).toBe(true);
        expect(toPermissionArray(entry.requiredPermissions).length, widgetId).toBeGreaterThan(0);

        if (entry.drilldownUrl) {
          expect(entry.drilldownUrl, widgetId).toMatch(/^\/(?!\/)/);
          expect(entry.drilldownUrl, widgetId).not.toContain('://');
        }
      });
    });
  });

  backendContractIt('stays in sync with backend dashboard widget definitions', () => {
    const frontendWidgetIds = Object.keys(dashboardWidgetRegistry).sort();
    const backendWidgetIds = parseBackendDashboardWidgetDefinitions()
      .map((definition) => definition.id)
      .sort();

    expect(frontendWidgetIds).toEqual(backendWidgetIds);
  });

  backendContractIt(
    'keeps frontend widget permissions aligned with backend widget permissions',
    () => {
      const backendDefinitions = new Map(
        parseBackendDashboardWidgetDefinitions().map((definition) => [definition.id, definition])
      );
      const permissionDrift = Object.values(dashboardWidgetRegistry).flatMap((entry) => {
        const backendDefinition = backendDefinitions.get(entry.id);
        const frontendPermissions = toPermissionArray(entry.requiredPermissions);
        const hasSharedPermissionFamily = frontendPermissions.some((frontendPermission) =>
          backendDefinition?.requiredPermissions.some((backendPermission) =>
            frontendPermissionMatchesBackend(frontendPermission, backendPermission)
          )
        );
        const unexpectedPermissions = frontendPermissions.filter(
          (frontendPermission) =>
            !backendDefinition?.requiredPermissions.some((backendPermission) =>
              frontendPermissionMatchesBackend(frontendPermission, backendPermission)
            )
        );

        if (hasSharedPermissionFamily && !unexpectedPermissions.length) {
          return [];
        }

        return [
          {
            widgetId: entry.id,
            frontendPermissions,
            backendPermissions: backendDefinition?.requiredPermissions ?? [],
          },
        ];
      });

      expect(permissionDrift).toEqual([]);
    }
  );

  backendContractIt(
    'keeps frontend widget zones, drilldowns, and owners aligned with backend metadata',
    () => {
      const backendDefinitions = new Map(
        parseBackendDashboardWidgetDefinitions().map((definition) => [definition.id, definition])
      );
      const metadataDrift = Object.values(dashboardWidgetRegistry).flatMap((entry) => {
        const backendDefinition = backendDefinitions.get(entry.id);

        if (
          backendDefinition &&
          entry.zone === backendDefinition.zone &&
          entry.drilldownUrl === backendDefinition.drilldownUrl &&
          (entry.owner ?? null) === (backendDefinition.owner ?? null)
        ) {
          return [];
        }

        return [
          {
            widgetId: entry.id,
            frontend: {
              zone: entry.zone,
              drilldownUrl: entry.drilldownUrl,
              owner: entry.owner,
            },
            backend: backendDefinition
              ? {
                  zone: backendDefinition.zone,
                  drilldownUrl: backendDefinition.drilldownUrl,
                  owner: backendDefinition.owner,
                }
              : null,
          },
        ];
      });

      expect(metadataDrift).toEqual([]);
    }
  );

  it('points dashboard drilldowns at existing Next.js routes', () => {
    const pageRoutes = new Set(collectPageRoutes(path.resolve(process.cwd(), 'src', 'app')));
    const missingRoutes = Object.values(dashboardWidgetRegistry)
      .map((entry) => entry.drilldownUrl)
      .filter((drilldownUrl): drilldownUrl is string => Boolean(drilldownUrl))
      .filter((drilldownUrl) => !pageRoutes.has(drilldownUrl));

    expect([...new Set(missingRoutes)].sort()).toEqual([]);
  });

  it('aligns dashboard drilldown permissions with target route leaf guards', () => {
    const routeGuardSources = collectPageRouteGuardSources(
      path.resolve(process.cwd(), 'src', 'app')
    );
    const routePermissionDrift = Object.values(dashboardWidgetRegistry).flatMap((entry) => {
      if (!entry.drilldownUrl) {
        return [];
      }

      const guardSources = routeGuardSources.get(entry.drilldownUrl);
      const leafGuardSource = guardSources?.at(-1);
      const routeLeafPermissions = leafGuardSource
        ? resolveRoutePermissionSource(leafGuardSource)
        : [];
      const widgetPermissions = toPermissionArray(entry.requiredPermissions);
      const hasSharedPermissionFamily = widgetPermissions.some((widgetPermission) =>
        routeLeafPermissions.some((routePermission) =>
          frontendPermissionMatchesBackend(widgetPermission, routePermission)
        )
      );

      if (hasSharedPermissionFamily) {
        return [];
      }

      return [
        {
          widgetId: entry.id,
          drilldownUrl: entry.drilldownUrl,
          widgetPermissions,
          routeLeafPermissions,
          leafGuardSource,
        },
      ];
    });

    expect(routePermissionDrift).toEqual([]);
  });
});
