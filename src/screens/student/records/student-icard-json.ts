import type { IdCardTemplate } from 'src/redux/student/records/student-record-documents-api';
import type {
  IdentityCardLayout,
  IdentityCardPrintSettings,
} from 'src/components/identity-card-designer';

import { DEFAULT_IDENTITY_CARD_PRINT_SETTINGS } from 'src/components/identity-card-designer';

export function readStudentICardLayout(template: IdCardTemplate): IdentityCardLayout | null {
  if (template.schemaVersion !== 2 || !template.layoutJson) return null;
  try {
    const layout = JSON.parse(template.layoutJson) as IdentityCardLayout;
    if (
      !layout?.front ||
      !Array.isArray(layout.front.elements) ||
      (layout.back && !Array.isArray(layout.back.elements))
    )
      return null;
    if (
      ![...layout.front.elements, ...(layout.back?.elements ?? [])].every(
        (element) =>
          element &&
          typeof element === 'object' &&
          typeof element.id === 'string' &&
          typeof element.type === 'string'
      )
    )
      return null;
    return layout;
  } catch {
    return null;
  }
}

export function getStudentICardPrintSettings(template: IdCardTemplate): IdentityCardPrintSettings {
  try {
    const settings = template.printSettingsJson
      ? (JSON.parse(template.printSettingsJson) as Partial<IdentityCardPrintSettings>)
      : {};
    return {
      ...DEFAULT_IDENTITY_CARD_PRINT_SETTINGS,
      ...settings,
      cardsPerPage: template.cardsPerPage,
      units: 'mm',
    };
  } catch {
    return { ...DEFAULT_IDENTITY_CARD_PRINT_SETTINGS, cardsPerPage: template.cardsPerPage };
  }
}
