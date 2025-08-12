import React, { useState, useEffect } from 'react';

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
  FormControlLabel,
} from '@mui/material';

import { GlobalIcons } from 'src/utils/icons';

import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { useGetQuizListQuery } from 'src/redux/academics/examination/quiz-management-api';

import { Iconify } from 'src/components/iconify';

// Styled components
interface QuestionNumberProps {
  theme?: any;
  children?: React.ReactNode;
  status: any;
  onClick?: () => void;
  sx?: any;
}
const QuestionNumber = styled(Paper)<QuestionNumberProps>(({ theme, status }) => ({
  width: 44,
  height: 44,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: 18,
  padding: 0,
  textAlign: 'center',
  cursor: 'pointer',
  borderRadius: 8,
  boxShadow: status === 'current' ? theme.shadows[3] : theme.shadows[1],
  border: status === 'current' ? `2px solid ${theme.palette.warning.main}` : 'none',
  backgroundColor:
    status === 'current'
      ? theme.palette.warning.main
      : status === 'answered'
        ? theme.palette.success.main
        : status === 'skipped'
          ? theme.palette.info.main
          : theme.palette.grey[300],
  color:
    status === 'answered' || status === 'current' || status === 'skipped'
      ? theme.palette.common.white
      : theme.palette.text.primary,
  fontWeight: status === 'current' ? 700 : 500,
  transition: 'all 0.2s',
}));

