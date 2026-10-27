import { useRef, useEffect } from 'react';
import { Box, Button, Typography } from '@mui/material';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

export function FinalizePageHeader({
  applicationId,
  returnHref,
  onBack,
  busy = false,
}: {
  applicationId: string;
  returnHref: string;
  onBack: () => void;
  busy?: boolean;
}) {
  const header = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const heading = header.current?.querySelector('h1');
    heading?.setAttribute('tabindex', '-1');
    heading?.focus({ preventScroll: true });
  }, [applicationId]);
  return (
    <Box ref={header} sx={{ flexShrink: 0, minWidth: 0 }}>
      <CustomBreadcrumbs
        heading="Finalize Staff Onboarding"
        headingComponent="h1"
        layout="inline"
        isBack
        onBack={onBack}
        backDisabled={busy}
        description="Review staff, work assignment, academic access and salary. Finalize saves them together. Staff remain inactive after finalization."
        links={[
          { name: 'Staff Onboarding', href: busy ? undefined : returnHref },
          { name: 'Finalize' },
        ]}
        action={
          <Button type="button" size="small" variant="outlined" onClick={onBack} disabled={busy}>
            Cancel
          </Button>
        }
      />
      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
        Unsaved changes stay in this tab. Refreshing or closing can lose this draft.
      </Typography>
    </Box>
  );
}
