'use client';

import {
  AcademicLanguageTypingGuide,
  AcademicLanguageTypingProvider,
} from './language-typing';

type AcademicModuleUiProviderProps = {
  children: React.ReactNode;
};

export function AcademicModuleUiProvider({ children }: AcademicModuleUiProviderProps) {
  return (
    <AcademicLanguageTypingProvider>
      {children}
      <AcademicLanguageTypingGuide />
    </AcademicLanguageTypingProvider>
  );
}

