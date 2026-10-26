import ts from 'typescript';
import fs from 'node:fs';
import { result as inv } from './check-ui-consistency.mjs';

const roots = [
  ...new Set([
    ...inv.reachable.map((t) => t.file),
    'src/screens/hr/i-card/i-card-staff-columns.tsx',
  ]),
];
const program = ts.createProgram(roots, { noResolve: true, noLib: true, jsx: ts.JsxEmit.Preserve });
const checker = program.getTypeChecker();
const unknown = (n) => ({ unknown: n?.getText().slice(0, 130) || '?' });
function unwrap(n) {
  while (
    n &&
    (ts.isParenthesizedExpression(n) ||
      ts.isAsExpression(n) ||
      ts.isSatisfiesExpression(n) ||
      ts.isNonNullExpression(n) ||
      ts.isJsxExpression(n))
  )
    n = n.expression;
  return n;
}
function returns(n) {
  n = unwrap(n);
  if (!n) return [];
  if (!ts.isBlock(n)) return [n];
  const out = [];
  function visit(x) {
    if (ts.isReturnStatement(x)) {
      if (x.expression) out.push(x.expression);
      return;
    }
    if (ts.isArrowFunction(x) || ts.isFunctionExpression(x) || ts.isFunctionDeclaration(x)) return;
    ts.forEachChild(x, visit);
  }
  ts.forEachChild(n, visit);
  return out;
}
const list = (v) => (Array.isArray(v) ? v : v == null ? [] : [v]);
function evaluate(n, env = new Map(), seen = new Set()) {
  n = unwrap(n);
  if (!n) return undefined;
  if (seen.has(n)) return unknown(n);
  seen = new Set(seen).add(n);
  if (ts.isStringLiteralLike(n)) return n.text;
  if (n.kind === ts.SyntaxKind.TrueKeyword) return true;
  if (n.kind === ts.SyntaxKind.FalseKeyword) return false;
  if (ts.isNumericLiteral(n)) return Number(n.text);
  if (ts.isIdentifier(n)) {
    if (env.has(n.text)) return env.get(n.text);
    const s = checker.getSymbolAtLocation(n);
    const d = s?.valueDeclaration ?? s?.declarations?.[0];
    if (d?.initializer) return evaluate(d.initializer, env, seen);
    if (d && ts.isBindingElement(d) && d.parent?.parent?.initializer) {
      const call = d.parent.parent.initializer;
      if (ts.isCallExpression(call) && call.expression.getText() === 'serverColumnFilters')
        return evaluate(call.arguments[0], env, seen);
    }
    return unknown(n);
  }
  if (ts.isArrayLiteralExpression(n))
    return n.elements.flatMap((e) =>
      ts.isSpreadElement(e) ? list(evaluate(e.expression, env, seen)) : [evaluate(e, env, seen)]
    );
  if (ts.isObjectLiteralExpression(n)) {
    let out = {};
    for (const p of n.properties) {
      if (ts.isSpreadAssignment(p)) {
        const v = evaluate(p.expression, env, seen);
        if (v && typeof v === 'object' && !Array.isArray(v)) out = { ...out, ...v };
      } else if (ts.isPropertyAssignment(p)) {
        out[p.name.getText().replace(/^['"]|['"]$/g, '')] = [
          'render',
          'filterValue',
          'sortValue',
          'exportValue',
          'searchValue',
        ].includes(p.name.getText())
          ? p.initializer.getText().slice(0, 220)
          : evaluate(p.initializer, env, seen);
      } else if (ts.isShorthandPropertyAssignment(p))
        out[p.name.text] = evaluate(p.name, env, seen);
      else if (ts.isMethodDeclaration(p)) out[p.name.getText()] = p.getText().slice(0, 220);
    }
    return out;
  }
  if (ts.isConditionalExpression(n))
    return [...list(evaluate(n.whenTrue, env, seen)), ...list(evaluate(n.whenFalse, env, seen))];
  if (ts.isPropertyAccessExpression(n)) {
    const v = evaluate(n.expression, env, seen);
    return v && typeof v === 'object' ? (v[n.name.text] ?? unknown(n)) : unknown(n);
  }
  if (ts.isElementAccessExpression(n)) {
    const v = evaluate(n.expression, env, seen),
      k = evaluate(n.argumentExpression, env, seen);
    return v?.[k] ?? unknown(n);
  }
  if (ts.isCallExpression(n)) {
    const name = n.expression.getText();
    if (name === 'withStaffDirectoryCapabilities') return evaluate(n.arguments[0], env, seen);
    if (name === 'serverColumnFilters') return { columns: evaluate(n.arguments[0], env, seen) };
    if (name.endsWith('useMemo'))
      return returns(n.arguments[0]?.body).flatMap((x) => list(evaluate(x, env, seen)));
    if (
      ts.isPropertyAccessExpression(n.expression) &&
      ['map', 'filter', 'concat'].includes(n.expression.name.text)
    ) {
      const base = evaluate(n.expression.expression, env, seen);
      if (n.expression.name.text === 'filter') return base;
      if (n.expression.name.text === 'concat')
        return [...list(base), ...n.arguments.flatMap((a) => list(evaluate(a, env, seen)))];
      const fn = n.arguments[0];
      if ((ts.isArrowFunction(fn) || ts.isFunctionExpression(fn)) && Array.isArray(base))
        return base.flatMap((value, index) => {
          const e = new Map(env);
          if (ts.isArrayBindingPattern(fn.parameters[0]?.name) && Array.isArray(value)) {
            fn.parameters[0].name.elements.forEach((p, i) => e.set(p.name?.getText(), value[i]));
          } else e.set(fn.parameters[0]?.name.getText(), value);
          if (fn.parameters[1]) e.set(fn.parameters[1].name.getText(), index);
          return returns(fn.body).flatMap((x) => list(evaluate(x, e, seen)));
        });
    }
    const symbol = checker.getSymbolAtLocation(n.expression),
      declaration = symbol?.valueDeclaration;
    let fn = declaration?.initializer ?? declaration;
    if (!fn && name === 'createICardStaffColumns')
      fn = program
        .getSourceFile('src/screens/hr/i-card/i-card-staff-columns.tsx')
        .statements.find((x) => ts.isFunctionDeclaration(x) && x.name?.text === name);
    if (fn && ts.isCallExpression(fn) && fn.expression.getText().endsWith('useCallback'))
      fn = fn.arguments[0];
    if (
      fn &&
      (ts.isArrowFunction(fn) || ts.isFunctionExpression(fn) || ts.isFunctionDeclaration(fn))
    ) {
      const e = new Map(env);
      fn.parameters.forEach((p, i) => e.set(p.name.getText(), evaluate(n.arguments[i], env, seen)));
      return returns(fn.body).flatMap((x) => list(evaluate(x, e, seen)));
    }
  }
  if (ts.isTemplateExpression(n)) {
    let s = n.head.text;
    for (const span of n.templateSpans) {
      const v = evaluate(span.expression, env, seen);
      s +=
        (typeof v === 'string' || typeof v === 'number'
          ? v
          : '{' + span.expression.getText() + '}') + span.literal.text;
    }
    return s;
  }
  if (ts.isBinaryExpression(n) && n.operatorToken.kind === ts.SyntaxKind.BarBarToken)
    return evaluate(n.left, env, seen) ?? evaluate(n.right, env, seen);
  return unknown(n);
}
const result = [];
for (const file of roots) {
  const sf = program.getSourceFile(file);
  function visit(node) {
    if (ts.isJsxSelfClosingElement(node) || ts.isJsxOpeningElement(node)) {
      const tag = node.tagName.getText(),
        line = sf.getLineAndCharacterOfPosition(node.getStart()).line + 1;
      const table = inv.reachable.find((t) => t.file === file && t.line === line && t.tag === tag);
      if (table) {
        const attrs = Object.fromEntries(
          node.attributes.properties
            .filter(ts.isJsxAttribute)
            .map((p) => [p.name.text, p.initializer])
        );
        let cols = list(evaluate(attrs.columns)).flat(Infinity);
        if (!cols.length && ['SalaryDetailsTableCard', 'PayrollLineTable'].includes(tag))
          cols = [
            { id: 'name', label: 'Component', filterType: 'string' },
            { id: 'amount', label: 'Amount', filterType: 'number' },
          ];
        cols = cols.filter((x, i, a) => !x?.id || a.findIndex((y) => y?.id === x.id) === i);
        let parent = node.parent;
        let owner;
        while (parent) {
          if (ts.isFunctionDeclaration(parent) && parent.name) {
            owner = parent.name.text;
            break;
          }
          if (ts.isVariableDeclaration(parent) && parent.name) {
            owner = parent.name.getText();
            break;
          }
          parent = parent.parent;
        }
        result.push({
          file,
          line,
          tag,
          owner,
          props: table.props,
          id: evaluate(attrs.tableId),
          expression: table.props.columns?.replace(/\s+/g, ' ').slice(0, 120),
          server: table.props.serverSidePagination,
          sort: table.props.onServerSort,
          filter: table.props.onServerFilter,
          columns: cols.map((c, i) =>
            typeof c === 'string'
              ? {
                  id: list(evaluate(attrs.columnIds))[i] || 'column' + i,
                  label: c,
                  ...list(evaluate(attrs.columnDefinitions))[i],
                }
              : c
          ),
          routes: inv.routes
            .filter((r) => r.tables.some((t) => t.file === file && t.line === line))
            .map((r) => r.route),
        });
      }
    }
    ts.forEachChild(node, visit);
  }
  visit(sf);
}
export const columnInventory = result;
if (
  process.argv[1]?.replaceAll('\\', '/').endsWith('/column-inventory.mjs') &&
  process.argv.includes('--json')
)
  console.log(JSON.stringify(columnInventory, null, 2));
