import { useCallback, useState } from 'react';
const noApprovalMode = new URLSearchParams(window.location.search).has('approvalNotRequired');
export const useLazyGetStudentsByScopeQuery = 'students';
export const useLazyGetClassByMediumQuery = 'classes';
export const useGetClassByMediumQuery = 'classes';
export const useGetChargeCategoriesQuery = 'categories';
export const usePostChargeMutation = 'create';
export const useUpdateChargeMutation = 'update';
export const useGetChargeByIdQuery = 'details';
const classes = [
  {
    id: 'class3',
    name: 'Class 3',
    divisions: [
      { id: 'a', name: 'A' },
      { id: 'b', name: 'B' },
    ],
  },
  { id: 'class4', name: 'Class 4', divisions: [{ id: 'c', name: 'C' }] },
];
const students = [
  {
    studentId: 'diya',
    studentName: 'Diya Synthetic Student',
    grNo: 10092,
    rollNo: 2,
    standardId: 'class3',
    standardName: 'Class 3',
    divisionId: 'a',
    divisionName: 'A',
    gender: 1,
    hasFeeStructureAssignment: true,
    hasChargeInCategory: false,
  },
  {
    studentId: 'jay',
    studentName: 'Jay Synthetic Student',
    grNo: 10093,
    rollNo: 12,
    standardId: 'class3',
    standardName: 'Class 3',
    divisionId: 'b',
    divisionName: 'B',
    gender: 0,
    hasFeeStructureAssignment: true,
    hasChargeInCategory: true,
  },
];
export default function useQueryAndMutation({ type, currentQueryAndMutation: kind }: any) {
  const [data, setData] = useState<any>(kind === 'classes' ? classes : undefined);
  const [loading, setLoading] = useState(false);
  const trigger = useCallback(
    (params: any) => {
      if (kind === 'create' || kind === 'update') {
        (window as any).lastChargePayload = params;
        return {
          unwrap: async () => ({
            data: {
              status: noApprovalMode && params.body?.chargeCategoryId === 'category' ? 1 : 0,
            },
          }),
        };
      }
      if (kind === 'classes') {
        setData(classes);
        return Promise.resolve({ data: classes });
      }
      if (kind === 'students') {
        setLoading(true);
        return new Promise((resolve) =>
          setTimeout(() => {
            setLoading(false);
            const error = (window as any).failStudentLookup;
            (window as any).failStudentLookup = false;
            resolve(
              error
                ? { error: { status: 503 } }
                : {
                    data: students.filter(
                      (s) =>
                        params.classIds.includes(s.standardId) &&
                        (!params.divisionIds?.length || params.divisionIds.includes(s.divisionId))
                    ),
                  }
            );
          }, 1200)
        );
      }
      return Promise.resolve({ data: [] });
    },
    [kind]
  );
  if (type === 'query' && kind === 'classes')
    return {
      currentData: classes,
      data: classes,
      isLoading: false,
      isFetching: false,
      isError: false,
      refetch: () => Promise.resolve({ data: classes }),
    };
  if (type === 'query')
    return {
      data:
        kind === 'categories'
          ? {
              items: [
                {
                  id: 'category',
                  name: 'Transport Pass Replacement',
                  isActive: true,
                  isApprovalRequired: !noApprovalMode,
                },
                { id: 'category2', name: 'Exam fee', isActive: true, isApprovalRequired: true },
              ],
            }
          : null,
      isLoading: false,
    };
  return [trigger, { data, isLoading: loading }];
}
