import type { ReactNode } from 'react';
import type { AdmissionOfferingListItem } from 'src/redux/student/admissions/admission-offerings-api';

import { Provider } from 'react-redux';
import { api } from 'src/redux/service';
import { http, HttpResponse } from 'msw';
import { mswServer } from 'src/test/mswServer';
import { configureStore } from '@reduxjs/toolkit';
import { shikshaMitraToast } from 'src/components/toast';
import { studentAdmissionsCrmType } from 'src/redux/tagTypes';
import { it, vi, expect, afterEach, beforeEach } from 'vitest';
import { clearCachedAuthSession } from 'src/redux/session-cache';
import { act, cleanup, waitFor, renderHook } from '@testing-library/react';

import { useAdmissionInquiryDialog } from './use-admission-inquiry-dialog';
import { getInquiryOfferingUnavailableReason } from './use-admission-inquiry-class-offerings';

vi.hoisted(() => {
  process.env.NEXT_PUBLIC_API_URL = 'http://localhost:5000';
});
vi.mock('./use-admission-unsaved-changes', () => ({ useAdmissionUnsavedChanges: vi.fn() }));
vi.mock('src/components/toast', () => ({
  shikshaMitraToast: { error: vi.fn(), warning: vi.fn(), success: vi.fn() },
}));

const root = '*/api/student/enrollment/admissions/inquiries';
const baseScope = { admissionCycleId: 'cycle', boardId: 'board', mediumId: 'medium' };
const offering = (standardId: string, availabilityStatus = 2) =>
  ({
    ...baseScope,
    id: `offering-${standardId}`,
    name: standardId,
    standardId,
    standardName: standardId,
    boardName: 'CBSE',
    mediumName: 'English',
    isActive: availabilityStatus !== 4,
    availabilityStatus,
    configurationStatus: 1,
    entryMode: 0,
  }) as AdmissionOfferingListItem;
const catalogue = (offerings: AdmissionOfferingListItem[] = []) => ({
  periods: [{ id: 'cycle', name: 'General' }],
  academicOptions: ['class-a', 'class-b'].map((standardId) => ({
    boardId: 'board',
    boardName: 'CBSE',
    mediumId: 'medium',
    mediumName: 'English',
    standardId,
    standardName: standardId,
  })),
  offerings,
});
const createStore = () =>
  configureStore({
    reducer: {
      [api.reducerPath]: api.reducer,
      globalState: () => ({ currentYear: { id: 'year' } }),
      auth: () => ({ permissions: [] }),
    },
    middleware: (defaults) => defaults().concat(api.middleware),
  });
let store: ReturnType<typeof createStore>;
beforeEach(() => {
  vi.clearAllMocks();
  clearCachedAuthSession();
  store = createStore();
  mswServer.use(http.get('*/api/auth/session', () => HttpResponse.json(null)));
});
afterEach(() => {
  cleanup();
  store.dispatch(api.util.resetApiState());
  clearCachedAuthSession();
});
const wrapper = ({ children }: { children: ReactNode }) => (
  <Provider store={store}>{children}</Provider>
);
const selectClass = async (
  result: { current: ReturnType<typeof useAdmissionInquiryDialog> },
  standardId: string
) => {
  await act(async () => {
    await result.current.formik.setValues(
      (current) => ({
        ...current,
        ...baseScope,
        standardId,
        offeringId: '',
        fields: {},
      }),
      false
    );
  });
};

