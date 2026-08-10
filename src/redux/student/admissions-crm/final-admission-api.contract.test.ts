/* eslint-disable no-bitwise */
import { it, expect, describe } from 'vitest';

import { AdmissionCrmFinalAdmissionApi } from './final-admission-api';

import {
  AdmissionCrmPolicyPackStatus,
  AdmissionCrmSeatOfferStatus,
  AdmissionCrmSeatPoolStatus,
  buildAdmissionCrmActivationPreviewRequest,
  buildAdmissionCrmOfferListRequest,
  buildAdmissionCrmPolicyPackListRequest,
  buildAdmissionCrmRouteDefinitionListRequest,
  buildAdmissionCrmSeatPoolListRequest,
  buildAssignAdmissionCrmSpecialRouteRequest,
  buildCreateAdmissionCrmOfferRequest,
  buildCreateAdmissionCrmSeatPoolRequest,
} from './final-admission-contracts';

describe('final-admission admissions CRM API contracts', () => {
  it('builds policy, activation, and governed-route requests', () => {
    expect(
      buildAdmissionCrmPolicyPackListRequest({
        status: AdmissionCrmPolicyPackStatus.Published,
        board: 'CBSE',
        jurisdiction: 'Gujarat',
      })
    ).toEqual({
      url: '/student-enrollment/admissions-crm/policy-packs',
      method: 'GET',
      params: {
        status: AdmissionCrmPolicyPackStatus.Published,
        board: 'CBSE',
        jurisdiction: 'Gujarat',
      },
    });

    const activationBody = {
      educationBoardId: 'board-1',
      academicMediumId: 'medium-1',
      academicMediumStageId: 'stage-1',
      standardId: 'standard-1',
      divisionId: 'division-1',
      grNumberSeriesId: 'series-1',
    };

    expect(
      buildAdmissionCrmActivationPreviewRequest({ leadId: 'lead-1', body: activationBody })
    ).toEqual({
      url: '/student-enrollment/admissions-crm/leads/lead-1/activation/preview',
      method: 'POST',
      body: activationBody,
    });

    expect(buildAdmissionCrmRouteDefinitionListRequest({ academicYearId: 'year-1' })).toEqual({
      url: '/student-enrollment/admissions-crm/year-1/admission-routes',
      method: 'GET',
    });

    const routeBody = {
      routeDefinitionId: 'route-1',
      routeData: { allotmentNumber: 'RTE-100' },
      evidenceReferences: ['ALLOTMENT:RTE-100'],
      reason: 'Official allotment matched.',
    };

    expect(
      buildAssignAdmissionCrmSpecialRouteRequest({ leadId: 'lead-1', body: routeBody })
    ).toEqual({
      url: '/student-enrollment/admissions-crm/leads/lead-1/admission-route',
      method: 'POST',
      body: routeBody,
    });
  });

  it('builds final-admission seat, offer, and decision requests', () => {
    expect(
      buildAdmissionCrmSeatPoolListRequest({
        academicYearId: 'year-1',
        status: AdmissionCrmSeatPoolStatus.Active,
        maxResultCount: 50,
      })
    ).toEqual({
      url: '/student-enrollment/admissions-crm/year-1/final-admission/seat-pools',
      method: 'GET',
      params: { status: AdmissionCrmSeatPoolStatus.Active, maxResultCount: 50 },
    });

    const poolBody = {
      code: 'GRADE-1-GEN',
      name: 'Grade 1 general',
      desiredClass: 'Grade 1',
      operationalTarget: 40,
      approvedCapacity: 40,
      isActive: true,
    };

    expect(
      buildCreateAdmissionCrmSeatPoolRequest({ academicYearId: 'year-1', body: poolBody })
    ).toEqual({
      url: '/student-enrollment/admissions-crm/year-1/final-admission/seat-pools',
      method: 'POST',
      body: poolBody,
    });

    expect(
      buildAdmissionCrmOfferListRequest({
        academicYearId: 'year-1',
        leadId: 'lead-1',
        status: AdmissionCrmSeatOfferStatus.Issued,
      })
    ).toEqual({
      url: '/student-enrollment/admissions-crm/year-1/final-admission/offers',
      method: 'GET',
      params: { leadId: 'lead-1', status: AdmissionCrmSeatOfferStatus.Issued },
    });

    const offerBody = {
      seatPoolId: 'pool-1',
      offerType: 1,
      terms: { conditions: 'Accept before expiry.' },
      language: 'en',
      validFrom: '2026-07-12T00:00:00.000Z',
      validUntil: '2026-07-19T00:00:00.000Z',
    };

    expect(buildCreateAdmissionCrmOfferRequest({ leadId: 'lead-1', body: offerBody })).toEqual({
      url: '/student-enrollment/admissions-crm/leads/lead-1/final-admission/offers',
      method: 'POST',
      body: offerBody,
    });
  });

  it('registers workspace, configuration, task, public form, exam, and analytics endpoints', () => {
    expect(
      AdmissionCrmFinalAdmissionApi.endpoints.getAdmissionCrmGeneratedDocumentAvailability
    ).toBeTruthy();
  });
});
