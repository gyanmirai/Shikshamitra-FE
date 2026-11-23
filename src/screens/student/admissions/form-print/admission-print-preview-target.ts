import type { PdfPreviewTarget } from 'src/components/preview-document/pdf-preview/find-pdf-preview-target';
import type { AdmissionFormPrintSettings } from 'src/redux/student/admissions/admission-form-print-settings';

import { resolveAdmissionPrintAdvancedSettings } from 'src/redux/student/admissions/admission-form-print-settings';

import type { AdmissionPrintDocument } from './form-print-model';

type LabeledTarget = { label: string; target: PdfPreviewTarget };

const changed = (before: unknown, after: unknown) =>
  JSON.stringify(before) !== JSON.stringify(after);
const changedCode = (before: Record<string, unknown>, after: Record<string, unknown>) =>
  [...new Set([...Object.keys(after), ...Object.keys(before)])].find((code) =>
    changed(before[code], after[code])
  );
const settingLabels: Record<string, string> = {
  columns: 'Section columns',
  spacing: 'Section spacing',
  fullWidth: 'Full-width section',
  startNewPage: 'Start section on a new page',
  keepHeading: 'Keep heading with first row',
  repeatTableHeadings: 'Repeat table headings',
  blankRows: 'Blank table rows',
  width: 'Field width',
  labelPosition: 'Label position',
  answerStyle: 'Answer style',
  writingLines: 'Writing lines',
  showRequired: 'Show required marker',
  showHelp: 'Show field help text',
  showConditional: 'Show conditional question note',
};
function describeChange(
  title: string,
  before: Record<string, unknown> = {},
  after: Record<string, unknown> = {}
) {
  const keys = [...new Set([...Object.keys(before), ...Object.keys(after)])].filter((key) =>
    changed(before[key], after[key])
  );
  const setting = keys.length === 1 ? settingLabels[keys[0]] : undefined;
  return setting ? `${title} · ${setting}` : title;
}

