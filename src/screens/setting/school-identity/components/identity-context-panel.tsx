import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import { Iconify } from 'src/components/iconify';
import Typography from '@mui/material/Typography';
import { RouterLink } from 'src/routes/components';
import LinearProgress from '@mui/material/LinearProgress';
import { FormSectionCard } from 'src/components/form-section-card';

import { IdentityContextFields } from './identity-context-fields';

import type { SchoolIdentityWorkspace } from '../hooks/use-school-identity';

export function IdentityContextPanel({ workspace }: { workspace: SchoolIdentityWorkspace }) {
  const { yearsQuery, boardsQuery, years, boards, selectedYear, boardId, mediumId, valid } =
    workspace;
  const loading = yearsQuery.isLoading || boardsQuery.isLoading;
  const failed = yearsQuery.isError || boardsQuery.isError;
  const hasBoards = boards.some((board) => board.academicYearId === selectedYear);
  return (
    <FormSectionCard
      icon="mdi:layers-outline"
      title="Document context"
      titleTypographyProps={{ id: 'identity-context-heading' }}
      descriptionTooltip="Choose a year and board, then a medium if its documents need different images. All mediums uses the board’s settings. Choose a medium to review its own overrides."
      actionFullWidthOnMobile
      action={
        workspace.currentBoard && !loading && !failed ? (
          <Button variant="outlined" onClick={workspace.selectCurrentContext}>
            Use current context
          </Button>
        ) : undefined
      }
    >
      {loading ? (
        <LinearProgress aria-label="Loading academic options" />
      ) : failed ? (
        <Alert
          severity="error"
          action={
            <Button
              onClick={() => {
                yearsQuery.refetch();
                boardsQuery.refetch();
              }}
            >
              Retry
            </Button>
          }
        >
          Academic options could not be loaded.
        </Alert>
      ) : !years.length ? (
        <Alert severity="info">No academic years are available for your access.</Alert>
      ) : (
        <>
          <IdentityContextFields
            years={years}
            boards={boards}
            yearId={selectedYear}
            boardId={boardId}
            mediumId={mediumId}
            onChange={workspace.selectContext}
          />
          {!valid ? (
            <Box
              sx={{
                mt: 2,
                p: 2,
                display: 'flex',
                alignItems: 'flex-start',
                gap: 1.5,
                bgcolor: 'background.neutral',
                borderRadius: 1,
              }}
            >
              <Iconify
                icon="mdi:layers-outline"
                width={24}
                sx={{ color: 'text.secondary', flexShrink: 0, mt: 0.25 }}
              />
              <Stack spacing={0.5} sx={{ minWidth: 0 }}>
                <Typography variant="subtitle2">
                  {hasBoards
                    ? 'Select a board to review its images'
                    : 'No boards in this academic year'}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {hasBoards
                    ? 'Review the inherited logo, letterhead and signature before configuring an override.'
                    : 'Choose another academic year or review the shared school defaults.'}
                </Typography>
                <Button
                  component={RouterLink}
                  href={workspace.tabHref(0)}
                  scroll={false}
                  sx={{ alignSelf: 'flex-start' }}
                >
                  View school defaults
                </Button>
              </Stack>
            </Box>
          ) : null}
        </>
      )}
    </FormSectionCard>
  );
}
