import React from 'react';
import CustomDialog from 'src/components/custom-dialog';

import TemplateTwoPDF from './templates/TemplatesTwoForPdf';

interface ViewReceiptProps {
  dialogValue: boolean;
  onClose: () => void;
}

const ViewReceipt: React.FC<ViewReceiptProps> = ({ dialogValue, onClose }) => (
  // const totalFee = 5000; // Example: Total fee for the student
  // const subTotal = paymentDetails.reduce((acc, item) => acc + item.amount, 0);
  // const tax = subTotal * 0.05; // Example: 5% tax
  // const total = subTotal + tax;
  // const pendingFees = totalFee - total;

  // const handlePrint = useReactToPrint({
  //   content: () => componentRef.current,
  // } as any);

  <CustomDialog fullScreen title="Fee Receipt" handleClose={onClose} open={dialogValue}>
    {/* <TemplatesOneFeeReceipt /> */}
    <TemplateTwoPDF />
  </CustomDialog>
);
export default ViewReceipt;
