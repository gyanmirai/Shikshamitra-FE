import { it, expect, describe } from 'vitest';
import { hasGrantedPermission } from 'src/utils/permissions';

import { academicNotificationPermissions } from './academic-menu';

describe('Academic notification permissions', () => {
  it('keeps scoped sending independent from rule and template administration', () => {
    expect(academicNotificationPermissions).toEqual({
      view: 'Academics.Notification.View',
      manage: 'Academics.Notification.Add',
      remove: 'Academics.Notification.Delete',
      send: 'Academics.Notification.Send',
    });
    const sender = [{ name: 'Academics.Notification.Send', isGranted: true }];
    expect(hasGrantedPermission(sender, academicNotificationPermissions.send)).toBe(true);
    expect(hasGrantedPermission(sender, academicNotificationPermissions.manage)).toBe(false);
    expect(hasGrantedPermission([{ name: 'Academics.Notification.Add', isGranted: true }], academicNotificationPermissions.send)).toBe(false);
  });
});
