import type { IBookPayload } from './type';

export const getInitialBookData = (editData?: Partial<IBookPayload> | null): IBookPayload => ({
  title: editData?.title || '',
  isbn: editData?.isbn || '',
  author: editData?.author || '',
  publisher: editData?.publisher || '',
  subject: editData?.subject || '',
  category: editData?.category || '',
  edition: editData?.edition || '',
  language: editData?.language || '',
  price: editData?.price || null,
  numberOfCopies: editData?.numberOfCopies || 0,
  bookCoverImages: editData?.bookCoverImages || [],
  copies: editData?.copies || [],
});
