import React from 'react';
import CustomizableTable from 'src/components/customizabaleTable';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { useGetConcessionTypeByIdQuery } from 'src/redux/finance/concessionType';

import { ConcessionDocumentFormat } from '../type';

import type { IConcessionTypeForm } from '../type';

interface ConcessionTableProps {
  data: IConcessionTypeForm | null;
}

const ConcessionDocumentTable: React.FC<ConcessionTableProps> = ({ data }) => {
  const { data: concessionTypeDetails, isLoading: isLoadingDetails } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetConcessionTypeByIdQuery,
    params: {
      concessionTypeId: data?.id,
    },
    options: {
      skip: !data?.id,
    },
  });

  const getFormatLabel = (value: number) => {
    switch (value) {
      case ConcessionDocumentFormat.Pdf:
        return 'PDF';
      case ConcessionDocumentFormat.Jpeg:
        return 'JPEG';
      case ConcessionDocumentFormat.Png:
        return 'PNG';
      case ConcessionDocumentFormat.Doc:
        return 'DOC';
      case ConcessionDocumentFormat.Docx:
        return 'DOCX';
      case ConcessionDocumentFormat.Xls:
        return 'XLS';
      default:
        return value;
    }
  };

  return (
    <CustomizableTable
      tableId="concession-details"
      isLoading={isLoadingDetails}
      noDataText="Concession Data Not Found"
      columns={[
        { id: 'documentName', label: 'Document Name', align: 'left' },
        {
          id: 'documentSize',
          label: 'Document Size',
          render: (value: number) => (value ? `${(value / (1024 * 1024)).toFixed(2)} MB` : '-'),
        },
        {
          id: 'acceptedFormat',
          label: 'Accepted Format',
          align: 'left',
          render: (value: number[]) => (value || []).map(getFormatLabel).join(', '),
        },
      ]}
      data={concessionTypeDetails?.documents || []}
    />
  );
};

export default ConcessionDocumentTable;
