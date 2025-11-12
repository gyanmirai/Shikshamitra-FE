import React, { useState } from 'react';
import { varAlpha } from 'src/theme/styles';
import { Label } from 'src/components/label';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { Email, School, Numbers, LocalPhone, CalendarToday } from '@mui/icons-material';
import {
  Box,
  Grid,
  Accordion,
  Typography,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material'; // adjust import per your theme utils
import type { LabelColor } from 'src/components/label';

import { ChargesPaymentStatus, ChargesPaymentStatusColors } from 'src/enums/fee-charges-status';

const ChargeInformationAccordion = ({ charge }: any) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <Box
      sx={{
        transition: 'margin 0.3s ease',
      }}
    >
      <Accordion
        expanded={expanded}
        onChange={(e, isExpanded) => setExpanded(isExpanded)}
        sx={{
          borderRadius: 2,
          boxShadow: 2,

          overflow: 'hidden',
          '&:before': { display: 'none' },
        }}
      >
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          sx={{
            borderTopLeftRadius: 8,
            borderTopRightRadius: 8,
            '& .MuiAccordionSummary-content': {
              alignItems: 'center',
            },
          }}
        >
          <Typography variant="h6" color="primary.main">
            {charge?.studentName}&apos;s Information
          </Typography>
          <Box sx={{ ml: 'auto' }}>
            <Label
              color={
                ChargesPaymentStatusColors[charge?.status as ChargesPaymentStatus] as LabelColor
              }
            >
              {ChargesPaymentStatus[charge?.status as ChargesPaymentStatus]}
            </Label>
          </Box>
        </AccordionSummary>

        <AccordionDetails>
          <Box sx={{ borderRadius: 2, mb: 1 }}>
            <Grid container spacing={2}>
              {/* GR Number */}
              <Grid size={{ xs: 12, md: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Box
                    sx={{
                      width: 32,
                      height: 32,
                      borderRadius: '50%',
                      bgcolor: (theme) => varAlpha(theme.palette.primary.mainChannel, 0.15),
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: 2,
                    }}
                  >
                    <Numbers sx={{ color: 'primary.main', fontSize: 17 }} />
                  </Box>
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      GR No.
                    </Typography>
                    <Typography variant="body1" fontWeight="medium">
                      {charge?.grNo || 'GR2025-69145'}
                    </Typography>
                  </Box>
                </Box>
              </Grid>

              <Grid size={{ xs: 12, md: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Box
                    sx={{
                      width: 32,
                      height: 32,
                      borderRadius: '50%',
                      bgcolor: (theme) => varAlpha(theme.palette.primary.mainChannel, 0.15),
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: 2,
                    }}
                  >
                    <Numbers sx={{ color: 'primary.main', fontSize: 17 }} />
                  </Box>
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Roll No.
                    </Typography>
                    <Typography variant="body1" fontWeight="medium">
                      {charge?.rollNo || 'R2025-145'}
                    </Typography>
                  </Box>
                </Box>
              </Grid>
              <Grid size={{ xs: 12, md: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Box
                    sx={{
                      width: 32,
                      height: 32,
                      borderRadius: '50%',
                      bgcolor: (theme) => varAlpha(theme.palette.primary.mainChannel, 0.15),
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: 2,
                    }}
                  >
                    <CalendarToday sx={{ color: 'primary.main', fontSize: 17 }} />
                  </Box>
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Applied On
                    </Typography>
                    <Typography variant="body1" fontWeight="medium">
                      {charge?.appliedOn || '20-12-2025'}
                    </Typography>
                  </Box>
                </Box>
              </Grid>
              {/* Requested On */}
              <Grid size={{ xs: 12, md: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Box
                    sx={{
                      width: 32,
                      height: 32,
                      borderRadius: '50%',
                      bgcolor: (theme) => varAlpha(theme.palette.primary.mainChannel, 0.15),
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: 2,
                    }}
                  >
                    <CalendarToday sx={{ color: 'primary.main', fontSize: 17 }} />
                  </Box>
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Due Date
                    </Typography>
                    <Typography variant="body1" fontWeight="medium">
                      {charge?.dueDate || '20 Aug 2025'}
                    </Typography>
                  </Box>
                </Box>
              </Grid>

              {/* Class / Divisions */}
              <Grid size={{ xs: 12, md: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Box
                    sx={{
                      width: 32,
                      height: 32,
                      borderRadius: '50%',
                      bgcolor: (theme) => varAlpha(theme.palette.primary.mainChannel, 0.15),
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: 2,
                    }}
                  >
                    <School sx={{ color: 'primary.main', fontSize: 17 }} />
                  </Box>
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Class / Division
                    </Typography>
                    <Typography variant="body1" fontWeight="medium">
                      {`${charge?.class || '10'}-${charge?.division || 'A'}`}
                    </Typography>
                  </Box>
                </Box>
              </Grid>

              {/* Contact */}
              <Grid size={{ xs: 12, md: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Box
                    sx={{
                      width: 32,
                      height: 32,
                      borderRadius: '50%',
                      bgcolor: (theme) => varAlpha(theme.palette.primary.mainChannel, 0.15),
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: 2,
                    }}
                  >
                    <LocalPhone sx={{ color: 'primary.main', fontSize: 17 }} />
                  </Box>
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Contact
                    </Typography>
                    <Typography variant="body1" fontWeight="medium">
                      {charge?.contact || '+91 98765 43210'}
                    </Typography>
                  </Box>
                </Box>
              </Grid>

              {/* Email */}
              <Grid size={{ xs: 12, md: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Box
                    sx={{
                      width: 32,
                      height: 32,
                      borderRadius: '50%',
                      bgcolor: (theme) => varAlpha(theme.palette.primary.mainChannel, 0.15),
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: 2,
                    }}
                  >
                    <Email sx={{ color: 'primary.main', fontSize: 18 }} /> {/* keep same */}
                  </Box>

                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Email
                    </Typography>
                    <Typography variant="body1" fontWeight="medium">
                      {charge?.email || 'aarya.mehta@example.com'}
                    </Typography>
                  </Box>
                </Box>
              </Grid>
            </Grid>
          </Box>
        </AccordionDetails>
      </Accordion>
    </Box>
  );
};

export default ChargeInformationAccordion;
