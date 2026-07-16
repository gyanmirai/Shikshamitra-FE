import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import React, { useState, useEffect } from 'react';
import { alpha, styled, useTheme } from '@mui/material/styles';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { useGetQuizListQuery } from 'src/redux/academics/examination/quiz-management-api';
import {
  Box,
  Grid,
  Card,
  Chip,
  Paper,
  Radio,
  Stack,
  Button,
  Divider,
  TextField,
  Typography,
  RadioGroup,
  FormControlLabel,
} from '@mui/material';

// ----------------------------------------------------------------------

// Styled components

const StyledCard = styled(Card)(({ theme }) => ({
  borderRadius: (theme.shape.borderRadius as number) * 2,
  boxShadow: theme.customShadows?.z20 || '0 4px 20px 0 rgba(0,0,0,0.05)',
  border: `1px solid ${alpha(theme.palette.grey[300], 0.3)}`,
  overflow: 'hidden',
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
}));

interface QuestionNumberProps {
  theme?: any;
  children?: React.ReactNode;
  status: 'current' | 'answered' | 'skipped' | 'unanswered';
  onClick?: () => void;
  sx?: any;
}

const QuestionNumber = styled(Box, {
  shouldForwardProp: (prop) => prop !== 'status',
})<QuestionNumberProps>(({ theme, status }) => {
  const getBackgroundColor = () => {
    switch (status) {
      case 'current':
        return alpha(theme.palette.primary.main, 0.1);
      case 'answered':
        return theme.palette.success.main;
      case 'skipped':
        return theme.palette.warning.main;
      default:
        return alpha(theme.palette.grey[500], 0.08);
    }
  };

  const getColor = () => {
    switch (status) {
      case 'current':
        return theme.palette.primary.main;
      case 'answered':
      case 'skipped':
        return theme.palette.common.white;
      default:
        return theme.palette.text.secondary;
    }
  };

  const getBorder = () => {
    if (status === 'current') {
      return `2px solid ${theme.palette.primary.main}`;
    }
    return 'none';
  };

  return {
    width: 40,
    height: 40,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 14,
    fontWeight: status === 'current' ? 700 : 600,
    cursor: 'pointer',
    borderRadius: '12px', // Softer radius
    backgroundColor: getBackgroundColor(),
    color: getColor(),
    border: getBorder(),
    transition: 'all 0.2s ease-in-out',
    '&:hover': {
      transform: 'scale(1.05)',
      backgroundColor: status === 'unanswered' ? alpha(theme.palette.grey[500], 0.16) : undefined,
    },
  };
});

const OptionCard = styled(Box, {
  shouldForwardProp: (prop) => prop !== 'selected',
})<{ selected?: boolean }>(({ theme, selected }) => ({
  marginBottom: theme.spacing(2),
  padding: theme.spacing(2),
  borderRadius: (theme.shape.borderRadius as number) * 1.5,
  border: `1px solid ${selected ? theme.palette.primary.main : theme.palette.divider}`,
  backgroundColor: selected
    ? alpha(theme.palette.primary.main, 0.04)
    : theme.palette.background.paper,
  transition: 'all 0.2s ease-in-out',
  cursor: 'pointer',
  '&:hover': {
    borderColor: selected ? theme.palette.primary.main : theme.palette.grey[400],
    backgroundColor: selected
      ? alpha(theme.palette.primary.main, 0.06)
      : theme.palette.action.hover,
  },
}));

