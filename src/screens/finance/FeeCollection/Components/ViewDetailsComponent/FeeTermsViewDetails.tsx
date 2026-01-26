// import { useTheme } from '@mui/material/styles';
import { Scrollbar } from 'src/components/scrollbar';
import { alpha, useTheme } from '@mui/material/styles';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { Label, type LabelColor } from 'src/components/label';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import {
  FeeCollectionStatusType,
  FeeCollectionStatusTypeColors,
} from 'src/enums/fee-collection-type';
import {
  Box,
  Card,
  Paper,
  Table,
  Stack,
  Divider,
  TableRow,
  Accordion,
  TableHead,
  TableCell,
  TableBody,
  Typography,
  TableContainer,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';

import feeCollectionData from '../../../../../../financeFeeCollection.json';

export const FeeTermAccordion = () => {
  // Mocking the API call
  // const { data: terms, isLoading } = useQueryAndMutation({
  //   type: 'query',
  //   currentQueryAndMutation: useGetFeeTermsQuery,
  // });
  const theme = useTheme();

  // if (isLoading) {
  //   return (
  //     <Box
  //       sx={{
  //         mt: 2,
  //         display: 'flex',
  //         justifyContent: 'center',
  //         alignItems: 'center',
  //         height: 120,
  //       }}
  //     >
  //       <Box className="loader" height={24} />
  //     </Box>
  //   );
  // }

  return (
    <Card
      sx={{
        p: 0,
        borderRadius: 2,
        boxShadow: theme.shadows[2],
        border: 'none',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}
    >
      <Box
        sx={{
          p: 3,
          pb: 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: `1px dashed ${theme.palette.divider}`,
        }}
      >
        <Typography variant="h6" fontWeight={700}>
          Fee Term Breakdown
        </Typography>
        <Label color="info" variant="soft">
          {feeCollectionData?.terms.length} Terms
        </Label>
      </Box>

      <Scrollbar
        sx={{
          flexGrow: 1,
          maxHeight: 500,
          p: 2,
          bgcolor: alpha(theme.palette.background.neutral, 0.4),
        }}
      >
        <Stack spacing={2}>
          {feeCollectionData?.terms.map((term: any) => {
            const pending = term.total - term.paid;

            return (
              <Accordion
                key={term.id}
                disableGutters
                sx={{
                  borderRadius: 2,
                  bgcolor: 'background.paper',
                  boxShadow: theme.shadows[1],
                  '&:before': { display: 'none' },
                  overflow: 'hidden',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    boxShadow: theme.shadows[4],
                  },
                  '&.Mui-expanded': {
                    margin: 0,
                    boxShadow: theme.shadows[8],
                  },
                }}
              >
                {/* ---------- TERM HEADER ---------- */}
                <AccordionSummary
                  expandIcon={<ExpandMoreIcon sx={{ color: 'text.secondary' }} />}
                  sx={{
                    px: 2.5,
                    py: 1,
                    '& .MuiAccordionSummary-content': {
                      margin: '12px 0',
                      flexWrap: 'wrap',
                      gap: 2,
                      alignItems: 'center',
                    },
                    '&:hover': {
                      bgcolor: alpha(theme.palette.primary.main, 0.02),
                    },
                  }}
                >
                  <Stack
                    direction={{ xs: 'column', sm: 'row' }}
                    alignItems={{ xs: 'flex-start', sm: 'center' }}
                    spacing={2}
                    flex={1}
                  >
                    {/* Term Info */}
                    <Box flexGrow={1}>
                      <Typography variant="subtitle1" fontWeight={700}>
                        {term.name}
                      </Typography>
                      <Stack direction="row" alignItems="center" spacing={0.5} mt={0.5}>
                        <CalendarTodayIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
                        <Typography variant="caption" color="text.secondary" fontWeight={500}>
                          Due: {term.dueDate}
                        </Typography>
                      </Stack>
                    </Box>

                    {/* Stats */}
                    <Stack
                      direction="row"
                      divider={
                        <Divider
                          orientation="vertical"
                          flexItem
                          sx={{ height: 24, alignSelf: 'center' }}
                        />
                      }
                      spacing={2}
                      alignItems="center"
                      sx={{
                        bgcolor: alpha(theme.palette.background.neutral, 0.7),
                        p: 1,
                        borderRadius: 1.5,
                      }}
                    >
                      <Box textAlign="center" minWidth={80}>
                        <Typography variant="caption" display="block" color="text.secondary">
                          Total
                        </Typography>
                        <Typography variant="subtitle2" fontWeight={700}>
                          ₹{term.total.toLocaleString()}
                        </Typography>
                      </Box>

                      <Box textAlign="center" minWidth={80}>
                        <Typography variant="caption" display="block" color="text.secondary">
                          Paid
                        </Typography>
                        <Typography variant="subtitle2" color="success.main" fontWeight={700}>
                          ₹{term.paid.toLocaleString()}
                        </Typography>
                      </Box>

                      <Box textAlign="center" minWidth={80}>
                        <Typography variant="caption" display="block" color="text.secondary">
                          Pending
                        </Typography>
                        <Typography variant="subtitle2" color="warning.main" fontWeight={700}>
                          ₹{pending.toLocaleString()}
                        </Typography>
                      </Box>
                    </Stack>

                    {/* Status */}
                    <Box>
                      <Label
                        variant="soft"
                        color={
                          FeeCollectionStatusTypeColors[
                            term.status as FeeCollectionStatusType
                          ] as LabelColor
                        }
                      >
                        {FeeCollectionStatusType[term.status as FeeCollectionStatusType]}
                      </Label>
                    </Box>
                  </Stack>
                </AccordionSummary>

                {/* ---------- CONTENT ---------- */}
                <AccordionDetails sx={{ p: 0, borderTop: `1px solid ${theme.palette.divider}` }}>
                  <Box sx={{ p: 2, bgcolor: alpha(theme.palette.primary.main, 0.01) }}>
                    <Stack spacing={3}>
                      {/* FEE HEADS */}
                      <Box>
                        <Typography
                          variant="overline"
                          color="text.secondary"
                          sx={{ mb: 1.5, display: 'block', letterSpacing: 1.1, fontWeight: 700 }}
                        >
                          Fee Head Maintenance
                        </Typography>

                        <TableContainer
                          component={Paper}
                          elevation={0}
                          sx={{
                            borderRadius: 1.5,
                            border: `1px solid ${alpha(theme.palette.divider, 0.6)}`,
                            overflow: 'hidden',
                          }}
                        >
                          <Table size="small">
                            <TableHead sx={{ bgcolor: 'background.neutral' }}>
                              <TableRow>
                                <TableCell sx={{ color: 'text.secondary', fontWeight: 600 }}>
                                  Fee Head
                                </TableCell>
                                <TableCell sx={{ color: 'text.secondary', fontWeight: 600 }}>
                                  Category
                                </TableCell>
                                <TableCell
                                  align="right"
                                  sx={{ color: 'text.secondary', fontWeight: 600 }}
                                >
                                  Pending
                                </TableCell>
                                <TableCell
                                  align="right"
                                  sx={{ color: 'text.secondary', fontWeight: 600 }}
                                >
                                  Paid
                                </TableCell>
                                <TableCell
                                  align="center"
                                  sx={{ color: 'text.secondary', fontWeight: 600 }}
                                >
                                  Status
                                </TableCell>
                              </TableRow>
                            </TableHead>

                            <TableBody>
                              {term.feeHeads.map((head: any, index: number) => (
                                <TableRow
                                  key={index}
                                  hover
                                  sx={{
                                    '&:last-child td, &:last-child th': { border: 0 },
                                    transition: 'all 0.2s',
                                  }}
                                >
                                  <TableCell sx={{ fontWeight: 500 }}>{head.name}</TableCell>
                                  <TableCell sx={{ color: 'text.secondary' }}>
                                    {head.category}
                                  </TableCell>
                                  <TableCell
                                    align="right"
                                    sx={{ color: 'warning.dark', fontWeight: 600 }}
                                  >
                                    ₹{(head.total - head.paid).toLocaleString()}
                                  </TableCell>
                                  <TableCell
                                    align="right"
                                    sx={{ color: 'success.dark', fontWeight: 600 }}
                                  >
                                    ₹{head.paid?.toLocaleString()}
                                  </TableCell>
                                  <TableCell align="center">
                                    <Label
                                      variant="filled" // Changed to filled for contrast on white
                                      color={
                                        FeeCollectionStatusTypeColors[
                                          head.status as FeeCollectionStatusType
                                        ] as LabelColor
                                      }
                                      sx={{ fontSize: 11, height: 20 }}
                                    >
                                      {
                                        FeeCollectionStatusType[
                                          head.status as FeeCollectionStatusType
                                        ]
                                      }
                                    </Label>
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </TableContainer>
                      </Box>

                      {/* CHARGES */}
                      {term.charges?.length > 0 && (
                        <Box>
                          <Typography
                            variant="overline"
                            color="text.secondary"
                            sx={{ mb: 1.5, display: 'block', letterSpacing: 1.1, fontWeight: 700 }}
                          >
                            Additional Charges
                          </Typography>

                          <TableContainer
                            component={Paper}
                            elevation={0}
                            sx={{
                              borderRadius: 1.5,
                              border: `1px solid ${alpha(theme.palette.divider, 0.6)}`,
                              overflow: 'hidden',
                            }}
                          >
                            <Table size="small">
                              <TableHead sx={{ bgcolor: 'background.neutral' }}>
                                <TableRow>
                                  <TableCell sx={{ color: 'text.secondary', fontWeight: 600 }}>
                                    Charge
                                  </TableCell>
                                  <TableCell sx={{ color: 'text.secondary', fontWeight: 600 }}>
                                    Due Date
                                  </TableCell>
                                  <TableCell
                                    align="right"
                                    sx={{ color: 'text.secondary', fontWeight: 600 }}
                                  >
                                    Pending
                                  </TableCell>
                                  <TableCell
                                    align="right"
                                    sx={{ color: 'text.secondary', fontWeight: 600 }}
                                  >
                                    Paid
                                  </TableCell>
                                  <TableCell
                                    align="center"
                                    sx={{ color: 'text.secondary', fontWeight: 600 }}
                                  >
                                    Status
                                  </TableCell>
                                </TableRow>
                              </TableHead>
                              <TableBody>
                                {term.charges.map((cha: any) => (
                                  <TableRow
                                    key={cha.id}
                                    hover
                                    sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                                  >
                                    <TableCell sx={{ fontWeight: 500 }}>{cha.name}</TableCell>
                                    <TableCell sx={{ color: 'text.secondary' }}>
                                      {cha.dueDate}
                                    </TableCell>
                                    <TableCell
                                      align="right"
                                      sx={{ color: 'warning.dark', fontWeight: 600 }}
                                    >
                                      ₹{(cha.total - cha.paid).toLocaleString()}
                                    </TableCell>
                                    <TableCell
                                      align="right"
                                      sx={{ color: 'success.dark', fontWeight: 600 }}
                                    >
                                      ₹{cha.paid.toLocaleString()}
                                    </TableCell>
                                    <TableCell align="center">
                                      <Label
                                        variant="filled"
                                        color={
                                          FeeCollectionStatusTypeColors[
                                            cha.status as FeeCollectionStatusType
                                          ] as LabelColor
                                        }
                                        sx={{ fontSize: 11, height: 20 }}
                                      >
                                        {
                                          FeeCollectionStatusType[
                                            cha.status as FeeCollectionStatusType
                                          ]
                                        }
                                      </Label>
                                    </TableCell>
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                          </TableContainer>
                        </Box>
                      )}
                    </Stack>
                  </Box>
                </AccordionDetails>
              </Accordion>
            );
          })}
        </Stack>
      </Scrollbar>
    </Card>
  );
};
