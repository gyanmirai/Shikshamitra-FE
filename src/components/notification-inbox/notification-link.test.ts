import { it, expect, describe } from 'vitest';

import { notificationLink } from './notification-link';

describe('notification links', () => {
  it('retains an internal source link and its parameters', () => {
    expect(notificationLink('/academic/homework?id=123#record')).toBe('/academic/homework?id=123#record');
  });

  it.each([null, 'https://school.test/academic', '//other.test', '/\\other.test', '/\n/other.test', 'data:text/plain,notice'])(
    'rejects an unsafe destination %s',
    (link) => expect(notificationLink(link)).toBeNull()
  );
});