// QuestionList Component
const QuestionList = ({
  totalQuestions,
  currentQuestion,
  answeredQuestions,
  skippedQuestions,
  onQuestionSelect,
}: any) => {
  const theme = useTheme();

  const legends = [
    { label: 'Answered', color: theme.palette.success.main, count: answeredQuestions.length },
    { label: 'Skipped', color: theme.palette.warning.main, count: skippedQuestions.length },
    { label: 'Current', color: theme.palette.primary.main, count: 1 },
    {
      label: 'Not Visited',
      color: theme.palette.grey[300],
      count: totalQuestions - answeredQuestions.length - skippedQuestions.length - 1,
    },
  ];

  return (
    <StyledCard>
      <Box
        sx={{
          p: 3,
          borderBottom: `1px solid ${theme.palette.divider}`,
          bgcolor: alpha(theme.palette.primary.lighter, 0.2),
        }}
      >
        <Typography variant="h6" fontWeight={700} color="text.primary">
          Question Navigator
        </Typography>
      </Box>

      <Box sx={{ p: 3, flex: 1, overflowY: 'auto' }}>
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(40px, 1fr))',
            gap: 1,
          }}
        >
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

      <Divider />

      <Box sx={{ p: 3, bgcolor: 'background.neutral' }}>
        <Grid container spacing={1}>
          {legends.map((item) => (
            <Grid size={{ xs: 6 }}>
              <Stack direction="row" alignItems="center" spacing={1}>
                <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: item.color }} />
                <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                  {item.label}
                </Typography>
              </Stack>
            </Grid>
          ))}
        </Grid>
      </Box>
    </StyledCard>
  );
};

