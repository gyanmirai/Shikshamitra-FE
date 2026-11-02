import { Iconify } from 'src/components/iconify';
import { Stack, Button, Typography } from '@mui/material';
import { FormSectionCard } from 'src/components/form-section-card';
import { useGetSchoolIdentityQuery } from 'src/redux/InstituteSetup/schoolIdentityApi';
import { IDENTITY_KINDS, IDENTITY_LABELS } from 'src/screens/setting/school-identity/types';
import { useIdentityPermissions } from 'src/screens/setting/school-identity/hooks/use-identity-permissions';

export default function SchoolIdentityReview({ onEdit }: { onEdit: () => void }) {
  const permissions = useIdentityPermissions();
  const query = useGetSchoolIdentityQuery({}, { skip: !permissions.ready || !permissions.canView });
  return (
    <FormSectionCard
      title="School Identity (Optional)"
      icon="mdi:image-multiple-outline"
      descriptionTooltip="School assets can be added later in Institute Setup. The school code is used as the navigation name."
      action={
        <Button
          size="small"
          aria-label="Edit School Identity"
          startIcon={<Iconify icon="mdi:pencil-outline" width={16} />}
          onClick={onEdit}
        >
          Edit
        </Button>
      }
    >
      <Stack spacing={0.5}>
        {!permissions.canView ? (
          <Typography variant="body2">
            Optional. An authorized administrator can configure school assets later.
          </Typography>
        ) : query.isError ? (
          <Typography variant="body2">
            School Identity could not be loaded. This does not prevent finishing setup.
          </Typography>
        ) : !query.currentData ? (
          <Typography variant="body2" role="status">
            Loading school identity…
          </Typography>
        ) : (
          IDENTITY_KINDS.filter(
            (kind) => kind !== 'signature' || query.currentData?.canAccessSignature
          ).map((kind) => (
            <Typography key={kind} variant="body2">
              {IDENTITY_LABELS[kind]}:{' '}
              {query.currentData?.effective[kind]?.asset?.fileName ??
                (kind === 'logo' ? 'Default icon' : 'Not configured')}
            </Typography>
          ))
        )}
      </Stack>
    </FormSectionCard>
  );
}
