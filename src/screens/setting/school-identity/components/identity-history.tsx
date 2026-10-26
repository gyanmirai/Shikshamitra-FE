import Box from '@mui/material/Box';
import Alert from '@mui/material/Alert';
import Stack from '@mui/material/Stack';
import Timeline from '@mui/lab/Timeline';
import Button from '@mui/material/Button';
import { GlobalIcons } from 'src/utils/icons';
import Skeleton from '@mui/material/Skeleton';
import { Iconify } from 'src/components/iconify';
import DialogActions from '@mui/material/DialogActions';
import LinearProgress from '@mui/material/LinearProgress';
import { EmptyContent } from 'src/components/empty-content';
import { FormSectionCard } from 'src/components/form-section-card';
import CustomDialog, { DialogScrollContent } from 'src/components/customDialog';
import { useGetSchoolIdentityHistoryQuery } from 'src/redux/InstituteSetup/schoolIdentityApi';

import { IdentityHistoryItem } from './identity-history-item';

import type { IdentityContext } from '../types';

export function IdentityHistory({
  context,
  onClose,
}: {
  context: IdentityContext;
  onClose: () => void;
}) {
  const query = useGetSchoolIdentityHistoryQuery(context);
  const revisions = [...(query.currentData ?? [])].sort(
    (left, right) => (Date.parse(right.creationTime) || 0) - (Date.parse(left.creationTime) || 0)
  );
  return (
    <CustomDialog
      open
      title="School Identity History"
      titleInfo="Review the configuration recorded at each save. These entries show saved choices, not a comparison of individual changes."
      handleClose={onClose}
      hasForm={false}
      hasUnsavedChanges={false}
      maxWidth="sm"
    >
      <DialogScrollContent>
        <FormSectionCard
          icon="mdi:history"
          title="Revision History"
          descriptionTooltip="Saved configuration snapshots, newest first. Times use your local time zone."
        >
          {query.isLoading ? (
            <Stack spacing={2} role="status" aria-label="Loading identity history">
              {[0, 1].map((item) => (
                <Box key={item}>
                  <Skeleton width="40%" />
                  <Skeleton width="70%" />
                  <Skeleton variant="rounded" height={88} sx={{ mt: 1 }} />
                </Box>
              ))}
            </Stack>
          ) : query.isError ? (
            <Alert severity="error" action={<Button onClick={() => query.refetch()}>Retry</Button>}>
              History could not be loaded.
            </Alert>
          ) : !revisions.length ? (
            <EmptyContent
              title="No saved changes yet"
              description="Updates saved for this context will appear here."
              sx={{ py: 2 }}
            />
          ) : (
            <>
              {query.isFetching && <LinearProgress aria-label="Refreshing identity history" />}
              <Timeline
                aria-label="Saved school identity revisions"
                sx={{
                  m: 0,
                  p: 0,
                  '& .MuiTimelineItem-root::before': { display: 'none' },
                }}
              >
                {revisions.map((revision, index) => (
                  <IdentityHistoryItem
                    key={revision.id}
                    revision={revision}
                    context={context}
                    latest={index === 0}
                    last={index === revisions.length - 1}
                  />
                ))}
              </Timeline>
            </>
          )}
        </FormSectionCard>
      </DialogScrollContent>
      <DialogActions>
        <Button
          variant="outlined"
          onClick={onClose}
          startIcon={<Iconify icon={GlobalIcons.cancel} />}
        >
          Close
        </Button>
      </DialogActions>
    </CustomDialog>
  );
}
