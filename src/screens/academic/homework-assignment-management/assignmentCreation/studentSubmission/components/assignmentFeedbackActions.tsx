import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import { Stack, Button, DialogActions } from '@mui/material';
import { LoadingButton } from 'src/components/loading-button';

import type { IAssignGradeProps } from '../../../homeworkCreation/type';
import type { AssignmentFeedbackFormState } from '../hooks/useAssignmentFeedbackForm';

type Props = IAssignGradeProps & { state: AssignmentFeedbackFormState };
export default function AssignmentFeedbackActions({
  isEdit = true,
  onClose,
  onPrevious,
  onNext,
  hasPrevious,
  hasNext,
  state,
}: Props) {
  const { busy, submitAndNextRef } = state;
  return (
    <DialogActions sx={{ p: 2, flexWrap: 'wrap', rowGap: 1 }}>
      <Stack direction="row" spacing={1} sx={{ mr: 'auto' }}>
        <Button
          type="button"
          variant="outlined"
          color="inherit"
          onClick={onPrevious}
          disabled={!hasPrevious || busy}
          size="small"
          startIcon={<Iconify icon="solar:alt-arrow-left-bold" />}
        >
          Previous
        </Button>
        <Button
          type="button"
          variant="outlined"
          color="inherit"
          onClick={onNext}
          disabled={!hasNext || busy}
          size="small"
          endIcon={<Iconify icon="solar:alt-arrow-right-bold" />}
        >
          Next
        </Button>
      </Stack>
      {isEdit ? (
        <>
          <Button
            type="button"
            variant="outlined"
            color="inherit"
            disabled={busy}
            onClick={() => onClose(null, false)}
            size="small"
            startIcon={<Iconify icon={GlobalIcons.cancel} />}
          >
            Cancel
          </Button>
          <LoadingButton
            type="button"
            variant="outlined"
            color="inherit"
            loading={busy}
            disabled={!hasNext || busy}
            size="small"
            onClick={(event) => {
              submitAndNextRef.current = true;
              event.currentTarget.form?.requestSubmit();
            }}
            startIcon={<Iconify icon="solar:double-alt-arrow-right-bold" />}
          >
            Submit & next
          </LoadingButton>
          <LoadingButton
            type="submit"
            variant="contained"
            color="inherit"
            loading={busy}
            disabled={busy}
            size="small"
            onClick={() => {
              submitAndNextRef.current = false;
            }}
            startIcon={<Iconify icon={GlobalIcons.submit} />}
          >
            Submit
          </LoadingButton>
        </>
      ) : (
        <Button
          type="button"
          variant="outlined"
          color="inherit"
          onClick={() => onClose(null, false)}
          size="small"
          startIcon={<Iconify icon={GlobalIcons.cancel} />}
        >
          Close
        </Button>
      )}
    </DialogActions>
  );
}
