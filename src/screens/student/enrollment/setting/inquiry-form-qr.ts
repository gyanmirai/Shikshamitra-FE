const qrFileNameFallback = 'inquiry-form';

export const getInquiryFormQrFileName = (templateName: string) => {
  const safeName = templateName
    .trim()
    .toLocaleLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

  return `${safeName || qrFileNameFallback}-qr.png`;
};

export const downloadInquiryFormQr = async ({
  publicUrl,
  templateName,
}: {
  publicUrl: string;
  templateName: string;
}) => {
  const { toDataURL } = await import('qrcode');
  const dataUrl = await toDataURL(publicUrl, {
    errorCorrectionLevel: 'M',
    margin: 2,
    width: 768,
    color: {
      dark: '#111827',
      light: '#FFFFFF',
    },
  });
  const anchor = document.createElement('a');
  anchor.href = dataUrl;
  anchor.download = getInquiryFormQrFileName(templateName);
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
};
