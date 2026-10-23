import type {
  ConcessionEligibleDueFee,
  ConcessionEligibleFeeHead,
} from 'src/redux/finance/ConcessionManagement/types';

import { Fragment, useState } from 'react';
import { formatNumber } from 'src/utils/formate_number';
import { Iconify } from 'src/components/iconify';
import {
  Box,
  Table,
  Button,
  Checkbox,
  Collapse,
  TableRow,
  TableHead,
  TableCell,
  TableBody,
  Typography,
  TableContainer,
  FormControlLabel,
} from '@mui/material';

import { concessionInstallmentLabel } from './concessionInstallmentLabel';

type FeeHead = Pick<ConcessionEligibleFeeHead, 'feeHeadId' | 'feeHeadName'> & {
  amount: number;
};

export default function ConcessionFeeHeadSelection({
  feeHeads,
  installments,
  selectedIds,
  onToggle,
}: {
  feeHeads: FeeHead[];
  installments: ConcessionEligibleDueFee[];
  selectedIds: string[];
  onToggle: (id: string) => void;
}) {
  const [expandedIds, setExpandedIds] = useState<string[]>([]);
  const money = (value: number) => formatNumber(value, 'INR');

  return (
    <TableContainer sx={{ border: 1, borderColor: 'divider', borderRadius: 1, maxWidth: '100%' }}>
      <Table size="small" aria-label="Eligible fee heads" sx={{ minWidth: 560 }}>
        <TableHead>
          <TableRow>
            <TableCell>Fee head</TableCell>
            <TableCell align="right">Original</TableCell>
            <TableCell align="right">Paid</TableCell>
            <TableCell align="right">Eligible</TableCell>
            <TableCell>Installments</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {feeHeads.map((head) => {
            const lines = installments.filter((line) => line.feeHeadId === head.feeHeadId);
            const selected = selectedIds.includes(head.feeHeadId);
            const expanded = expandedIds.includes(head.feeHeadId);
            const sum = (field: 'originalAmount' | 'paidAmount') =>
              lines.reduce((total, line) => total + line[field], 0);
            return (
              <Fragment key={head.feeHeadId}>
                <TableRow selected={selected} sx={{ '& td': { py: 0.75 } }}>
                  <TableCell>
                    <FormControlLabel
                      sx={{ m: 0, '& .MuiFormControlLabel-label': { typography: 'body2' } }}
                      control={
                        <Checkbox
                          size="small"
                          checked={selected}
                          onChange={() => onToggle(head.feeHeadId)}
                          sx={{ p: 0.5, mr: 0.5 }}
                        />
                      }
                      label={head.feeHeadName}
                    />
                  </TableCell>
                  <TableCell align="right">
                    {lines.length ? money(sum('originalAmount')) : '—'}
                  </TableCell>
                  <TableCell align="right">
                    {lines.length ? money(sum('paidAmount')) : '—'}
                  </TableCell>
                  <TableCell
                    align="right"
                    sx={{ fontWeight: 600, fontVariantNumeric: 'tabular-nums' }}
                  >
                    {money(head.amount)}
                  </TableCell>
                  <TableCell>
                    {lines.length > 0 && (
                      <Button
                        type="button"
                        size="small"
                        aria-label={`${expanded ? 'Hide' : 'Show'} ${head.feeHeadName} installments`}
                        aria-expanded={expanded}
                        aria-controls={`fee-head-installments-${head.feeHeadId}`}
                        endIcon={
                          <Iconify icon={expanded ? 'mdi:chevron-up' : 'mdi:chevron-down'} />
                        }
                        onClick={() =>
                          setExpandedIds((ids) =>
                            expanded
                              ? ids.filter((id) => id !== head.feeHeadId)
                              : [...ids, head.feeHeadId]
                          )
                        }
                      >
                        {lines.length} installments
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell colSpan={5} sx={{ p: 0, border: expanded ? undefined : 0 }}>
                    <Collapse in={expanded} unmountOnExit>
                      <Box id={`fee-head-installments-${head.feeHeadId}`} sx={{ px: 1.5, py: 1 }}>
                        <Typography variant="caption" color="text.secondary">
                          {head.feeHeadName} · installment breakdown
                        </Typography>
                        <Table size="small" aria-label={`${head.feeHeadName} installments`}>
                          <TableHead>
                            <TableRow>
                              <TableCell>Installment</TableCell>
                              <TableCell align="right">Original</TableCell>
                              <TableCell align="right">Paid</TableCell>
                              <TableCell align="right">Eligible</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {lines.map((line) => (
                              <TableRow key={line.dueFeeId}>
                                <TableCell>
                                  {concessionInstallmentLabel(line.installmentLabel, line.year)}
                                </TableCell>
                                <TableCell align="right">{money(line.originalAmount)}</TableCell>
                                <TableCell align="right">{money(line.paidAmount)}</TableCell>
                                <TableCell align="right">
                                  {money(line.eligibleConcessionAmount)}
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </Box>
                    </Collapse>
                  </TableCell>
                </TableRow>
              </Fragment>
            );
          })}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
