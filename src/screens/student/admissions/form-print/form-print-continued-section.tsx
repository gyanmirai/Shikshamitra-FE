import type { ReactNode } from 'react';

import { Text, View } from '@react-pdf/renderer';

type Props = {
  title: string;
  language: string;
  fontFamily: string;
  fontSize: number;
  startNewPage?: boolean;
  tracker: SectionContinuationTracker;
  children: ReactNode;
};

export type SectionContinuationTracker = { started: boolean };

export function continuedSectionTitle(title: string, language: string) {
  const continued = language === 'hi' ? 'जारी' : language === 'gu' ? 'ચાલુ' : 'continued';
  return `${title} (${continued})`;
}

export function PrintSectionStart({ tracker }: { tracker: SectionContinuationTracker }) {
  return (
    <Text
      style={{ height: 0, fontSize: 1 }}
      render={({ totalPages }) => {
        if (totalPages != null) tracker.started = true;
        return '';
      }}
    />
  );
}

/** Repeat a heading only on pages containing a continuation of this section. */
export function ContinuedPrintSection({
  title,
  language,
  fontFamily,
  fontSize,
  startNewPage,
  tracker,
  children,
}: Props) {
  return (
    <View break={startNewPage}>
      <Text
        fixed
        style={{ height: fontSize + 6, fontSize, fontWeight: 700, fontFamily }}
        render={({ totalPages }) => {
          // Earlier pagination passes can include pages the section is moved off.
          if (totalPages == null) return '';
          return tracker.started ? continuedSectionTitle(title, language) : '';
        }}
      />
      {children}
    </View>
  );
}
