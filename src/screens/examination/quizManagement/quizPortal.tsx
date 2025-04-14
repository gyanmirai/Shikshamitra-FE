import React, { useState } from 'react';

import {
  Box,
  Grid,
  Card,
  Paper,
  Radio,
  Stack,
  Button,
  styled,
  TextField,
  Typography,
  RadioGroup,
  CardContent,
  FormControlLabel,
} from '@mui/material';

import { GlobalIcons } from 'src/utils/icons';

import { Iconify } from 'src/components/iconify';

// Styled components
interface QuestionNumberProps {
  theme?: any;
  children?: React.ReactNode;
  status: any;
}
const QuestionNumber: React.FC<QuestionNumberProps> = styled(Paper)(({ theme, status }: any) => ({
  padding: theme.spacing(1),
  textAlign: 'center',
  cursor: 'pointer',
  border: status === 'current' ? `2px solid ${theme.palette.primary.main}` : 'none',
  backgroundColor:
    status === 'current'
      ? theme.palette.grey[200]
      : status === 'answered'
        ? theme.palette.success.main
        : status === 'skipped'
          ? theme.palette.warning.main
          : theme.palette.grey[200],
  color:
    status === 'answered' || status === 'skipped'
      ? theme.palette.common.white
      : theme.palette.text.primary,
}));

