'use client';

import { createContext } from 'react';

/** Visible workspace context for exports of complete, already-loaded collections. */
export const TableExportContext = createContext<string[]>([]);
