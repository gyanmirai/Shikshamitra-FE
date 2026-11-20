import { libraryFinanceApi } from './finance-external-api';
import {
  form,
  waiver,
  command,
  postBody,
  collection,
  receivable,
  collectBody,
} from './finance-external.fixture';

import type { FinanceTestStore } from './finance-external.fixture';

const bind = {
  ...command,
  collectionPolicyVersionId: 'policy-version-id',
  reason: 'Confirmed source policy.',
};
const approve = { ...command, reason: 'Independent assessment review.' };
const requestWaiver = { ...command, amount: 10.1, reason: 'Reviewed school assistance.' };
const decision = {
  ...command,
  waiverRequestId: 'waiver-request-id',
  reason: 'Independent assistance review.',
};
const reversal = {
  ...command,
  waiverApplicationId: 'waiver-application-id',
  amount: 2.05,
  reason: 'Reviewed correction.',
};
export const financeCommandCases: {
  route: string;
  body: object;
  response: object;
  invoke: (store: FinanceTestStore) => Promise<unknown>;
}[] = [
  {
    route: '',
    body: postBody,
    response: receivable,
    invoke: (store) =>
      store
        .dispatch(libraryFinanceApi.endpoints.postFinanceExternalReceivable.initiate(postBody))
        .unwrap(),
  },
  {
    route: '/settlement-policy',
    body: bind,
    response: form,
    invoke: (store) =>
      store.dispatch(libraryFinanceApi.endpoints.bindFinanceExternalPolicy.initiate(bind)).unwrap(),
  },
  {
    route: '/approve',
    body: approve,
    response: receivable,
    invoke: (store) =>
      store
        .dispatch(libraryFinanceApi.endpoints.approveFinanceExternalReceivable.initiate(approve))
        .unwrap(),
  },
  {
    route: '/collections',
    body: collectBody,
    response: collection,
    invoke: (store) =>
      store
        .dispatch(
          libraryFinanceApi.endpoints.collectFinanceExternalReceivable.initiate(collectBody)
        )
        .unwrap(),
  },
  {
    route: '/waivers',
    body: requestWaiver,
    response: waiver,
    invoke: (store) =>
      store
        .dispatch(libraryFinanceApi.endpoints.requestFinanceExternalWaiver.initiate(requestWaiver))
        .unwrap(),
  },
  {
    route: '/waivers/approve',
    body: decision,
    response: waiver,
    invoke: (store) =>
      store
        .dispatch(libraryFinanceApi.endpoints.approveFinanceExternalWaiver.initiate(decision))
        .unwrap(),
  },
  {
    route: '/waivers/reject',
    body: decision,
    response: waiver,
    invoke: (store) =>
      store
        .dispatch(libraryFinanceApi.endpoints.rejectFinanceExternalWaiver.initiate(decision))
        .unwrap(),
  },
  {
    route: '/waivers/reverse',
    body: reversal,
    response: waiver,
    invoke: (store) =>
      store
        .dispatch(libraryFinanceApi.endpoints.reverseFinanceExternalWaiver.initiate(reversal))
        .unwrap(),
  },
];
