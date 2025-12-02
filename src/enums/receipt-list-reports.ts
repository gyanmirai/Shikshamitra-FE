export enum ReceiptListReportsTitle {
  ReceiptListDateWise = 'ReceiptListDateWise',
  ReceiptListDateWiseWithRemark = 'ReceiptListDateWiseWithRemark',
  ReceiptListDateWiseWithBatch = 'ReceiptListDateWiseWithBatch',
  ReceiptListDateWiseWithPayType = 'ReceiptListDateWiseWithPayType',
  ReceiptListNumberWise = 'ReceiptListNumberWise',
  ReceiptListWithDetail = 'ReceiptListWithDetail',
  OrganizationWiseFeeReceiptList = 'OrganizationWiseFeeReceiptList',
}

export const ReceiptListReportsTitleOptions = [
  { label: 'Receipt List Date wise', name: ReceiptListReportsTitle.ReceiptListDateWise },
  {
    label: 'Receipt List Date wise With Remark',
    name: ReceiptListReportsTitle.ReceiptListDateWiseWithRemark,
  },
  {
    label: 'Receipt List Date wise With Batch',
    name: ReceiptListReportsTitle.ReceiptListDateWiseWithBatch,
  },
  {
    label: 'Receipt List Date wise With Pay Type',
    name: ReceiptListReportsTitle.ReceiptListDateWiseWithPayType,
  },
  { label: 'Receipt List Number wise', name: ReceiptListReportsTitle.ReceiptListNumberWise },
  { label: 'Receipt List With Detail', name: ReceiptListReportsTitle.ReceiptListWithDetail },
  {
    label: 'Organization Wise Fee Receipt List',
    name: ReceiptListReportsTitle.OrganizationWiseFeeReceiptList,
  },
];
