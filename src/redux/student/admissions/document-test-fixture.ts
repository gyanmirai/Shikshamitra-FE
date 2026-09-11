import { api } from 'src/redux/service';
import auth from 'src/redux/auth/authSlice';
import { configureStore } from '@reduxjs/toolkit';
import confirmPopup from 'src/redux/confirmPopup/confirmPopupSlice';

import type {
  AdmissionDocumentEvidence,
  ApplicationDocumentVerification,
} from './admission-document-types';

export const documentKey = { applicationId: 'application-1', stageInstanceId: 'stage-documents' };
export const documentPath = '*/api/student/enrollment/admissions/document-verification';
export const documentStagePath = `${documentPath}/applications/application-1/stages/stage-documents`;
export const documentEvidence: AdmissionDocumentEvidence = {
  id: 'evidence-1',
  versionNumber: 1,
  kind: 'upload',
  fileName: 'birth-certificate.pdf',
  contentType: 'application/pdf',
  size: 22,
  originalSeen: false,
  submittedBy: 'collector-1',
  submittedAt: '2026-09-10T10:00:00Z',
  status: 'pendingReview',
  canDownload: true,
  reviews: [],
};
export const documentSummary: ApplicationDocumentVerification = {
  ...documentKey,
  documentVerificationEnabled: true,
  isActive: true,
  canComplete: false,
  concurrencyStamp: 'application-stamp',
  blockers: ['Birth certificate is required.'],
  policy: {
    version: 1,
    enabled: true,
    allowWaivers: true,
    requireIndependentReview: false,
    requirements: [
      {
        code: 'BIRTH_CERTIFICATE',
        name: 'Birth certificate',
        requirement: 'required',
        collectionMode: 'upload',
        allowedExtensions: ['pdf'],
        maxFileSizeMb: 10,
      },
    ],
  },
  requirements: [
    {
      code: 'BIRTH_CERTIFICATE',
      name: 'Birth certificate',
      requirement: 'required',
      collectionMode: 'upload',
      isRequired: true,
      conditionStatus: 'notConditional',
      status: 'missing',
      blockers: [],
      canUpload: true,
      canRecordOriginal: false,
      canReview: false,
      canWaive: true,
      evidence: [],
    },
  ],
};
export const createDocumentTestStore = () =>
  configureStore({
    reducer: { auth, confirmPopup, [api.reducerPath]: api.reducer },
    middleware: (defaults) => defaults().concat(api.middleware),
  });
