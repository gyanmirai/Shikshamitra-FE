import React, { useState } from 'react';

import { Search } from '@mui/icons-material';
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

import { useBoolean } from 'src/hooks/use-boolean';

import { Scrollbar } from 'src/components/scrollbar';
import CustomDialog from 'src/components/customDialog';

const PerformanceReview = () => {
  const feedbackDialog = useBoolean();
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
        <ReviewCard onReview={reviewDialog.onTrue} onFeedBack={feedbackDialog.onTrue} />
        <ReviewCard onReview={reviewDialog.onTrue} onFeedBack={feedbackDialog.onTrue} />
      </Box>

      <CustomDialog
        open={feedbackDialog.value}
        handleClose={feedbackDialog.onFalse}
        title="Feedback"
      >
        <Scrollbar sx={{ bgcolor: 'background.neutral', p: 2 }}>
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
          <Button variant="outlined">Cancel</Button>
          <Button variant="contained">Save</Button>
        </DialogActions>
      </CustomDialog>

      <CustomDialog open={reviewDialog.value} handleClose={reviewDialog.onFalse} title="Review">
        <ReviewForm />
      </CustomDialog>
    </Box>
  );
};

export default PerformanceReview;

interface ReviewCardProps {
  onReview?: () => void;
  onFeedBack?: () => void;
}

const ReviewCard = ({ onReview, onFeedBack }: ReviewCardProps) => (
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
      <Button variant="outlined" sx={{ width: '45%' }} onClick={onReview}>
        Review
      </Button>
      <Button variant="contained" sx={{ width: '45%' }} onClick={onFeedBack}>
        Feedback
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

  const handleSubmit = () => {
    console.log('Submitted Reviews:', reviews);
  };

  const handleSaveDraft = () => {
    console.log('Draft Saved:', reviews);
  };

  const handleCancel = () => {
    setReviews({
      communication: { rating: 0, comment: '' },
      problemSolving: { rating: 0, comment: '' },
    });
  };

  return (
    <Box>
      <Scrollbar sx={{ bgcolor: 'background.neutral', p: 2 }}>
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
      </Scrollbar>
      <DialogActions>
        <Button variant="outlined" onClick={handleCancel}>
          Cancel
        </Button>
        <Button variant="contained" onClick={handleSaveDraft}>
          Save Draft
        </Button>
        <Button variant="contained" color="primary" onClick={handleSubmit}>
          Submit Review
        </Button>
      </DialogActions>
    </Box>
  );
}
