import { it, expect, describe } from 'vitest';
import { hrPaths, hrPermissions } from 'src/constants/hr-menus';

import { hrSetupAction } from './hr-setup';
import { safeHrText, normalizeHrFailure } from './hr-failure';

describe('HR failure contract', () => {
  it('shows all supported validation shapes with their field names', () => {
    const failure = normalizeHrFailure({
      status: 400,
      data: {
        error: {
          message: 'One or more validation errors occurred.',
          validationErrors: [
            { message: 'Enter a positive amount.', members: ['monthlyAmount'] },
            { errorMessage: 'Choose a month.', memberNames: ['effectiveMonth'] },
          ],
        },
        errors: { BankName: ['Enter a bank name.'] },
      },
    });
    expect(failure.fields).toEqual([
      { name: 'Bank Name', message: 'Enter a bank name.' },
      { name: 'monthly Amount', message: 'Enter a positive amount.' },
      { name: 'effective Month', message: 'Choose a month.' },
    ]);
    expect(failure.message).not.toMatch(/One or more/);
  });

  it('retains an actual business reason rather than replacing it with a guessed prerequisite', () => {
    const failure = normalizeHrFailure({
      status: 400,
      data: {
        error: {
          code: 'HR:Employee:010201',
          message: 'One or more business rules were violated.',
          data: { Reason: 'ESIC enrollment is incomplete.' },
        },
      },
    });
    expect(failure.message).toBe('ESIC enrollment is incomplete.');
    expect(failure.setup).toBe('salary');
  });

  it('provides safe known-code guidance even when the server has generic copy', () => {
    expect(
      normalizeHrFailure({ status: 400, data: { errorCode: 'HR:Leave:020015' } })
    ).toMatchObject({
      setup: 'leave',
      message: 'No leave policy was found for the selected leave type.',
    });
  });

  it.each([401, 403])('does not suggest a permission bypass for %s', (status) => {
    expect(
      normalizeHrFailure({ status, data: { detail: 'secret', errorCode: 'HR:Employee:010201' } })
    ).toMatchObject({
      title: 'Access Required',
      fields: [],
    });
    expect(normalizeHrFailure({ status }).setup).toBeUndefined();
  });

  it.each([500, 502, 'FETCH_ERROR', 'TIMEOUT_ERROR', 'PARSING_ERROR'])(
    'does not invent a result or repeat a command after %s',
    (status) => {
      const failure = normalizeHrFailure({
        status,
        data: { detail: 'System.InvalidOperationException: secret' },
      });
      expect(failure.guidance).toContain('Check the saved record or history before retrying');
      expect(failure.message).not.toContain('secret');
    }
  );

  it('keeps conflict reasons and instructs review before retry', () => {
    expect(
      normalizeHrFailure({ status: 409, data: { detail: 'The request is already finalized.' } })
    ).toMatchObject({
      title: 'Review the Latest Record',
      message: 'The request is already finalized.',
    });
  });

  it('does not fabricate a reason for an unknown code or expose exception details', () => {
    const failure = normalizeHrFailure({
      status: 400,
      data: {
        error: {
          code: 'HR:Unknown',
          details: 'System.Exception: connection string secret',
          message: 'One or more business rules were violated.',
        },
      },
    });
    expect(failure.message).toContain('did not provide a specific reason');
    expect(failure.setup).toBeUndefined();
  });

  it.each([
    'System.Exception: secret',
    'at Sql.Execute(query)',
    'Bearer abc',
    'Password=secret',
    'C:\\service\\file.cs',
    'https://internal.test',
  ])('filters diagnostic text: %s', (value) => {
    expect(safeHrText(value)).toBeUndefined();
  });

  it('caps field summaries without retaining the source object', () => {
    const error = { status: 400, data: { errors: { Amount: Array(50).fill('Enter an amount.') } } };
    const result = normalizeHrFailure(error);
    expect(result.fields).toHaveLength(12);
    error.data.errors.Amount[0] = 'Changed';
    expect(result.fields[0].message).toBe('Enter an amount.');
  });
});

describe('authorized fixed setup destinations', () => {
  it('requires staff edit and every directory ancestor, and encodes only the selected staff context', () => {
    const grants = [
      hrPermissions.root,
      hrPermissions.employee.root,
      `${hrPermissions.employee.list}.View`,
      `${hrPermissions.employee.list}.Edit`,
      hrPermissions.payroll.settings.statutorySchemes,
    ].map((name) => ({ name, isGranted: true }));
    const action = hrSetupAction('staffPayroll', grants, true, 'staff/1?draft=private');
    const url = new URL(action!.href, 'https://example.test');
    expect(url.pathname).toBe(hrPaths.employee.list);
    expect(Object.fromEntries(url.searchParams)).toEqual({
      mode: 'form',
      editEmployee: 'staff/1?draft=private',
      step: 'payroll',
    });
    grants.forEach((grant) =>
      expect(
        hrSetupAction(
          'staffPayroll',
          grants.filter((p) => p !== grant),
          true,
          'staff-1'
        )
      ).toBeNull()
    );
    expect(hrSetupAction('staffPayroll', grants)).toBeNull();
    expect(hrSetupAction('staffPayroll', grants, false, 'staff-1')).toBeNull();
  });

  it('requires the attendance route action and ancestors for the attendance prerequisite', () => {
    const grants = [
      hrPermissions.root,
      hrPermissions.attendance.root,
      `${hrPermissions.attendance.markAttendance}.View`,
    ].map((name) => ({ name, isGranted: true }));
    expect(hrSetupAction('attendance', grants)?.href).toBe(hrPaths.attendance.markAttendance);
    grants.forEach((grant) =>
      expect(
        hrSetupAction(
          'attendance',
          grants.filter((p) => p !== grant)
        )
      ).toBeNull()
    );
    expect(hrSetupAction('attendance', grants, false)).toBeNull();
  });

  const permissions = [
    hrPermissions.root,
    hrPermissions.payroll.root,
    hrPermissions.payroll.settings.root,
    hrPermissions.payroll.settings.salaryTemplateActions.view,
  ].map((name) => ({ name, isGranted: true }));
  it('uses a fixed local route with no payload or return URL', () => {
    expect(hrSetupAction('templates', permissions)).toEqual({
      label: 'Review salary templates',
      href: hrPaths.payroll.settings.salaryTemplates,
    });
  });
  it('requires every ancestor route guard and the actual view action', () => {
    permissions.forEach((permission) =>
      expect(
        hrSetupAction(
          'templates',
          permissions.filter((item) => item !== permission)
        )
      ).toBeNull()
    );
    expect(hrSetupAction('templates', permissions, false)).toBeNull();
    expect(hrSetupAction('salary', permissions)).toBeNull();
  });
});
