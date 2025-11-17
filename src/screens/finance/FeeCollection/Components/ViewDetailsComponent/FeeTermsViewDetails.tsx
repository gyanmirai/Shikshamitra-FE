import type { LabelColor } from 'src/components/label';

import { Label } from 'src/components/label';
import { useTheme } from '@mui/material/styles';
import { Scrollbar } from 'src/components/scrollbar';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { useGetFeeTermsQuery } from 'src/redux/feeCollection/feeTerms';
import {
  FeeCollectionStatusType,
  FeeCollectionStatusTypeColors,
} from 'src/enums/fee-collection-type';
import {
  Box,
  Chip,
  Card,
  Paper,
  Table,
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

const getStatusChip = (paid: number, total: number) => {
  if (paid === 0) return <Chip label="Pending" color="warning" size="small" />;
  if (paid < total) return <Chip label="Partially Paid" color="warning" size="small" />;
  if (paid === total) return <Chip label="Paid" color="success" size="small" />;
  return null;
};

export const FeeTermAccordion = () => {
  const { data: terms, isLoading } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetFeeTermsQuery,
  });
  const theme = useTheme();

  if (isLoading) {
    return (
      <Box
        sx={{ mt: 2, display: 'flex', justifyContent: 'center', alignItems: 'center', height: 120 }}
      >
        <Box className="loader" height={24} />
      </Box>
    );
  }

  return (
    <Card
      sx={{
        p: 1.5,
        borderRadius: 1,
        boxShadow: 'var(--shadows-8)',
        bgcolor: theme.vars.palette.background.paper,
        height: '100%',
      }}
    >
      <Typography variant="h6" color="primary.main">
        Fee Term Breakdown
      </Typography>

      <Scrollbar sx={{ height: '300px', p: 1 }}>
        {terms.map((term: any) => {
          const pending = term.total - term.paid;

          return (
            <Accordion
              key={term.id}
              sx={{
                borderRadius: 1,
                boxShadow: 2,
                mb: 2,
                bgcolor: 'background.paper',
                '&:before': {
                  display: 'none', // <<< remove the top border line
                },
              }}
            >
              {/* ---------- TERM HEADER ---------- */}
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Box flex={1}>
                  <Typography fontWeight={700}>{term.name}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Due Date: {term.dueDate}
                  </Typography>
                </Box>

                {/* Totals */}
                <Box display="flex" alignItems="center" justifyContent="space-between" gap={2}>
                  <Box display="flex" alignItems="center" gap={2}>
                    <Box>
                      <Typography variant="body2">
                        Total : <strong>₹ {term.total.toLocaleString()}</strong>
                      </Typography>
                    </Box>
                    <Divider orientation="vertical" flexItem />
                    <Box>
                      <Typography variant="body2" color="success.main">
                        Paid : <strong>₹ {term.paid.toLocaleString()}</strong>
                      </Typography>
                    </Box>
                    <Divider orientation="vertical" flexItem />
                    <Box>
                      <Typography variant="body2" color="error.main">
                        Pending : <strong>₹ {pending.toLocaleString()}</strong>
                      </Typography>
                    </Box>
                  </Box>

                  {/* Status chip */}
                  <Label
                    color={
                      FeeCollectionStatusTypeColors[
                        term.status as FeeCollectionStatusType
                      ] as LabelColor
                    }
                  >
                    {FeeCollectionStatusType[term.status as FeeCollectionStatusType]}
                  </Label>
                </Box>
              </AccordionSummary>

              {/* ---------- CONTENT ---------- */}
              <AccordionDetails>
                <Typography variant="h6" color="primary.main" mb={1}>
                  Fee Head Breakdown
                </Typography>

                {/* FEE HEADS LIST */}
                <TableContainer component={Paper} elevation={0}>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 700 }}>Fee Head</TableCell>
                        <TableCell sx={{ fontWeight: 700 }}>Category</TableCell>
                        <TableCell sx={{ fontWeight: 700 }}>Pending</TableCell>
                        <TableCell sx={{ fontWeight: 700 }}>Paid</TableCell>
                        <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                      </TableRow>
                    </TableHead>

                    <TableBody>
                      {term.feeHeads.map((head: any) => (
                        <TableRow key={head.name}>
                          <TableCell>{head.name}</TableCell>
                          <TableCell>{head.category}</TableCell>
                          <TableCell>₹ {(head.total - head.paid).toLocaleString()}</TableCell>
                          <TableCell>₹ {head.paid?.toLocaleString()}</TableCell>

                          <TableCell>
                            <Label
                              color={
                                FeeCollectionStatusTypeColors[
                                  head.status as FeeCollectionStatusType
                                ] as LabelColor
                              }
                            >
                              {FeeCollectionStatusType[head.status as FeeCollectionStatusType]}
                            </Label>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>

                {/* ---------- CHARGES ---------- */}
                {term.charges?.length > 0 && (
                  <>
                    <Typography
                      variant="subtitle1"
                      fontWeight={600}
                      color="primary.main"
                      mt={2}
                      mb={1}
                    >
                      Charges
                    </Typography>

                    <TableContainer component={Paper} elevation={0} sx={{ mt: 2 }}>
                      <Table>
                        <TableHead>
                          <TableRow>
                            <TableCell sx={{ fontWeight: 700 }}>Charge</TableCell>
                            <TableCell sx={{ fontWeight: 700 }}>Due Date</TableCell>
                            <TableCell sx={{ fontWeight: 700 }}>Pending</TableCell>
                            <TableCell sx={{ fontWeight: 700 }}>Paid</TableCell>
                            <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                          </TableRow>
                        </TableHead>
                        {term.charges.map((cha: any, idx: number) => (
                          <TableBody>
                            <TableRow key={cha.id}>
                              <TableCell>{cha.name}</TableCell>
                              <TableCell>{cha.dueDate}</TableCell>
                              <TableCell>₹ {(cha.total - cha.paid).toLocaleString()}</TableCell>
                              <TableCell>₹ {cha.paid.toLocaleString()}</TableCell>
                              <TableCell>
                                <Label
                                  color={
                                    FeeCollectionStatusTypeColors[
                                      cha.status as FeeCollectionStatusType
                                    ] as LabelColor
                                  }
                                >
                                  {FeeCollectionStatusType[cha.status as FeeCollectionStatusType]}
                                </Label>
                              </TableCell>
                            </TableRow>
                          </TableBody>
                        ))}
                      </Table>
                    </TableContainer>
                  </>
                )}
              </AccordionDetails>
            </Accordion>
          );
        })}
      </Scrollbar>
    </Card>
  );
};