// QuestionList Component
const QuestionList = ({
  totalQuestions,
  currentQuestion,
  answeredQuestions,
  skippedQuestions,
}: any) => (
  <Paper elevation={3} sx={{ p: 2, mb: 2 }}>
    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      <Typography variant="subtitle1" gutterBottom>
        Total Questions: {totalQuestions}
      </Typography>
      <Typography variant="subtitle1" color="primary">
        <Iconify icon="mdi:clock-outline" color="black" height="20px" width="20px" /> 00:00:30
      </Typography>
    </Box>

    <Grid container spacing={1}>
      {Array.from({ length: totalQuestions }, (_, i) => (
        <Grid item xs={0.4} key={i}>
          <QuestionNumber
            status={
              i + 1 === currentQuestion
                ? 'current'
                : answeredQuestions.includes(i + 1)
                  ? 'answered'
                  : skippedQuestions.includes(i + 1)
                    ? 'skipped'
                    : 'unanswered'
            }
          >
            {i + 1}
          </QuestionNumber>
        </Grid>
      ))}
    </Grid>
    <Box sx={{ mt: 2, display: 'flex', gap: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Box sx={{ width: 16, height: 16, bgcolor: 'success.main', borderRadius: 1 }} />
        <Typography variant="body2">Answered</Typography>
      </Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Box sx={{ width: 16, height: 16, bgcolor: 'warning.main', borderRadius: 1 }} />
        <Typography variant="body2">Skipped</Typography>
      </Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Box
          sx={{
            width: 16,
            height: 16,
            bgcolor: 'grey.200',
            borderRadius: 1,
            border: 2,
            borderColor: 'primary.main',
          }}
        />
        <Typography variant="body2">Current</Typography>
      </Box>
    </Box>
  </Paper>
);

// QuestionDisplay Component
const QuestionDisplay = ({ question, onAnswer }: any) => {
  if (!question) return null;

  const renderOptions = () => {
    switch (question.questionType) {
      case 'multiple-choice':
        return (
          <RadioGroup onChange={(e) => onAnswer(e.target.value)}>
            {question.options.map((option: any) => (
              <FormControlLabel
                key={option.value}
                value={option.value}
                control={<Radio />}
                label={option.label}
                sx={{ mb: 1 }}
              />
            ))}
          </RadioGroup>
        );
      case 'trueFalse':
        return (
          <RadioGroup onChange={(e) => onAnswer(e.target.value)}>
            {['true', 'false'].map((value) => (
              <FormControlLabel
                key={value}
                value={value}
                control={<Radio />}
                label={value.charAt(0).toUpperCase() + value.slice(1)}
                sx={{ mb: 1 }}
              />
            ))}
          </RadioGroup>
        );
      case 'shortAns':
        return (
          <TextField
            fullWidth
            multiline
            rows={4}
            variant="outlined"
            placeholder="Type your answer here..."
            onChange={(e) => onAnswer(e.target.value)}
          />
        );
      default:
        return null;
    }
  };

  return (
    <Card elevation={3}>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h5">Question {question.questionNumber}</Typography>
          <Typography variant="subtitle1" color="text.secondary">
            Marks: {question.marks}
          </Typography>
        </Box>
        <Typography variant="body1" gutterBottom>
          {question.question}
        </Typography>
        <Box sx={{ mt: 2 }}>{renderOptions()}</Box>
      </CardContent>
    </Card>
  );
};

// Navigation Component
const NavigationButtons = ({ currentQuestion, totalQuestions, onNext, onBack, onSkip }: any) => (
  <Stack direction="row" justifyContent="space-between" sx={{ mt: 2 }}>
    <Box>
      {currentQuestion > 1 && (
        <Button variant="contained" color="secondary" onClick={onBack}>
          Back
        </Button>
      )}
    </Box>
    <Stack direction="row" spacing={2}>
      <Button
        startIcon={<Iconify icon={GlobalIcons.skipIcon} />}
        variant="outlined"
        onClick={onSkip}
      >
        Skip
      </Button>
      <Button variant="contained" onClick={onNext}>
        Next
      </Button>
    </Stack>
  </Stack>
);

// Main Quiz Portal Component
const QuizPortal = ({ quizData }: any) => {
  const [currentQuestion, setCurrentQuestion] = useState(1);
  const [answeredQuestions, setAnsweredQuestions] = useState<number[]>([]);
  const [skippedQuestions, setSkippedQuestions] = useState<number[]>([]);
  const [answers, setAnswers] = useState({});

  const handleAnswer = (answer: any) => {
    setAnswers((prev) => ({ ...prev, [currentQuestion]: answer }));

    // Remove from skipped questions if it was previously skipped
    if (skippedQuestions.includes(currentQuestion)) {
      setSkippedQuestions(skippedQuestions.filter((q) => q !== currentQuestion));
    }

    // Add to answered questions if not already there
    if (!answeredQuestions.includes(currentQuestion)) {
      setAnsweredQuestions([...answeredQuestions, currentQuestion]);
    }
  };

  const handleNext = () => {
    if (currentQuestion < quizData.length) {
      // If moving to next without answering, consider it skipped
      if (
        !answeredQuestions.includes(currentQuestion) &&
        !skippedQuestions.includes(currentQuestion)
      ) {
        setSkippedQuestions([...skippedQuestions, currentQuestion]);
      }
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const handleBack = () => {
    if (currentQuestion > 1) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const handleSkip = () => {
    // Add current question to skipped questions if not already answered
    if (
      !answeredQuestions.includes(currentQuestion) &&
      !skippedQuestions.includes(currentQuestion)
    ) {
      setSkippedQuestions([...skippedQuestions, currentQuestion]);
    }
    handleNext();
  };

  // Optional: function to handle going back to a skipped question
  const handleQuestionSelect = (questionNumber: any) => {
    setCurrentQuestion(questionNumber);
  };

  return (
    <Box>
      <QuestionList
        totalQuestions={quizData.length}
        currentQuestion={currentQuestion}
        answeredQuestions={answeredQuestions}
        skippedQuestions={skippedQuestions}
        onQuestionSelect={handleQuestionSelect}
      />

      <QuestionDisplay
        question={{ ...quizData[currentQuestion - 1], questionNumber: currentQuestion }}
        onAnswer={handleAnswer}
        isSkipped={skippedQuestions.includes(currentQuestion)}
      />

      <NavigationButtons
        currentQuestion={currentQuestion}
        totalQuestions={quizData.length}
        onNext={handleNext}
        onBack={handleBack}
        onSkip={handleSkip}
        isAnswered={answeredQuestions.includes(currentQuestion)}
        isSkipped={skippedQuestions.includes(currentQuestion)}
      />
    </Box>
  );
};

export default QuizPortal;