// QuestionDisplay Component
const QuestionDisplay = ({ question, onAnswer, currentAnswer, totalQuestions }: any) => {
  if (!question) return null;

  return (
    <StyledCard sx={{ p: 0 }}>
      {/* Header */}
      <Box
        sx={{
          p: 3,
          borderBottom: '1px solid',
          borderColor: 'divider',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          bgcolor: (theme) => alpha(theme.palette.primary.lighter, 0.1),
        }}
      >
        <Typography variant="h6" sx={{ color: 'primary.main', fontWeight: 800 }}>
          Question {String(question.questionNumber).padStart(2, '0')}
        </Typography>
        <Chip
          label={`Marks: ${question.marks}`}
          color="warning"
          variant="soft"
          size="small"
          sx={{ fontWeight: 700, borderRadius: 1 }}
        />
      </Box>

      <Box sx={{ p: 4 }}>
        <Typography variant="h5" gutterBottom sx={{ mb: 4, fontWeight: 500, lineHeight: 1.6 }}>
          {question.question}
        </Typography>

        <Box>
          {(() => {
            switch (question.questionType) {
              case 'multiple-choice':
                return (
                  <RadioGroup
                    value={currentAnswer || ''}
                    onChange={(e) => onAnswer(e.target.value)}
                  >
                    {question.options.map((option: any) => {
                      const isSelected = currentAnswer === option.value;
                      return (
                        <OptionCard
                          key={option.value}
                          selected={isSelected}
                          onClick={() => onAnswer(option.value)}
                        >
                          <FormControlLabel
                            value={option.value}
                            control={<Radio sx={{ display: 'none' }} />}
                            label={
                              <Stack direction="row" alignItems="center" spacing={1}>
                                <Box
                                  sx={{
                                    width: 24,
                                    height: 24,
                                    borderRadius: '50%',
                                    border: '2px solid',
                                    borderColor: isSelected ? 'primary.main' : 'text.disabled',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                  }}
                                >
                                  {isSelected && (
                                    <Box
                                      sx={{
                                        width: 12,
                                        height: 12,
                                        borderRadius: '50%',
                                        bgcolor: 'primary.main',
                                      }}
                                    />
                                  )}
                                </Box>
                                <Typography variant="body1" fontWeight={isSelected ? 600 : 400}>
                                  {option.label}
                                </Typography>
                              </Stack>
                            }
                            sx={{ m: 0, width: '100%' }}
                          />
                        </OptionCard>
                      );
                    })}
                  </RadioGroup>
                );
              case 'trueFalse':
                return (
                  <RadioGroup
                    value={currentAnswer || ''}
                    onChange={(e) => onAnswer(e.target.value)}
                  >
                    {['true', 'false'].map((value) => {
                      const isSelected = currentAnswer === value;
                      const label = value.charAt(0).toUpperCase() + value.slice(1);
                      return (
                        <OptionCard
                          key={value}
                          selected={isSelected}
                          onClick={() => onAnswer(value)}
                        >
                          <FormControlLabel
                            value={value}
                            control={<Radio sx={{ display: 'none' }} />}
                            label={
                              <Stack direction="row" alignItems="center" spacing={1}>
                                <Box
                                  sx={{
                                    width: 24,
                                    height: 24,
                                    borderRadius: '50%',
                                    border: '2px solid',
                                    borderColor: isSelected ? 'primary.main' : 'text.disabled',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                  }}
                                >
                                  {isSelected && (
                                    <Box
                                      sx={{
                                        width: 12,
                                        height: 12,
                                        borderRadius: '50%',
                                        bgcolor: 'primary.main',
                                      }}
                                    />
                                  )}
                                </Box>
                                <Typography variant="body1" fontWeight={isSelected ? 600 : 400}>
                                  {label}
                                </Typography>
                              </Stack>
                            }
                            sx={{ m: 0, width: '100%' }}
                          />
                        </OptionCard>
                      );
                    })}
                  </RadioGroup>
                );
              case 'shortAns':
                return (
                  <TextField
                    fullWidth
                    multiline
                    rows={6}
                    variant="outlined"
                    value={currentAnswer || ''}
                    placeholder="Type your answer here..."
                    onChange={(e) => onAnswer(e.target.value)}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        bgcolor: 'background.paper',
                        borderRadius: 2,
                      },
                    }}
                  />
                );
              case 'matchTheFollowing':
                return (
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    {question.pairs.map((pair: any, idx: number) => (
                      <Paper key={idx} variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
                        <Grid container alignItems="center" spacing={1}>
                          <Grid size={{ xs: 12, md: 4 }}>
                            <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                              {pair.left}
                            </Typography>
                          </Grid>
                          <Grid size={{ xs: 12, md: 1 }} sx={{ textAlign: 'center' }}>
                            <Iconify icon="eva:arrow-right-fill" sx={{ color: 'text.disabled' }} />
                          </Grid>
                          <Grid size={{ xs: 12, md: 7 }}>
                            <RadioGroup
                              row
                              value={currentAnswer?.[idx] || ''}
                              onChange={(e) => {
                                const newAnswers = Array.isArray(currentAnswer)
                                  ? [...currentAnswer]
                                  : [];
                                newAnswers[idx] = e.target.value;
                                onAnswer(newAnswers);
                              }}
                              sx={{ gap: 1 }}
                            >
                              {pair.rightOptions.map((option: string) => (
                                <FormControlLabel
                                  key={option}
                                  value={option}
                                  control={<Radio size="small" />}
                                  label={<Typography variant="body2">{option}</Typography>}
                                  sx={{
                                    m: 0,
                                    px: 1,
                                    py: 0.5,
                                    borderRadius: 1,
                                    border: '1px solid',
                                    borderColor: 'divider',
                                    '&:hover': { bgcolor: 'action.hover' },
                                  }}
                                />
                              ))}
                            </RadioGroup>
                          </Grid>
                        </Grid>
                      </Paper>
                    ))}
                  </Box>
                );
              default:
                return null;
            }
          })()}
        </Box>
      </Box>
    </StyledCard>
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
  <Stack
    direction="row"
    justifyContent="space-between"
    sx={{
      mt: 3,
      p: 2,
      bgcolor: 'background.paper',
      borderRadius: 2,
      boxShadow: (theme) => theme.customShadows?.z8 || 2,
    }}
  >
    <Box>
      {currentQuestion > 1 && (
        <Button
          variant="outlined"
          color="inherit"
          onClick={onBack}
          size="large"
          startIcon={<Iconify icon="eva:arrow-back-fill" />}
          sx={{ borderRadius: 1.5, px: 3 }}
        >
          Previous
        </Button>
      )}
    </Box>

    <Stack direction="row" spacing={1}>
      <Button
        size="large"
        color="warning"
        variant="soft"
        onClick={onSkip}
        startIcon={<Iconify icon={GlobalIcons.skipIcon} />}
        sx={{ borderRadius: 1.5, px: 3 }}
      >
        Skip
      </Button>

      {currentQuestion === totalQuestions ? (
        <Button
          size="large"
          variant="contained"
          color="primary"
          onClick={onSubmit}
          startIcon={<Iconify icon={GlobalIcons.submit} />}
          sx={{
            borderRadius: 1.5,
            px: 4,
            boxShadow: (theme) => theme.customShadows?.primary,
          }}
        >
          Submit Quiz
        </Button>
      ) : (
        <Button
          size="large"
          variant="contained"
          color="primary"
          onClick={onNext}
          endIcon={<Iconify icon="eva:arrow-forward-fill" />}
          sx={{
            borderRadius: 1.5,
            px: 4,
            boxShadow: (theme) => theme.customShadows?.primary,
          }}
        >
          Next
        </Button>
      )}
    </Stack>
  </Stack>
);

