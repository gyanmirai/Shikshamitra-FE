'use client';

import { Box, Chip, Typography } from '@mui/material';

import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';

import { DetailRow } from '../announcement/schoolWiseAnnounsement';

const SurveyDetailsView = ({ survey }: any) => (
  <Box>
    <Scrollbar sx={{ height: '400px' }}>
      <Box sx={{ mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
        <Iconify icon="mdi:poll" className="text-gray-500 w-6 h-6" />
        <Typography variant="h6" className="font-semibold">
          {survey?.surveyTitle}
        </Typography>
      </Box>

      <hr className="my-6 border-gray-200" />

      <DetailRow
        label="Description"
        icon="mdi:text-box-outline"
        value={
          <Typography variant="body2" className="text-gray-700">
            {survey?.description}
          </Typography>
        }
      />

      <DetailRow
        label="Organizations"
        icon="mdi:office-building-outline"
        value={
          <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
            {survey?.organization?.map((org: string) => (
              <Chip key={org} label={org} size="small" variant="outlined" />
            ))}
          </Box>
        }
      />

      <DetailRow
        label="Target Audience"
        icon="mdi:account-group-outline"
        value={
          <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
            {survey?.audience?.map((aud: string) => (
              <Chip key={aud} label={aud} size="small" variant="outlined" />
            ))}
          </Box>
        }
      />

      <DetailRow
        label="Classes"
        icon="mdi:school-outline"
        value={
          <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
            {survey?.className?.map((cls: string) => (
              <Chip key={cls} label={cls} size="small" variant="outlined" />
            ))}
          </Box>
        }
      />

      <Box className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        <DetailRow
          label="Start Date"
          icon="mdi:calendar-outline"
          value={
            <Typography variant="body2" className="text-gray-700">
              {survey?.startDate ? new Date(survey.startDate).toLocaleString() : 'Not set'}
            </Typography>
          }
        />

        <DetailRow
          label="End Date"
          icon="mdi:calendar-clock-outline"
          value={
            <Typography variant="body2" className="text-gray-700">
              {survey?.endDate ? new Date(survey.endDate).toLocaleString() : 'Not set'}
            </Typography>
          }
        />

        <DetailRow
          label="Status"
          icon="mdi:information-outline"
          value={
            <Typography
              component="span"
              variant="body2"
              className={`px-3 py-1 rounded-full ${
                survey?.status === 'Active'
                  ? 'bg-green-50 text-green-600 border border-green-200'
                  : survey?.status === 'Upcoming'
                    ? 'bg-blue-50 text-blue-600 border border-blue-200'
                    : survey?.status === 'Completed'
                      ? 'bg-gray-50 text-gray-600 border border-gray-200'
                      : 'bg-yellow-50 text-yellow-600 border border-yellow-200'
              }`}
            >
              {survey?.status || 'Draft'}
            </Typography>
          }
        />
      </Box>

      {survey?.questions && survey.questions.length > 0 && (
        <DetailRow
          label="Questions"
          icon="mdi:help-circle-outline"
          value={
            <Box sx={{ mt: 1 }}>
              {survey.questions.map((question: any, index: number) => (
                <Box
                  key={index}
                  sx={{
                    mb: 3,
                    p: 2,
                    borderRadius: 1,
                    border: '1px solid',
                    borderColor: 'divider',
                  }}
                >
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="subtitle2">
                      {index + 1}. {question.question}
                    </Typography>
                    <Chip
                      label={question.questionType}
                      color="primary"
                      variant="outlined"
                      size="small"
                      sx={{ textTransform: 'capitalize' }}
                    />
                  </Box>

                  {question.questionType === 'multiple-choice' && question.options.length > 0 && (
                    <Box sx={{ ml: 2 }}>
                      <Typography variant="caption" color="text.secondary" sx={{ mb: 1 }}>
                        Options:
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                        {question.options.map((option: string, optIndex: number) => (
                          <Chip
                            key={optIndex}
                            label={option}
                            size="small"
                            variant="outlined"
                            sx={{ mb: 0.5 }}
                          />
                        ))}
                      </Box>
                    </Box>
                  )}

                  <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                    <Typography variant="caption" color="text.secondary">
                      Required:
                    </Typography>
                    {question.isRequired ? (
                      <Iconify icon="mdi:check-circle" color="success.main" sx={{ ml: 0.5 }} />
                    ) : (
                      <Iconify
                        icon="mdi:close-circle-outline"
                        color="text.secondary"
                        sx={{ ml: 0.5 }}
                      />
                    )}
                  </Box>
                </Box>
              ))}
            </Box>
          }
        />
      )}

      {survey?.responses && (
        <DetailRow
          label="Response Stats"
          icon="mdi:chart-bar"
          value={
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              <Box
                sx={{
                  p: 1.5,
                  borderRadius: 1,
                  bgcolor: 'background.neutral',
                  textAlign: 'center',
                  minWidth: 100,
                }}
              >
                <Typography variant="h6" color="primary.main">
                  {survey.responses?.total || 0}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Total Responses
                </Typography>
              </Box>
              <Box
                sx={{
                  p: 1.5,
                  borderRadius: 1,
                  bgcolor: 'background.neutral',
                  textAlign: 'center',
                  minWidth: 100,
                }}
              >
                <Typography variant="h6" color="success.main">
                  {survey.responses?.completed || 0}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Completed
                </Typography>
              </Box>
              <Box
                sx={{
                  p: 1.5,
                  borderRadius: 1,
                  bgcolor: 'background.neutral',
                  textAlign: 'center',
                  minWidth: 100,
                }}
              >
                <Typography variant="h6" color="warning.main">
                  {survey.responses?.partial || 0}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Partial
                </Typography>
              </Box>
            </Box>
          }
        />
      )}
    </Scrollbar>
  </Box>
);

export default SurveyDetailsView;
