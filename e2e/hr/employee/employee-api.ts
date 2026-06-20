import type { Page, APIResponse } from '@playwright/test';

import type { EmployeeFixture } from './employee-fixtures';

const apiBaseUrl = () => {
  const url = process.env.E2E_API_URL || process.env.NEXT_PUBLIC_API_URL;
  if (!url) {
    throw new Error('Set E2E_API_URL or NEXT_PUBLIC_API_URL to the backend host URL.');
  }
  return url.replace(/\/$/, '');
};

let directApiAccessToken: string | null = null;

async function getDirectApiAccessToken(page: Page) {
  if (directApiAccessToken) {
    return directApiAccessToken;
  }

  const response = await page.request.post(`${apiBaseUrl()}/connect/token`, {
    form: {
      grant_type: 'password',
      username:
        process.env.E2E_LIBRARY_EMAIL ||
        process.env.E2E_HR_EMAIL ||
        (process.env.E2E_HR_ATTENDANCE_SYNC === '1' ? 'admin-ddvs' : 'hr-manager@ddvs.com'),
      password: process.env.E2E_LIBRARY_PASSWORD || process.env.E2E_HR_PASSWORD || 'Temp@123',
      client_id: process.env.NEXT_PUBLIC_CLIENT_ID || 'shikshamitra-nextjs',
      client_secret: process.env.NEXT_PUBLIC_CLIENT_SECRET || 'frontend-secret',
      scope:
        process.env.NEXT_PUBLIC_SCOPE || 'openid profile email roles offline_access ShikshaMitra',
    },
    headers: {
      __tenant: process.env.E2E_TENANT || 'DDVS',
    },
  });

  if (!response.ok()) {
    throw new Error(`Direct API auth failed: ${response.status()} ${await response.text()}`);
  }

  const body = await response.json();
  directApiAccessToken = body.access_token;
  return directApiAccessToken;
}

export async function getAccessToken(page: Page) {
  if (process.env.E2E_DIRECT_API_AUTH === '1') {
    return getDirectApiAccessToken(page);
  }

  const token = await page.evaluate(async () => {
    const response = await fetch('/api/auth/session');
    if (!response.ok) return null;
    const session = await response.json();
    return session?.accessToken ?? null;
  });

  if (!token) {
    throw new Error('Unable to read accessToken from NextAuth session.');
  }

  return token as string;
}

export async function employeeApiRequest(
  page: Page,
  path: string,
  init: RequestInit & { timeout?: number } = {}
): Promise<APIResponse> {
  const token = await getAccessToken(page);
  const { body, ...requestInit } = init;
  const requestHeaders =
    init.headers instanceof Headers
      ? Object.fromEntries(init.headers.entries())
      : Array.isArray(init.headers)
        ? Object.fromEntries(init.headers)
        : init.headers || {};

  return page.request.fetch(`${apiBaseUrl()}/api${path}`, {
    ...requestInit,
    ...(body ? { data: body } : {}),
    headers: {
      accept: 'application/json',
      __tenant: process.env.E2E_TENANT || 'DDVS',
      Authorization: `Bearer ${token}`,
      ...(init.body instanceof FormData ? {} : { 'Content-Type': 'application/json' }),
      ...requestHeaders,
    },
  });
}

export async function findEmployeeBySearch(page: Page, search: string) {
  const response = await employeeApiRequest(
    page,
    `/employees?page=1&pageSize=10&search=${encodeURIComponent(search)}`
  );

  if (!response.ok()) {
    throw new Error(`Employee search failed: ${response.status()} ${await response.text()}`);
  }

  const body = await response.json();
  return body?.items?.[0] ?? null;
}

type EmployeeDefaultOverrides = {
  dateOfJoining?: string;
  roleId?: string;
  shiftId?: string;
};