it.each(['guardian', 'father', 'mother'] as const)(
  'blocks blank %s mobile before either API and creates after it is corrected',
  async (role) => {
    let duplicateChecks = 0;
    const submitted: Record<string, unknown>[] = [];
    const onClose = vi.fn();
    const available = offering('class-a');
    mswServer.use(
      http.get(`${root}/capture-catalogue`, () =>
        HttpResponse.json({ data: catalogue([available]) })
      ),
      http.get(`${root}/capture-context/${available.id}`, () =>
        HttpResponse.json({
          data: {
            offering: available,
            availability: { canCreateInquiry: true },
            policy: null,
            form: {
              sections: [
                {
                  fields: [
                    {
                      id: 'first',
                      code: 'FIRST',
                      label: 'First name',
                      bindingKey: 'Applicant.FirstName',
                      fieldType: 0,
                      required: true,
                    },
                    {
                      id: 'parent',
                      code: 'PARENT',
                      label: 'Parent name',
                      bindingKey:
                        role === 'guardian'
                          ? 'Guardian.FirstName'
                          : role === 'father'
                            ? 'Father.Name'
                            : 'Mother.Name',
                      fieldType: 0,
                      required: true,
                    },
                    {
                      id: 'phone',
                      code: 'PHONE',
                      label: 'Parent mobile',
                      bindingKey:
                        role === 'father'
                          ? 'Father.Mobile'
                          : role === 'mother'
                            ? 'Mother.Mobile'
                            : 'Guardian.Mobile',
                      fieldType: 4,
                      required: true,
                    },
                  ],
                },
              ],
            },
          },
        })
      ),
      http.post(`${root}/duplicate-check`, () => {
        duplicateChecks += 1;
        return HttpResponse.json({ data: [] });
      }),
      http.post(root, async ({ request }) => {
        submitted.push((await request.json()) as Record<string, unknown>);
        return HttpResponse.json({ data: { id: 'new-inquiry' } });
      })
    );
    const { result } = renderHook(() => useAdmissionInquiryDialog(onClose), { wrapper });
    await waitFor(() => expect(result.current.periods).toHaveLength(1));
    await selectClass(result, 'class-a');
    await waitFor(() => expect(result.current.canCreateInquiry).toBe(true));
    await act(async () => {
      await result.current.formik.setValues(
        (current) => ({
          ...current,
          parentRelationship: role === 'mother' ? 'mother' : 'father',
          fields: { FIRST: 'QA child', PARENT: 'QA parent', PHONE: '' },
        }),
        false
      );
    });
    await act(async () => {
      await result.current.formik.submitForm();
    });
    expect(result.current.formik.errors.fields).toMatchObject({
      PHONE: 'Parent mobile is required',
    });
    expect(duplicateChecks).toBe(0);
    expect(submitted).toHaveLength(0);
    expect(result.current.formik.values.fields.FIRST).toBe('QA child');
    if (role !== 'guardian')
      expect(
        result.current.sections
          .flatMap((section) => section.fields)
          .some((field) => field.bindingKey === 'Guardian.Mobile')
      ).toBe(false);

    await act(async () => {
      await result.current.formik.setFieldValue('fields.PHONE', '9876543210', false);
    });
    await act(async () => {
      await result.current.formik.submitForm();
    });
    await waitFor(() => expect(onClose).toHaveBeenCalledOnce());
    expect(duplicateChecks).toBe(1);
    expect(submitted).toHaveLength(1);
    expect(submitted[0]).toMatchObject({ guardianPhone: '9876543210', phone: '9876543210' });
  }
);

it.each(['Guardian', 'Father', 'Mother'] as const)(
  'creates using the optional identity fields of an existing published %s form',
  async (parent) => {
    const available = offering('class-a');
    const submitted: Record<string, unknown>[] = [];
    const onClose = vi.fn();
    mswServer.use(
      http.get(`${root}/capture-catalogue`, () =>
        HttpResponse.json({ data: catalogue([available]) })
      ),
      http.get(`${root}/capture-context/${available.id}`, () =>
        HttpResponse.json({
          data: {
            offering: available,
            availability: { canCreateInquiry: true },
            form: {
              purpose: 0,
              sections: [
                {
                  fields: [
                    {
                      code: 'CHILD',
                      label: 'Child',
                      bindingKey: 'Applicant.FirstName',
                      fieldType: 0,
                      required: false,
                    },
                    {
                      code: 'ADULT',
                      label: 'Parent',
                      bindingKey: `${parent}.${parent === 'Guardian' ? 'FirstName' : 'Name'}`,
                      fieldType: 0,
                      required: false,
                    },
                    {
                      code: 'PHONE',
                      label: 'Mobile',
                      bindingKey: `${parent}.Mobile`,
                      fieldType: 4,
                      required: false,
                    },
                  ],
                },
              ],
            },
          },
        })
      ),
      http.post(`${root}/duplicate-check`, () => HttpResponse.json({ data: [] })),
      http.post(root, async ({ request }) => {
        submitted.push((await request.json()) as Record<string, unknown>);
        return HttpResponse.json({ data: { id: 'legacy-inquiry' } });
      })
    );
    const { result } = renderHook(() => useAdmissionInquiryDialog(onClose), { wrapper });
    await waitFor(() => expect(result.current.periods).toHaveLength(1));
    await selectClass(result, 'class-a');
    await waitFor(() => expect(result.current.canCreateInquiry).toBe(true));
    expect(result.current.fields).toHaveLength(3);
    expect(result.current.fields.every((field) => !field.required)).toBe(true);
    expect(shikshaMitraToast.error).not.toHaveBeenCalled();
    await act(async () => {
      await result.current.formik.setFieldValue(
        'fields',
        {
          CHILD: 'Riya',
          ADULT: 'Meera',
          PHONE: '9876543210',
        },
        false
      );
    });
    await act(async () => {
      await result.current.formik.submitForm();
    });
    await waitFor(() => expect(onClose).toHaveBeenCalledOnce());
    expect(submitted).toHaveLength(1);
    expect(submitted[0]).toMatchObject({
      applicantFirstName: 'Riya',
      guardianFirstName: 'Meera',
      guardianPhone: '9876543210',
    });
    expect(shikshaMitraToast.error).not.toHaveBeenCalled();
  }
);

