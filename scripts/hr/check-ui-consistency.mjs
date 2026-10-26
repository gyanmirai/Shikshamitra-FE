import fs from 'node:fs';
import path from 'node:path';
import ts from 'typescript';

// Static import closure is an upper bound: conditional tabs and dynamic panels are included.
const root = process.cwd();
const sourceRoot = path.join(root, 'src');
const normalize = (file) => path.relative(root, file).replaceAll('\\', '/');
function sourceFiles(directory) {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const file = path.join(directory, entry.name);
    if (entry.isDirectory()) return sourceFiles(file);
    return /\.[tj]sx?$/.test(entry.name) && !/\.(test|spec)\./.test(entry.name) ? [file] : [];
  });
}
function resolveImport(file, name) {
  if (!name.startsWith('.') && !name.startsWith('src/')) return undefined;
  const candidate = name.startsWith('.')
    ? path.resolve(path.dirname(file), name)
    : path.join(root, name);
  return [
    candidate,
    ...['.tsx', '.ts', '.jsx', '.js', '/index.tsx', '/index.ts'].map(
      (suffix) => candidate + suffix
    ),
  ].find((target) => fs.existsSync(target) && fs.statSync(target).isFile());
}
const cache = new Map();
const tableTags = new Set([
  'CustomizableTable',
  'SectionTable',
  'PerformanceDataTable',
  'HrReportPreviewTable',
  'ReportResultTable',
  'ReviewTable',
  'Table',
  'CommonTable',
  'DataGrid',
  'table',
]);
const rawTags = new Set(['Table', 'CommonTable', 'DataGrid', 'table']);
function inspect(file) {
  if (cache.has(file)) return cache.get(file);
  const source = fs.readFileSync(file, 'utf8');
  const ast = ts.createSourceFile(file, source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  const imports = [];
  const tables = [];
  function visit(node) {
    let name;
    if (
      (ts.isImportDeclaration(node) || ts.isExportDeclaration(node)) &&
      node.moduleSpecifier &&
      ts.isStringLiteral(node.moduleSpecifier)
    )
      name = node.moduleSpecifier.text;
    if (
      ts.isCallExpression(node) &&
      node.expression.kind === ts.SyntaxKind.ImportKeyword &&
      node.arguments[0] &&
      ts.isStringLiteral(node.arguments[0])
    )
      name = node.arguments[0].text;
    if (name) {
      const target = resolveImport(file, name);
      if (target) imports.push(target);
    }
    if (ts.isJsxSelfClosingElement(node) || ts.isJsxOpeningElement(node)) {
      const tag = node.tagName.getText(ast);
      if (tableTags.has(tag)) {
        const props = Object.fromEntries(
          node.attributes.properties
            .filter(ts.isJsxAttribute)
            .map((attribute) => [
              attribute.name.text,
              attribute.initializer?.getText(ast) || 'true',
            ])
        );
        const spreads = node.attributes.properties
          .filter(ts.isJsxSpreadAttribute)
          .map((attribute) => attribute.expression.getText(ast));
        const scalarFilter = spreads.some(
          (expression) =>
            expression.startsWith('serverColumnFilters(') ||
            (['tableCriteria', 'versionTableFilters'].includes(expression) &&
              source.includes('serverColumnFilters('))
        );
        if (scalarFilter) props.onServerFilter = 'endpoint scalar predicate adapter';
        tables.push({
          file: normalize(file),
          line: ast.getLineAndCharacterOfPosition(node.getStart(ast)).line + 1,
          tag,
          props,
          forwarded: node.attributes.properties.some(ts.isJsxSpreadAttribute),
        });
      }
    }
    ts.forEachChild(node, visit);
  }
  visit(ast);
  const result = { imports, tables, source };
  cache.set(file, result);
  return result;
}
const files = sourceFiles(sourceRoot);
const routes = files
  .filter(
    (file) =>
      file.includes(`${path.sep}app${path.sep}`) &&
      file.includes(`${path.sep}hr${path.sep}`) &&
      file.endsWith(`${path.sep}page.tsx`)
  )
  .sort()
  .map((entry) => {
    const visited = new Set();
    function walk(file) {
      if (visited.has(file)) return;
      visited.add(file);
      inspect(file).imports.forEach(walk);
    }
    walk(entry);
    return {
      route: `/${path
        .relative(path.join(sourceRoot, 'app'), path.dirname(entry))
        .split(path.sep)
        .filter((part) => !part.startsWith('('))
        .join('/')}`,
      entry: normalize(entry),
      kind: /\bredirect\(/.test(inspect(entry).source)
        ? 'redirect'
        : /\bnotFound\(/.test(inspect(entry).source)
          ? 'not-found'
          : 'page',
      tables: [...visited]
        .flatMap((file) => inspect(file).tables)
        .filter((table) => table.file.startsWith('src/screens/hr/')),
      externalTables: [...visited]
        .flatMap((file) => inspect(file).tables)
        .filter(
          (table) =>
            table.file.startsWith('src/screens/') && !table.file.startsWith('src/screens/hr/')
        ),
    };
  });
const reachable = [
  ...new Map(
    routes.flatMap((route) => route.tables).map((table) => [`${table.file}:${table.line}`, table])
  ).values(),
];
const exceptions = {
  'src/screens/hr/policies/components/CalendarPolicyDrawer.tsx':
    'Editable holiday configuration with inclusion, manual edit and removal controls.',
  'src/screens/hr/policies/components/PayrollPolicyDrawer.tsx':
    'Editable monthly payroll basis configuration; preserves manual-day calculation and validation.',
};
const violations = [];
for (const table of reachable) {
  if (rawTags.has(table.tag) && !exceptions[table.file])
    violations.push(`Unapproved raw table: ${table.file}:${table.line}`);
  if (['CustomizableTable', 'PerformanceDataTable'].includes(table.tag) && !table.forwarded) {
    for (const name of ['tableId', 'tableTitle'])
      if (!table.props[name]) violations.push(`Missing ${name}: ${table.file}:${table.line}`);
  }
}
const checklist = fs.readFileSync('docs/hr/references/hr-table-coverage.md', 'utf8');
for (const route of routes)
  if (!checklist.includes(`\`${route.route}\``))
    violations.push(`Route missing from checklist: ${route.route}`);
const unusedRaw = files
  .filter((file) => normalize(file).startsWith('src/screens/hr/'))
  .flatMap((file) => inspect(file).tables)
  .filter(
    (table) =>
      rawTags.has(table.tag) &&
      !reachable.some((current) => current.file === table.file && current.line === table.line)
  );
const enabled = (value) => value !== undefined && value !== 'false' && value !== '{false}';
const capabilities = reachable.map(({ file, line, tag, props, forwarded }) => {
  if (rawTags.has(tag))
    return {
      file,
      line,
      table: `${tag}: ${exceptions[file] || file}`,
      pagination: 'not applicable',
      sort: 'unavailable: editable configuration',
      filter: 'feature-owned editing controls',
      search: 'feature-owned',
      export: 'unavailable: draft editing context',
    };
  const paged = enabled(props.serverSidePagination);
  const adapter = tag !== 'CustomizableTable' || forwarded;
  return {
    file,
    line,
    table: props.tableId || tag,
    pagination: paged ? 'server' : adapter ? 'adapter/consumer' : 'local',
    sort: paged
      ? props.onServerSort || props.onSortChange
        ? 'server callback'
        : forwarded && !props.onServerFilter
          ? 'forwarded'
          : 'unavailable: endpoint integration required'
      : 'local per-column / adapter',
    filter: paged
      ? props.onServerFilter || props.onFiltersChange
        ? 'server callback'
        : forwarded && !props.onServerFilter
          ? 'forwarded'
          : 'unavailable: endpoint integration required'
      : 'local per-column / adapter',
    search:
      props.isSearch === '{false}'
        ? 'disabled'
        : enabled(props.serverSideSearch)
          ? 'server'
          : paged
            ? 'verify consumer'
            : 'local / adapter',
    export:
      props.showExport === '{false}'
        ? 'disabled: editing/selection'
        : props.onExport
          ? 'full-result callback'
          : props.exportScope === '"all"' && paged
            ? 'disabled without callback'
            : adapter
              ? 'adapter/consumer'
              : 'filtered loaded rows',
  };
});
const result = { routes, reachable, capabilities, exceptions, unusedRaw, violations };
if (process.argv.includes('--json')) console.log(JSON.stringify(result, null, 2));
else if (process.argv.includes('--capabilities')) {
  console.log('| Table | Pagination | Sort | Filter | Search | Export |');
  console.log('| --- | --- | --- | --- | --- | --- |');
  capabilities.forEach((item) =>
    console.log(
      `| ${item.table.replaceAll('|', '/')} | ${item.pagination} | ${item.sort} | ${item.filter} | ${item.search} | ${item.export} |`
    )
  );
} else {
  console.log(
    `HR routes: ${routes.length}; table instances including adapters: ${reachable.length}; editable raw-table exceptions: ${reachable.filter((table) => rawTags.has(table.tag)).length}; unused demo raw tables: ${unusedRaw.length}`
  );
  violations.forEach((message) => console.error(message));
  console.log(
    violations.length
      ? `${violations.length} consistency violation(s).`
      : 'Route coverage and shared-table ownership checks passed.'
  );
}
process.exitCode = violations.length ? 1 : 0;
