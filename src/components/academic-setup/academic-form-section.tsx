import type { ReactNode } from 'react';

import { FormSectionCard } from '../form-section-card';
import { academicValidationStyles } from './academic-form-styles';
import { academicFormGuidance, type AcademicFormKind } from './academic-form-guidance';

export function AcademicFormSection({
  kind,
  children,
}: {
  kind: AcademicFormKind;
  children: ReactNode;
}) {
  const guidance = academicFormGuidance[kind];
  return (
    <FormSectionCard
      title={guidance.title}
      icon={guidance.icon}
      descriptionTooltip={guidance.section}
      titleTypographyProps={{ variant: 'subtitle1', fontWeight: 600 }}
      sx={academicValidationStyles}
    >
      {children}
    </FormSectionCard>
  );
}
