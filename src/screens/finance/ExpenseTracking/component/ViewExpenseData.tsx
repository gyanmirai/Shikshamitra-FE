import type { UseBooleanReturn } from 'src/hooks/use-boolean';

import React from 'react';

import {
  Box,
  Grid,
  Card,
  Table,
  Paper,
  Button,
  TableRow,
  TableBody,
  TableCell,
  TableHead,
  Typography,
  TableContainer,
} from '@mui/material';

import { Iconify } from 'src/components/iconify';

import type { IExpenseFormValues } from './type';

const ViewExpenseData = ({
  viewExpenseDialog,
  expenseData,
  expenseDetailedData,
  onClose,
}: {
  viewExpenseDialog: UseBooleanReturn;
  expenseData: IExpenseFormValues | null;
  expenseDetailedData: any;
  onClose: () => void;
}) => (
  <Box sx={{ p: 0 }}>
    {/* Expense Information Card */}
    <Card
      sx={{
        mx: 3,
        mt: 2,
        mb: 3,
        border: '1px solid #e0e0e0',
        borderRadius: 2,
        boxShadow: 'none',
      }}
    >
      <Box sx={{ p: 2 }}>
        <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mb: 2 }}>
          Expense Information
        </Typography>

        <Grid container spacing={3}>
          <Grid item xs={3}>
            <Typography
              variant="body2"
              sx={{ color: 'text.secondary', fontSize: '0.875rem', mb: 0.5 }}
            >
              Expense Category
            </Typography>
            <Typography variant="body1" sx={{ fontWeight: 600, fontSize: '0.95rem' }}>
              Learning Materials
            </Typography>
          </Grid>
          <Grid item xs={3}>
            <Typography
              variant="body2"
              sx={{ color: 'text.secondary', fontSize: '0.875rem', mb: 0.5 }}
            >
              Budget
            </Typography>
            <Typography variant="body1" sx={{ fontWeight: 600, fontSize: '0.95rem' }}>
              Academic Budget 2025
            </Typography>
          </Grid>
          <Grid item xs={3}>
            <Typography
              variant="body2"
              sx={{ color: 'text.secondary', fontSize: '0.875rem', mb: 0.5 }}
            >
              Budget Sub Category
            </Typography>
            <Typography variant="body1" sx={{ fontWeight: 600, fontSize: '0.95rem' }}>
              3
            </Typography>
          </Grid>
          <Grid item xs={3}>
            <Typography
              variant="body2"
              sx={{ color: 'text.secondary', fontSize: '0.875rem', mb: 0.5 }}
            >
              Total Expense Amount
            </Typography>
            <Typography variant="body1" sx={{ fontWeight: 600, fontSize: '0.95rem' }}>
              ₹ 1,00,000
            </Typography>
          </Grid>
        </Grid>
      </Box>
    </Card>

    {/* Expense Lists Section */}
    <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mb: 2, px: 3 }}>
      Expense Lists
    </Typography>

    <Box sx={{ px: 3, pb: 2 }}>
      <TableContainer component={Paper} sx={{ boxShadow: 'none', border: '1px solid #e0e0e0' }}>
        <Table size="small">
          <TableHead sx={{ backgroundColor: '#f8f9fa' }}>
            <TableRow>
              <TableCell
                sx={{ fontWeight: 600, color: 'text.secondary', fontSize: '0.875rem', py: 1.5 }}
              >
                Expense Name
              </TableCell>
              <TableCell
                sx={{ fontWeight: 600, color: 'text.secondary', fontSize: '0.875rem', py: 1.5 }}
              >
                Expense Date
              </TableCell>
              <TableCell
                sx={{ fontWeight: 600, color: 'text.secondary', fontSize: '0.875rem', py: 1.5 }}
              >
                Budget Sub Category
              </TableCell>
              <TableCell
                sx={{ fontWeight: 600, color: 'text.secondary', fontSize: '0.875rem', py: 1.5 }}
              >
                Payment Method
              </TableCell>
              <TableCell
                sx={{ fontWeight: 600, color: 'text.secondary', fontSize: '0.875rem', py: 1.5 }}
              >
                Amount
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            <TableRow sx={{ '&:hover': { backgroundColor: '#f5f5f5' } }}>
              <TableCell sx={{ py: 1.5, fontSize: '0.875rem' }}>Math Textbooks</TableCell>
              <TableCell sx={{ py: 1.5, fontSize: '0.875rem' }}>10-08-2025</TableCell>
              <TableCell sx={{ py: 1.5, fontSize: '0.875rem' }}>Textbooks Books</TableCell>
              <TableCell sx={{ py: 1.5, fontSize: '0.875rem' }}>Cash</TableCell>
              <TableCell sx={{ py: 1.5, fontSize: '0.875rem' }}>₹ 30,000</TableCell>
            </TableRow>
            <TableRow sx={{ '&:hover': { backgroundColor: '#f5f5f5' } }}>
              <TableCell sx={{ py: 1.5, fontSize: '0.875rem' }}>Art & Craft Supplies</TableCell>
              <TableCell sx={{ py: 1.5, fontSize: '0.875rem' }}>04-08-2025</TableCell>
              <TableCell sx={{ py: 1.5, fontSize: '0.875rem' }}>Classroom Supplies</TableCell>
              <TableCell sx={{ py: 1.5, fontSize: '0.875rem' }}>Bank Transfer</TableCell>
              <TableCell sx={{ py: 1.5, fontSize: '0.875rem' }}>₹ 30,000</TableCell>
            </TableRow>
            <TableRow sx={{ '&:hover': { backgroundColor: '#f5f5f5' } }}>
              <TableCell sx={{ py: 1.5, fontSize: '0.875rem' }}>E Learning License</TableCell>
              <TableCell sx={{ py: 1.5, fontSize: '0.875rem' }}>01-08-2025</TableCell>
              <TableCell sx={{ py: 1.5, fontSize: '0.875rem' }}>E-Learning Tools</TableCell>
              <TableCell sx={{ py: 1.5, fontSize: '0.875rem' }}>UPI</TableCell>
              <TableCell sx={{ py: 1.5, fontSize: '0.875rem' }}>₹ 40,000</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>
    </Box>

    {/* Close Button */}
    <Box sx={{ display: 'flex', justifyContent: 'flex-end', px: 3, pb: 3, pt: 2 }}>
      <Button
        variant="outlined"
        size="small"
        onClick={() => {
          onClose();
        }}
        startIcon={<Iconify icon="material-symbols:close" />}
        sx={{
          minWidth: 100,
          borderColor: 'grey.400',
          color: 'text.primary',
          '&:hover': {
            borderColor: 'grey.600',
            backgroundColor: 'grey.50',
          },
        }}
      >
        Close
      </Button>
    </Box>
  </Box>
);

export default ViewExpenseData;
