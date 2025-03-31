import React, { useState } from 'react';

import {
  Box,
  Grid,
  Tooltip,
  Checkbox,
  Accordion,
  Typography,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';

import { useBoolean } from 'src/hooks/use-boolean';

import { formatNumber } from 'src/utils/formate_number';

import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import CustomDialog from 'src/components/customDialog';
import CustomSelect from 'src/components/custom-select';
import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizabaleTable';
import SendInstantNotificationDialog from 'src/components/send-instant-notification-dialog';

import { studentsDataForFeeStructure } from './data/student-fee-structure-data';
import FinanceEditFeeStructureForStudent from './component/finance-edit-fee-structure-for-student';

import type { StudentForFeeStructure } from './data/student-fee-structure-data';

const FinanceStudentFeeManagement = () => {
  const dialog = useBoolean();
  const [open, setOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<StudentForFeeStructure | null>();

  const handleOpen = (student: any) => {
    setSelectedStudent(student);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedStudent(null);
  };

  const FeeStructureClose = () => {
    dialog.onFalse();
    setSelectedStudent(null);
  };

  const feeStructureSaveHandler = (data: any) => {};

  const headerCellStyle = {
    border: '1px solid #ccc',
    padding: '10px',
    position: 'sticky',
    top: 0,
    background: '#f4f6f8',
    zIndex: 1,
  };

  const cellStyle: React.CSSProperties = {
    border: '1px solid #ccc',
    padding: '10px',
    fontSize: '12px',
    textAlign: 'right',
  };

  const [selectedStudents, setSelectedStudents] = useState<any>([]);
  const sendInstantNotificationDialogValue = useBoolean();

  const handlerSendNotification = () => {
    if (!sendInstantNotificationDialogValue.value) {
      sendInstantNotificationDialogValue.onTrue();
    }
  };
  return (
    <>
      {/* <CustomBreadcrumbs
        heading="Student Fee Management"
        links={[{ name: 'Finance' }, { name: 'Fee Management' }]}
        sx={{ px: 1, mb: 2 }}
        
      /> */}
      <Grid container sx={{ display: 'flex', alignItems: 'center', mb: 2, gap: 2 }}>
        {/* <Grid item lg={2}>
          <CustomSelect
            label="Class"
            name="className"
            options={[]}
            labelKey="name"
            valueKey="name"
            value={[]}
            onChange={(value) => console.log('className', value)}
            fullWidth
          // formControlProps={{ sx: { minWidth: '200px', width: '100%' } }}
          />
        </Grid> */}
        <Grid item lg={2}>
          <CustomSelect
            label="Class"
            name="className"
            options={[]}
            labelKey="name"
            valueKey="name"
            value={[]}
            onChange={(value) => console.log('className', value)}
            fullWidth
            // formControlProps={{ sx: { minWidth: '200px', width: '100%' } }}
          />
        </Grid>
        <Grid item lg={2}>
          <CustomSelect
            fullWidth
            label="Division"
            labelKey="name"
            valueKey="id"
            options={[]}
            value={[]}
            onChange={(val) => {
              console.log(val as string);
            }}
            // formControlProps={{
            //   sx: { width: '100%', maxWidth: '150px' },
            // }}
          />
        </Grid>
      </Grid>

      <CustomizableTable
        onSendNotification={handlerSendNotification}
        showCheckbox={selectedStudents.length !== 0}
        tableId="student-fee-management"
        columns={[
          {
            id: 'checkBox',
            align: 'left',
            minWidth: '60px',
            isSort: false,
            isFilter: false,
            label: '',
            renderColumn() {
              return (
                <Checkbox
                  checked={
                    !!studentsDataForFeeStructure?.length &&
                    selectedStudents?.length === studentsDataForFeeStructure?.length
                  }
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedStudents(studentsDataForFeeStructure || []);
                    } else {
                      setSelectedStudents([]);
                    }
                  }}
                />
              );
            },
            render(value, row) {
              return (
                <Checkbox
                  checked={!!selectedStudents.some((i: any) => i.id === row.id)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedStudents([...selectedStudents, row]);
                    } else {
                      setSelectedStudents(selectedStudents.filter((i: any) => i.id !== row.id));
                    }
                  }}
                />
              );
            },
          },
          {
            id: 'grNo',
            label: 'Gr No',
            render(value, row) {
              return (
                <Typography minWidth="120px" fontSize="12px">
                  {value}
                </Typography>
              );
            },
          },
          {
            id: 'rollNo',
            label: 'Roll No',
            render(value, row) {
              return (
                <Typography minWidth="120px" fontSize="12px">
                  {value}
                </Typography>
              );
            },
          },
          {
            id: 'division',
            label: 'Division',
            render(value, row) {
              return (
                <Typography minWidth="120px" fontSize="12px">
                  A
                </Typography>
              );
            },
          },
          {
            id: 'name',
            label: 'Student Name',
            render(value, row) {
              return (
                <Typography minWidth="120px" fontSize="12px">
                  {row.name}
                </Typography>
              );
            },
          },
          { id: 'grade', label: 'Class' },
          {
            id: 'totalFees',
            label: 'Gross Fees',
            render(value, row) {
              return (
                <Typography minWidth="100px" fontSize="12px">
                  {formatNumber(row.totalFees, 'INR')}
                </Typography>
              );
            },
          },
          {
            id: 'finalFees',
            label: 'Payable Fees',
            render(value, row) {
              return (
                <Typography minWidth="120px" fontSize="12px">
                  {formatNumber(row.finalFees, 'INR')}
                </Typography>
              );
            },
          },
          {
            id: 'totalGeneralDiscount',
            label: 'Total General Discount',

            render(value, row) {
              return (
                <Typography sx={{ textAlign: 'center' }} minWidth="200px" fontSize="12px">
                  {formatNumber(row.totalGeneralDiscount, 'INR')}
                </Typography>
              );
            },
          },
          {
            id: 'totalAdditionalDiscount',
            label: 'Total Additional Discount',

            render(value, row) {
              return (
                <Typography minWidth="180px" fontSize="12px" sx={{ textAlign: 'center' }}>
                  {formatNumber(row.totalAdditionalDiscount, 'INR')}
                </Typography>
              );
            },
          },
          {
            id: 'totalPaid',
            label: 'Total Paid',

            render(value, row) {
              return (
                <Typography minWidth="100px" fontSize="12px" color="#1a8877">
                  {formatNumber(row.totalPaid, 'INR')}
                </Typography>
              );
            },
          },
          {
            id: 'totalPending',
            label: 'Total Pending',

            render(value, row) {
              return (
                <Typography minWidth="120px" fontSize="12px" color="red">
                  {formatNumber(row.totalPending, 'INR')}
                </Typography>
              );
            },
          },

          {
            id: 'action',
            label: 'Action',

            render(value: any, row: any) {
              return (
                <ThreeDotsActions
                  placement="right-top"
                  showThreeDots={false}
                  showViewIcon
                  handleViewClick={() => {
                    handleOpen(row);
                  }}
                  // actions={({ popover }: any) => (
                  //   <MenuList>
                  //     <MenuItem
                  //       onClick={() => {
                  //         handleOpen(row);
                  //       }}
                  //     >
                  //       <Iconify icon="mdi:eye" />
                  //       View Details
                  //     </MenuItem>

                  //     {/* <MenuItem
                  //       onClick={() => {
                  //         setSelectedStudent(row);
                  //         dialog.onTrue();
                  //         popover.onClose();
                  //       }}
                  //     >
                  //       <Iconify icon="solar:pen-bold" />
                  //       Edit
                  //     </MenuItem> */}
                  //   </MenuList>
                  // )}
                />
              );
            },
          },
        ]}
        data={studentsDataForFeeStructure}
      />

      {sendInstantNotificationDialogValue.value && (
        <SendInstantNotificationDialog
          open={sendInstantNotificationDialogValue.value}
          onClose={sendInstantNotificationDialogValue.onFalse}
          data={[]}
          userList={selectedStudents}
        />
      )}

      {/* Details Modal */}
      {selectedStudent && (
        <CustomDialog
          title={
            <Box display="flex" flexDirection="row" gap={2} alignItems="center">
              <Typography variant="h5">{`Fee Details for ${selectedStudent.name} / Standard: ${selectedStudent.grade}th -A `}</Typography>
              <Tooltip
                arrow
                placement="right"
                title="This dialog displays the fee details of a Vishal, where you can find a complete overview of their fee information."
              >
                <Iconify icon="lucide:info" sx={{ cursor: 'pointer' }} color="info.main" />
              </Tooltip>
            </Box>
          }
          open={open}
          handleClose={handleClose}
          maxWidth="xl"
        >
          <Scrollbar sx={{ overflow: 'auto', maxHeight: '550px' }}>
            <div>
              {selectedStudent.fees.map((feeHead: any) => (
                <Accordion key={feeHead.feeHeadId}>
                  <AccordionSummary
                    expandIcon={<Iconify icon="iconamoon:arrow-up-2-thin" />}
                    aria-controls={`panel-${feeHead.feeHeadId}-content`}
                    id={`panel-${feeHead.feeHeadId}-header`}
                  >
                    <Box display="flex" flexDirection="column" gap={3} width="100%">
                      <Typography
                        variant="subtitle1"
                        component="div"
                        sx={{ fontWeight: 'bold', marginBottom: 1 }}
                      >
                        {feeHead.feeHead}
                      </Typography>
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center', // Center aligns Paid & Pending vertically with others
                          gap: '10px',
                          fontSize: '14px',
                          width: '100%', // Ensures full width for proper spacing
                        }}
                      >
                        <Box display="flex" flexWrap="wrap" gap="10px">
                          <Typography variant="body2" component="span">
                            <strong>Gross Fee:</strong> {formatNumber(feeHead.totalFees, 'INR')}
                          </Typography>
                          <Typography variant="body2" component="span">
                            <strong>Payable Fee:</strong> {formatNumber(feeHead.finalFees, 'INR')}
                          </Typography>
                          <Typography variant="body2" component="span">
                            <strong>General Discount:</strong>{' '}
                            {formatNumber(feeHead.totalDiscount, 'INR')}
                          </Typography>
                          <Typography variant="body2" component="span">
                            <strong>Additional Discount:</strong> {formatNumber(0, 'INR')}
                          </Typography>
                        </Box>
                        <Box display="flex" gap="20px" alignItems="center">
                          <Typography
                            variant="body2"
                            component="span"
                            sx={{ color: '#138e58', fontWeight: 'bold' }}
                          >
                            <strong>Paid:</strong> {formatNumber(feeHead.totalPaidAmount, 'INR')}
                          </Typography>
                          <Typography
                            variant="body2"
                            component="span"
                            sx={{ color: '#b76e00', fontWeight: 'bold' }}
                          >
                            <strong>Pending:</strong>{' '}
                            {formatNumber(feeHead.finalFees - feeHead.totalPaidAmount, 'INR')}
                          </Typography>
                        </Box>
                      </div>
                    </Box>
                  </AccordionSummary>

                  <AccordionDetails>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                      <thead>
                        <tr>
                          <th
                            style={{
                              border: '1px solid #ccc',
                              padding: '10px',
                              position: 'sticky',
                              top: 0,
                              background: '#f4f6f8',
                              zIndex: 1,
                              fontSize: '12px',
                            }}
                          >
                            Month
                          </th>
                          <th
                            style={{
                              border: '1px solid #ccc',
                              padding: '10px',
                              position: 'sticky',
                              top: 0,
                              background: '#f4f6f8',
                              zIndex: 1,
                              fontSize: '12px',
                            }}
                          >
                            Gross Fee
                          </th>
                          <th
                            style={{
                              border: '1px solid #ccc',
                              padding: '10px',
                              position: 'sticky',
                              top: 0,
                              background: '#f4f6f8',
                              zIndex: 1,
                              fontSize: '12px',
                            }}
                          >
                            Payable Fee
                          </th>
                          <th
                            style={{
                              border: '1px solid #ccc',
                              padding: '10px',
                              position: 'sticky',
                              top: 0,
                              background: '#f4f6f8',
                              zIndex: 1,
                              fontSize: '12px',
                            }}
                          >
                            Paid
                          </th>
                          <th
                            style={{
                              border: '1px solid #ccc',
                              padding: '10px',
                              position: 'sticky',
                              top: 0,
                              background: '#f4f6f8',
                              zIndex: 1,
                              fontSize: '12px',
                            }}
                          >
                            Pending
                          </th>
                          <th
                            style={{
                              border: '1px solid #ccc',
                              padding: '10px',
                              position: 'sticky',
                              top: 0,
                              background: '#f4f6f8',
                              zIndex: 1,
                              fontSize: '12px',
                            }}
                          >
                            General Discount
                          </th>
                          <th
                            style={{
                              border: '1px solid #ccc',
                              padding: '10px',
                              position: 'sticky',
                              top: 0,
                              background: '#f4f6f8',
                              zIndex: 1,
                              fontSize: '12px',
                            }}
                          >
                            Additional Discount
                          </th>
                          {/* <th style={{
                            border: "1px solid #ccc",
                            padding: "10px",
                            position: "sticky",
                            top: 0,
                            background: "#f4f6f8",
                            zIndex: 1,

                          }}>Status</th> */}
                        </tr>
                      </thead>
                      <tbody>
                        {feeHead.paymentDates.map((payment: any, index: any) => (
                          <tr key={index}>
                            <td
                              style={{
                                border: '1px solid #ccc',
                                padding: '10px',
                                fontSize: '12px',
                                textAlign: 'center',
                              }}
                            >
                              {payment.month}
                            </td>
                            <td style={cellStyle}>{formatNumber(feeHead.grossAmount, 'INR')}</td>
                            <td style={cellStyle}>{formatNumber(feeHead.payableAmount, 'INR')}</td>
                            <td
                              style={{
                                ...cellStyle,
                                color: payment.paidAmount > 0 ? '#138e58' : 'black',
                              }}
                            >
                              {formatNumber(payment.paidAmount, 'INR')}
                            </td>
                            <td
                              style={{
                                ...cellStyle,
                                color: payment.pendingAmount > 0 ? '#b76e00' : 'black',
                              }}
                            >
                              {formatNumber(payment.pendingAmount, 'INR')}
                            </td>
                            <td
                              style={{
                                ...cellStyle,
                                color: feeHead.discount > 0 ? '#856404' : '#000',
                              }}
                            >
                              {formatNumber(feeHead.discount, 'INR')}
                            </td>
                            <td
                              style={{
                                ...cellStyle,
                                color: feeHead.discount > 0 ? '#856404' : '#000',
                              }}
                            >
                              {formatNumber(0, 'INR')}
                            </td>
                            {/* <td style={cellStyle}>
                              <Label
                                variant="soft"
                                color={
                                  payment.status === 'Overdue'
                                    ? 'error'
                                    : payment.status === 'Unpaid'
                                      ? 'warning'
                                      : payment.status === 'Paid'
                                        ? 'success'
                                        : 'default'
                                }
                              >
                                {payment.status}
                              </Label>
                            </td> */}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </AccordionDetails>
                </Accordion>
              ))}
            </div>
          </Scrollbar>
        </CustomDialog>
      )}
      {dialog.value && selectedStudent && (
        <FinanceEditFeeStructureForStudent
          onSave={feeStructureSaveHandler}
          dialogValue={dialog.value}
          onClose={() => dialog.onFalse()}
          data={selectedStudent}
        />
      )}
    </>
  );
};

