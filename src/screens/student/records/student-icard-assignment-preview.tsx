import type { ReactNode } from 'react';
import type { IdCard } from 'src/redux/student/records/student-record-documents-api';

import { useRef, useState, useEffect } from 'react';
import CustomSelect from 'src/components/custom-select';
import { Box, Stack, Button, Typography } from '@mui/material';
import { StudentFeedback } from 'src/components/student-feedback';
import { useGetRecordIdPhotoQuery } from 'src/redux/student/records/student-record-documents-api';

import { StudentCardPreview } from './components/student-card-preview';
import StudentAssignmentDrawer from '../onboarding/student-setup/student-assignment-drawer';

type Props = {
  open: boolean;
  onExited: () => void;
  standardName: string;
  cards: IdCard[];
  currentCard: IdCard;
  existingCount: number;
  busy: boolean;
  printError?: string;
  actions: ReactNode;
  getStudentName: (card: IdCard) => string;
  onStudentChange: (studentId: string) => void;
  onClose: () => void;
};

export default function StudentICardAssignmentPreview({
  open,
  onExited,
  standardName,
  cards,
  currentCard,
  existingCount,
  busy,
  printError,
  actions,
  getStudentName,
  onStudentChange,
  onClose,
}: Props) {
  const [showAll, setShowAll] = useState(false);
  const currentIndex = cards.findIndex((card) => card.studentId === currentCard.studentId);
  const canShowAll = cards.length > 1;

  return (
    <StudentAssignmentDrawer
      open={open}
      onExited={onExited}
      title={`Preview I-Cards for ${standardName}`}
      titleInfo="Review and print the selected cards, or issue numbered cards where needed."
      busy={busy}
      onClose={onClose}
      actions={actions}
      context={
        <Stack
          spacing={1}
          sx={{
            px: 2,
            py: 1.5,
            flexShrink: 0,
            minWidth: 0,
            borderBottom: 1,
            borderColor: 'divider',
          }}
        >
          {printError && (
            <StudentFeedback
              notificationKey="i-card-print-configuration"
              severity="error"
              presentation="inline"
              role="alert"
            >
              {printError}
            </StudentFeedback>
          )}
          {!showAll && (
            <CustomSelect
              label="Student to preview"
              value={currentCard.studentId}
              options={cards.map((card) => ({ id: card.studentId, name: getStudentName(card) }))}
              labelKey="name"
              valueKey="id"
              isSearch
              disabled={busy}
              onChange={(value) => onStudentChange(String(value))}
            />
          )}
          {(canShowAll || existingCount > 0) && (
            <Stack
              direction="row"
              gap={1}
              flexWrap="wrap"
              alignItems="center"
              justifyContent="space-between"
            >
              <Stack direction="row" gap={1} flexWrap="wrap" alignItems="center">
                {canShowAll && !showAll && (
                  <>
                    <Button
                      variant="outlined"
                      size="small"
                      aria-label="Previous student"
                      disabled={busy || currentIndex === 0}
                      onClick={() => onStudentChange(cards[currentIndex - 1].studentId)}
                    >
                      Previous
                    </Button>
                    <Typography variant="caption" aria-live="polite">
                      {currentIndex + 1} of {cards.length}
                    </Typography>
                    <Button
                      variant="outlined"
                      size="small"
                      aria-label="Next student"
                      disabled={busy || currentIndex === cards.length - 1}
                      onClick={() => onStudentChange(cards[currentIndex + 1].studentId)}
                    >
                      Next
                    </Button>
                  </>
                )}
                {canShowAll && (
                  <Button
                    variant={showAll ? 'contained' : 'outlined'}
                    color="inherit"
                    size="small"
                    aria-pressed={showAll}
                    disabled={busy}
                    onClick={() => setShowAll(!showAll)}
                  >
                    Show all
                  </Button>
                )}
              </Stack>
              {existingCount > 0 && (
                <Typography variant="body2">{existingCount} already issued</Typography>
              )}
            </Stack>
          )}
        </Stack>
      }
    >
      {showAll ? (
        <Stack
          component="ul"
          role="list"
          spacing={2}
          sx={{ maxWidth: 480, mx: 'auto', mt: 0, mb: 0, p: 0, minWidth: 0, listStyle: 'none' }}
        >
          {cards.map((card) => (
            <Box component="li" key={card.studentId}>
              <PreviewCard card={card} studentName={getStudentName(card)} />
            </Box>
          ))}
        </Stack>
      ) : (
        <Box sx={{ maxWidth: 480, mx: 'auto', minWidth: 0 }}>
          <PreviewCard key={currentCard.studentId} card={currentCard} eagerPhoto />
        </Box>
      )}
    </StudentAssignmentDrawer>
  );
}

function PreviewCard({
  card,
  studentName,
  eagerPhoto = false,
}: {
  card: IdCard;
  studentName?: string;
  eagerPhoto?: boolean;
}) {
  const preview = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const hasPhoto = Boolean(card.hasPhoto && card.templateSnapshot.showPhoto);

  useEffect(() => {
    const element = preview.current;
    if (!element || eagerPhoto || !hasPhoto || typeof IntersectionObserver === 'undefined')
      return undefined;

    const observer = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting));
    observer.observe(element);
    return () => observer.disconnect();
  }, [eagerPhoto, hasPhoto]);

  const { currentData } = useGetRecordIdPhotoQuery(card.studentId, {
    skip: !hasPhoto || !(eagerPhoto || visible),
  });

  return (
    <Stack spacing={1} ref={preview}>
      {studentName && (
        <Typography variant="subtitle2" sx={{ overflowWrap: 'anywhere' }}>
          {studentName}
        </Typography>
      )}
      <StudentCardPreview
        template={card.templateSnapshot}
        card={card}
        photoUrl={currentData?.imageData}
      />
    </Stack>
  );
}