export function getAdmissionPrintPreviewTarget(
  model: AdmissionPrintDocument,
  before: AdmissionFormPrintSettings,
  after: AdmissionFormPrintSettings
): LabeledTarget | undefined {
  const previous = resolveAdmissionPrintAdvancedSettings(before.advanced);
  const next = resolveAdmissionPrintAdvancedSettings(after.advanced);
  const sections = model.steps.flatMap((step) => step.sections);
  const first = (label: string, page = 1): LabeledTarget => ({ label, target: { page } });
  const last = (label: string, text?: string): LabeledTarget => ({
    label,
    target: { page: 'last', edge: 'bottom', ...(text && { text: [text] }) },
  });

  const fieldCode = changedCode(previous.fields, next.fields);
  if (fieldCode) {
    const section = sections.find((item) =>
      item.entries.some((entry) =>
        entry.fields.some((field) => field.code.toUpperCase() === fieldCode)
      )
    );
    const field = section?.entries
      .flatMap((entry) => entry.fields)
      .find((item) => item.code.toUpperCase() === fieldCode);
    if (field && section) {
      return {
        label: describeChange(field.label, previous.fields[fieldCode], next.fields[fieldCode]),
        target: {
          destination: `field:${section.key}:${field.key}`,
          text: [field.label],
          afterText: section.title,
        },
      };
    }
    return undefined;
  }
  const sectionCode = changedCode(previous.sections, next.sections);
  if (sectionCode) {
    const section = sections.find((item) => item.code.toUpperCase() === sectionCode);
    return (
      section && {
        label: describeChange(
          section.title,
          previous.sections[sectionCode],
          next.sections[sectionCode]
        ),
        target: { destination: `section:${section.key}`, text: [section.title] },
      }
    );
  }

  if (before.showPhoto !== after.showPhoto || changed(previous.photo, next.photo)) {
    const photo = sections
      .flatMap((section) => section.entries)
      .flatMap((entry) => entry.fields)
      .find((field) => field.kind === 'photo');
    const isLast = (after.showPhoto ? next.photo.placement : previous.photo.placement) === 'last';
    return {
      label: 'Photo space',
      target: {
        ...(isLast ? { page: 'last' as const, edge: 'bottom' as const } : { page: 1 }),
        text: [next.photo.caption, photo?.label ?? '', model.labels.photo].filter(Boolean),
      },
    };
  }

  const beforeContent = previous.content;
  const { content } = next;
  const previousTranslation = beforeContent.translations[model.language];
  const translation = content.translations[model.language];
  if (
    beforeContent.showInstructions !== content.showInstructions ||
    beforeContent.instructionsPlacement !== content.instructionsPlacement ||
    beforeContent.instructionSection !== content.instructionSection ||
    previousTranslation?.instructions !== translation?.instructions
  ) {
    const section = sections.find((item) => item.code.toUpperCase() === content.instructionSection);
    if (content.instructionsPlacement === 'before-declaration')
      return last(model.labels.instructions, model.labels.instructions);
    return {
      label: model.labels.instructions,
      target: {
        text: [model.labels.instructions, ...(section ? [section.title] : [])],
      },
    };
  }
  if (
    beforeContent.showChecklist !== content.showChecklist ||
    beforeContent.checklistPlacement !== content.checklistPlacement ||
    changed(previousTranslation?.checklist, translation?.checklist)
  ) {
    return content.checklistPlacement === 'first'
      ? { label: model.labels.checklist, target: { text: [model.labels.checklist] } }
      : last(model.labels.checklist, model.labels.checklist);
  }
  if (
    beforeContent.showDeclaration !== content.showDeclaration ||
    previousTranslation?.declaration !== translation?.declaration
  )
    return last(model.labels.declaration, model.labels.declaration);
  if (
    changed(
      [
        beforeContent.showOfficeUse,
        beforeContent.officePlacement,
        beforeContent.remarks,
        beforeContent.documentChecks,
        beforeContent.verificationDate,
        beforeContent.stamp,
      ],
      [
        content.showOfficeUse,
        content.officePlacement,
        content.remarks,
        content.documentChecks,
        content.verificationDate,
        content.stamp,
      ]
    )
  )
    return last(model.labels.officeUse, model.labels.officeUse);
  if (
    before.showSignature !== after.showSignature ||
    changed(
      [
        beforeContent.signaturePlacement,
        beforeContent.parentSignature,
        beforeContent.officeSignature,
        beforeContent.parentSignatureImage,
        beforeContent.officeSignatureImage,
        beforeContent.signatureDate,
        previousTranslation?.parentLabel,
        previousTranslation?.officeLabel,
      ],
      [
        content.signaturePlacement,
        content.parentSignature,
        content.officeSignature,
        content.parentSignatureImage,
        content.officeSignatureImage,
        content.signatureDate,
        translation?.parentLabel,
        translation?.officeLabel,
      ]
    )
  )
    return last(model.labels.signature, model.labels.signature);

  if (changed(previous.footer, next.footer)) {
    const placement =
      next.footer.placement === 'none' ? previous.footer.placement : next.footer.placement;
    return { label: 'Footer', target: { page: placement === 'last' ? 'last' : 1, edge: 'bottom' } };
  }
  if (previous.header.continuation !== next.header.continuation)
    return first('Header on later pages', 2);
  if (before.showSchoolHeader !== after.showSchoolHeader || changed(previous.header, next.header))
    return first('School header');
  if (changed(previous.branding, next.branding)) {
    const { bannerPages, bannerPlacement } = next.branding;
    if (bannerPlacement === 'selected') {
      const previousPages = previous.branding.bannerPages;
      const updated = [...bannerPages, ...previousPages].find(
        (page) => bannerPages.includes(page) !== previousPages.includes(page)
      );
      return first('School branding', updated ?? bannerPages[0]);
    }
    return first('School branding');
  }

  if (before.template !== after.template) return { label: 'Print template', target: {} };
  if (before.paperSize !== after.paperSize || changed(previous.paper, next.paper))
    return { label: 'Paper setup', target: {} };
  if (changed(previous.border, next.border)) return { label: 'Page borders', target: {} };
  if (changed(previous.style, next.style)) return { label: 'Print styles', target: {} };
  if (before.layout !== after.layout || changed(previous.flow, next.flow))
    return { label: 'Form layout', target: {} };
  if (changed(previous.copies, next.copies)) return { label: 'Printed answers', target: {} };
  return undefined;
}
