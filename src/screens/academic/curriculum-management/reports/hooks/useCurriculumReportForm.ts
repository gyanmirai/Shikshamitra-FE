'use client';

import type { RootState } from 'src/redux/store';
import type { Medium, Division, Standards, Organization } from 'src/types/school';

import { useFormik } from 'formik';
import { cloneDeep } from 'lodash';
import { useSelector } from 'react-redux';
import { useMemo, useState, useEffect, useCallback } from 'react';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { CurriculumReportTitle } from 'src/enums/curriuculum-reports';
import { useGetCoreSubjectsByMediumQuery } from 'src/redux/academicAPI/CurriculumManagementApi/Setting/Core-SubjectApi';
import { useGetChaptersByStandardQuery } from 'src/redux/academicAPI/CurriculumManagementApi/Subject-AssignmentApi.ts/Chapter-management-api';

import { getCurriculumValidationSchema } from '../getCurriculumReportsValidationSchema';

export interface CurriculumReportInitialValues {
  report: CurriculumReportTitle;
  organization: string;
  classes: string[];
  divisions: string[];
  subjects: string;
  chapters: string[];
}

const initialValues: CurriculumReportInitialValues = {
  report: '' as unknown as CurriculumReportTitle,
  organization: '',
  classes: [],
  divisions: [],
  subjects: '',
  chapters: [],
};

const CurriculumReportFieldsMap: Record<number, string[]> = {
  [CurriculumReportTitle.ChapterProgressReport]: [
    'organization',
    'classes',
    'divisions',
    'subjects',
  ],
  [CurriculumReportTitle.SubjectWiseChapterCoverage]: [
    'organization',
    'classes',
    'divisions',
    'subjects',
  ],
  [CurriculumReportTitle.ChapterDescriptionSummary]: [
    'organization',
    'classes',
    'divisions',
    'subjects',
    'chapters',
  ],
  [CurriculumReportTitle.TimelineReport]: ['organization', 'classes', 'divisions', 'subjects'],
  [CurriculumReportTitle.ClassWiseChapterAssignmentReport]: [
    'organization',
    'classes',
    'divisions',
    'subjects',
  ],
  [CurriculumReportTitle.CurriculumCompletionReport]: [
    'organization',
    'classes',
    'divisions',
    'subjects',
  ],
  [CurriculumReportTitle.ChapterRevisionAndRevisitTracker]: [
    'organization',
    'classes',
    'divisions',
    'subjects',
    'chapters',
  ],
};

const CurriculumReportRequiredFieldsMap: Record<number, string[]> = {
  [CurriculumReportTitle.ChapterProgressReport]: [
    'organization',
    'classes',
    'divisions',
    'subjects',
  ],
  [CurriculumReportTitle.SubjectWiseChapterCoverage]: [
    'organization',
    'classes',
    'divisions',
    'subjects',
  ],
  [CurriculumReportTitle.ChapterDescriptionSummary]: [
    'organization',
    'classes',
    'divisions',
    'subjects',
  ],
  [CurriculumReportTitle.TimelineReport]: ['organization', 'classes'],
  [CurriculumReportTitle.ClassWiseChapterAssignmentReport]: ['organization', 'classes', 'subjects'],
  [CurriculumReportTitle.CurriculumCompletionReport]: ['organization'],
  [CurriculumReportTitle.ChapterRevisionAndRevisitTracker]: ['organization', 'classes'],
};