export default FinanceStudentFeeManagement;
// eslint-disable-next-line no-lone-blocks
{
  /* selectedStudent.fees.map((feeHead: any) => (
  
  // <Card key={feeHead.feeHeadId} style={{ marginBottom: "20px" }}>
                //   <h3>{feeHead.feeHead}</h3>
                //   <div>Total Fees: {feeHead.totalFees}</div>
                //   <div>Total Paid: {feeHead.totalPaidAmount}</div>
                //   <div>Total Pending: {feeHead.totalFees - feeHead.totalPaidAmount}</div>
                //   <div>Discount per Month: {feeHead.discount.toFixed(2)}</div>

                //   {/* Nested Payment Term Details */
}
//   <div style={{ marginTop: "15px", borderTop: "1px solid #ccc", paddingTop: "10px" }}>
//     <h4>Payment Details (Monthly):</h4>
//     {
//       feeHead.paymentDates.map((payment: any, index: any) => (
//         <Card key={index} style={{ marginBottom: "10px", padding: "10px", background: "#f9f9f9" }}>
//           <div><strong>Month:</strong> {payment.month}</div>
//           <div><strong>Due Date:</strong> {payment.date}</div>
//           <div><strong>Status:</strong> {payment.status}</div>
//           <div><strong>Paid Amount:</strong> {payment.paidAmount}</div>
//           <div><strong>Pending Amount:</strong> {payment.pendingAmount}</div>
//         </Card>
//       ))
//     }
//   </div>
// </Card>
// ))}} */}

