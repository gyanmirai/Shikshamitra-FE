import React from 'react';

import {
  Table,
  Paper,
  TableRow,
  TableBody,
  TableCell,
  TableHead,
  DialogContent,
  TableContainer,
} from '@mui/material';

import { Scrollbar } from 'src/components/scrollbar';
import CustomDialog from 'src/components/customDialog';

const headerCellStyle = {
  border: '1px solid #ccc',
  padding: '10px',
  position: 'sticky',
  top: 0,
  background: '#f4f6f8',
  zIndex: 1,
  width: '100px',
};

const cellStyle: React.CSSProperties = {
  // border: '1px solid #ccc',
  // padding: '10px',
  fontSize: '12px',
  // textAlign: 'center',
};
const MemberDetailsDialog = ({ dialogValue, memberData, onClose }: any) => (
  <CustomDialog maxWidth="md" title="Ravi P Patel" open={dialogValue} handleClose={onClose}>
    <Scrollbar>
      <DialogContent>
        {/* Issued Books Table */}
        <div>
          <h3>Issued Books</h3>
          <TableContainer component={Paper}>
            <Table sx={{ minWidth: 650 }} aria-label="issued books table">
              <TableHead>
                <TableRow>
                  <TableCell sx={headerCellStyle}>Title</TableCell>
                  <TableCell sx={headerCellStyle}>Issued On</TableCell>
                  <TableCell sx={headerCellStyle}>Due On</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {memberData.issuedBooks.length > 0 ? (
                  memberData.issuedBooks.map((book: any) => (
                    <TableRow key={book.bookId}>
                      <TableCell sx={cellStyle} component="th" scope="row">
                        {book.title}
                      </TableCell>
                      <TableCell sx={cellStyle}>{book.issueDate}</TableCell>
                      <TableCell sx={cellStyle}>{book.dueDate}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={3} align="center">
                      No books issued
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </div>

        {/* Reserved Books Table */}
        <div style={{ marginTop: '20px' }}>
          <h3>Reserved Books</h3>
          <TableContainer component={Paper}>
            <Table sx={{ minWidth: 650 }} aria-label="reserved books table">
              <TableHead>
                <TableRow>
                  <TableCell>Title</TableCell>
                  <TableCell align="right">Reserved On</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {memberData.reservedBooks.length > 0 ? (
                  memberData.reservedBooks.map((book: any) => (
                    <TableRow key={book.bookId}>
                      <TableCell component="th" scope="row">
                        {book.title}
                      </TableCell>
                      <TableCell align="right">{book.reservationDate}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={2} align="center">
                      No books reserved
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </div>
      </DialogContent>
    </Scrollbar>
    {/* <DialogActions>
            <Button onClick={onClose}>Close</Button>
        </DialogActions>
        <DialogActions>
            <Button color="error" variant="outlined" onClick={dialog.onFalse}>
              Cancel
            </Button>
            <Button variant="contained" onClick={dialog.onFalse}>
              Submit
            </Button>
          </DialogActions> */}
  </CustomDialog>
);

export default MemberDetailsDialog;
