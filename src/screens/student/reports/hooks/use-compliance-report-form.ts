import type { RootState } from 'src/redux/store';
import type {
  RecordsReportInput,
  ComplianceReportType,
} from 'src/redux/student/records/student-record-reports-api';

import * as Yup from 'yup';
import { useState } from 'react';
import { useFormik } from 'formik';
import { useSelector } from 'react-redux';
import { hasGrantedPermission } from 'src/utils/permissions';
import { useGetStudentRecordsDirectoryOptionsQuery } from 'src/redux/student/records/student-records-api';

export type ComplianceReportScope = {
  academicYearId: string;
  boardId: string;
  mediumId: string;
  standardId: string;
  divisionId: string;
};

export function useComplianceReportForm(reportType: ComplianceReportType) {
  const permissions = useSelector((state: RootState) => state.auth.permissions);
  const currentYear = useSelector((state: RootState) => state.globalState.currentYear);
  const [year] = useState(currentYear);
  const [request, setRequest] = useState<RecordsReportInput | null>(null);
  const canRead = [
    'Students.Records.Reports.View',
    'Students.Records.StudentList.View',
    'Students.IdentityCompliance.View',
  ].every((grant) => hasGrantedPermission(permissions, grant));
  const canGenerate = canRead && hasGrantedPermission(permissions, 'Students.Records.Reports.Add');
  const options = useGetStudentRecordsDirectoryOptionsQuery(
    { academicYearId: year?.id },
    { skip: !year?.id || !canRead }
  );
  const form = useFormik<ComplianceReportScope>({
    initialValues: {
      academicYearId: year?.id ?? '',
      boardId: '',
      mediumId: '',
      standardId: '',
      divisionId: '',
    },
    validationSchema: Yup.object({
      academicYearId: Yup.string().required(
        'Select an academic year in the header, then reopen this report.'
      ),
    }),
    onSubmit: (values, helpers) => {
      helpers.setSubmitting(false);
      if (
        !canRead ||
        options.isFetching ||
        options.isError ||
        !options.currentData ||
        !validScope ||
        !validChildren
      )
        return;
      setRequest({
        reportType,
        academicYearId: values.academicYearId,
        boardId: values.boardId || undefined,
        mediumId: values.mediumId || undefined,
        standardId: values.standardId || undefined,
        divisionId: values.divisionId || undefined,
        skipCount: 0,
        maxResultCount: 25,
      });
    },
  });
  const data = options.currentData;
  const boards = data?.boards ?? [];
  const boardIds = new Set(
    boards
      .filter((board) => !form.values.boardId || board.id === form.values.boardId)
      .map((board) => board.id)
  );
  const mediums = (data?.mediums ?? []).filter((medium) => boardIds.has(medium.parentId ?? ''));
  const mediumIds = new Set(
    mediums
      .filter((medium) => !form.values.mediumId || medium.id === form.values.mediumId)
      .map((medium) => medium.id)
  );
  const standards = (data?.standards ?? []).filter((standard) =>
    mediumIds.has(standard.parentId ?? '')
  );
  const standardIds = new Set(
    standards
      .filter((standard) => !form.values.standardId || standard.id === form.values.standardId)
      .map((standard) => standard.id)
  );
  const divisions = (data?.divisions ?? []).filter((division) =>
    standardIds.has(division.parentId ?? '')
  );
  const change = (field: keyof ComplianceReportScope, value: string) => {
    const order = ['boardId', 'mediumId', 'standardId', 'divisionId'] as const;
    const index = order.indexOf(field as (typeof order)[number]);
    form.setValues({
      ...form.values,
      ...Object.fromEntries(order.slice(index + 1).map((key) => [key, ''])),
      [field]: value,
    });
    setRequest(null);
  };
  const validScope = !form.values.boardId || boards.some((item) => item.id === form.values.boardId);
  const validChildren =
    (!form.values.mediumId || mediums.some((item) => item.id === form.values.mediumId)) &&
    (!form.values.standardId || standards.some((item) => item.id === form.values.standardId)) &&
    (!form.values.divisionId || divisions.some((item) => item.id === form.values.divisionId));
  return {
    form,
    year,
    request,
    setRequest,
    canRead,
    canGenerate,
    options,
    boards,
    mediums,
    standards,
    divisions,
    change,
    validScope: validScope && validChildren,
  };
}
