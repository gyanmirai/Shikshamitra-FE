// utils/exportData.ts

import type { AutoTableOptions } from 'jspdf-autotable';

import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

interface SeriesData {
  name: string;
  data: number[];
}

interface ExportRow {
  Month: string;
  [key: string]: any; // For dynamic property names
}

export const exportGraphData = (
  categories: string[],
  seriesData: SeriesData[],
  filename: string
) => {
  const exportData = (): ExportRow[] =>
    categories.map((category, index) => {
      const row: ExportRow = { Month: category };
      seriesData.forEach((series) => {
        row[series.name] = series.data[index];
      });
      return row;
    });

  const excelExport = () => {
    const worksheet = XLSX.utils.json_to_sheet(exportData());
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Data');
    XLSX.writeFile(workbook, `${filename}.xlsx`);
  };

  const pdfExport = () => {
    // Create a new jsPDF instance
    // eslint-disable-next-line new-cap
    const doc = new jsPDF();

    // Prepare the data for the PDF
    const tableData = exportData().map((item) => [
      item.Month,
      ...seriesData.map((series) => item[series.name]),
    ]);

    // Define the columns based on your series data
    const columns = [
      { header: 'Month', dataKey: 'Month' },
      ...seriesData.map((series) => ({ header: series.name, dataKey: series.name })),
    ];

    // Define the options for the autoTable
    const options: AutoTableOptions = {
      head: [['Month', ...seriesData.map((series) => series.name)]],
      body: tableData,
      columns, // Add the columns property here
    };

    // Generate the table in the PDF
    autoTable(doc, options);

    // Save the PDF with the specified filename
    doc.save(`${filename}.pdf`);
  };

  return { excelExport, pdfExport };
};
