import type { ProfessionalReview } from 'src/redux/hr/professional-management-api';

import dayjs from 'dayjs';
import { toast } from 'sonner';
import { Search } from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers';
import { useBoolean } from 'src/hooks/use-boolean';
import { Scrollbar } from 'src/components/scrollbar';
import CustomDialog from 'src/components/customDialog';
import React, { useMemo, useState, useEffect } from 'react';
import CustomizableTable from 'src/components/customizabaleTable';
import {
  Box,
  Stack,
  Button,
  Rating,
  MenuItem,
  TextField,
  Typography,
  DialogActions,
  InputAdornment,
} from '@mui/material';
import {
  useGetProfessionalCycleReviewsQuery,
  useGetProfessionalReviewCyclesQuery,
  useSubmitProfessionalReviewMutation,
  useSaveProfessionalReviewDraftMutation,
  useCreateProfessionalReviewCycleMutation,
} from 'src/redux/hr/professional-management-api';

const cycleStatus = ['Draft', 'Active', 'Closed'];
const reviewStatus = ['Draft', 'Submitted'];

const PerformanceReview = () => {
  const reviewDialog = useBoolean();
  const cycleDialog = useBoolean();
  const [search, setSearch] = useState('');
  const [selectedCycleId, setSelectedCycleId] = useState('');
  const [selectedReview, setSelectedReview] = useState<ProfessionalReview | null>(null);

  const { data: cyclesData } = useGetProfessionalReviewCyclesQuery({ page: 1, pageSize: 50 });
  const cycles = useMemo(() => cyclesData?.items || [], [cyclesData?.items]);

  useEffect(() => {
    if (!selectedCycleId && cycles[0]?.id) {
      setSelectedCycleId(cycles[0].id);
    }
  }, [cycles, selectedCycleId]);

  const { data: reviewsData, isLoading } = useGetProfessionalCycleReviewsQuery(
    { id: selectedCycleId, search },
    { skip: !selectedCycleId }
  );

  const reviews = reviewsData?.items || [];

  return (
    <Box>
      <Stack direction={{ xs: 'column', md: 'row' }} gap={2} sx={{ mb: 3 }}>
        <TextField
          select
          label="Review Cycle"
          value={selectedCycleId}
          onChange={(event) => setSelectedCycleId(event.target.value)}
          size="small"
          sx={{ minWidth: 260 }}
        >
          {cycles.map((cycle: any) => (
            <MenuItem key={cycle.id} value={cycle.id}>
              {cycle.name} ({cycleStatus[cycle.status]})
            </MenuItem>
          ))}
        </TextField>
        <TextField
          fullWidth
          placeholder="Search employee or employee code."
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search />
              </InputAdornment>
            ),
          }}
        />
        <Button variant="contained" onClick={cycleDialog.onTrue}>
          New Cycle
        </Button>
      </Stack>

      <CustomizableTable
        tableId="professional-review"
        isLoading={isLoading}
        columns={[
          { id: 'employeeName', label: 'Employee' },
          { id: 'employeeIdentifier', label: 'Code' },
          { id: 'employeeRole', label: 'Role' },
          {
            id: 'communicationScore',
            label: 'Communication',
            render: (value) => <Rating readOnly value={Number(value || 0)} />,
          },
          {
            id: 'problemSolvingScore',
            label: 'Problem Solving',
            render: (value) => <Rating readOnly value={Number(value || 0)} />,
          },
          {
            id: 'status',
            label: 'Status',
            render: (value) => reviewStatus[value] || 'Draft',
          },
          {
            id: 'actions',
            label: 'Actions',
            render: (_value, row) => (
              <Button
                size="small"
                variant="outlined"
                onClick={() => {
                  setSelectedReview(row as unknown as ProfessionalReview);
                  reviewDialog.onTrue();
                }}
              >
                Review
              </Button>
            ),
          },
        ]}
        data={reviews}
        noDataText={
          selectedCycleId ? 'No employees found for this cycle.' : 'Create a review cycle to start.'
        }
      />

      <CustomDialog
        open={reviewDialog.value}
        handleClose={reviewDialog.onFalse}
        title="Review & feedback"
      >
        <ReviewForm review={selectedReview} onClose={reviewDialog.onFalse} />
      </CustomDialog>
      <CustomDialog
        open={cycleDialog.value}
        handleClose={cycleDialog.onFalse}
        title="New review cycle"
      >
        <CycleForm onClose={cycleDialog.onFalse} />
      </CustomDialog>
    </Box>
  );
};

