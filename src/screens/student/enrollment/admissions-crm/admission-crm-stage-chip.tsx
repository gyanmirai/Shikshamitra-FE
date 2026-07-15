import Chip from '@mui/material/Chip';
import { alpha } from '@mui/material/styles';
import { AdmissionInquiryStage } from 'src/redux/student/admissions-crm/admissions-crm-api';

import { admissionCrmStageColors, getAdmissionCrmStageLabel } from './admissions-crm-utils';

type Props = {
  stage: AdmissionInquiryStage;
};

export function AdmissionCrmStageChip({ stage }: Props) {
  const color = admissionCrmStageColors[stage];

  return (
    <Chip
      size="small"
      variant="outlined"
      label={getAdmissionCrmStageLabel(stage)}
      sx={(theme) => {
        const palette = color === 'default' ? null : theme.palette[color];

        return {
          color: 'text.primary',
          bgcolor: palette ? alpha(palette.main, 0.14) : 'action.selected',
          borderColor: palette ? alpha(palette.main, 0.48) : 'divider',
        };
      }}
    />
  );
}
