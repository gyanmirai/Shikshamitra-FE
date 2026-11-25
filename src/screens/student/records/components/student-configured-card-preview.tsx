import type { ReactNode } from 'react';
import type {
  IdCard,
  IdCardTemplate,
} from 'src/redux/student/records/student-record-documents-api';

import { useState } from 'react';
import { Box, Stack, ToggleButton, ToggleButtonGroup } from '@mui/material';
import { IdentityCardPreview } from 'src/components/identity-card-designer';
import { CardTrimPreview } from 'src/components/identity-card-designer/card-trim-preview';

import { StudentICardSignaturePreview } from './student-icard-signature-preview';
import { getStudentICardLayout, getStudentICardPrintSettings } from '../student-icard-design';

export type StudentCardPreviewProps = {
  template: IdCardTemplate;
  card?: Pick<IdCard, 'studentSnapshot' | 'hasPhoto' | 'cardNumber'> & Partial<Pick<IdCard, 'templateSnapshot'>>;
  side?: 'front' | 'back';
  interactive?: boolean;
  photoUrl?: string;
  showTrim?: boolean;
  flat?: boolean;
};

export function StudentConfiguredCardPreview({
  template,
  card,
  side,
  interactive = true,
  photoUrl,
  legacyFront,
  showTrim = false,
  flat = false,
}: StudentCardPreviewProps & { legacyFront?: ReactNode }) {
  const [selected, setSelected] = useState<'front' | 'back'>('front');
  const canPreviewBack = template.backSideEnabled || Boolean(legacyFront);
  const activeSide = canPreviewBack ? (side ?? selected) : 'front';
  const layout = getStudentICardLayout(template);
  const values = {
    ...card?.studentSnapshot,
    schoolName: template.schoolName,
    schoolAddress: template.schoolAddress,
    headerText: template.headerText,
    footerText: template.footerText,
    CardNumber: card?.cardNumber ?? 'Preview',
  };
  const renderArtwork = (signatureUrl?: string) => (
    <IdentityCardPreview
      photoUrl={photoUrl}
      layout={layout}
      side={activeSide}
      values={values}
      qrCodeEnabled={template.showQrCode}
      logoHidden={template.logo?.mode === 2}
      signatureUrl={signatureUrl}
      flat={flat || showTrim}
    />
  );
  const identityTemplate = card?.templateSnapshot ?? template;
  const artwork = identityTemplate.signature && identityTemplate.signature.mode !== 2
    && layout[activeSide]?.elements.some((element) => element.type === 'signature' && element.visible)
    ? (
      <StudentICardSignaturePreview template={identityTemplate} snapshot={identityTemplate.schoolIdentity}>
        {renderArtwork}
      </StudentICardSignaturePreview>
    ) : renderArtwork();
  return (
    <Stack spacing={1} sx={{ width: 1, minWidth: 0 }}>
      {interactive && canPreviewBack && (
        <ToggleButtonGroup
          size="small"
          exclusive
          value={activeSide}
          aria-label="Student card side"
          onChange={(_event, value: 'front' | 'back' | null) => {
            if (value) setSelected(value);
          }}
        >
          <ToggleButton value="front">Front</ToggleButton>
          <ToggleButton value="back">Back</ToggleButton>
        </ToggleButtonGroup>
      )}
      <Box sx={{ width: 1, minWidth: 0 }}>
        {activeSide === 'front' && legacyFront ? legacyFront : showTrim ? (
          <CardTrimPreview
            layout={layout}
            settings={getStudentICardPrintSettings(template)}
            back={activeSide === 'back'}
          >
            {artwork}
          </CardTrimPreview>
        ) : (
          artwork
        )}
      </Box>
    </Stack>
  );
}
