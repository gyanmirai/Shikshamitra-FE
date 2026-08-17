'use client';

import React, { useState } from 'react';
import { Iconify } from 'src/components/iconify';
import { Box, Card, Stack, Typography, LinearProgress, Chip, Button } from '@mui/material';

import { Academic360EmptyState } from './Academic360EmptyState';

import type { Academic360SubjectPerformance } from '../types';

type SubjectPerformanceCardProps = {
  subjectPerformance?: Academic360SubjectPerformance[];
};

const getStatusTier = (average: number) => {
  if (average >= 75) {
    return { label: 'Strong', color: 'success' as const, barColor: 'success' as const };
  }
  if (average >= 60) {
    return { label: 'On Track', color: 'info' as const, barColor: 'primary' as const };
  }
  if (average >= 40) {
    return { label: 'Monitoring', color: 'warning' as const, barColor: 'warning' as const };
  }
  return { label: 'Needs Attention', color: 'error' as const, barColor: 'error' as const };
};

const getSubjectIcon = (name?: string) => {
  const n = (name || '').toLowerCase();
  if (n.includes('math')) return 'mdi:calculator-variant-outline';
  if (n.includes('sci') || n.includes('physic') || n.includes('chem') || n.includes('bio')) return 'mdi:flask-outline';
  if (n.includes('eng') || n.includes('lang') || n.includes('hindi') || n.includes('marathi') || n.includes('sanskrit')) return 'mdi:book-open-page-variant-outline';
  if (n.includes('hist') || n.includes('geo') || n.includes('social') || n.includes('civic')) return 'mdi:earth';
  if (n.includes('pt') || n.includes('sport') || n.includes('phys')) return 'mdi:run-fast';
  if (n.includes('art') || n.includes('craft') || n.includes('music')) return 'mdi:palette-outline';
  if (n.includes('comp') || n.includes('code') || n.includes('it')) return 'mdi:laptop';
  return 'mdi:book-outline';
};

export function SubjectPerformanceCard({ subjectPerformance = [] }: SubjectPerformanceCardProps) {
  const [showAll, setShowAll] = useState(false);

  const displayedSubjects = showAll ? subjectPerformance : subjectPerformance.slice(0, 6);

  return (
    <Card variant="outlined" sx={{ p: 2, borderRadius: 2, height: '100%' }}>
      <Stack spacing={2}>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Stack direction="row" spacing={1.25} alignItems="center">
            <Box
              sx={{
                width: 34,
                height: 34,
                borderRadius: 1.5,
                display: 'grid',
                placeItems: 'center',
                bgcolor: (theme) => `${theme.palette.primary.main}14`,
                color: 'primary.main',
              }}
            >
              <Iconify icon="mdi:chart-box-outline" width={20} />
            </Box>
            <Box>
              <Typography variant="subtitle1" fontWeight={700}>
                Subject Performance
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Cumulative averages and assessment counts across subjects
              </Typography>
            </Box>
          </Stack>

          {subjectPerformance.length > 0 && (
            <Chip
              size="small"
              variant="soft"
              color="default"
              label={`${subjectPerformance.length} Subjects`}
              sx={{ fontWeight: 600, fontSize: 11 }}
            />
          )}
        </Stack>

        {subjectPerformance.length > 0 ? (
          <Box>
            <Box
              sx={{
                maxHeight: showAll ? 380 : 'none',
                overflowY: showAll ? 'auto' : 'visible',
                pr: showAll ? 0.5 : 0,
              }}
            >
              <Stack spacing={1.5}>
                {displayedSubjects.map((subject) => {
                  const avg = Math.round(subject.averagePercentage || 0);
                  const examCount = subject.examCount || 0;
                  const tier = getStatusTier(avg);
                  const icon = getSubjectIcon(subject.subjectName);

                  return (
                    <Box
                      key={subject.subjectId || subject.subjectName}
                      sx={{
                        p: 1.5,
                        borderRadius: 1.5,
                        border: 1,
                        borderColor: 'divider',
                        bgcolor: 'background.paper',
                        transition: 'all 0.15s ease',
                        '&:hover': {
                          bgcolor: (theme) => `${theme.palette.action.hover}`,
                          borderColor: 'primary.light',
                        },
                      }}
                    >
                      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
                        <Stack direction="row" spacing={1} alignItems="center" sx={{ minWidth: 0, flex: 1 }}>
                          <Box
                            sx={{
                              width: 28,
                              height: 28,
                              borderRadius: 1,
                              display: 'grid',
                              placeItems: 'center',
                              bgcolor: (theme) => `${theme.palette.grey[500]}12`,
                              color: 'text.secondary',
                              flexShrink: 0,
                            }}
                          >
                            <Iconify icon={icon} width={16} />
                          </Box>
                          <Typography variant="subtitle2" fontWeight={600} noWrap>
                            {subject.subjectName}
                          </Typography>
                          {subject.latestGrade && (
                            <Chip
                              size="small"
                              label={`Grade ${subject.latestGrade}`}
                              variant="soft"
                              color="default"
                              sx={{ height: 20, fontSize: 10, fontWeight: 700 }}
                            />
                          )}
                        </Stack>

                        <Stack direction="row" spacing={1} alignItems="center" flexShrink={0}>
                          <Typography variant="caption" color="text.secondary">
                            {examCount} {examCount === 1 ? 'assessment' : 'assessments'}
                          </Typography>
                          <Typography variant="subtitle2" fontWeight={700} sx={{ minWidth: 40, textAlign: 'right' }}>
                            {avg}%
                          </Typography>
                          <Chip
                            size="small"
                            variant="soft"
                            color={tier.color}
                            label={tier.label}
                            sx={{ height: 22, fontSize: 11, fontWeight: 600 }}
                          />
                        </Stack>
                      </Stack>

                      <LinearProgress
                        variant="determinate"
                        value={avg}
                        color={tier.barColor}
                        sx={{
                          height: 6,
                          borderRadius: 1,
                          bgcolor: (theme) => `${theme.palette.grey[500]}1A`,
                        }}
                      />
                    </Box>
                  );
                })}
              </Stack>
            </Box>

            {subjectPerformance.length > 6 && (
              <Box sx={{ pt: 1.5, textAlign: 'center' }}>
                <Button
                  size="small"
                  variant="text"
                  onClick={() => setShowAll((prev) => !prev)}
                  endIcon={<Iconify icon={showAll ? 'mdi:chevron-up' : 'mdi:chevron-down'} />}
                  sx={{ textTransform: 'none', fontWeight: 600 }}
                >
                  {showAll ? 'Show Fewer Subjects' : `View All (${subjectPerformance.length}) Subjects`}
                </Button>
              </Box>
            )}
          </Box>
        ) : (
          <Academic360EmptyState
            icon="mdi:chart-box-outline"
            color="info"
            title="No subject assessment data yet"
            description="Subject-wise performance averages and grade distributions will appear here after marks are evaluated."
            compact
          />
        )}
      </Stack>
    </Card>
  );
}

