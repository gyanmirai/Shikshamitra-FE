import { it, expect, describe } from 'vitest';

import { inquirySchoolContact } from './inquiry-school-contact';

const original = {
  applicantName: 'Rahul Sharma',
  normalizedPhone: '9876543210',
  email: 'father@example.com',
};

describe('inquirySchoolContact', () => {
  it('shows the selected guardian and never borrows a missing mailbox from a parent', () => {
    expect(
      inquirySchoolContact({
        ...original,
        mainSchoolContact: {
          fullName: 'Anita Sharma',
          relationship: 'guardian',
          relationshipLabel: 'Aunt',
          mobile: '9876543212',
          email: null,
        },
      })
    ).toEqual({
      fullName: 'Anita Sharma',
      relationship: 'Guardian (Aunt)',
      mobile: '9876543212',
      email: null,
      defaultChannels: [1],
    });
  });

  it('suggests email when the chosen contact only has email, without borrowing the parent phone', () => {
    const contact = inquirySchoolContact({
      ...original,
      mainSchoolContact: {
        fullName: 'Anita Sharma',
        relationship: 'guardian',
        relationshipLabel: 'Aunt',
        email: 'aunt@example.com',
      },
    });
    expect(contact.mobile).toBeNull();
    expect(contact.email).toBe('aunt@example.com');
    expect(contact.defaultChannels).toEqual([2]);
  });

  it('keeps the historical inquiry destination when no selected contact was recorded', () => {
    expect(inquirySchoolContact(original)).toEqual({
      fullName: 'Rahul Sharma',
      relationship: null,
      mobile: '9876543210',
      email: 'father@example.com',
      defaultChannels: [1],
    });
  });
});