it('preserves an incomplete legacy form and shows the actual API error on attempted submission', async () => {
  const available = offering('class-a');
  const duplicate = vi.fn();
  const create = vi.fn();
  mswServer.use(
    http.get(`${root}/capture-catalogue`, () =>
      HttpResponse.json({ data: catalogue([available]) })
    ),
    http.get(`${root}/capture-context/${available.id}`, () =>
      HttpResponse.json({
        data: {
          offering: available,
          availability: { canCreateInquiry: true },
          form: {
            purpose: 0,
            sections: [
              {
                id: 'school',
                name: 'School questions',
                fields: [
                  {
                    id: 'note',
                    code: 'NOTE',
                    label: 'Note',
                    fieldType: 0,
                    required: false,
                    bindingType: 1,
                    bindingKey: 'Custom.Note',
                  },
                ],
              },
            ],
          },
        },
      })
    ),
    http.post(`${root}/duplicate-check`, () => {
      duplicate();
      return HttpResponse.json({ data: [] });
    }),
    http.post(root, () => {
      create();
      return HttpResponse.json(
        {
          status: 400,
          detail: 'A parent mobile number is needed to create an inquiry.',
          errorCode: 'Admissions.InquiryIdentityIncomplete',
        },
        { status: 400 }
      );
    })
  );
  const { result } = renderHook(() => useAdmissionInquiryDialog(vi.fn()), { wrapper });
  await waitFor(() => expect(result.current.periods).toHaveLength(1));
  await selectClass(result, 'class-a');
  await waitFor(() => expect(result.current.canCreateInquiry).toBe(true));
  expect(shikshaMitraToast.error).not.toHaveBeenCalled();
  expect(result.current.fields.map((field) => field.code)).toEqual(['NOTE']);
  await act(async () => {
    await result.current.formik.setFieldValue('fields.NOTE', 'Keep this draft', false);
  });
  await act(async () => {
    await result.current.formik.submitForm();
  });
  expect(duplicate).toHaveBeenCalledOnce();
  expect(create).toHaveBeenCalledOnce();
  expect(shikshaMitraToast.error).toHaveBeenCalledWith({
    message: 'A parent mobile number is needed to create an inquiry.',
  });
  expect(result.current.formik.values.fields.NOTE).toBe('Keep this draft');
});

it('keeps capture blocked when an available offering has no loaded published form', async () => {
  const available = offering('class-a');
  mswServer.use(
    http.get(`${root}/capture-catalogue`, () =>
      HttpResponse.json({ data: catalogue([available]) })
    ),
    http.get(`${root}/capture-context/${available.id}`, () =>
      HttpResponse.json({
        data: {
          offering: available,
          availability: { canCreateInquiry: true },
          form: null,
        },
      })
    )
  );
  const { result } = renderHook(() => useAdmissionInquiryDialog(vi.fn()), { wrapper });
  await waitFor(() => expect(result.current.periods).toHaveLength(1));
  await selectClass(result, 'class-a');
  await waitFor(() => expect(result.current.runtimeError).toBe(true));
  expect(result.current.canCreateInquiry).toBe(false);
  expect(result.current.runtimeLoading).toBe(false);
});

