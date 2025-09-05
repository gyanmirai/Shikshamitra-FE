import React, { useRef } from 'react';
import CustomDialog from 'src/components/customDialog';

import TemplateTwoPDF from './Templates/TemplatesTwoForPdf';

interface ViewReceiptProps {
  dialogValue: boolean;
  onClose: () => void;
}

const ViewReceipt: React.FC<ViewReceiptProps> = ({ dialogValue, onClose }) => {
  const paymentDetails = [
    { feeHead: 'Library Fee', month: 'January', amount: 1000, paymentMode: 'Cash' },
    { feeHead: 'Library Fee', month: 'February', amount: 1000, paymentMode: 'Cash' },
    { feeHead: 'Library Fee', month: 'March', amount: 1000, paymentMode: 'Cash' },
    // Add more rows as required
  ];

  const totalFee = 5000; // Example: Total fee for the student
  const subTotal = paymentDetails.reduce((acc, item) => acc + item.amount, 0);
  const tax = subTotal * 0.05; // Example: 5% tax
  const total = subTotal + tax;
  // const pendingFees = totalFee - total;

  const componentRef = useRef(null);

  // const handlePrint = useReactToPrint({
  //   content: () => componentRef.current,
  // } as any);

  return (
    <CustomDialog fullScreen title="Fee Receipt" handleClose={onClose} open={dialogValue}>
      {/* <TemplatesOneFeeReceipt /> */}
      <TemplateTwoPDF />
    </CustomDialog>
  );
};

export default ViewReceipt;
