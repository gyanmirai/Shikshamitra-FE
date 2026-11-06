import { Label } from 'src/components/label';
import { Stack, Typography } from '@mui/material';

export const ReadinessBar = ({
  readiness,
}: {
  readiness: {
    selected: number;
    missingPhoto: number;
    missingPhone: number;
    missingDesignation: number;
    missingEmployeeCode: number;
    missingLogo: number;
  };
}) => (
  <Stack spacing={1}>
    <Typography variant="subtitle2">Readiness</Typography>
    <Stack direction="row" spacing={1} flexWrap="wrap">
      <Label color="primary" variant="soft">
        {`${readiness.selected} selected`}
      </Label>
      <Label color={readiness.missingPhoto ? 'warning' : 'success'} variant="soft">
        {`${readiness.missingPhoto} missing photo`}
      </Label>
      <Label color={readiness.missingPhone ? 'warning' : 'success'} variant="soft">
        {`${readiness.missingPhone} missing phone`}
      </Label>
      <Label color={readiness.missingDesignation ? 'warning' : 'success'} variant="soft">
        {`${readiness.missingDesignation} missing role`}
      </Label>
      <Label color={readiness.missingEmployeeCode ? 'warning' : 'success'} variant="soft">
        {`${readiness.missingEmployeeCode} missing code`}
      </Label>
      <Label color={readiness.missingLogo ? 'warning' : 'success'} variant="soft">
        {readiness.missingLogo ? 'Logo missing' : 'Logo ready'}
      </Label>
    </Stack>
  </Stack>
);
