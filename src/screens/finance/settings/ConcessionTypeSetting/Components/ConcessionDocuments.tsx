import React from 'react';
import CustomizableTable from 'src/components/customizabaleTable';

import type { IConcessionTypeForm } from '../type';

interface ConcessionTableProps {
  data: IConcessionTypeForm | null;
  isLoading: boolean;
}

const ConcessionDocumentTable: React.FC<ConcessionTableProps> = ({ data, isLoading }) => (
  <CustomizableTable
    tableId="concession-details"
    isLoading={isLoading}
    noDataText="Concession Data Not Found"
    columns={[
      { id: 'documentName', label: 'Concession Name', align: 'left' },
      {
        id: 'documentSize',
        label: 'Document Size',
        filterType: 'number',
      },
      {
        id: 'acceptedFormat',
        label: 'Accepted Format',
        align: 'left',
        render: (value: string[]) => value.join(', '),
      },
    ]}
    data={data?.documents || []}
  />
);

export default ConcessionDocumentTable;
