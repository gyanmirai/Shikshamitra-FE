import type {
  IdCard,
  IdCardTemplate,
} from 'src/redux/student/records/student-record-documents-api';
import type { IdentityCardPhotoEdit, IdentityCardPhotoRecord } from 'src/components/identity-card-designer/types';

import { Stack, Alert } from '@mui/material';
import { IdentityCardDesigner } from 'src/components/identity-card-designer';
import { useIdentityPermissions } from 'src/screens/setting/school-identity/hooks/use-identity-permissions';

import { StudentICardBranding } from './student-icard-branding';
import { StudentICardSignaturePreview } from './student-icard-signature-preview';
import { StudentICardSignatureSettings } from './student-icard-signature-settings';
import {
  STUDENT_ICARD_FIELDS,
  STUDENT_ICARD_TOKENS,
  getStudentICardLayout,
  applyStudentICardDesign,
  getStudentICardPrintSettings,
  hasStudentICardSignatureLayer,
} from '../student-icard-design';

export function StudentICardDesigner({
  template,
  card,
  onChange,
  disabled,
  onBusyChange,
  photoRecords,
  photoEdits,
  onPhotoEdit,
}: {
  template: IdCardTemplate;
  card?: Pick<IdCard, 'studentSnapshot' | 'hasPhoto' | 'cardNumber'>;
  onChange: (patch: Partial<IdCardTemplate>) => void;
  disabled?: boolean;
  onBusyChange?: (busy: boolean) => void;
  photoRecords?: IdentityCardPhotoRecord[];
  photoEdits?: IdentityCardPhotoEdit[];
  onPhotoEdit?: (edit: IdentityCardPhotoEdit) => void;
}) {
  const layout = getStudentICardLayout(template);
  const settings = getStudentICardPrintSettings(template);
  const permissions = useIdentityPermissions();
  const hasSignature = hasStudentICardSignatureLayer(layout);
  const canConfigureSignature = permissions.canView && permissions.canAccessSignature;
  const showSignature = canConfigureSignature && template.signature?.mode !== 2;
  const signatureContent = canConfigureSignature ? (
    <StudentICardSignatureSettings
      value={template.signature}
      disabled={disabled}
      onBusy={onBusyChange}
      onChange={(signature) => onChange({ signature })}
    />
  ) : undefined;
  const values = {
    ...card?.studentSnapshot,
    schoolName: template.schoolName,
    schoolAddress: template.schoolAddress,
    headerText: template.headerText,
    footerText: template.footerText,
    CardNumber: card?.cardNumber ?? 'Preview',
  };
  const designer = (signatureUrl?: string) => (
    <IdentityCardDesigner
      configurationPanelSize="wide"
      showConfigurationHints={false}
      borderStylesEnabled
      photoRecords={photoRecords}
      photoEdits={photoEdits}
      onPhotoEdit={onPhotoEdit}
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
            signatureContent={signatureContent}
            onBusyChange={onBusyChange}
          />
        </Stack>
      }
      signatureContent={signatureContent}
      layout={layout}
      values={values}
      fields={STUDENT_ICARD_FIELDS}
      fieldPickerLabel="Select Student Field"
      fieldTokens={STUDENT_ICARD_TOKENS}
      logoHidden={template.logo?.mode === 2}
      signatureUrl={signatureUrl}
      signaturePlaceholder={showSignature}
      canPlaceSignature={showSignature}
      printSettings={settings}
      disabled={disabled}
      onLayoutChange={(next) =>
        onChange(
          applyStudentICardDesign(
            !template.signature && !hasSignature && hasStudentICardSignatureLayer(next)
              ? { ...template, signature: { mode: 0 } }
              : template,
            next,
            settings
          )
        )
      }
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
  return canConfigureSignature ? (
    <StudentICardSignaturePreview template={template} enabled={hasSignature}>
      {designer}
    </StudentICardSignaturePreview>
  ) : (
    designer()
  );
}
