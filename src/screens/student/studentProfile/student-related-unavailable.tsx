import type { RootState } from 'src/redux/store';

import { useSelector } from 'react-redux';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import { RouterLink } from 'src/routes/components';
import { Stack, Button, Typography } from '@mui/material';
import { hasNavigationPermission } from 'src/utils/permissions';
import { FormSectionCard } from 'src/components/form-section-card';

type Props = {
  title: string;
  message: string;
  onOverview?: () => void;
  destination?: { href: string; label: string; permission: string };
};

export function StudentRelatedUnavailable({ title, message, onOverview, destination }: Props) {
  const permissions = useSelector((state: RootState) => state.auth.permissions);
  const canOpen = destination && hasNavigationPermission(permissions, destination.permission);
  return (
    <FormSectionCard
      title={title}
      icon={GlobalIcons.info}
      descriptionTooltip="This profile does not have a connected student-specific view for this information."
    >
      <Typography variant="body2">{message}</Typography>
      <Typography variant="body2" color="text.secondary">
        This does not mean the student has no records. Review the owning module for current
        information.
      </Typography>
      <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
        {canOpen && (
          <Button
            component={RouterLink}
            href={destination.href}
            variant="outlined"
            startIcon={<Iconify icon={GlobalIcons.eye} />}
          >
            {destination.label}
          </Button>
        )}
        {onOverview && (
          <Button onClick={onOverview} startIcon={<Iconify icon={GlobalIcons.back} />}>
            View student overview
          </Button>
        )}
      </Stack>
    </FormSectionCard>
  );
}
