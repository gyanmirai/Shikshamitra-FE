import { useState } from 'react';
import { Stack, Button } from '@mui/material';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import CustomSelect from 'src/components/custom-select';
import { shikshaMitraToast } from 'src/components/toast';
import { ConfirmDialog } from 'src/components/confirm-dialog';
import ShakingTextField from 'src/components/shaking-text-field';

import type { useClassTeacherActions } from './useClassTeacherActions';
import type { useClassTeacherWorkspace } from './useClassTeacherWorkspace';

type Props = {
  workspace: ReturnType<typeof useClassTeacherWorkspace>;
  actions: ReturnType<typeof useClassTeacherActions>;
  onHistory: () => void;
};

export function ClassTeacherAssignmentControls({ workspace: w, actions: a, onHistory }: Props) {
  const [discardOpen, setDiscardOpen] = useState(false);
  const [pendingOrganization, setPendingOrganization] = useState<string | null>(null);
  const locked = a.busy || w.isFetching || !w.organization || !w.canView;
  const discard = () => {
    if (a.busy) return;
    w.discard();
    setDiscardOpen(false);
    if (pendingOrganization !== null) {
      w.setOrganization(pendingOrganization);
      setPendingOrganization(null);
    }
    shikshaMitraToast.success({ message: 'Draft changes discarded.' });
  };
  const closeDiscard = () => {
    if (!a.busy) {
      setDiscardOpen(false);
      setPendingOrganization(null);
    }
  };
  return (
    <>
      <Stack
        direction={{ xs: 'column', md: 'row' }}
        gap={1}
        justifyContent="space-between"
        alignItems={{ xs: 'stretch', md: 'center' }}
        sx={{ p: 1, borderRadius: 1, bgcolor: 'background.paper', flexShrink: 0 }}
      >
        <ShakingTextField sx={{ width: { xs: '100%', md: 280 }, maxWidth: '100%' }}>
          <CustomSelect
            options={w.organizations}
            label="Organization"
            required
            disabled={a.busy || !w.canView}
            value={w.organization}
            labelKey="name"
            valueKey="id"
            onChange={(value) => {
              if (w.hasChanges) setPendingOrganization(String(value));
              else w.setOrganization(String(value));
            }}
          />
        </ShakingTextField>
        <Stack
          direction="row"
          gap={1}
          flexWrap="wrap"
          justifyContent="flex-end"
          alignItems="center"
        >
          <Button
            size="small"
            variant="outlined"
            color="inherit"
            startIcon={<Iconify icon={GlobalIcons.history} />}
            disabled={locked}
            onClick={onHistory}
          >
            History
          </Button>
          {w.canAdd && (
            <>
              <Button
                size="small"
                variant="outlined"
                color="inherit"
                startIcon={<Iconify icon={GlobalIcons.resetIcon} />}
                disabled={locked || !w.hasChanges}
                onClick={() => setDiscardOpen(true)}
              >
                Discard changes
              </Button>
              <Button
                size="small"
                variant="outlined"
                color="inherit"
                startIcon={<Iconify icon={GlobalIcons.submit} />}
                disabled={locked || !w.hasChanges || a.invalidDates || w.isError}
                loading={a.isSaving}
                onClick={a.saveDraft}
              >
                Save draft
              </Button>
              <Button
                size="small"
                variant="contained"
                color="inherit"
                startIcon={<Iconify icon={GlobalIcons.assigned} />}
                disabled={locked || !w.pendingRows.length || a.invalidDates || w.isError}
                loading={a.isValidating}
                onClick={a.review}
              >
                Review & confirm
              </Button>
            </>
          )}
        </Stack>
      </Stack>
      <ConfirmDialog
        title="Discard Unsaved Changes?"
        icon="warning"
        cancelText="Keep editing"
        open={discardOpen || pendingOrganization !== null}
        onClose={closeDiscard}
        disableCancel={a.busy}
        content={
          pendingOrganization !== null
            ? 'Changing organization will discard your unsaved assignment changes. Saved assignments will remain available.'
            : 'Discard your unsaved assignment changes and restore the last saved values?'
        }
        action={
          <Button
            size="small"
            variant="contained"
            color="error"
            onClick={discard}
            startIcon={<Iconify icon={GlobalIcons.delete} />}
          >
            Discard changes
          </Button>
        }
      />
    </>
  );
}
