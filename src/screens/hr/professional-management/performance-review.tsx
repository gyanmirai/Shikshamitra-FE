import type { Dayjs } from 'dayjs';

import dayjs from 'dayjs';
import React, { useState } from 'react';
import { Search } from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers';
import { useBoolean } from 'src/hooks/useBoolean';
import { Scrollbar } from 'src/components/scrollbar';
import CustomDialog from 'src/components/custom-dialog';
import {
  Box,
  Card,
  Avatar,
  Button,
  Slider,
  Rating,
  TextField,
  Typography,
  CardContent,
  DialogActions,
  InputAdornment,
} from '@mui/material';

const PerformanceReview = () => {
  const reviewDialog = useBoolean();

  return (
    <Box>
      <Box sx={{ mb: 3 }}>
        <TextField
          fullWidth
          placeholder="Search by department or performance period."
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search />
              </InputAdornment>
            ),
          }}
          sx={{
            backgroundColor: 'background.paper',
            '& .MuiOutlinedInput-root': {
              borderRadius: 2,
            },
          }}
        />
      </Box>

      <Box sx={{ display: 'flex', gap: 2 }}>
        <ReviewCard onReview={reviewDialog.onTrue} />
        <ReviewCard onReview={reviewDialog.onTrue} />
      </Box>

      <CustomDialog
        open={reviewDialog.value}
        handleClose={reviewDialog.onFalse}
        title="Review & feedback"
      >
        <ReviewForm />
      </CustomDialog>
    </Box>
  );
};

export default PerformanceReview;

interface ReviewCardProps {
  onReview?: () => void;
}

const ReviewCard = ({ onReview }: ReviewCardProps) => (
  <Card sx={{ borderRadius: 2, p: 2, width: 300 }}>
    <CardContent sx={{ display: 'flex', alignItems: 'center' }}>
      <Avatar
        src="https://example.com/avatar.jpg"
        alt="Selina Boyer"
        sx={{ width: 50, height: 50, mr: 2 }}
      />
      <Box>
        <Typography variant="h6">Selina Boyer</Typography>
        <Typography variant="body2" color="textSecondary">
          Teacher
        </Typography>
      </Box>
    </CardContent>

    <Box sx={{ px: 2 }}>
      <Slider
        value={30}
        valueLabelDisplay="on"
        step={10}
        sx={{
          color: 'primary.main',
          height: 8,
          '& .MuiSlider-thumb': {
            width: 24,
            height: 24,
            backgroundColor: '#fff',
            border: '2px solid currentColor',
          },
          '& .MuiSlider-track': {
            border: 'none',
          },
          '& .MuiSlider-rail': {
            opacity: 0.2,
            backgroundColor: '#37404f',
          },
        }}
      />
    </Box>

    <Box sx={{ display: 'flex', justifyContent: 'space-around', mt: 2 }}>
      <Button variant="outlined" fullWidth onClick={onReview}>
        Review & Feedback
      </Button>
    </Box>
  </Card>
);

interface ReviewData {
  rating: number;
  comment: string;
}

interface Reviews {
  communication: ReviewData;
  problemSolving: ReviewData;
}

type CategoryType = keyof Reviews;

function ReviewForm() {
  const [date, setDate] = useState<null | Dayjs>(dayjs());
  const [reviews, setReviews] = useState<Reviews>({
    communication: { rating: 0, comment: '' },
    problemSolving: { rating: 0, comment: '' },
  });

  const handleRatingChange = (category: CategoryType, newRating: number | null) => {
    if (newRating !== null) {
      setReviews((prev) => ({
        ...prev,
        [category]: { ...prev[category], rating: newRating },
      }));
    }
  };

  const handleCommentChange = (category: CategoryType, newComment: string) => {
    setReviews((prev) => ({
      ...prev,
      [category]: { ...prev[category], comment: newComment },
    }));
  };

  const handleSubmit = () => {};

  const handleSaveDraft = () => {};

  const handleCancel = () => {
    setReviews({
      communication: { rating: 0, comment: '' },
      problemSolving: { rating: 0, comment: '' },
    });
  };

  return (
    <Box>
      <Scrollbar sx={{ bgcolor: 'background.neutral', p: 2 }}>
        <DatePicker
          label="Select Date"
          format="DD-MM-YYYY"
          value={date}
          onChange={(newValue) => setDate(newValue)}
          slotProps={{ textField: { fullWidth: true, size: 'small' } }}
          sx={{ mb: 2 }}
        />
        {(['communication', 'problemSolving'] as const).map((category) => (
          <Box key={category} mb={3}>
            <Typography variant="subtitle1" gutterBottom>
              {category === 'communication' ? 'Communication' : 'Problem-Solving'}
            </Typography>
            <Rating
              value={reviews[category].rating}
              onChange={(event, newValue) => handleRatingChange(category, newValue)}
            />
            <TextField
              variant="outlined"
              placeholder="Leave a comment"
              fullWidth
              multiline
              minRows={3}
              value={reviews[category].comment}
              onChange={(event) => handleCommentChange(category, event.target.value)}
              sx={{
                mt: 1,
              }}
            />
          </Box>
        ))}
        <Typography variant="subtitle1" gutterBottom>
          Feedback
        </Typography>
        <TextField
          variant="outlined"
          placeholder="Leave a comment"
          fullWidth
          multiline
          minRows={3}
          sx={{
            mt: 1,
          }}
        />
      </Scrollbar>
      <DialogActions>
        <Button variant="outlined" onClick={handleCancel}>
          Cancel
        </Button>
        <Button variant="contained" onClick={handleSaveDraft}>
          Save Draft
        </Button>
        <Button variant="contained" color="primary" onClick={handleSubmit}>
          Submit
        </Button>
      </DialogActions>
    </Box>
  );
}
