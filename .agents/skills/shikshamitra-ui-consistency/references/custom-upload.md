# CustomUpload: consistent document fields

Use the default import from `src/components/custom-upload` for document selection, file cards,
preview/download, and removal in [drawers](drawers.md), [dialogs](form-dialogs.md), and
[page forms](page-forms.md). Keep the same [section structure](sections.md) and attachment
terminology in the corresponding view. Selection does not itself upload anything to a server.

## Component choice and current API

| Source | Actual contract |
| --- | --- |
| [Directory default](../../../../src/components/custom-upload/index.tsx) | Default export is named FileUploader internally; import it as CustomUpload. This guide's standard document API. |
| [Alternate file](../../../../src/components/custom-upload/custom-upload.tsx) | Different API: array values, boolean error, helperText/label, outputFormat, onDelete, previewCount, and banner variant. It is not interchangeable with the directory default. Its default branch does not configure file type/size rejection or consume disabled; banner has separate validation/busy behavior. |
| [Banner](../../../../src/components/custom-upload/banner-upload.tsx), [hook](../../../../src/components/custom-upload/use-banner-upload.ts) | Specialized image workflow; preserve its own allowed formats, file-reading state, and output contract. Do not apply banner behavior to general documents. |

Inspect the actual import before editing an existing workflow. Reuse its supported API; do not
silently switch wrappers and change its values, validation, or file payload format.

Directory-default props:

| Need | Supported props / behavior |
| --- | --- |
| Selection | `multiple` defaults true; `value` and required `onChange` use an array for multiple, a File/FileData for single |
| Saved files | Exported `FileData`: name, filePath, optional size/type/url/base64. Normalize server metadata to this shape; newly chosen files remain File objects |
| Copy | `primaryText`, `secondaryText`, `propertyPr`; no `label`, `required`, or `helperText` prop |
| Error | `error` is a message string; `onReject(message)` currently reports oversized files |
| Availability/progress | `disabled`, `loading`, `isLoading`; either loading flag activates the built-in indeterminate spinner and locks file actions |
| Picker hints | `accept` string; no public maxSize, maxFiles, allowedTypes, or per-file progress prop |
| Cards/preview | `showVisibleDocumentCount` defaults 3, `showPreview` defaults true, `onPreview(file)` overrides built-in preview |
| Layout/accessibility | `parentsProps`, `dragProps` are Box props; `hideDropzone` hides selection only, not Remove |

For single-file removal the implementation emits null, although the single onChange/value type
does not include it. Handle that actual clear result at the owner and record the typing gap;
do not leave an old form value behind. Multiple-file removal emits the remaining array.

## Labels, required star, help, and spacing

- Put upload fields in a meaningful section, such as Attachments, using the same section
  heading/icon/info style as the rest of the form. Prefer a full-width grid row for the file list.
- Add a persistent sentence-case field label, such as `Supporting documents`, with a supported
  MUI FormLabel/FormControl composition outside this uploader. It has no required/label prop.
  Show exactly one `*` when required by the schema; optional attachments have no star.
- Associate label, help, and current error with the group/dropzone using stable IDs and
  `parentsProps`/`dragProps` accessibility attributes. Expose required/invalid meaning on the
  supported focusable control. Use the dropzone's existing Enter/Space/file-picker behavior.
- Explain the allowed extensions, per-file size, and actual file-count rule before selection.
  Use secondaryText/propertyPr for concise guidance; keep important guidance below the cards
  too, because built-in empty-dropzone copy disappears once files are selected.
- Add accessible `GlobalIcons.info` help only when a document's purpose or evidence rule needs
  explanation. Errors and mandatory instructions stay visible, not hidden in a tooltip.
- Keep the theme's dashed area, cards, filename/size hierarchy, and semantic error treatment.
  Use section spacing `2` (16 px), normal helper spacing, and the uploader's internal gaps;
  do not wrap it in another padded card or force it to ordinary text-input height.
