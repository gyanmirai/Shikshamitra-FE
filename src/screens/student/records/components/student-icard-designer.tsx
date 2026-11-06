import type {
  IdCard,
  IdCardTemplate,
} from 'src/redux/student/records/student-record-documents-api';

import { Stack, Alert } from '@mui/material';
import { IdentityCardDesigner } from 'src/components/identity-card-designer';

import { StudentICardBranding } from './student-icard-branding';
import {
  STUDENT_ICARD_FIELDS,
  getStudentICardLayout,
  applyStudentICardDesign,
  getStudentICardPrintSettings,
} from '../student-icard-design';

export function StudentICardDesigner({
  template,
  card,
  onChange,
  disabled,
  onBusyChange,
}: {
  template: IdCardTemplate;
  card?: Pick<IdCard, 'studentSnapshot' | 'hasPhoto' | 'cardNumber'>;
  onChange: (patch: Partial<IdCardTemplate>) => void;
  disabled?: boolean;
  onBusyChange?: (busy: boolean) => void;
}) {
  const layout = getStudentICardLayout(template);
  const settings = getStudentICardPrintSettings(template);
  const values = {
    ...card?.studentSnapshot,
    schoolName: template.schoolName,
    schoolAddress: template.schoolAddress,
    headerText: template.headerText,
    footerText: template.footerText,
    CardNumber: card?.cardNumber ?? 'Preview',
  };
  return (
    <IdentityCardDesigner
      brandingContent={
        <Stack spacing={2}>
          {template.schemaVersion === 2 && !template.layoutJson && (
            <Alert severity="error">
              The saved design is unavailable. Choose Classic Identity to reset it.
            </Alert>
          )}
          <StudentICardBranding
            template={template}
            onChange={onChange}
            disabled={disabled}
            onBusyChange={onBusyChange}
          />
        </Stack>
      }
      layout={layout}
      values={values}
      fields={STUDENT_ICARD_FIELDS}
      logoHidden={template.logo?.mode === 2}
      printSettings={settings}
      disabled={disabled}
      onLayoutChange={(next) => onChange(applyStudentICardDesign(template, next, settings))}
      onPrintSettingsChange={(next) => onChange(applyStudentICardDesign(template, layout, next))}
      backSideEnabled={template.backSideEnabled ?? false}
      onBackSideEnabledChange={(enabled) =>
        onChange(
          applyStudentICardDesign({ ...template, backSideEnabled: enabled }, layout, settings)
        )
      }
      qrCodeEnabled={template.showQrCode}
      onQrCodeEnabledChange={(enabled) =>
        onChange(applyStudentICardDesign({ ...template, showQrCode: enabled }, layout, settings))
      }
    />
  );
}
