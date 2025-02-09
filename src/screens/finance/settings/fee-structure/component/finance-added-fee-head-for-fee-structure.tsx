import React from 'react';

import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizabaleTable';

interface FinanceAddedFeeHeadForFeeStructureProps {
  data: any;
  onDelete: (data: any) => void;
  onEdit: (data: any) => void;
}

const FinanceAddedFeeHeadForFeeStructure: React.FC<FinanceAddedFeeHeadForFeeStructureProps> = ({
  data,
  onDelete,
  onEdit,
}) => (
  <CustomizableTable
    isFilter={false}
    isShowedDense={false}
    isSearch={false}
    tableId="added-fee-head-for-fee-structure-table"
    columns={[
      // { id: "receiptBook", label: "Receipt Book" },
      { id: 'feeHead', label: 'Fee Head' },
      { id: 'grossFee', label: 'Gross Fee (₹)' },
      { id: 'payableFee', label: 'Payable Fee (₹)' },
      { id: 'discountAmount', label: 'Discount Amount (₹)' },
      { id: 'discountRemark', label: 'Discount Remark' },
      { id: 'paymentMethod', label: 'Payment Method' },
      { id: 'lateFeeChargesType', label: 'Late Fee Type' },
      { id: 'lateFeeChargesAmount', label: 'Late Fee Amount (₹)' },
      // { id: 'paymentDueDate', label: 'Payment Due Date' },
      {
        id: 'action',
        label: 'Action',
        render(value, row) {
          return (
            <ThreeDotsActions
              showThreeDots={false}
              showDeleteIcon
              handleDeleteClick={() => {
                onDelete(row);
              }}
              showEditIcon
              handleEditClick={() => {
                onEdit(row);
              }}
            />
          );
        },
      },
    ]}
    data={data}
  />
);

export default FinanceAddedFeeHeadForFeeStructure;
