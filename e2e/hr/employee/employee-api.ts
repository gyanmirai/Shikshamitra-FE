import type { Page, APIResponse } from '@playwright/test';

import type { EmployeeFixture } from './employee-fixtures';

const apiBaseUrl = () => {
  const url = process.env.E2E_API_URL || process.env.NEXT_PUBLIC_API_URL;
  if (!url) {
    throw new Error('Set E2E_API_URL or NEXT_PUBLIC_API_URL to the backend host URL.');
  }
  return url.replace(/\/$/, '');
};

export async function getAccessToken(page: Page) {
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
  init: RequestInit = {}
): Promise<APIResponse> {
  const token = await getAccessToken(page);
  const requestHeaders =
    init.headers instanceof Headers
      ? Object.fromEntries(init.headers.entries())
      : Array.isArray(init.headers)
        ? Object.fromEntries(init.headers)
        : init.headers || {};

  return page.request.fetch(`${apiBaseUrl()}/api${path}`, {
    ...init,
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

export async function createEmployeeFromExistingDefaults(page: Page, fixture: EmployeeFixture) {
  const token = await getAccessToken(page);
  const tenant = process.env.E2E_TENANT || 'DDVS';
  const baseUrl = apiBaseUrl();
  const created = await page.evaluate(
    async ({
      baseUrl: evaluatedBaseUrl,
      token: evaluatedToken,
      tenant: evaluatedTenant,
      fixture: evaluatedFixture,
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
        department: defaults.department ?? 'Academics',
        doj: '2024-06-01',
        isTeaching: defaults.isTeaching ?? true,
        roleId: defaults.roleId,
        address1: evaluatedFixture.addressLine1,
        address2: evaluatedFixture.addressLine2,
        address3: evaluatedFixture.addressLine3,
        country: defaults.country ?? { name: 'India', isoCode: 'IN' },
        state: defaults.state ?? { name: 'Gujarat', isoCode: 'GJ' },
        city: defaults.city ?? evaluatedFixture.city,
        pinCode: evaluatedFixture.pincode,
        shiftId: defaults.shiftId,
      };

      if (!body.roleId || !body.shiftId) {
        throw new Error('Existing employee did not expose roleId and shiftId.');
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
        throw new Error(`Employee create failed: ${createResponse.status} ${responseText}`);
      }

      return JSON.parse(responseText);
    },
    { baseUrl, token, tenant, fixture }
  );

  return created;
}

export async function updateEmployeeStatus(
  page: Page,
  employeeId: string,
  employeeStatusType: number,
  remarks?: string
) {
  const response = await employeeApiRequest(page, `/employees/${employeeId}/status`, {
    method: 'PUT',
    body: JSON.stringify({ employeeStatusType, remarks }),
  });

  return response;
}
