import { useState } from 'react';
import { it, expect, describe } from 'vitest';
import userEvent from '@testing-library/user-event';
import { render, screen } from '@testing-library/react';
import { DEFAULT_OFFER_POLICY, getAdmissionOfferConfigurationError } from 'src/redux/student/admissions/admission-offer-policy';

import { OfferValiditySettings } from './components/offer-validity-settings';

function Fixture() {
  const [policy,setPolicy]=useState({...DEFAULT_OFFER_POLICY,allowExpiryOverride:false,minimumValidityDays:14,maximumValidityDays:14});
  return <><OfferValiditySettings policy={policy} disabled={false} onChange={(change)=>setPolicy((previous)=>({...previous,...change}))}/><output data-testid="policy">{JSON.stringify(policy)}</output></>;
}

describe('Offer fixed expiry settings',()=>{
  it('updates the fixed limits with the default so valid edits can still be saved',async()=>{
    const user=userEvent.setup();render(<Fixture/>);
    await user.clear(screen.getByRole('textbox',{name:'Default validity (days) *'}));
    await user.type(screen.getByRole('textbox',{name:'Default validity (days) *'}),'21');
    const policy=JSON.parse(screen.getByTestId('policy').textContent!);
    expect(policy).toMatchObject({validityDays:21,minimumValidityDays:21,maximumValidityDays:21});
    expect(getAdmissionOfferConfigurationError(JSON.stringify({offer:policy}))).toBeUndefined();
    expect(screen.queryByRole('textbox',{name:'Minimum validity (days) *'})).not.toBeInTheDocument();
  });
});