export default PerformanceReview;

function CycleForm({ onClose }: { onClose: () => void }) {
  const [name, setName] = useState('');
  const [periodStart, setPeriodStart] = useState(dayjs());
  const [periodEnd, setPeriodEnd] = useState(dayjs().add(6, 'month'));
  const [createCycle, { isLoading }] = useCreateProfessionalReviewCycleMutation();

  const handleSubmit = async () => {
    await createCycle({
      name,
      periodStart: periodStart.startOf('day').toISOString(),
      periodEnd: periodEnd.startOf('day').toISOString(),
      status: 1,
    }).unwrap();
    toast.success('Review cycle created');
    onClose();
  };

  return (
    <>
      <Scrollbar sx={{ bgcolor: 'background.neutral', p: 2 }}>
        <Stack spacing={2}>
          <TextField
            label="Cycle Name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            fullWidth
          />
          <DatePicker
            label="Period Start"
            value={periodStart}
            onChange={(value) => value && setPeriodStart(value)}
          />
          <DatePicker
            label="Period End"
            value={periodEnd}
            onChange={(value) => value && setPeriodEnd(value)}
          />
        </Stack>
      </Scrollbar>
      <DialogActions>
        <Button variant="outlined" onClick={onClose}>
          Cancel
        </Button>
        <Button variant="contained" disabled={!name.trim() || isLoading} onClick={handleSubmit}>
          Create
        </Button>
      </DialogActions>
    </>
  );
}

function ReviewForm({
  review,
  onClose,
}: {
  review: ProfessionalReview | null;
  onClose: () => void;
}) {
  const [communicationScore, setCommunicationScore] = useState(review?.communicationScore || 0);
  const [problemSolvingScore, setProblemSolvingScore] = useState(review?.problemSolvingScore || 0);
  const [comments, setComments] = useState(review?.comments || '');
  const [feedback, setFeedback] = useState(review?.feedback || '');
  const [saveDraft, draftState] = useSaveProfessionalReviewDraftMutation();
  const [submitReview, submitState] = useSubmitProfessionalReviewMutation();
  const isSubmitted = review?.status === 1;

  useEffect(() => {
    setCommunicationScore(review?.communicationScore || 0);
    setProblemSolvingScore(review?.problemSolvingScore || 0);
    setComments(review?.comments || '');
    setFeedback(review?.feedback || '');
  }, [review]);

  const body = { communicationScore, problemSolvingScore, comments, feedback };

  const handleSaveDraft = async () => {
    if (!review?.id) return;
    await saveDraft({ id: review.id, body }).unwrap();
    toast.success('Draft saved');
    onClose();
  };

  const handleSubmit = async () => {
    if (!review?.id) return;
    await submitReview({ id: review.id, body }).unwrap();
    toast.success('Review submitted');
    onClose();
  };

  return (
    <Box>
      <Scrollbar sx={{ bgcolor: 'background.neutral', p: 2 }}>
        <Typography variant="subtitle1" gutterBottom>
          {review?.employeeName}
        </Typography>
        <Box mb={3}>
          <Typography variant="subtitle2">Communication</Typography>
          <Rating
            value={communicationScore}
            readOnly={isSubmitted}
            onChange={(_, value) => setCommunicationScore(value || 0)}
          />
        </Box>
        <Box mb={3}>
          <Typography variant="subtitle2">Problem Solving</Typography>
          <Rating
            value={problemSolvingScore}
            readOnly={isSubmitted}
            onChange={(_, value) => setProblemSolvingScore(value || 0)}
          />
        </Box>
        <TextField
          label="Comments"
          fullWidth
          multiline
          minRows={3}
          value={comments}
          onChange={(event) => setComments(event.target.value)}
          disabled={isSubmitted}
          sx={{ mb: 2 }}
        />
        <TextField
          label="Feedback"
          fullWidth
          multiline
          minRows={3}
          value={feedback}
          onChange={(event) => setFeedback(event.target.value)}
          disabled={isSubmitted}
        />
      </Scrollbar>
      <DialogActions>
        <Button variant="outlined" onClick={onClose}>
          Cancel
        </Button>
        <Button
          variant="contained"
          disabled={isSubmitted || draftState.isLoading}
          onClick={handleSaveDraft}
        >
          Save Draft
        </Button>
        <Button
          variant="contained"
          color="primary"
          disabled={isSubmitted || submitState.isLoading}
          onClick={handleSubmit}
        >
          Submit
        </Button>
      </DialogActions>
    </Box>
  );
}
