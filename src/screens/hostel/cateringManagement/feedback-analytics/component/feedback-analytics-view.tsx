import type { LabelColor } from 'src/components/label';

import React, { useState } from 'react';
import { Label } from 'src/components/label';
import { useTheme } from '@mui/material/styles';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { FeedBackStatusType, FeedBackStatusColors } from 'src/enums/meal-feedback-status';
import { AnalyticsCurrentVisits } from 'src/sections/overview/analytics/analytics-current-visits';
import {
  Box,
  Card,
  Grid,
  Accordion,
  Typography,
  AccordionDetails,
  AccordionSummary,
} from '@mui/material';

import type { IFeedbackDetailsViewDialogProps } from '../feedback-analytics-interface';

const FeedbackAnalyticsViewDialog: React.FC<IFeedbackDetailsViewDialogProps> = ({ data }) => {
  const theme = useTheme();
  const [expanded, setExpanded] = useState<number | false>(false);

  return (
    <Grid container spacing={2}>
      <Grid size={{ xs: 12, md: 6 }}>
        <Card sx={{ p: 2, boxShadow: 'var(--shadows-2)', height: '100%' }}>
          <AnalyticsCurrentVisits
            title="Aggregate Rating"
            chart={{
              series: [
                { label: 'Okay', value: data.howMuchOkay },
                { label: 'Bad', value: data.howMuchBad },
                { label: 'loved it', value: data.howMuchlovedIt },
                { label: 'Very Bad', value: data.howMuchVeryBad },
                { label: 'Superb', value: data.howMuchSuperb },
                { label: 'Amezing', value: data.howMuchAmezing },
              ],
            }}
            sx={{ boxShadow: 'none', height: '100%' }}
          />
        </Card>
      </Grid>

      <Grid size={{ xs: 12, md: 6 }}>
        {data.reviewBy.map((review, index) => (
          <Accordion
            key={index}
            expanded={expanded === index}
            onChange={(e, isExpanded) => setExpanded(isExpanded ? index : false)}
            sx={{
              boxShadow: 'none',
              color: theme.palette.text.secondary,
              fontSize: '14px',
              '&:before': { display: 'none' },
            }}
          >
            <AccordionSummary
              expandIcon={null} // handled manually
              sx={{
                borderBottom: `1px solid ${theme.palette.divider}`,
                borderLeft:
                  expanded === index
                    ? `2px solid ${theme.palette.primary.main}`
                    : `2px solid ${theme.palette.divider}`,
                bgcolor: 'inherit',
                '&.Mui-expanded': { minHeight: '40px' },
                '& .MuiAccordionSummary-content.Mui-expanded': { margin: '0' },
              }}
            >
              <Box display="flex" alignItems="center" justifyContent="space-between" width="100%">
                {/* Left side: title */}
                <Typography
                  variant="subtitle1"
                  sx={{
                    fontSize: '14px',
                    fontWeight:
                      expanded === index
                        ? theme.typography.fontWeightBold
                        : theme.typography.fontWeightMedium,
                    color: theme.palette.text.secondary,
                  }}
                >
                  {review.name}
                </Typography>

                {/* Right side: label + expand icon */}
                <Box display="flex" alignItems="center" gap={1}>
                  <Label
                    color={FeedBackStatusColors[review.status as FeedBackStatusType] as LabelColor}
                  >
                    {FeedBackStatusType[review.status]}
                  </Label>
                  <ExpandMoreIcon />
                </Box>
              </Box>
            </AccordionSummary>

            <AccordionDetails sx={{ padding: 3 }}>{review.message}</AccordionDetails>
          </Accordion>
        ))}
      </Grid>
    </Grid>
  );
};

export default FeedbackAnalyticsViewDialog;
