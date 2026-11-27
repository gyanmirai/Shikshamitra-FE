export const ADMISSION_PRINT_PAPER_SIZES = ['A4', 'A5', 'LETTER', 'LEGAL'] as const;

export type AdmissionPrintPaperSize = (typeof ADMISSION_PRINT_PAPER_SIZES)[number];
export type AdmissionPrintAlignment = 'left' | 'center' | 'right';
export type AdmissionPrintPlacement = 'first' | 'every' | 'last';

/** Percentages of the printable header band, in persisted paper coordinates. */
export type AdmissionPrintAssetPlacement = {
  x: number;
  y: number;
  width: number;
  height: number;
  lockAspectRatio?: boolean;
};

export type AdmissionPrintHeaderElement =
  | 'logo'
  | 'banner'
  | 'schoolName'
  | 'address'
  | 'phone'
  | 'email'
  | 'website'
  | 'title'
  | 'subtitle'
  | 'board'
  | 'medium'
  | 'class'
  | 'academicYear'
  | 'registrationNumber'
  | 'date'
  | 'photo';

export type AdmissionPrintAcademicDetails = Partial<
  Record<'board' | 'medium' | 'class' | 'academicYear', string>
>;

export type AdmissionPrintSectionSettings = {
  columns?: 1 | 2 | 3 | 4;
  spacing?: 'compact' | 'spacious';
  fullWidth?: boolean;
  startNewPage?: boolean;
  keepHeading?: boolean;
  repeatTableHeadings?: boolean;
  blankRows?: number;
};

export type AdmissionPrintFieldSettings = {
  width?: 'auto' | 'half' | 'full';
  labelPosition?: 'above' | 'inline';
  answerStyle?: 'auto' | 'line' | 'boxes' | 'checkboxes';
  writingLines?: number;
  showRequired?: boolean;
  showHelp?: boolean;
  showConditional?: boolean;
};

export type AdmissionPrintAdvancedSettings = {
  paper?: {
    orientation?: 'portrait' | 'landscape';
    margins?: { top: number; right: number; bottom: number; left: number };
  };
  border?: {
    enabled?: boolean;
    placement?: 'first' | 'every';
    style?: 'single' | 'double';
    thickness?: 'thin' | 'medium' | 'thick';
    inset?: number;
    corners?: 'square' | 'rounded';
    sectionBorders?: boolean;
    fieldBorders?: boolean;
    dividers?: boolean;
  };
  style?: {
    palette?: 'school-blue' | 'neutral' | 'forest-green' | 'monochrome';
    sectionFill?: string;
    borderColor?: string;
    textColor?: string;
    fontFamily?: 'sans' | 'serif' | 'monospace' | 'roboto';
    baseSize?: number;
    titleSize?: number;
    labelWeight?: 'regular' | 'semibold';
  };
  branding?: {
    showLogo?: boolean;
    showBanner?: boolean;
    bannerPlacement?: 'first' | 'every' | 'selected';
    bannerPages?: number[];
    logo?: AdmissionPrintAssetPlacement;
    banner?: AdmissionPrintAssetPlacement;
  };
  header?: {
    layout?: Partial<Record<AdmissionPrintHeaderElement, AdmissionPrintAssetPlacement>>;
    continuation?: 'compact' | 'full' | 'none';
    schoolName?: boolean;
    address?: boolean;
    addressLayout?: 'vertical' | 'horizontal';
    phone?: boolean;
    email?: boolean;
    website?: boolean;
    board?: boolean;
    medium?: boolean;
    class?: boolean;
    academicYear?: boolean;
    title?: string;
    subtitle?: string;
    alignment?: AdmissionPrintAlignment;
    registrationNumber?: boolean;
    date?: boolean;
  };
  photo?: {
    placement?: 'first' | 'last' | 'field' | 'header-top-right';
    alignment?: AdmissionPrintAlignment;
    width?: number;
    height?: number;
    caption?: string;
    useSaved?: boolean;
  };
  footer?: {
    placement?: AdmissionPrintPlacement | 'none';
    alignment?: AdmissionPrintAlignment;
    pageNumbers?: boolean;
    registrationReference?: boolean;
    schoolName?: boolean;
    formTitle?: boolean;
  };
  flow?: { stepTitles?: boolean; sectionNumbers?: boolean };
  /** Uppercase authored codes survive draft reopen and new-version clones. */
  sections?: Record<string, AdmissionPrintSectionSettings>;
  fields?: Record<string, AdmissionPrintFieldSettings>;
  content?: {
    showInstructions?: boolean;
    instructionsPlacement?: 'first' | 'section' | 'before-declaration' | 'separate-page';
    instructionSection?: string;
    instructionHeadingSize?: 'default' | '10' | '12' | '14' | '16';
    instructionTextSize?: 'default' | '10' | '12' | '14' | '16';
    instructionTextWeight?: 'regular' | 'bold';
    instructionTextColor?: 'default' | 'black' | 'gray';
    showChecklist?: boolean;
    checklistPlacement?: 'first' | 'last' | 'separate-page';
    showDeclaration?: boolean;
    signaturePlacement?: 'last' | 'separate-page';
    parentSignature?: boolean;
    officeSignature?: boolean;
    parentSignatureImage?: string;
    officeSignatureImage?: string;
    signatureDate?: boolean;
    showOfficeUse?: boolean;
    officePlacement?: 'last' | 'separate-page';
    documentChecks?: boolean;
    remarks?: boolean;
    verificationDate?: boolean;
    stamp?: boolean;
    translations?: Record<
      string,
      {
        instructions?: string;
        checklist?: string[];
        declaration?: string;
        parentLabel?: string;
        officeLabel?: string;
      }
    >;
  };
  copies?: {
    unanswered?: 'blank' | 'dash' | 'not-provided';
    selectedChoices?: 'label' | 'mark';
  };
};

