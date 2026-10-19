declare module 'jspdf-autotable' {
  import type { jsPDF } from 'jspdf';

  interface Column {
    header: string;
    dataKey: string;
  }

  interface AutoTableOptions {
    columns: Column[];
    body: any[];
    head?: any[][];
    startY?: number;
    styles?: Record<string, unknown>;
    headStyles?: Record<string, unknown>;
    margin?: { left?: number; right?: number; top?: number; bottom?: number };
    horizontalPageBreak?: boolean;
    horizontalPageBreakRepeat?: string[] | number[] | string | number;
    didDrawPage?: () => void;
    // Add other options if necessary
  }

  export default function autoTable(doc: jsPDF, options: AutoTableOptions): void;
}
