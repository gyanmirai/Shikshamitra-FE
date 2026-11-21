import { Box, Stack, Alert } from '@mui/material';
import { FormBusyRegion } from 'src/components/form-busy-region';
import CustomDialog, { DialogScrollContent } from 'src/components/customDialog';

import { useSectionDraft } from './useSectionDraft';
import { SectionFormFooter } from './SectionFormFooter';
import { SectionShelfFields } from './SectionShelfFields';
import { SectionIdentityFields } from './SectionIdentityFields';

import type { ISectionFormProps } from './type';

export default function SectionManagementForm(props: ISectionFormProps) {
  const { open, editData } = props;
  const draft = useSectionDraft(props);
  return (
    <>
      <CustomDialog
        open={open}
        hasForm={false}
        maxWidth="md"
        title={editData ? 'Edit Section' : 'Add Section'}
        titleInfo="Configure a Library section and its shelf names. Saved shelves are checked against existing stock before replacement."
        guardUnsavedChanges={false}
        disableClose={draft.busy}
        disableEscapeKeyDown={draft.busy}
        handleClose={draft.requestClose}
      >
        <Box
          component="form"
          noValidate
          onSubmit={draft.formik.handleSubmit}
          sx={{ display: 'flex', flexDirection: 'column', minHeight: 0, flex: 1 }}
        >
          <FormBusyRegion busy={draft.busy} label="Saving section" fillContent>
            <DialogScrollContent>
              <Stack spacing={2}>
                {!draft.academicYearId && (
                  <Alert severity="info">Select an academic year to save a section.</Alert>
                )}
                {draft.saveError && <Alert severity="error">{draft.saveError}</Alert>}
                <SectionIdentityFields draft={draft} />
                <SectionShelfFields draft={draft} />
              </Stack>
            </DialogScrollContent>
          </FormBusyRegion>
          <SectionFormFooter draft={draft} />
        </Box>
      </CustomDialog>
      {draft.confirmation}
    </>
  );
}
