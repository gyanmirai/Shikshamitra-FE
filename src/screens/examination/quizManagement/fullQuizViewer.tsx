'use client';

import React, { useState } from 'react';

import {
  Box,
  Card,
  Radio,
  Button,
  TextField,
  CardHeader,
  Typography,
  RadioGroup,
  CardContent,
  FormControl,
  DialogActions,
  FormControlLabel,
} from '@mui/material';

import { Scrollbar } from 'src/components/scrollbar';

const FullQuizViewer = ({ quizData, onSubmit }: any) => {
  const [answers, setAnswers] = useState({});
  console.log('FullQuizViewer-------');

  const handleAnswerChange = (questionId: any, value: any) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: value,
    }));
  };

  const handleSubmit = () => {
    const unansweredRequired = quizData.filter((q) => q.isRequired && !answers[q.question]);

    if (unansweredRequired.length > 0) {
      alert('Please answer all required questions before submitting.');
      return;
    }

    if (onSubmit) {
      onSubmit(answers);
    }
  };

  const renderQuestionContent = (questionData: any) => {
    const { question, questionType, options } = questionData;

    switch (questionType) {
      case 'multiple-choice':
        return (
          <FormControl component="fieldset" fullWidth>
            <RadioGroup
              value={answers[question] || ''}
              onChange={(e) => handleAnswerChange(question, e.target.value)}
            >
              {options.map((option: any, index: any) => (
                <FormControlLabel
                  key={index}
                  value={option.value}
                  control={<Radio />}
                  label={option.label}
                />
              ))}
            </RadioGroup>
          </FormControl>
        );

      case 'trueFalse':
        return (
          <FormControl component="fieldset" fullWidth>
            <RadioGroup
              value={answers[question] || ''}
              onChange={(e) => handleAnswerChange(question, e.target.value)}
            >
              <FormControlLabel value="true" control={<Radio />} label="True" />
              <FormControlLabel value="false" control={<Radio />} label="False" />
            </RadioGroup>
          </FormControl>
        );

      case 'shortAns':
        return (
          <TextField
            fullWidth
            multiline
            rows={3}
            variant="outlined"
            placeholder="Type your answer here..."
            value={answers[question] || ''}
            onChange={(e) => handleAnswerChange(question, e.target.value)}
          />
        );

      default:
        return <Typography color="error">Invalid question type</Typography>;
    }
  };

  return (
    <Box p={3}>
      <Box display="flex" justifyContent="space-between" alignItems="center">
        {/* Left Side */}
        <Box display="flex" flexDirection="column" alignItems="flex-right">
          <Typography variant="caption">
            <b>Quiz Time </b>: 00:00:30
          </Typography>
          <Typography variant="caption">
            <b>Total Marks </b>: 15
          </Typography>
        </Box>

        {/* Right Side */}
        <Box display="flex" flexDirection="column" alignItems="flex-end">
          <Typography variant="caption">
            <b>Due: </b> 01-12-2025, 11:00
          </Typography>
          <Typography variant="caption" color="primary">
            <b>00:00:30 remaining</b>
          </Typography>
        </Box>
      </Box>

      <Scrollbar sx={{ mt: 1.5, height: '550px' }}>
        <Box sx={{ mt: 2 }}>
          {quizData.map((questionData: any, index: any) => (
            <Card key={index} sx={{ mb: 1 }}>
              <CardHeader
                title={
                  <Box display="flex" justifyContent="space-between" alignItems="center">
                    {/* Question on the left */}
                    <Box display="flex" alignItems="flex-start">
                      <Typography variant="body1" component="span" sx={{ mr: 1 }}>
                        {index + 1}.
                      </Typography>
                      <Typography variant="body1" component="span">
                        {questionData.question}
                        {questionData.isRequired && (
                          <Typography component="span" color="error" sx={{ ml: 0.5 }}>
                            *
                          </Typography>
                        )}
                      </Typography>
                    </Box>

                    {/* Marks on the right */}
                    {questionData.marks && (
                      <Typography variant="caption" color="primary" sx={{ fontWeight: 'bold' }}>
                        {questionData.marks} Point
                      </Typography>
                    )}
                  </Box>
                }
              />
              <CardContent>{renderQuestionContent(questionData)}</CardContent>
            </Card>
          ))}
        </Box>
      </Scrollbar>

      <DialogActions sx={{ justifyContent: 'flex-end' }}>
        <Button variant="outlined" onClick={() => {}}>
          Cancel
        </Button>
        <Button variant="contained" onClick={handleSubmit}>
          Submit
        </Button>
      </DialogActions>
    </Box>
  );
};

export default FullQuizViewer;
