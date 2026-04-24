import React from 'react';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import type { ISubjectFormValues } from './type';

interface SubjectBreadcrumbsProps {
  isFormOpen: boolean;
  isViewOpen: boolean;
  selectedSubject: ISubjectFormValues | null;
  onBackFromForm: () => void;
  onBackFromView: () => void;
}

const SubjectBreadcrumbs = ({
  isFormOpen,
  isViewOpen,
  selectedSubject,
  onBackFromForm,
  onBackFromView,
}: SubjectBreadcrumbsProps) => {
  if (isFormOpen) {
    return (
      <CustomBreadcrumbs
        heading="Subjects Assignment"
        description={
          selectedSubject
            ? 'Update and modify existing subject assignments by revising key details, curriculum mappings, teacher assignments, and assessment criteria for improved academic delivery.'
            : 'Create and manage subject assignments by entering key details, mapping them to the curriculum, assigning teachers, and configuring assessment criteria for effective academic delivery.'
        }
        isBack
        onBack={onBackFromForm}
        links={[
          { name: 'Academics', href: '/academic/dashboard' },
          { name: 'Curriculum Management', href: '/academic/curriculumSubjects' },
          { name: 'Subjects Assignment', href: '/academic/curriculumSubjects' },
        ]}
        sx={{ px: 1 }}
      />
    );
  }

  return (
    <CustomBreadcrumbs
      heading="Subjects Assignment"
      description={
        isViewOpen
          ? 'Access detailed information on the selected subject, such as name, code, curriculum mapping, and assessment criteria to support structured academic planning.'
          : 'Define and organize academic subjects by linking them to classes, setting subject codes, and outlining curriculum requirements to ensure effective teaching-learning process.'
      }
      links={[
        { name: 'Academics', href: '/academic/dashboard' },
        { name: 'Curriculum Management', href: '/academic/curriculumSubjects' },
        {
          name: 'Subjects Assignment',
          href: isViewOpen ? '/academic/curriculumSubjects' : undefined,
        },
      ]}
      isBack={isViewOpen}
      onBack={onBackFromView}
    />
  );
};

/**
 * Memoization Justification:
 * Rendered on every page state (form, view, list). React.memo prevents
 * re-renders from table data changes, class selection, or dialog state
 * that don't affect breadcrumb props.
 */
export default React.memo(SubjectBreadcrumbs);