// Main Quiz Portal Component
const QuizPortal = ({ handleClose }: { handleClose: () => void }) => {
  const theme = useTheme();
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

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h > 0 ? `${h}:` : ''}${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return isLoading ? (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
      <Typography variant="h6" color="text.secondary">
        Loading Quiz...
      </Typography>
    </Box>
  ) : (
    <Box
      sx={{
        maxWidth: '1600px',
        margin: '0 auto',
        p: { xs: 2, md: 3 },
        minHeight: '100vh',
        bgcolor: 'background.default',
      }}
    >
      {/* Header Section */}
      <Paper
        elevation={0}
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          mb: 4,
          p: 2,
          pl: 3,
          pr: 3,
          bgcolor: 'background.paper',
          borderRadius: 3,
          borderBottom: `1px solid ${theme.palette.divider}`,
          boxShadow: theme.customShadows?.z1 || '0 1px 2px 0 rgba(0,0,0,0.05)',
        }}
      >
        <Box>
          <Typography variant="h4" fontWeight={800} sx={{ color: 'text.primary', mb: 0.5 }}>
            General Knowledge Quiz
          </Typography>
          <Stack direction="row" spacing={1}>
            <Typography variant="body2" color="text.secondary">
              Total Questions: {quizList.length}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              •
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Total Marks: {quizList.reduce((acc: any, curr: any) => acc + curr.marks, 0)}
            </Typography>
          </Stack>
        </Box>

        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            px: 2.5,
            py: 1,
            borderRadius: 50,
            bgcolor:
              timeLeft < 300
                ? alpha(theme.palette.error.main, 0.1)
                : alpha(theme.palette.primary.main, 0.1),
            color: timeLeft < 300 ? 'error.main' : 'primary.main',
            border: `1px solid ${timeLeft < 300 ? alpha(theme.palette.error.main, 0.3) : alpha(theme.palette.primary.main, 0.3)}`,
          }}
        >
          <Iconify icon="mdi:clock-outline" width={24} />
          <Typography variant="h6" fontWeight={700} sx={{ fontVariantNumeric: 'tabular-nums' }}>
            {formatTime(timeLeft)}
          </Typography>
        </Box>
      </Paper>

      <Grid container spacing={1}>
        <Grid size={{ xs: 12, md: 8, lg: 9 }}>
          <Stack spacing={1}>
            <QuestionDisplay
              question={{ ...quizList[currentQuestion - 1], questionNumber: currentQuestion }}
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

        <Grid size={{ xs: 12, md: 4, lg: 3 }}>
          <Box sx={{ position: { md: 'sticky' }, top: 24 }}>
            <QuestionList
              totalQuestions={quizList.length}
              currentQuestion={currentQuestion}
              answeredQuestions={answeredQuestions}
              skippedQuestions={skippedQuestions}
              onQuestionSelect={handleQuestionSelect}
            />
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};

export default QuizPortal;