it.each([
  [0, /setup is incomplete/i],
  [1, /not opened yet/i],
  [3, /is closed/i],
  [4, /inactive/i],
] as const)(
  'explains unavailable offering status %i without claiming the offering is missing',
  (status, reason) => {
    expect(getInquiryOfferingUnavailableReason([offering('class-a', status)])).toMatch(reason);
  }
);

it('keeps manual offering selection when more than one fresh offering is open', async () => {
  const alternatives = [offering('class-a'), { ...offering('class-a'), id: 'second-offering' }];
  mswServer.use(
    http.get(`${root}/capture-catalogue`, () =>
      HttpResponse.json({ data: catalogue(alternatives) })
    ),
    http.get(`${root}/capture-context/second-offering`, () =>
      HttpResponse.json({
        data: {
          offering: alternatives[1],
          form: { sections: [] },
          policy: null,
          availability: { canCreateInquiry: true },
        },
      })
    )
  );
  const { result } = renderHook(() => useAdmissionInquiryDialog(vi.fn()), { wrapper });
  await waitFor(() => expect(result.current.periods).toHaveLength(1));
  await selectClass(result, 'class-a');
  await waitFor(() => expect(result.current.offeringsLoading).toBe(false));
  expect(result.current.offerings).toHaveLength(2);
  expect(result.current.formik.values.offeringId).toBe('');
  await act(async () => {
    await result.current.formik.setFieldValue('offeringId', 'second-offering', false);
  });
  await waitFor(() => expect(result.current.canCreateInquiry).toBe(true));
  expect(result.current.formik.values.offeringId).toBe('second-offering');
});

it('checks fresh offerings on A → B → A instead of reusing the academic-year snapshot', async () => {
  let reads = 0;
  mswServer.use(
    http.get(`${root}/capture-catalogue`, () => {
      reads += 1;
      return HttpResponse.json({ data: catalogue() });
    })
  );
  const { result } = renderHook(() => useAdmissionInquiryDialog(vi.fn()), { wrapper });
  await waitFor(() => expect(result.current.periods).toHaveLength(1));
  expect(reads).toBe(1);
  await selectClass(result, 'class-a');
  await waitFor(() => expect(reads).toBe(2));
  await waitFor(() => expect(result.current.offeringsLoading).toBe(false));
  await selectClass(result, 'class-b');
  await waitFor(() => expect(reads).toBe(3));
  await waitFor(() => expect(result.current.offeringsLoading).toBe(false));
  await selectClass(result, 'class-a');
  await waitFor(() => expect(reads).toBe(4));
});

it('ignores an earlier class response and exposes the latest class reason', async () => {
  let reads = 0;
  let release!: () => void;
  const pending = new Promise<void>((resolve) => {
    release = resolve;
  });
  mswServer.use(
    http.get(`${root}/capture-catalogue`, async () => {
      reads += 1;
      if (reads === 2) {
        await pending;
        return HttpResponse.json({ data: catalogue([offering('class-a')]) });
      }
      return HttpResponse.json({ data: catalogue(reads === 1 ? [] : [offering('class-b', 3)]) });
    })
  );
  const { result } = renderHook(() => useAdmissionInquiryDialog(vi.fn()), { wrapper });
  await waitFor(() => expect(result.current.periods).toHaveLength(1));
  await selectClass(result, 'class-a');
  await waitFor(() => expect(reads).toBe(2));
  await selectClass(result, 'class-b');
  await waitFor(() => expect(reads).toBe(3));
  await waitFor(() => expect(result.current.noOfferingReason).toMatch(/closed/i));
  await act(async () => {
    release();
    await pending;
  });
  expect(result.current.formik.values.standardId).toBe('class-b');
  expect(result.current.formik.values.offeringId).toBe('');
  expect(result.current.noOfferingReason).toMatch(/closed/i);
  expect(result.current.canCreateInquiry).toBe(false);
});

