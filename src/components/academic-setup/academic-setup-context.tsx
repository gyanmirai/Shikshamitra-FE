'use client';

import { useContext, createContext } from 'react';

export const AcademicSetupContext = createContext({ isOnboarding: false });

export const useAcademicSetupContext = () => useContext(AcademicSetupContext);
