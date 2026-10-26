import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';
import { columnInventory } from './column-inventory.mjs';
import {
  columnCapabilityMatrix as matrix,
  columnCapabilityIssues as issues,
  pendingProjectionGaps,
} from './check-column-capabilities.mjs';

test('every discovered column definition/call site has a capability entry or an explicit dynamic schema', () => {
  assert.deepEqual(issues, []);
  assert.deepEqual(pendingProjectionGaps, []);
  assert.equal(matrix.length, columnInventory.length);
  for (const table of matrix) {
    assert.ok(table.columns.length || table.schema, `${table.file}#${table.owner} is unresolved`);
    for (const column of table.columns) {
      assert.equal(typeof column.id, 'string');
      if (!column.exception) {
        assert.ok(column.sort, `${table.table}.${column.id} cannot sort`);
        assert.ok(column.filter, `${table.table}.${column.id} cannot filter`);
      } else {
        assert.equal(column.sort, false);
        assert.equal(column.filter, false);
      }
    }
  }
});

test('directory, Register and I-card data columns use complete-result capabilities, with action exceptions', () => {
  const expected = {
    'employee-table': [
      'fullName',
      'roleValue',
      'dob',
      'genderValue',
      'doi',
      'email',
      'mobileNo',
      'isTeaching',
      'shiftName',
      'organization',
      'statusValue',
    ],
    'hr-attendance-register': [
      'employeeName',
      'present',
      'exceptions',
      'employeeGroup',
      'department',
      'editability',
    ],
    'employee-icard-selection-table': ['fullName', 'designation', 'readiness'],
  };
  for (const [id, fields] of Object.entries(expected)) {
    const table = matrix.find((entry) => entry.table === id);
    assert.ok(table, id);
    assert.deepEqual(
      table.columns.filter((column) => !column.exception).map((column) => column.id),
      fields
    );
    for (const column of table.columns.filter((entry) => !entry.exception))
      assert.equal(column.sort, 'global before pagination');
    if (id === 'employee-icard-selection-table') {
      assert.ok(table.exportPolicy.includes('generic table export is prohibited'));
      for (const column of table.columns) assert.equal(column.export, false);
    }
  }
  const directory = matrix.find((table) => table.table === 'employee-table');
  assert.equal(directory.columns.find((column) => column.id === 'dob').filter, 'date');
  assert.equal(directory.columns.find((column) => column.id === 'isTeaching').filter, 'enum');
  assert.equal(directory.columns.find((column) => column.id === 'actions').export, false);
});

test('numeric/date ESI fields and formerly invisible salary tables remain in the column audit', () => {
  const esi = matrix.find((table) => table.table === 'esi-policy-table');
  for (const id of ['employeeRate', 'employerRate', 'ceiling'])
    assert.equal(esi.columns.find((column) => column.id === id).filter, 'number');
  assert.equal(esi.columns.find((column) => column.id === 'effectiveFrom').filter, 'date');
  for (const id of [
    'payroll-workbench-earnings',
    'payroll-workbench-deductions',
    'payroll-workbench-employer-contributions',
  ]) {
    const table = matrix.find((entry) => entry.table === id);
    assert.deepEqual(
      table.columns.map((column) => column.id),
      ['name', 'amount']
    );
    assert.equal(table.columns[1].filter, 'number');
  }
  assert.equal(matrix.filter((table) => table.exception).length, 2);
  const pending = matrix.find((table) => table.table === 'performance-report-pending-actions');
  assert.equal(pending.columns.find((column) => column.id === 'action').filter, 'string');
  assert.equal(pending.columns.find((column) => column.id === 'reviewId').export, false);
});

test('performance template and cycle UI IDs resolve to their global authorized source fields', () => {
  const allowedFields = JSON.parse(
    fs.readFileSync('src/screens/hr/hooks/hr-table-fields.json', 'utf8')
  );
  for (const [uiId, source] of [
    ['performance-templates', 'hr-performance-templates'],
    ['performance-cycles', 'hr-performance-cycles'],
  ]) {
    const table = matrix.find((entry) => entry.table === uiId);
    assert.ok(table, uiId);
    assert.equal(table.dataset, source);
    const dataColumns = table.columns.filter((column) => !column.exception);
    assert.deepEqual(
      dataColumns.map((column) => column.id).sort(),
      [...allowedFields[source]].sort()
    );
    for (const column of dataColumns) {
      assert.equal(column.sort, 'global before pagination');
      assert.equal(column.export, 'same global criteria, visible ordered fields');
    }
    assert.equal(table.columns.find((column) => column.id === 'actions').export, false);
  }
});