- Required uploads use one [ShakingTextField](sections.md#shared-required-field-wrapper) around
  the field/error group. Touch/submission gates a required error; an explicit rejected-file
  attempt can mark the field touched and show its rejection immediately. Mirror the same
  actual error in the uploader's string `error` prop and the visible feedback.

The built-in error text renders only in the empty, visible dropzone. For invalid nonempty lists
or hidden dropzones, provide an associated field error below the list. Avoid displaying that
same message twice when the built-in copy is already visible. The current wrapper does not
offer a dedicated helper/error ID API; inspect the composition and extend it centrally if needed
for complete label/error association rather than inventing props.

## File types, size, and validation

| Constraint | Current behavior / required integration |
| --- | --- |
| Standard document types | PNG, JPEG/JPG and PDF; internal MIME list is image/png, image/jpeg, image/jpg, application/pdf |
| Per-file limit | `5 * 1024 * 1024` bytes, labeled 5 MB by the UI; current comparison rejects greater than this limit, so exactly the limit is accepted |
| MIME validation gap | Multiple mode filters by its internal list; single mode only checks size. Unsupported multiple-file types are currently filtered without a rejection message |
| accept override | Changes the native picker hint only; it does not change the internal multiple-mode MIME allowlist, and drag/drop does not rely on this hint |
| Count | No general maximum-count enforcement; showVisibleDocumentCount limits displayed cards, not accepted files |

Preserve these shared defaults unless a scoped product task changes the component and contract.
Do not claim CSV/Excel/other formats are supported in both modes just because accept includes
them. Apply a narrower feature rule through owning validation; broader accepted types require
an explicit shared-component change. Client checks improve feedback; the backend still validates
the upload against its actual contract.

Formik/Yup validates required/nonempty selection, the permitted count, each new file's actual
type and byte size, and applicable duplicate/total-size rules. Do not invent a universal count,
aggregate cap, duplicate policy, or zero-byte-file rule. Missing size/type metadata on an existing
server attachment means unknown, not zero bytes or automatic rejection; preserve its server ID
and check eligibility through the actual saved-file contract.

Validate picker and dropped files consistently, retain existing valid files when another file
is rejected, and show an actionable rejection with filename/reason where available. Unsupported
types must not disappear silently in the intended UI. The current MIME/reporting gaps need an
implementation change before that behavior can be claimed. Keep file errors near this field;
a toast alone does not replace required/form-level validation.

## Upload progress, failure, and form ownership

- Keep values in the owning Formik form. Connect onChange to that field and mark it touched
  after a meaningful selection/removal; do not create a second authoritative file list.
- Use the owning workflow's supported upload/mutation client. Selection, local parsing,
  server transfer, and final save are different phases; show accurate status for the active phase.
  Do not introduce immediate upload unless the workflow actually requires it.
- Pass loading/isLoading only during the real upload operation. The built-in spinner/status
  is indeterminate: do not invent a progress percentage or pass an unsupported progress prop.
  Where the existing client reports real bytes/progress, render a labeled progress region in
  the owner. No byte progress means a spinner, not simulated completion.
- While blocking, lock pick/drop/remove and conflicting Submit/Cancel/X/Escape/navigation using
  the owning form boundary and [button-family rules](button-family.md). `disabled` alone locks
  the uploader without claiming an upload. It does not lock the surrounding form or shell.
- On failure, keep the selected files and saved attachment references, show accurate errors,
  release busy state, and allow a supported retry without duplicate uploads. After success,
  update file metadata/baseline according to the real workflow; do not show success on selection.
- Include file additions/removals in dirty-state comparison. Dirty cancellation uses the single
  [Keep Editing / Discard Changes](confirmations.md) flow. If immediate uploads already occurred,
  use the established cleanup contract; discarding the form must not invent a server delete.

## Preview, download, remove, and view details

- Cards show the readable filename, actual known size or an honest unknown-size label, and
  a meaningful thumbnail. Long filenames stay contained and remain available accessibly.
- Preview opens the selected file, preserving the form and values. Use onPreview for an
  owning preview workflow; otherwise the built-in preview handles images/PDFs. A local File,
  saved authorized document, unsupported preview, and failed preview need distinct handling.
- Reuse [DocumentPreviewDialog](../../../../src/components/preview-document/DocumentPreviewDialog.tsx)
  only when its fetching mode fits: its default client is curriculum-specific; directUrl uses
  its checked API origin and authenticated fetch. Do not import that domain client into unrelated
  features as a universal file endpoint. Keep credentials out of displayed filenames/URLs.
- Preview/download/remove use small icon controls with tooltips and names such as `Preview
  certificate.pdf`, `Download certificate.pdf`, `Remove certificate.pdf`. Use GlobalIcons.eye,
  download, delete, and cancel through Iconify for new composition. Labeled actions follow the
  button guide. Preview Close dismisses only the preview and restores its launching focus.
- Remove changes the draft file list through onChange; it is not proof of a server deletion.
  Preserve other attachments, update required validation, and use the owning mutation/confirmation
  only if permanent deletion is actually part of the workflow. Allow selecting the same file again.
- In read-only details retain the same attachment section and permitted Preview/Download actions,
  without required stars, pick/drop, or Remove. hideDropzone is insufficient for read-only mode,
  because removal remains. Use suitable view cards or extend shared action visibility centrally;
  do not disable the entire uploader and thereby remove useful preview/download access.
- Manage preview object URLs through their lifecycle and release them when no longer used.
  The current built-in PDF/local-download paths need lifecycle review; documentation does not
  establish full cleanup, authenticated-preview behavior, focus return, or safe failure handling.

## References and verification

No supplied image depicts a complete upload field. The Syllabus screenshot establishes its
Attachments section context only; the new Staff member image belongs to
[searchable dropdowns](searchable-dropdowns.md), not uploads. Upload visual matching remains
Unverified until an appropriate reference and runtime comparison exist.

Source references: [bulk subject import](../../../../src/screens/academic/curriculum-management/setting/subjectCreation/bulkImport/BulkSubjectImportDialog.tsx)
uses the directory default with a scoped spreadsheet workflow; it does not establish standard
document formats. [Maintenance form](../../../../src/screens/transport/VehicleManagements/Components/AddMaintenanceForm.tsx)
uses the alternate wrapper. [FileThumbnail](../../../../src/components/file-thumbnail/file-thumbnail.tsx)
and [DocumentCard](../../../../src/components/preview-document/DocumentCard.tsx) have their own
props/fetch behavior; inspect before reuse.

Verify empty/required/optional, single/multiple, type and size boundaries, count limits,
selection/drop/rejection, persisted metadata, zero/unknown sizes, remove/reselect, upload failure
and retry, preview/download failure, dirty cancellation, keyboard/focus, busy locks, long names,
narrow layouts, and both themes. Documentation checks cover links/assets and whitespace;
runtime changes require focused tests and the in-app browser smoke test. This guide changes
no application code and does not claim the recorded source gaps have been fixed.
