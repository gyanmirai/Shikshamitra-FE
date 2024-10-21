declare module 'jspdf-autotable' {
  import { jsPDF } from 'jspdf';

  interface Column {
    header: string;
    dataKey: string;
  }

  interface AutoTableOptions {
    columns: Column[];
    body: any[];
    // Add other options if necessary
  }

  export default function autoTable(doc: jsPDF, options: AutoTableOptions): void;
}