export async function createEmployeeFromExistingDefaults(
  page: Page,
  fixture: EmployeeFixture,
  overrides: EmployeeDefaultOverrides = {}
) {
  const token = await getAccessToken(page);
  const tenant = process.env.E2E_TENANT || 'DDVS';
  const baseUrl = apiBaseUrl();
  const created = await page.evaluate(
    async ({
      baseUrl: evaluatedBaseUrl,
      token: evaluatedToken,
      tenant: evaluatedTenant,
      fixture: evaluatedFixture,
      overrides: evaluatedOverrides,
    }) => {
      const headers = {
        accept: 'application/json',
        __tenant: evaluatedTenant,
        Authorization: `Bearer ${evaluatedToken}`,
      };
      const listResponse = await fetch(`${evaluatedBaseUrl}/api/employees?page=1&pageSize=1`, {
        headers,
      });

      if (!listResponse.ok) {
        throw new Error(`Employee defaults list failed: ${listResponse.status}`);
      }

      const listBody = await listResponse.json();
      const sourceEmployee = listBody?.items?.[0];
      if (!sourceEmployee?.id) {
        throw new Error(
          'At least one existing employee is required for E2E default role/shift data.'
        );
      }

      const detailResponse = await fetch(
        `${evaluatedBaseUrl}/api/employees/${sourceEmployee.id}/personal-info`,
        { headers }
      );
      if (!detailResponse.ok) {
        throw new Error(`Employee defaults detail failed: ${detailResponse.status}`);
      }

      const defaults = await detailResponse.json();
      const rolesResponse = await fetch(`${evaluatedBaseUrl}/api/identity/roles/all`, {
        headers,
      });
      const roles = rolesResponse.ok ? await rolesResponse.json() : [];
      const shiftsResponse = await fetch(`${evaluatedBaseUrl}/api/app/shift-management`, {
        headers,
      });
      const shifts = shiftsResponse.ok ? await shiftsResponse.json() : { items: [] };
      const fallbackRole = (Array.isArray(roles) ? roles : roles?.items || []).find(
        (role: any) => role?.id
      );
      const fallbackShift = (Array.isArray(shifts) ? shifts : shifts?.items || []).find(
        (shift: any) => shift?.id
      );
      const isUsableId = (value: any) =>
        typeof value === 'string' &&
        value.trim() &&
        value !== '00000000-0000-0000-0000-000000000000';
      const roleId = isUsableId(evaluatedOverrides.roleId)
        ? evaluatedOverrides.roleId
        : isUsableId(defaults.roleId)
          ? defaults.roleId
          : fallbackRole?.id;
      const shiftId = isUsableId(defaults.shiftId) ? defaults.shiftId : fallbackShift?.id;
      const body = {
        firstName: evaluatedFixture.firstName,
        middleName: evaluatedFixture.middleName,
        lastName: evaluatedFixture.lastName,
        shortName: evaluatedFixture.firstName.slice(0, 20),
        dob: '1990-01-01',
        familyCaste: evaluatedFixture.familyCaste,
        casteType: defaults.casteType ?? 0,
        gender: defaults.gender ?? 1,
        religion: defaults.religion ?? 'Hindu',
        maritalStatus: defaults.maritalStatus ?? 0,
        bloodGroup: defaults.bloodGroup ?? null,
        mobileNo: evaluatedFixture.primaryMobile,
        secondaryMobileNo: evaluatedFixture.secondaryMobile,
        email: evaluatedFixture.email,
        panNo: evaluatedFixture.panNo,
        adharNo: evaluatedFixture.adharNo,
        department: defaults.department ?? 'Academics',
        doj: evaluatedOverrides.dateOfJoining ?? '2024-06-01',
        isTeaching: defaults.isTeaching ?? true,
        roleId,
        address1: evaluatedFixture.addressLine1,
        address2: evaluatedFixture.addressLine2,
        address3: evaluatedFixture.addressLine3,
        country: defaults.country ?? { name: 'India', isoCode: 'IN' },
        state: defaults.state ?? { name: 'Gujarat', isoCode: 'GJ' },
        city: defaults.city ?? evaluatedFixture.city,
        pinCode: evaluatedFixture.pincode,
        shiftId: evaluatedOverrides.shiftId ?? shiftId,
      };

      if (!body.roleId || !body.shiftId) {
        throw new Error('E2E setup could not resolve roleId and shiftId.');
      }

      const formData = new FormData();
      formData.append('Data', JSON.stringify(body));
      const createResponse = await fetch(`${evaluatedBaseUrl}/api/employees/personal-info`, {
        method: 'POST',
        headers,
        body: formData,
      });

      const responseText = await createResponse.text();
      if (!createResponse.ok) {
        throw new Error(
          `Employee create failed: ${createResponse.status} ${responseText} roleId=${body.roleId} shiftId=${body.shiftId}`
        );
      }

      return JSON.parse(responseText);
    },
    { baseUrl, token, tenant, fixture, overrides }
  );

  return created;
}

export async function updateEmployeeStatus(
  page: Page,
  employeeId: string,
  employeeStatusType: number,
  remarks?: string
) {
  const monthEnd = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0);
  const effectiveDate =
    employeeStatusType === 0
      ? null
      : `${monthEnd.getFullYear()}-${String(monthEnd.getMonth() + 1).padStart(2, '0')}-${String(
          monthEnd.getDate()
        ).padStart(2, '0')}`;
  const response = await employeeApiRequest(page, `/employees/${employeeId}/status`, {
    method: 'PUT',
    body: JSON.stringify({ employeeStatusType, remarks, effectiveDate }),
  });

  return response;
}

export async function assignReportingManager(
  page: Page,
  employeeId: string,
  reportingManagerId: string
) {
  return employeeApiRequest(page, `/employees/${employeeId}/reporting-manager`, {
    method: 'PUT',
    body: JSON.stringify({ reportingManagerId }),
  });
}
