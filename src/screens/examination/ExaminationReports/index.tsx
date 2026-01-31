'use client';

import type { UseBooleanReturn } from 'src/hooks/use-boolean';

import React from 'react';
import { Box } from '@mui/material';
import CommonReport from 'src/components/common-report';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import {
  StudentWiseResultReportMap,
  StandardResultListReportMap,
  ConsolidatedMultiExamReportMap,
  GeneralGradePerformanceReportMap,
  StudentRankingBrightWeakReportMap,
  SubjectPerformanceAnalysisReportMap,
} from 'src/enums/examination-reports';

import StudentRankingReports from './StudentRanking/StudentRankingReports';
import StudentWiseResultReports from './StudentWiseResults/StudentWiseResultReports';
import SubjectPerformanceReports from './SubjectPerformance/SubjectPerformanceReports';
import StandardResultListReports from './StandardResultLists/StandardResultListReports';
import ConsolidatedMultiExamReports from './ConsolidatedReports/ConsolidatedMultiExamReports';
import GeneralGradePerformanceReports from './GeneralAnalysis/GeneralGradePerformanceReports';

const ExaminationReports = ({ addReportDialog }: { addReportDialog: UseBooleanReturn }) => {
  const categories = [
    {
      name: 'Subject Performance & Analysis',
      id: 'SubjectPerformance',
      icon: 'mdi:chart-line',
    },
    {
      name: 'Student Ranking / Bright–Weak',
      id: 'StudentRanking',
      icon: 'mdi:star-outline',
    },
    {
      name: 'Standard Result Lists (Single Exam)',
      id: 'StandardResultList',
      icon: 'mdi:format-list-bulleted',
    },
    {
      name: 'Consolidated / Multi-Exam',
      id: 'ConsolidatedMultiExam',
      icon: 'mdi:folder-multiple-outline',
    },
    {
      name: 'Student-Wise Full Result',
      id: 'StudentWiseResult',
      icon: 'mdi:account-details-outline',
    },
    {
      name: 'General Grade & Performance',
      id: 'GeneralGradePerformance',
      icon: 'mdi:chart-bar',
    },
  ];

  const subjectPerformanceSubCategories = SubjectPerformanceAnalysisReportMap.map((opt, index) => ({
    name: opt.label,
    id: `SubjectPerformance-${opt.label.replace(/\s+/g, '-')}-${index}`,
    icon: '',
    description: opt.label,
    categoryId: 'SubjectPerformance',
    render: () => <SubjectPerformanceReports report={opt.label} />,
  }));

  const studentRankingSubCategories = StudentRankingBrightWeakReportMap.map((opt, index) => ({
    name: opt.label,
    id: `StudentRanking-${opt.label.replace(/\s+/g, '-')}-${index}`,
    icon: '',
    description: opt.label,
    categoryId: 'StudentRanking',
    render: () => <StudentRankingReports report={opt.label} />,
  }));

  const standardResultListSubCategories = StandardResultListReportMap.map((opt, index) => ({
    name: opt.label,
    id: `StandardResultList-${opt.label.replace(/\s+/g, '-')}-${index}`,
    icon: '',
    description: opt.label,
    categoryId: 'StandardResultList',
    render: () => <StandardResultListReports report={opt.label} />,
  }));

  const consolidatedMultiExamSubCategories = ConsolidatedMultiExamReportMap.map((opt, index) => ({
    name: opt.label,
    id: `ConsolidatedMultiExam-${opt.label.replace(/\s+/g, '-')}-${index}`,
    icon: '',
    description: opt.label,
    categoryId: 'ConsolidatedMultiExam',
    render: () => <ConsolidatedMultiExamReports report={opt.label} />,
  }));

  const studentWiseResultSubCategories = StudentWiseResultReportMap.map((opt, index) => ({
    name: opt.label,
    id: `StudentWiseResult-${opt.label.replace(/\s+/g, '-')}-${index}`,
    icon: '',
    description: opt.label,
    categoryId: 'StudentWiseResult',
    render: () => <StudentWiseResultReports report={opt.label} />,
  }));

  const generalGradePerformanceSubCategories = GeneralGradePerformanceReportMap.map(
    (opt, index) => ({
      name: opt.label,
      id: `GeneralGradePerformance-${opt.label.replace(/\s+/g, '-')}-${index}`,
      icon: '',
      description: opt.label,
      categoryId: 'GeneralGradePerformance',
      render: () => <GeneralGradePerformanceReports report={opt.label} />,
    })
  );

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <CustomBreadcrumbs
        heading="Generate Report"
        links={[
          { name: 'Student', href: '/student/enrollment/dashboard/' },
          { name: 'Examination', href: '/examination/dashboard/' },
          { name: 'Generate Report' },
        ]}
        isBack={addReportDialog?.value}
        onBack={() => {
          addReportDialog?.onFalse();
        }}
      />

      <CommonReport
        categories={categories}
        subCategories={[
          ...subjectPerformanceSubCategories,
          ...studentRankingSubCategories,
          ...standardResultListSubCategories,
          ...consolidatedMultiExamSubCategories,
          ...studentWiseResultSubCategories,
          ...generalGradePerformanceSubCategories,
        ]}
      />
    </Box>
  );
};

export default ExaminationReports;
