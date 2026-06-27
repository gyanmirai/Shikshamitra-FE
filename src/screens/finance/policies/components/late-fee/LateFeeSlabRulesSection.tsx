'use client';

import React from 'react';
import CustomAccordion from 'src/components/custom-accordian';
import { Add, Delete, ArrowUpward, ArrowDownward } from '@mui/icons-material';
import {
  Box,
  Stack,
  Paper,
  Table,
  Button,
  Select,
  TableRow,
  MenuItem,
  TableHead,
  TableCell,
  TableBody,
  TextField,
  Typography,
  IconButton,
  TableContainer,
} from '@mui/material';

interface LateFeeSlabRulesSectionProps {
  formik: any;
  expanded: boolean;
  onToggle: () => void;
}

export default function LateFeeSlabRulesSection({
  formik,
  expanded,
  onToggle,
}: LateFeeSlabRulesSectionProps) {
  return (
    <CustomAccordion
      title="3. Escalation / Slab Rules"
      expanded={expanded}
      onChange={onToggle}
      isActive={expanded}
      content={
        <Stack spacing={2.5} p={2}>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="body2" color="text.secondary">
              Rules apply when overdue days fall within specified ranges.
            </Typography>
            <Button
              size="small"
              variant="outlined"
              startIcon={<Add />}
              onClick={() => {
                const count = formik.values.escalationRules.length;
                const start =
                  count > 0 ? (formik.values.escalationRules[count - 1].endDay || 0) + 1 : 1;
                formik.setFieldValue('escalationRules', [
                  ...formik.values.escalationRules,
                  { startDay: start, endDay: null, calculationType: 'Flat', value: 50 },
                ]);
              }}
            >
              Add Slab Rule
            </Button>
          </Box>

          {formik.values.escalationRules.length === 0 ? (
            <Typography
              variant="caption"
              sx={{ py: 2, textAlign: 'center', color: 'text.disabled' }}
            >
              No escalation rules defined. Overdue fee will resolve to flat/percentage configs.
            </Typography>
          ) : (
            <TableContainer component={Paper} variant="outlined">
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Start Day</TableCell>
                    <TableCell>End Day</TableCell>
                    <TableCell>Type</TableCell>
                    <TableCell>Value</TableCell>
                    <TableCell>Max Fee (₹)</TableCell>
                    <TableCell align="center">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {formik.values.escalationRules.map((rule: any, idx: number) => (
                    <TableRow key={idx}>
                      <TableCell sx={{ minWidth: 80 }}>
                        <TextField
                          type="number"
                          size="small"
                          variant="standard"
                          value={rule.startDay}
                          onChange={(e) =>
                            formik.setFieldValue(
                              `escalationRules[${idx}].startDay`,
                              +e.target.value
                            )
                          }
                        />
                      </TableCell>
                      <TableCell sx={{ minWidth: 80 }}>
                        <TextField
                          type="number"
                          size="small"
                          placeholder="Infinite"
                          variant="standard"
                          value={rule.endDay ?? ''}
                          onChange={(e) =>
                            formik.setFieldValue(
                              `escalationRules[${idx}].endDay`,
                              e.target.value === '' ? null : +e.target.value
                            )
                          }
                        />
                      </TableCell>
                      <TableCell>
                        <Select
                          size="small"
                          variant="standard"
                          value={rule.calculationType}
                          onChange={(e) =>
                            formik.setFieldValue(
                              `escalationRules[${idx}].calculationType`,
                              e.target.value
                            )
                          }
                        >
                          <MenuItem value="Flat">Flat Amount (₹)</MenuItem>
                          <MenuItem value="Percentage">Percentage (%)</MenuItem>
                        </Select>
                      </TableCell>
                      <TableCell sx={{ minWidth: 80 }}>
                        <TextField
                          type="number"
                          size="small"
                          variant="standard"
                          value={rule.value}
                          onChange={(e) =>
                            formik.setFieldValue(`escalationRules[${idx}].value`, +e.target.value)
                          }
                        />
                      </TableCell>
                      <TableCell sx={{ minWidth: 80 }}>
                        <TextField
                          type="number"
                          size="small"
                          placeholder="None"
                          variant="standard"
                          value={rule.maxFee ?? ''}
                          onChange={(e) =>
                            formik.setFieldValue(
                              `escalationRules[${idx}].maxFee`,
                              e.target.value === '' ? null : +e.target.value
                            )
                          }
                        />
                      </TableCell>
                      <TableCell align="center">
                        <Stack direction="row" spacing={0.5} justifyContent="center">
                          <IconButton
                            size="small"
                            onClick={() => {
                              if (idx === 0) return;
                              const rules = [...formik.values.escalationRules];
                              const tmp = rules[idx];
                              rules[idx] = rules[idx - 1];
                              rules[idx - 1] = tmp;
                              formik.setFieldValue('escalationRules', rules);
                            }}
                            disabled={idx === 0}
                          >
                            <ArrowUpward fontSize="small" />
                          </IconButton>
                          <IconButton
                            size="small"
                            onClick={() => {
                              if (idx === formik.values.escalationRules.length - 1) return;
                              const rules = [...formik.values.escalationRules];
                              const tmp = rules[idx];
                              rules[idx] = rules[idx + 1];
                              rules[idx + 1] = tmp;
                              formik.setFieldValue('escalationRules', rules);
                            }}
                            disabled={idx === formik.values.escalationRules.length - 1}
                          >
                            <ArrowDownward fontSize="small" />
                          </IconButton>
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => {
                              const rules = formik.values.escalationRules.filter(
                                (_: any, i: number) => i !== idx
                              );
                              formik.setFieldValue('escalationRules', rules);
                            }}
                          >
                            <Delete fontSize="small" />
                          </IconButton>
                        </Stack>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Stack>
      }
    />
  );
}
