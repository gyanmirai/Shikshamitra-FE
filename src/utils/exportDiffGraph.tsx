// utils/exportData.ts

import type { AutoTableOptions } from 'jspdf-autotable';

import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

interface CurrentVisitsData {
  label: string;
  value: number;
}

export const exportCurrentVisitsData = (data: CurrentVisitsData[], filename: string) => {
  // Prepare data for export
  const exportData = () =>
    data.map((item) => ({
      Label: item.label,
      Value: item.value,
    }));

  const excelExport = () => {
    const worksheet = XLSX.utils.json_to_sheet(exportData());
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Data');
    XLSX.writeFile(workbook, `${filename}.xlsx`);
  };

  const pdfExport = () => {
    // eslint-disable-next-line new-cap
    const doc = new jsPDF();
    const tableData = exportData().map((item) => [item.Label, item.Value]);

    // Define the columns for the autoTable
    const options: AutoTableOptions = {
      head: [['Label', 'Value']],
      body: tableData,
      columns: [
        { header: 'Label', dataKey: 'Label' }, // Maps to the Label in your data
        { header: 'Value', dataKey: 'Value' }, // Maps to the Value in your data
      ],
    };

    autoTable(doc, options);
    doc.save(`${filename}.pdf`);
  };

  return { excelExport, pdfExport };
};
