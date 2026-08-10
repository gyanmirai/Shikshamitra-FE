import type { AdmissionCrmExportDownloadDto } from 'src/redux/student/admissions-crm/admissions-crm-api';

export const downloadAdmissionExportFile = (result: AdmissionCrmExportDownloadDto) => {
  const bytes = Uint8Array.from(atob(result.base64Content), (value) => value.charCodeAt(0));
  const url = URL.createObjectURL(new Blob([bytes], { type: result.contentType }));
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = result.fileName;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
};