// QuestionList Component
const QuestionList = ({
  totalQuestions,
  currentQuestion,
  answeredQuestions,
  skippedQuestions,
  onQuestionSelect,
}: any) => (
  <Card
    sx={{
      p: 3,
      mb: 2,
      borderRadius: 3,
      boxShadow: 2,
      bgcolor: 'background.paper',
      height: 479,
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'flex-start',
    }}
  >
    <Box sx={{ mb: 2 }}>
      <Stack direction="row" alignItems="center" spacing={2} flexWrap="wrap">
        <Typography variant="h6">Question Navigation</Typography>

        <Stack direction="row" alignItems="center" spacing={1}>
          <Typography variant="subtitle2">Legend:</Typography>

          <Stack direction="row" alignItems="center" spacing={1}>
            <Box sx={{ width: 16, height: 16, bgcolor: 'success.main', borderRadius: 1 }} />
            <Typography variant="body2">Answered</Typography>
          </Stack>

          <Stack direction="row" alignItems="center" spacing={1}>
            <Box sx={{ width: 16, height: 16, bgcolor: 'info.main', borderRadius: 1 }} />
            <Typography variant="body2">Skipped</Typography>
          </Stack>

          <Stack direction="row" alignItems="center" spacing={1}>
            <Box sx={{ width: 16, height: 16, bgcolor: 'warning.main', borderRadius: 1 }} />
            <Typography variant="body2">Current</Typography>
          </Stack>

          <Stack direction="row" alignItems="center" spacing={1}>
            <Box sx={{ width: 16, height: 16, bgcolor: 'grey.300', borderRadius: 1 }} />
            <Typography variant="body2">Not Visited</Typography>
          </Stack>
        </Stack>
      </Stack>
    </Box>
    <Box
      sx={{
        flex: 1,
        overflow: 'auto',
        pr: 1,
      }}
    >
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
        {Array.from({ length: totalQuestions }, (_, i) => (
          <QuestionNumber
            key={i}
            onClick={() => onQuestionSelect(i + 1)}
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
        ))}
      </Box>
    </Box>
  </Card>
);
// QuestionDisplay Component
const QuestionDisplay = ({ question, onAnswer, currentAnswer, totalQuestions }: any) => {
  if (!question) return null;

  return (
    <Card sx={{ borderRadius: 3, boxShadow: 2, bgcolor: 'background.paper', p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6">
          Question {question.questionNumber} of {totalQuestions}
        </Typography>
        <Typography variant="subtitle2" color="text.secondary">
          Marks: {question.marks}
        </Typography>
      </Box>
      <Typography variant="body1" gutterBottom>
        {question.question}
      </Typography>
      <Box sx={{ mt: 2 }}>
        {(() => {
          switch (question.questionType) {
            case 'multiple-choice':
              return (
                <RadioGroup value={currentAnswer || ''} onChange={(e) => onAnswer(e.target.value)}>
                  {question.options.map((option: any) => (
                    <FormControlLabel
                      key={option.value}
                      value={option.value}
                      control={<Radio />}
                      label={option.label}
                      sx={{
                        mb: 2,
                        bgcolor: 'grey.100',
                        borderRadius: 2,
                        px: 2,
                        py: 1,
                        '& .MuiRadio-root': { color: 'primary.main' },
                      }}
                    />
                  ))}
                </RadioGroup>
              );
            case 'trueFalse':
              return (
                <RadioGroup value={currentAnswer || ''} onChange={(e) => onAnswer(e.target.value)}>
                  {['true', 'false'].map((value) => (
                    <FormControlLabel
                      key={value}
                      value={value}
                      control={<Radio />}
                      label={value.charAt(0).toUpperCase() + value.slice(1)}
                      sx={{
                        mb: 2,
                        bgcolor: 'grey.100',
                        borderRadius: 2,
                        px: 2,
                        py: 1,
                        '& .MuiRadio-root': { color: 'primary.main' },
                      }}
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
                  value={currentAnswer || ''}
                  placeholder="Type your answer here..."
                  onChange={(e) => onAnswer(e.target.value)}
                  sx={{ bgcolor: 'grey.100', borderRadius: 2 }}
                />
              );
            case 'matchTheFollowing':
              return (
                <Box>
                  {question.pairs.map((pair: any, idx: number) => (
                    <Box key={idx} sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <Typography sx={{ minWidth: 80 }}>{pair.left}</Typography>
                      <RadioGroup
                        row
                        value={currentAnswer?.[idx] || ''}
                        onChange={(e) => {
                          const newAnswers = Array.isArray(currentAnswer) ? [...currentAnswer] : [];
                          newAnswers[idx] = e.target.value;
                          onAnswer(newAnswers);
                        }}
                      >
                        {pair.rightOptions.map((option: string) => (
                          <FormControlLabel
                            key={option}
                            value={option}
                            control={<Radio />}
                            label={option}
                            sx={{ mx: 1 }}
                          />
                        ))}
                      </RadioGroup>
                    </Box>
                  ))}
                </Box>
              );
            default:
              return null;
          }
        })()}
      </Box>
    </Card>
  );
};

// Navigation Component
const NavigationButtons = ({
  currentQuestion,
  totalQuestions,
  onNext,
  onBack,
  onSkip,
  onSubmit,
}: any) => (
  <Stack direction="row" justifyContent="flex-end" sx={{ mt: 2 }}>
    {currentQuestion > 1 && (
      <Button
        variant="outlined"
        onClick={onBack}
        size="medium"
        sx={{ mr: 2, minWidth: 100, borderRadius: 2 }}
        startIcon={<Iconify icon="ic:round-arrow-back" width={20} />}
      >
        Back
      </Button>
    )}
    <Button
      size="medium"
      startIcon={<Iconify icon={GlobalIcons.skipIcon} />}
      variant="outlined"
      onClick={onSkip}
      sx={{ mr: 2, minWidth: 100 }}
    >
      Skip
    </Button>
    {currentQuestion === totalQuestions ? (
      <Button
        size="medium"
        variant="contained"
        onClick={onSubmit}
        startIcon={<Iconify icon={GlobalIcons.submit} />}
        sx={{ minWidth: 100 }}
      >
        Submit
      </Button>
    ) : (
      <Button
        size="medium"
        variant="contained"
        onClick={onNext}
        sx={{ minWidth: 100 }}
        endIcon={<Iconify icon="ic:round-arrow-forward" width={20} />}
      >
        Next
      </Button>
    )}
  </Stack>
);

// Main Quiz Portal Component
const QuizPortal = ({ quizData, handleClose }: { quizData: any; handleClose: () => void }) => {
  const { data, isLoading } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetQuizListQuery,
  });

  const quizList = data;

  const [currentQuestion, setCurrentQuestion] = useState(1);
  const [answeredQuestions, setAnsweredQuestions] = useState<number[]>([]);
  const [skippedQuestions, setSkippedQuestions] = useState<number[]>([]);
  type Answer = string | boolean | string[];
  const [answers, setAnswers] = useState<Record<number, Answer>>({});
  const [timeLeft, setTimeLeft] = useState(3600);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prevTime) => {
        if (prevTime <= 0) {
          clearInterval(timer);
          // Handle quiz submission when time is up
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

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
    if (currentQuestion < quizList.length) {
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

  const handleSubmit = () => {
    handleClose();
  };

  return isLoading ? (
    'loading.. ...'
  ) : (
    <>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          mb: 3,
          px: 2,
          pt: 2,
        }}
      >
        <Typography variant="h5" fontWeight={700}>
          Quiz: General Knowledge
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Iconify icon="mdi:clock-outline" width={20} />
            <Typography variant="h6" fontWeight={600} sx={{ fontSize: 18 }}>
              {Math.floor(timeLeft / 3600)}:
              {Math.floor((timeLeft % 3600) / 60)
                .toString()
                .padStart(2, '0')}
              :{(timeLeft % 60).toString().padStart(2, '0')}
            </Typography>
          </Box>
        </Box>
      </Box>

      <Grid container spacing={3} padding={2}>
        <Grid item xs={12} md={8}>
          <Stack spacing={3}>
            <QuestionDisplay
              question={{
                ...quizList[currentQuestion - 1],
                questionNumber: currentQuestion,
              }}
              totalQuestions={quizList.length}
              onAnswer={handleAnswer}
              currentAnswer={answers[currentQuestion]}
            />

            <NavigationButtons
              currentQuestion={currentQuestion}
              totalQuestions={quizList.length}
              onNext={handleNext}
              onBack={handleBack}
              onSkip={handleSkip}
              onSubmit={handleSubmit}
              isAnswered={answeredQuestions.includes(currentQuestion)}
              isSkipped={skippedQuestions.includes(currentQuestion)}
            />
          </Stack>
        </Grid>
        <Grid item xs={12} md={4}>
          <QuestionList
            totalQuestions={quizList.length}
            currentQuestion={currentQuestion}
            answeredQuestions={answeredQuestions}
            skippedQuestions={skippedQuestions}
            onQuestionSelect={handleQuestionSelect}
          />
        </Grid>
      </Grid>
    </>
  );
};

export default QuizPortal;
