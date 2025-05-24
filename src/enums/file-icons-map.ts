type FileType = 'pdf' | 'doc' | 'docx' | 'xls' | 'xlsx' | 'ppt' | 'pptx';

const iconMap: Record<FileType, { icon: string; color: string }> = {
  pdf: { icon: 'mdi:file-pdf-box', color: '#f44336' },
  doc: { icon: 'mdi:file-word-box', color: '#2196f3' },
  docx: { icon: 'mdi:file-word-box', color: '#2196f3' },
  xls: { icon: 'mdi:file-excel-box', color: '#4caf50' },
  xlsx: { icon: 'mdi:file-excel-box', color: '#4caf50' },
  ppt: { icon: 'mdi:file-powerpoint-box', color: '#ff9800' },
  pptx: { icon: 'mdi:file-powerpoint-box', color: '#ff9800' },
};

export const getFileIconData = (fileName: string) => {
  const ext = fileName.split('.').pop()?.toLowerCase() as FileType;
  return iconMap[ext] || { icon: 'mdi:file-outline', color: 'text.secondary' };
};
