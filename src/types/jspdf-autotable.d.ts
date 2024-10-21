// types/jspdf-autotable.d.ts

import 'jspdf-autotable';

declare module 'jspdf-autotable' {
  interface AutoTableOptions {
    head?: string[][]; // Add head property
    // Add any other properties you may need to extend
  }
}