export type AdmissionFormPrintSettings = {
  template?: 'simple' | 'boxed-grid' | 'structured-classic';
  layout: 'compact' | 'spacious';
  paperSize: AdmissionPrintPaperSize;
  showSchoolHeader: boolean;
  showPhoto: boolean;
  showSignature: boolean;
  advanced?: AdmissionPrintAdvancedSettings | null;
};

export function resolveEditableRegistrationPrintTemplate(
  template: AdmissionFormPrintSettings['template']
) {
  return template && template !== 'simple' ? template : 'boxed-grid';
}

export const ADMISSION_PRINT_DEFAULT_ASSETS = {
  logo: { x: 0, y: 8, width: 14, height: 84, lockAspectRatio: true },
  banner: { x: 20, y: 10, width: 60, height: 80, lockAspectRatio: true },
} satisfies Record<'logo' | 'banner', AdmissionPrintAssetPlacement>;

/** The on-screen editor and the PDF use the same printable-width-to-band-height ratio. */
export const ADMISSION_PRINT_BRANDING_ASPECT = 7.5;

export const ADMISSION_PRINT_PALETTES = {
  'school-blue': { sectionFill: '#E7F2FF', borderColor: '#003399', textColor: '#0A1F44' },
  neutral: { sectionFill: '#F3F4F6', borderColor: '#667085', textColor: '#101828' },
  'forest-green': { sectionFill: '#E8F5EC', borderColor: '#166534', textColor: '#102A1A' },
  monochrome: { sectionFill: '#FFFFFF', borderColor: '#000000', textColor: '#000000' },
} as const;

export function resolveAdmissionPrintAdvancedSettings(
  advanced?: AdmissionPrintAdvancedSettings | null
) {
  const palette = advanced?.style?.palette ?? 'neutral';
  const colors = ADMISSION_PRINT_PALETTES[palette] ?? ADMISSION_PRINT_PALETTES.neutral;
  return {
    paper: {
      orientation: 'portrait' as const,
      margins: { top: 12, right: 12, bottom: 12, left: 12 },
      ...advanced?.paper,
    },
    border: {
      enabled: false,
      placement: 'every' as const,
      style: 'single' as const,
      thickness: 'thin' as const,
      inset: 8,
      corners: 'square' as const,
      sectionBorders: true,
      fieldBorders: true,
      dividers: true,
      ...advanced?.border,
    },
    style: {
      fontFamily: 'sans' as const,
      baseSize: 10,
      titleSize: 16,
      labelWeight: 'semibold' as const,
      ...colors,
      ...advanced?.style,
      palette,
      ...(palette === 'monochrome' ? colors : {}),
    },
    branding: {
      showLogo: true,
      showBanner: true,
      ...ADMISSION_PRINT_DEFAULT_ASSETS,
      ...advanced?.branding,
      bannerPlacement:
        advanced?.branding?.bannerPlacement ??
        (advanced?.header?.continuation === 'full' ? 'every' : 'first'),
      bannerPages: advanced?.branding?.bannerPages?.length ? advanced.branding.bannerPages : [1],
    },
    header: {
      continuation: 'compact' as const,
      schoolName: true,
      address: true,
      addressLayout: 'vertical',
      phone: false,
      email: false,
      website: false,
      board: false,
      medium: false,
      class: false,
      academicYear: false,
      alignment: 'center' as const,
      title: '',
      subtitle: '',
      registrationNumber: true,
      date: true,
      ...advanced?.header,
    },
    photo: {
      placement: 'first' as const,
      width: 35,
      height: 45,
      caption: '',
      useSaved: true,
      ...advanced?.photo,
      alignment:
        advanced?.photo?.alignment ?? (advanced?.photo?.placement === 'field' ? 'left' : 'right'),
    },
    footer: {
      placement: 'every' as const,
      alignment: 'right' as const,
      pageNumbers: true,
      registrationReference: false,
      schoolName: false,
      formTitle: false,
      ...advanced?.footer,
    },
    flow: { stepTitles: true, sectionNumbers: true, ...advanced?.flow },
    sections: advanced?.sections ?? {},
    fields: advanced?.fields ?? {},
    content: {
      showInstructions: false,
      instructionsPlacement: 'first' as const,
      instructionSection: '',
      instructionHeadingSize: 'default' as const,
      instructionTextSize: 'default' as const,
      instructionTextWeight: 'regular' as const,
      instructionTextColor: 'default' as const,
      showChecklist: false,
      checklistPlacement: 'last' as const,
      showDeclaration: false,
      signaturePlacement: 'last' as const,
      parentSignature: true,
      officeSignature: true,
      signatureDate: false,
      showOfficeUse: false,
      officePlacement: 'last' as const,
      documentChecks: true,
      remarks: true,
      verificationDate: true,
      stamp: true,
      ...advanced?.content,
      translations: advanced?.content?.translations ?? {},
    },
    copies: {
      unanswered: 'blank' as const,
      selectedChoices: 'label' as const,
      ...advanced?.copies,
    },
  };
}

export type ResolvedAdmissionPrintAdvancedSettings = ReturnType<
  typeof resolveAdmissionPrintAdvancedSettings
>;
