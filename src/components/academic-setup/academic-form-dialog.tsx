import type { ComponentProps } from 'react';

import CustomDialog from '../customDialog';
import { useAcademicSetupContext } from './academic-setup-context';
import { academicFormGuidance, type AcademicFormKind } from './academic-form-guidance';

type Props = Omit<ComponentProps<typeof CustomDialog>, 'titleInfo'> & {
  kind: AcademicFormKind;
};

export function AcademicFormDialog({ kind, ...props }: Props) {
  const { isOnboarding } = useAcademicSetupContext();
  return (
    <CustomDialog
      {...props}
      titleInfo={isOnboarding ? undefined : academicFormGuidance[kind].dialog}
    />
  );
}