// eslint-disable-next-line no-lone-blocks
{
  /* <CustomizableTable
              isPagination={false}
              isFilter={false}
              isSearch={false}
              isShowedDense={false}

              columns={[
                { id: 'paymentTerm', label: 'Payment Term' },
                ...selectedStudent.fees.map((fee: any) => ({
                  id: fee.feeHead.toLowerCase(),
                  label: fee.feeHead,
                  render: (value: any) => (
                    <Typography

                      style={{
                        color: value.status === 'Paid' ? 'green' : 'red',
                        fontSize: "12px"

                      }}
                    >
                      {formatNumber(value.amount, "INR")}
                    </Typography>
                  ),
                })),
              
                {
                  id: 'action',
                  label: 'Action',
                  render: (value, row) => {




                    const unpaidFees = selectedStudent.fees
                      .filter((fee: any) =>
                        fee.paymentDates.some(
                          (payment: any) => payment.month === row.paymentTerm && payment.status === "Unpaid"
                        )
                      );

                    const actionLabel = unpaidFees.length > 0 ? "Send Reminder" : "Print Receipt";

                    const handleAction = () => {
                      if (unpaidFees.length > 0) {
                        const message = unpaidFees
                          .map((fee: any) => `${actionLabel} for ${fee.feeHead} - ${row.paymentTerm}`)
                          .join("\n");
                        alert(message);
                      } else {
                        alert(`${actionLabel} for ${selectedStudent.fees[0].feeHead} - ${row.paymentTerm}`);
                      }
                    };

                    return (

                      <Tooltip title={actionLabel === "Send Reminder" ? "Send Reminder" : "Print"}>
                        <Iconify
                          icon={actionLabel === "Send Reminder" ? "carbon:reminder" : "flat-color-icons:print"}
                          sx={{ height: '16px', width: '16px', cursor: 'pointer' }}
                          onClick={() => {
                            if (actionLabel === "Send Reminder") {
                              // Handle send reminder action
                              console.log("Reminder sent!");
                            } else {
                              // Handle Print action
                              console.log("Item Print!");
                            }
                          }}
                        />
                      </Tooltip>


                    );
                  },
                }



              ]}
              data={selectedStudent.fees[0].paymentDates.map((date: any, idx: any) => ({
                paymentTerm: date.month,
                ...selectedStudent.fees.reduce((acc: any, fee: any) => {
                  acc[fee.feeHead.toLowerCase()] = {
                    amount: fee.amount,
                    status: fee.paymentDates[idx].status,
                  };
                  return acc;
                }, {}),

              }))}
            /> */
}