it('starts a new check when returning to A while its earlier request is still pending', async () => {
  let reads = 0;
  let release!: () => void;
  const firstA = new Promise<void>((resolve) => {
    release = resolve;
  });
  mswServer.use(
    http.get(`${root}/capture-catalogue`, async () => {
      reads += 1;
      if (reads === 2) {
        await firstA;
        return HttpResponse.json({ data: catalogue([offering('class-a')]) });
      }
      return HttpResponse.json({
        data: catalogue(reads === 1 ? [] : [offering('class-a', 3), offering('class-b', 3)]),
      });
    })
  );
  const { result } = renderHook(() => useAdmissionInquiryDialog(vi.fn()), { wrapper });
  try {
    await waitFor(() => expect(result.current.periods).toHaveLength(1));
    await selectClass(result, 'class-a');
    await waitFor(() => expect(reads).toBe(2));
    await selectClass(result, 'class-b');
    await waitFor(() => expect(result.current.noOfferingReason).toMatch(/closed/i));
    await selectClass(result, 'class-a');
    await waitFor(() => expect(reads).toBe(4));
    await waitFor(() => expect(result.current.noOfferingReason).toMatch(/closed/i));
  } finally {
    await act(async () => {
      release();
      await firstA;
    });
  }
  expect(result.current.formik.values.offeringId).toBe('');
  expect(result.current.canCreateInquiry).toBe(false);
  expect(result.current.noOfferingReason).toMatch(/closed/i);
});

it('treats a failed availability check as an error, then retries without clearing academic choices', async () => {
  let reads = 0;
  mswServer.use(
    http.get(`${root}/capture-catalogue`, () => {
      reads += 1;
      return reads === 2
        ? HttpResponse.json({ message: 'Unavailable' }, { status: 503 })
        : HttpResponse.json({ data: catalogue() });
    })
  );
  const { result } = renderHook(() => useAdmissionInquiryDialog(vi.fn()), { wrapper });
  await waitFor(() => expect(result.current.periods).toHaveLength(1));
  await selectClass(result, 'class-a');
  await waitFor(() => expect(result.current.offeringsError).toBe(true));
  expect(result.current.noOfferingReason).toBeUndefined();
  expect(result.current.canCreateInquiry).toBe(false);
  act(() => result.current.retryOfferings());
  await waitFor(() => expect(reads).toBe(3));
  await waitFor(() => expect(result.current.offeringsError).toBe(false));
  expect(result.current.formik.values.standardId).toBe('class-a');
  expect(result.current.noOfferingReason).toMatch(/no inquiry offering/i);
});

it('recovers from a failed class check when offering cache invalidation refreshes the data', async () => {
  let reads = 0;
  mswServer.use(
    http.get(`${root}/capture-catalogue`, () => {
      reads += 1;
      return reads === 2
        ? HttpResponse.json({}, { status: 503 })
        : HttpResponse.json({ data: catalogue() });
    })
  );
  const { result } = renderHook(() => useAdmissionInquiryDialog(vi.fn()), { wrapper });
  await waitFor(() => expect(result.current.periods).toHaveLength(1));
  await selectClass(result, 'class-a');
  await waitFor(() => expect(result.current.offeringsError).toBe(true));
  act(() => {
    store.dispatch(api.util.invalidateTags([studentAdmissionsCrmType.admissionOffering]));
  });
  await waitFor(() => expect(result.current.offeringsError).toBe(false));
  await waitFor(() => expect(result.current.noOfferingReason).toMatch(/no inquiry offering/i));
});

it('selects a newly opened offering after a fresh class check and preserves the capacity blocker', async () => {
  let reads = 0;
  let contexts = 0;
  mswServer.use(
    http.get(`${root}/capture-catalogue`, () => {
      reads += 1;
      return HttpResponse.json({ data: catalogue([offering('class-a', reads <= 2 ? 3 : 2)]) });
    }),
    http.get(`${root}/capture-context/offering-class-a`, () => {
      contexts += 1;
      return HttpResponse.json({
        data: {
          offering: offering('class-a'),
          form: null,
          policy: null,
          availability: { canCreateInquiry: false, reasonMessage: 'All seats are filled.' },
        },
      });
    })
  );
  const { result } = renderHook(() => useAdmissionInquiryDialog(vi.fn()), { wrapper });
  await waitFor(() => expect(result.current.periods).toHaveLength(1));
  await selectClass(result, 'class-a');
  await waitFor(() => expect(result.current.noOfferingReason).toMatch(/closed/i));
  await selectClass(result, 'class-b');
  await waitFor(() => expect(result.current.offeringsLoading).toBe(false));
  await selectClass(result, 'class-a');
  await waitFor(() => expect(result.current.formik.values.offeringId).toBe('offering-class-a'));
  await waitFor(() => expect(contexts).toBe(1));
  await waitFor(() => expect(result.current.unavailableReason).toBe('All seats are filled.'));
  expect(result.current.canCreateInquiry).toBe(false);
});
