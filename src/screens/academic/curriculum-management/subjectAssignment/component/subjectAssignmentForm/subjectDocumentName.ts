export function getSubjectDocumentName(
  file: string | File,
  localFileNames: Record<string, string>
) {
  if (!file) return '';
  if (typeof file !== 'string') return file.name;
  if (localFileNames[file]) return localFileNames[file];

  const normalized = file.split('?')[0];
  const segments = normalized.split('/').filter(Boolean);
  let name = decodeURIComponent(segments[segments.length - 1] || '');

  // Uploaded files may prefix the original name with a UUID and underscore.
  if (name.length > 37 && name[36] === '_') {
    const prefix = name.substring(0, 36);
    if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(prefix)) {
      name = name.substring(37);
    }
  }

  return name;
}