export const useCurriculumReportForm = (report: CurriculumReportTitle) => {
  const { currentMedium: medium } = useSelector((state: RootState) => state.globalState);

  const [allOrganization, setAllOrganization] = useState<Organization[]>([]);
  const [allClass, setAllClass] = useState<Standards[]>([]);
  const [allDivision, setAllDivision] = useState<Division[]>([]);
  const [dynamicSchema, setDynamicSchema] = useState(getCurriculumValidationSchema([], []));

  /**
   * Memoization Justification:
   * Memoizes currentFields lookup array based on the selected report parameter,
   * avoiding re-evaluations on every render.
   */
  const currentFields = useMemo(() => CurriculumReportFieldsMap[report as number] || [], [report]);

  /**
   * Memoization Justification:
   * Memoizes requiredFields lookup array based on the selected report parameter,
   * avoiding re-evaluations on every render.
   */
  const currentRequiredFields = useMemo(
    () => CurriculumReportRequiredFieldsMap[report as number] || [],
    [report]
  );

  const showField = useCallback(
    (fieldName: string) => currentFields.includes(fieldName),
    [currentFields]
  );
  const isRequired = useCallback(
    (fieldName: string) => currentRequiredFields.includes(fieldName),
    [currentRequiredFields]
  );

  const { data: subjectData, isLoading: isSubjectLoading } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetCoreSubjectsByMediumQuery,
    params: { academicMediumId: (medium as Medium)?.id, includeArchived: false },
    options: {
      skip: !(medium as Medium)?.id,
    },
  });

  /**
   * Memoization Justification:
   * Maps and processes raw subjects API response to avoid redundant lookups and mapping on every render.
   */
  const subjectOptions = useMemo(
    () =>
      subjectData?.data?.items ??
      subjectData?.items ??
      subjectData?.records ??
      (Array.isArray(subjectData) ? subjectData : []),
    [subjectData]
  );

  const formik = useFormik({
    initialValues: {
      ...initialValues,
      report: report as unknown as CurriculumReportTitle,
    },
    enableReinitialize: true,
    validationSchema: dynamicSchema,
    onSubmit: (val, { setSubmitting }) => {
      window.alert('submitted...');
      setSubmitting(false);
    },
  });

  /**
   * Memoization Justification:
   * Memoizes classId derived from standard selections, preventing trigger dependencies of chapters query when unrelated form fields change.
   */
  const classId = useMemo(() => {
    const nonAllClasses = (formik.values.classes as string[]).filter((id) => id !== 'all');
    return nonAllClasses[0] ?? '';
  }, [formik.values.classes]);

  /**
   * Memoization Justification:
   * Memoizes the primary selected subject ID, avoiding dependency resets on the chapters query.
   */
  const subjectId = formik.values.subjects || '';

  const {
    data: chapterResponse,
    isLoading: isChapterLoading,
    isFetching: isChapterFetching,
  } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetChaptersByStandardQuery,
    params: { standardId: classId, subjectId },
    options: {
      skip: !currentFields.includes('chapters') || !classId || !subjectId,
    },
  });

  /**
   * Memoization Justification:
   * Maps and processes chapters API response to prevent redundant parsing and array reference changes on every render.
   */
  const chapterOptions = useMemo(
    () =>
      chapterResponse?.data?.items ??
      chapterResponse?.items ??
      chapterResponse?.records ??
      (Array.isArray(chapterResponse) ? chapterResponse : []),
    [chapterResponse]
  );

  const handleOrganizationChange = useCallback(
    (val: unknown) => {
      formik.setFieldValue('organization', val);
      const standards = allOrganization.find((org: any) => org?.id === val)?.standards || [];
      const standardIds = standards.map((standard: any) => standard.id);
      formik.setFieldValue('classes', ['all', ...standardIds.filter((id: string) => id !== 'all')]);
    },
    [allOrganization, formik]
  );

  const handleClassChange = useCallback(
    (val: unknown) => {
      const value = val as string[];
      const allClassIds = allClass?.filter((cls) => cls.id !== 'all').map((cls) => cls.id) || [];
      const isAllClicked = value.includes('all');
      const wasAllPreviouslySelected = (formik.values.classes as string[]).includes('all');

      if (isAllClicked && !wasAllPreviouslySelected) {
        formik.setFieldValue('classes', ['all', ...allClassIds]);
      } else if (!isAllClicked && wasAllPreviouslySelected) {
        formik.setFieldValue('classes', []);
      } else {
        const selectedWithoutAll = value.filter((id) => id !== 'all');
        if (selectedWithoutAll.length === allClassIds.length) {
          formik.setFieldValue('classes', ['all', ...allClassIds]);
        } else {
          formik.setFieldValue('classes', selectedWithoutAll);
        }
      }
    },
    [allClass, formik]
  );

  useEffect(() => {
    setDynamicSchema(getCurriculumValidationSchema(currentFields, currentRequiredFields));
  }, [currentFields, currentRequiredFields]);

  useEffect(() => {
    setAllOrganization(cloneDeep(medium?.educationMediumStages || []));
  }, [medium?.educationMediumStages]);

  useEffect(() => {
    const standards =
      allOrganization.find((org: any) => org?.id === formik.values.organization)?.standards || [];

    if (!standards.some((std) => std.id === 'all')) {
      standards.unshift({
        id: 'all',
        name: 'All',
        creationTime: '',
        creatorId: '',
        lastModificationTime: '',
        lastModifierId: '',
        educationMediumStageId: '',
        divisions: [],
      });
    }
    setAllClass(standards);
  }, [allOrganization, formik.values.organization, formik.values.classes]);

  useEffect(() => {
    if (formik.values.classes.length === 0) {
      setAllDivision([]);
      formik.setFieldValue('divisions', []);
      return;
    }

    if (formik.values.classes.length === 1 && formik.values.classes[0] !== 'all') {
      const selectedClass = allClass.find((cls: any) => cls?.id === formik.values.classes[0]);
      const divisions = selectedClass?.divisions || [];
      setAllDivision(divisions);
      formik.setFieldValue(
        'divisions',
        divisions.map((div: any) => div.id)
      );
    } else {
      setAllDivision([
        {
          id: 'all',
          name: 'All',
          creationTime: '',
          creatorId: '',
          lastModificationTime: '',
          lastModifierId: '',
          strength: 0,
          standardId: '',
        },
      ]);
      formik.setFieldValue('divisions', ['all']);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allClass, formik.values.classes]);

  useEffect(() => {
    formik.setFieldValue('chapters', []);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [classId, subjectId]);

  return {
    medium,
    formik,
    showField,
    isRequired,
    allOrganization,
    allClass,
    allDivision,
    subjectOptions,
    isSubjectLoading,
    chapterOptions,
    isChapterLoading: isChapterLoading || isChapterFetching,
    handleOrganizationChange,
    handleClassChange,
  };
};
