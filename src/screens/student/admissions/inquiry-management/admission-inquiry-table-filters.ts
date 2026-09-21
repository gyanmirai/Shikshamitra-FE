import type { IParams } from 'src/components/customizabaleTable/types';
import type {
  AdmissionInquirySource,
  AdmissionInquiryStatus,
  AdmissionInquiryListInput,
} from 'src/redux/student/admissions/admission-inquiries-api';

import { MY_INQUIRIES_FILTER, UNASSIGNED_INQUIRIES_FILTER } from './admission-inquiry-filters';

type TableFilter = IParams['filters'][number];

export const ADMISSION_INQUIRY_FILTER_QUERY_PARAMS: Record<string, string> = {
  inquiryNumber: 'inquiry',
  applicantName: 'applicant',
  admissionOfferingId: 'offering',
  normalizedPhone: 'phone',
  email: 'email',
  assignedCounsellorId: 'owner',
  source: 'source',
  status: 'status',
};

const FILTER_LABELS: Record<string, string> = {
  inquiryNumber: 'Inquiry',
  applicantName: 'Applicant',
  admissionOfferingId: 'Admission interest',
  normalizedPhone: 'Phone',
  email: 'Email',
  assignedCounsellorId: 'Counsellor',
  source: 'Source',
  status: 'Status',
};

const ENUM_FILTER_COLUMNS = ['admissionOfferingId', 'assignedCounsellorId', 'source', 'status'];

export const createInitialAdmissionInquiryTableFilters = (searchParams: {
  get: (name: string) => string | null;
}): IParams['filters'] =>
  Object.entries(ADMISSION_INQUIRY_FILTER_QUERY_PARAMS).flatMap(([column, parameter]) => {
    const value = searchParams.get(parameter);
    if (!value) return [];
    const isEnum = ENUM_FILTER_COLUMNS.includes(column);
    return [
      {
        column,
        type: isEnum ? 'equals' : searchParams.get(`${parameter}Op`) || 'contains',
        value,
        valueType: isEnum ? 'enum' : 'string',
        label: FILTER_LABELS[column] ?? column,
        displayValue: value,
      },
    ];
  });

export const isAdmissionInquiryEnumFilter = (column: string) =>
  ENUM_FILTER_COLUMNS.includes(column);

const findLatest = (filters: IParams['filters'], column: string) =>
  [...filters].reverse().find((filter) => filter.column === column);

const readTextFilter = (filters: IParams['filters'], column: string) => {
  const filter = findLatest(filters, column);
  const value = String(filter?.value ?? '').trim();
  return value ? { value, type: filter?.type || 'contains' } : undefined;
};

const readNumberFilter = (filters: IParams['filters'], column: string) => {
  const value = findLatest(filters, column)?.value;
  if (value === undefined || value === null || value === '') return undefined;
  const number = Number(value);
  return Number.isInteger(number) ? number : undefined;
};

export function normalizeAdmissionInquiryTableFilters(
  filters: IParams['filters']
): IParams['filters'] {
  const latestByColumn = new Map<string, TableFilter>();
  filters.forEach((filter) => {
    latestByColumn.delete(filter.column);
    latestByColumn.set(filter.column, filter);
  });
  return Array.from(latestByColumn.values());
}

export function buildAdmissionInquiryListFilters(
  filters: IParams['filters'],
  search: string,
  currentUserId?: string,
  options: { excludePostApplication?: boolean } = {}
): AdmissionInquiryListInput {
  const inquiryNumber = readTextFilter(filters, 'inquiryNumber');
  const applicantName = readTextFilter(filters, 'applicantName');
  const phone = readTextFilter(filters, 'normalizedPhone');
  const email = readTextFilter(filters, 'email');
  const owner = findLatest(filters, 'assignedCounsellorId')?.value;
  const status = readNumberFilter(filters, 'status');
  const source = readNumberFilter(filters, 'source');
  const admissionOfferingId = String(
    findLatest(filters, 'admissionOfferingId')?.value ?? ''
  ).trim();

  return {
    search: search.trim() || undefined,
    inquiryNumber: inquiryNumber?.value,
    inquiryNumberFilterType: inquiryNumber?.type,
    applicantName: applicantName?.value,
    applicantNameFilterType: applicantName?.type,
    phone: phone?.value,
    phoneFilterType: phone?.type,
    email: email?.value,
    emailFilterType: email?.type,
    admissionOfferingId: admissionOfferingId || undefined,
    status:
      status !== undefined && status >= 0 && status <= 8
        ? (status as AdmissionInquiryStatus)
        : undefined,
    source:
      source !== undefined && source >= 0 && source <= 9
        ? (source as AdmissionInquirySource)
        : undefined,
    assignedCounsellorId:
      owner === MY_INQUIRIES_FILTER
        ? currentUserId
        : owner && owner !== UNASSIGNED_INQUIRIES_FILTER
          ? String(owner)
          : undefined,
    isAssigned: owner === UNASSIGNED_INQUIRIES_FILTER ? false : undefined,
    excludePostApplication: options.excludePostApplication ?? true,
  };
}
