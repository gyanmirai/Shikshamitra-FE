'use client';

import type { ReactNode } from 'react';

// The authenticated app owns session access; each Library destination owns its exact action guard.
const LibraryLayout = ({ children }: { children: ReactNode }) => children;

export default LibraryLayout;
