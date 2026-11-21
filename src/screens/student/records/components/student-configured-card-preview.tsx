import type { ReactNode } from 'react';
import type {
  IdCard,
  IdCardTemplate,
} from 'src/redux/student/records/student-record-documents-api';

import { useState } from 'react';
import { Box, Stack, ToggleButton, ToggleButtonGroup } from '@mui/material';
import { IdentityCardPreview } from 'src/components/identity-card-designer';

import { getStudentICardLayout } from '../student-icard-design';

export type StudentCardPreviewProps = {
  template: IdCardTemplate;
  card?: Pick<IdCard, 'studentSnapshot' | 'hasPhoto' | 'cardNumber'>;
  side?: 'front' | 'back';
  interactive?: boolean;
  photoUrl?: string;
};

export function StudentConfiguredCardPreview({
  template,
  card,
  side,
  interactive = true,
  photoUrl,
  legacyFront,
}: StudentCardPreviewProps & { legacyFront?: ReactNode }) {
  const [selected, setSelected] = useState<'front' | 'back'>('front');
  const canPreviewBack = template.backSideEnabled || Boolean(legacyFront);
  const activeSide = canPreviewBack ? (side ?? selected) : 'front';
  const values = {
    ...card?.studentSnapshot,
    schoolName: template.schoolName,
    schoolAddress: template.schoolAddress,
    headerText: template.headerText,
    footerText: template.footerText,
    CardNumber: card?.cardNumber ?? 'Preview',
  };
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
        {activeSide === 'front' && legacyFront ? (
          legacyFront
        ) : (
          <IdentityCardPreview
            photoUrl={photoUrl}
            layout={getStudentICardLayout(template)}
            side={activeSide}
            values={values}
            qrCodeEnabled={template.showQrCode}
            logoHidden={template.logo?.mode === 2}
          />
        )}
      </Box>
    </Stack>
  );
}
