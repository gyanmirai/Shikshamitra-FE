export type CatalogueRequiredField =
  | 'author'
  | 'isbn'
  | 'publisher'
  | 'edition'
  | 'subject'
  | 'language'
  | 'applicableAge'
  | 'material';

export type CatalogueChoice = { code: string; label: string; isActive: boolean };

export type CatalogueDefinition = {
  requiredFields: CatalogueRequiredField[];
  languages: CatalogueChoice[];
  materials: CatalogueChoice[];
};

export type CatalogueConfiguration = CatalogueDefinition & {
  revision: string;
  source: 'Defaults' | 'School';
  canManageConfiguration: boolean;
};

export type CatalogueConfigurationRequest = {
  expectedRevision: string;
  definition: CatalogueDefinition;
};

export type CatalogueBookMetadata = {
  languageCode?: string | null;
  languageLabel?: string | null;
  materialCode?: string | null;
  materialLabel?: string | null;
  expectedCatalogueConfigurationRevision?: string | null;
};
