import { useId } from 'react';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import { Button, Typography } from '@mui/material';

import { hasAdmissionPrintPhotoField } from './form-print-model';
import {
  PrintSettingText,
  PrintSettingsGrid,
  PrintSettingsCard,
  PrintSettingsCards,
  PrintSettingSelect,
  PrintSettingNumber,
  PrintSettingToggle,
  PrintSettingsResetButton,
} from './admission-print-setting-controls';

import type { AdmissionPrintAdvancedTabProps } from './admission-print-advanced-types';

const ALIGNMENTS = [
  ['left', 'Left'],
  ['center', 'Centre'],
  ['right', 'Right'],
] as const;

export function AdmissionPrintHeaderFooterSettings({
  settings,
  advanced,
  branding,
  form,
  onChange,
  onEditHeader,
  update,
}: AdmissionPrintAdvancedTabProps) {
  const { header, photo, footer } = advanced;
  const hasPhotoField = hasAdmissionPrintPhotoField(form.sections);
  const contactHelpId = useId();
  const contacts = [
    ['phone', 'School phone', branding.schoolPhone],
    ['email', 'School email', branding.schoolEmail],
    ['website', 'School website', branding.schoolWebsite],
  ] as const;
  return (
    <PrintSettingsCards>
      <PrintSettingsCard
        defaultExpanded
        title="School Details"
        icon={GlobalIcons.building}
        action={
          <PrintSettingsResetButton
            title="School Details"
            onReset={() =>
              update('header', {
                continuation: 'compact',
                schoolName: true,
                address: true,
                phone: false,
                email: false,
                website: false,
              })
            }
          />
        }
        descriptionTooltip="Use the school identity configured in Institute Setup. These options do not change Institute Setup."
      >
        {branding.schoolName && <Typography variant="subtitle2">{branding.schoolName}</Typography>}
        {onEditHeader && (
          <Button
            type="button"
            size="small"
            variant="outlined"
            color="inherit"
            startIcon={<Iconify icon={GlobalIcons.edit} />}
            onClick={onEditHeader}
            sx={{ alignSelf: 'flex-start' }}
          >
            Edit header
          </Button>
        )}
        <PrintSettingToggle
          label="School name"
          checked={header.schoolName}
          disabled={!settings.showSchoolHeader}
          onChange={(schoolName) => update('header', { schoolName })}
        />
        <PrintSettingToggle
          label="School address"
          checked={header.address}
          disabled={!settings.showSchoolHeader}
          onChange={(address) => update('header', { address })}
        />
        {contacts.map(([key, label, value]) => (
          <PrintSettingToggle
            key={key}
            label={label}
            checked={header[key]}
            disabled={!settings.showSchoolHeader || !value}
            descriptionId={!value ? contactHelpId : undefined}
            onChange={(checked) => update('header', { [key]: checked })}
          />
        ))}
        {contacts.some(([, , value]) => !value) && (
          <Typography id={contactHelpId} variant="caption" color="text.secondary">
            Set missing school contact details in Institute Setup to include them.
          </Typography>
        )}
        <PrintSettingSelect
          label="Continuation page header"
          value={header.continuation}
          options={[
            ['compact', 'Compact school header'],
            ['full', 'Full header'],
            ['none', 'No school header'],
          ]}
          onChange={(continuation) => update('header', { continuation })}
        />
      </PrintSettingsCard>
      <PrintSettingsCard
        title="Title & Admission Details"
        icon={GlobalIcons.admissionDetails}
        action={
          <PrintSettingsResetButton
            title="Title & Admission Details"
            onReset={() =>
              update('header', {
                title: '',
                subtitle: '',
                alignment: 'center',
                registrationNumber: true,
                date: true,
                board: false,
                medium: false,
                class: false,
                academicYear: false,
              })
            }
          />
        }
        descriptionTooltip="Use a print-specific title or leave it empty to use the form name. Academic details use the selected admission context."
      >
        <PrintSettingText
          label="Print title"
          value={header.title}
          onChange={(title) => update('header', { title })}
          helperText="Leave empty to use the form name."
        />
        <PrintSettingText
          label="Subtitle"
          value={header.subtitle}
          onChange={(subtitle) => update('header', { subtitle })}
        />
        <PrintSettingSelect
          label="Header alignment"
          value={header.alignment}
          options={ALIGNMENTS}
          onChange={(alignment) => update('header', { alignment })}
        />
        {(
          [
            ['registrationNumber', 'Registration number'],
            ['date', 'Date'],
            ['board', 'Board'],
            ['medium', 'Medium'],
            ['class', 'Class'],
            ['academicYear', 'Academic year'],
          ] as const
        ).map(([key, label]) => (
          <PrintSettingToggle
            key={key}
            label={label}
            checked={header[key]}
            onChange={(checked) => update('header', { [key]: checked })}
          />
        ))}
      </PrintSettingsCard>
      <PrintSettingsCard
        title="Photo Space"
        icon={GlobalIcons.image}
        action={
          hasPhotoField && (
            <PrintSettingsResetButton
              title="Photo Space"
              onReset={() =>
                onChange({
                  ...settings,
                  showPhoto: true,
                  advanced: {
                    ...settings.advanced,
                    photo: {
                      placement: 'first',
                      alignment: 'right',
                      width: 35,
                      height: 45,
                      caption: '',
                      useSaved: true,
                    },
                  },
                })
              }
            />
          )
        }
        descriptionTooltip="Set the printed photo size and position for photo questions added in Build form. Blank copies show the photo dimensions."
      >
        {hasPhotoField ? (
          <>
            <PrintSettingToggle
              label="Show photo space"
              checked={settings.showPhoto}
              onChange={(showPhoto) => onChange({ ...settings, showPhoto })}
            />
            <PrintSettingSelect
              label="Photo placement"
              value={photo.placement}
              disabled={!settings.showPhoto}
              options={[
                ['field', 'At the photo question'],
                ['first', 'Before questions'],
                ['last', 'After questions'],
                ['header-top-right', 'Top right of first-page header'],
              ]}
              onChange={(placement) => update('photo', { placement })}
            />
            <PrintSettingsGrid>
              <PrintSettingNumber
                label="Photo width"
                value={photo.width}
                min={20}
                max={55}
                unit="mm"
                disabled={!settings.showPhoto}
                onChange={(width) => update('photo', { width })}
              />
              <PrintSettingNumber
                label="Photo height"
                value={photo.height}
                min={25}
                max={70}
                unit="mm"
                disabled={!settings.showPhoto}
                onChange={(height) => update('photo', { height })}
              />
              <PrintSettingSelect
                label="Photo alignment"
                value={photo.placement === 'header-top-right' ? 'right' : photo.alignment}
                disabled={!settings.showPhoto || photo.placement === 'header-top-right'}
                options={ALIGNMENTS}
                onChange={(alignment) => update('photo', { alignment })}
              />
              <PrintSettingText
                label="Photo caption"
                value={photo.caption}
                disabled={!settings.showPhoto}
                onChange={(caption) => update('photo', { caption })}
              />
            </PrintSettingsGrid>
            <PrintSettingToggle
              label="Use saved student photo in filled copies"
              checked={photo.useSaved}
              disabled={!settings.showPhoto}
              onChange={(useSaved) => update('photo', { useSaved })}
            />
          </>
        ) : (
          <Typography variant="body2" color="text.secondary">
            Add a photo question in Build form to include a photo on the printed form.
          </Typography>
        )}
      </PrintSettingsCard>
      <PrintSettingsCard
        title="Footer"
        icon={GlobalIcons.documentIcon}
        action={
          <PrintSettingsResetButton
            title="Footer"
            onReset={() =>
              update('footer', {
                placement: 'every',
                alignment: 'right',
                pageNumbers: true,
                registrationReference: false,
                schoolName: false,
                formTitle: false,
              })
            }
          />
        }
        descriptionTooltip="Choose footer placement and the references repeated on printed pages."
      >
        <PrintSettingsGrid>
          <PrintSettingSelect
            label="Footer pages"
            value={footer.placement}
            options={[
              ['every', 'Every page'],
              ['first', 'First page'],
              ['last', 'Last page'],
              ['none', 'No footer'],
            ]}
            onChange={(placement) => update('footer', { placement })}
          />
          <PrintSettingSelect
            label="Footer alignment"
            value={footer.alignment}
            disabled={footer.placement === 'none'}
            options={ALIGNMENTS}
            onChange={(alignment) => update('footer', { alignment })}
          />
        </PrintSettingsGrid>
        {(
          [
            ['pageNumbers', 'Page numbers'],
            ['registrationReference', 'Registration reference'],
            ['schoolName', 'School name in footer'],
            ['formTitle', 'Form title in footer'],
          ] as const
        ).map(([key, label]) => (
          <PrintSettingToggle
            key={key}
            label={label}
            checked={footer[key]}
            disabled={footer.placement === 'none'}
            onChange={(checked) => update('footer', { [key]: checked })}
          />
        ))}
      </PrintSettingsCard>
    </PrintSettingsCards>
  );
}
