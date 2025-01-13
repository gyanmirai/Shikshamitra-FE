import React from 'react';

import {
  Table,
  Paper,
  TableRow,
  TableBody,
  TableCell,
  TableHead,
  Typography,
  TableContainer,
} from '@mui/material';

interface ReceiptTableProps {
  columns: any;
  data: any;
}

const ReceiptTable: React.FC<ReceiptTableProps> = ({ columns, data }) => (
  <TableContainer component={Paper}>
    <Table sx={{ minWidth: 300, tableLayout: 'fixed' }} aria-label="simple table">
      <TableHead>
        <TableRow>
          {columns.map((column: any) => (
            <TableCell
              key={column.id}
              sx={{
                width: column.id === 'amount' ? '20%' : 'auto',
                textAlign: column.id === 'amount' ? 'right' : 'left',
                padding: '4px 8px', // Reduce padding for smaller height
              }}
            >
              <Typography fontSize="10px" variant="body2">
                {column.label}
              </Typography>
            </TableCell>
          ))}
        </TableRow>
      </TableHead>
      <TableBody>
        {data.map((row: any, rowIndex: number) => (
          <TableRow key={rowIndex}>
            {columns.map((column: any) => (
              <TableCell
                key={column.id}
                sx={{
                  textAlign: column.id === 'amount' ? 'right' : 'left',
                  padding: '4px 8px', // Adjust the padding here as well
                }}
              >
                <Typography fontSize="10px" variant="body2">
                  {row[column.id]}
                </Typography>
              </TableCell>
            ))}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  </TableContainer>
);

export default ReceiptTable;
