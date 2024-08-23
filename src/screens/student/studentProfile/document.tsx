import React from 'react';

import { FileRecentItem } from 'src/components/file-manager/file-recent-items';

import type { StudentTabsComponentType } from '.';

const _fileNames = [
  'cover-2.jpg',
  'design-suriname-2015.mp3',
  'expertise-2015-conakry-sao-tome-and-principe-gender.mp4',
  'money-popup-crack.pdf',
  'cover-4.jpg',
  'cover-6.jpg',
  'large-news.txt',
  'nauru-6015-small-fighter-left-gender.psd',
  'tv-xs.doc',
  'gustavia-entertainment-productivity.docx',
  'vintage-bahrain-saipan.xls',
  'indonesia-quito-nancy-grace-left-glad.xlsx',
  'legislation-grain.zip',
  'large-energy-dry-philippines.rar',
  'footer-243-ecuador.iso',
  'kyrgyzstan-04795009-picabo-street-guide-style.ai',
  'india-data-large-gk-chesterton-mother.esp',
  'footer-barbados-celine-dion.ppt',
  'socio-respectively-366996.pptx',
  'socio-ahead-531437-sweden-popup.wav',
  'trinidad-samuel-morse-bring.m4v',
  'cover-12.jpg',
  'cover-18.jpg',
  'xl-david-blaine-component-tanzania-books.pdf',
];
const GB = 1000000000 * 24;
const _files = _fileNames.map((name, index) => ({
  id: `${index}_file`,
  name,
  url: '',
  shared: [{ id: '', name: '', email: '', avatarUrl: '', permission: '' }],
  tags: [],
  size: GB / ((index + 1) * 500),
  createdAt: '',
  modifiedAt: '',
  type: `${name.split('.').pop()}`,
  isFavorited: true,
}));

const Document = (props: StudentTabsComponentType) =>
  _files
    .slice(0, 5)
    .map((file: any) => (
      <FileRecentItem key={file.id} file={file} onDelete={() => console.info('DELETE', file.id)} />
    ));
export default Document;
