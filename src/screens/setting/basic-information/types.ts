export type TenantRecord = {
  id: string;
  name?: string;
  adminEmailAddress?: string;
  extraProperties?: {
    InstituteName?: string;
    Logo?: string[];
    Banner?: string[];
    PrincipleSign?: string[];
    Address1?: string;
    Address2?: string;
    Address3?: string;
    City?: string;
    State?: { name: string; isoCode?: string };
    Country?: { name: string; isoCode?: string };
    PostalCode?: string;
    ContactNumber?: string;
  };
};

export type BasicInformationFormProps = {
  editData?: TenantRecord | null;
  handleClose?: () => void;
};
