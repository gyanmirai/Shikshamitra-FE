import { it, vi, expect, describe } from 'vitest';

import {
  createApplicantRowNavigationProps,
  createApplicantLinkNavigationProps,
} from './applicant-row-navigation';

type RowNavigationProps = ReturnType<typeof createApplicantRowNavigationProps>;
type RowClickEvent = Parameters<RowNavigationProps['onClick']>[0];

const createRow = () => document.createElement('tr');

const clickEvent = (target: Element, currentTarget: HTMLTableRowElement) =>
  ({ target, currentTarget }) as unknown as RowClickEvent;

describe('applicant row navigation', () => {
  it('opens the applicant from a direct row click', () => {
    const onOpen = vi.fn();
    const row = createRow();
    const props = createApplicantRowNavigationProps({
      applicantName: 'Aarav Shah',
      onOpen,
    });

    props.onClick(clickEvent(row, row));

    expect(onOpen).toHaveBeenCalledOnce();
  });

  it('does not open when a nested button is clicked', () => {
    const onOpen = vi.fn();
    const row = createRow();
    const button = document.createElement('button');
    const icon = document.createElement('span');
    button.append(icon);
    row.append(button);
    const props = createApplicantRowNavigationProps({
      applicantName: 'Aarav Shah',
      onOpen,
    });

    props.onClick(clickEvent(icon, row));

    expect(onOpen).not.toHaveBeenCalled();
  });

  it('does not open when a link, input, or menu item handles the interaction', () => {
    const onOpen = vi.fn();
    const row = createRow();
    const link = document.createElement('a');
    const input = document.createElement('input');
    const menuItem = document.createElement('div');
    menuItem.setAttribute('role', 'menuitem');
    row.append(link, input, menuItem);
    const props = createApplicantRowNavigationProps({
      applicantName: 'Aarav Shah',
      onOpen,
    });

    props.onClick(clickEvent(link, row));
    props.onClick(clickEvent(input, row));
    props.onClick(clickEvent(menuItem, row));

    expect(onOpen).not.toHaveBeenCalled();
  });

  it('does not make a table row a second focusable navigation control', () => {
    const props = createApplicantRowNavigationProps({
      applicantName: 'Aarav Shah',
      onOpen: vi.fn(),
    });

    expect(props).not.toHaveProperty('tabIndex');
    expect(props).not.toHaveProperty('aria-label');
    expect(props).not.toHaveProperty('onKeyDown');
  });

  it('keeps a real applicant href while intercepting an ordinary click for exact return state', () => {
    const onOpen = vi.fn();
    const preventDefault = vi.fn();
    const props = createApplicantLinkNavigationProps({
      href: '/student/enrollment/applicants/lead-1?tab=next',
      onOpen,
    });

    props.onClick({
      button: 0,
      defaultPrevented: false,
      metaKey: false,
      ctrlKey: false,
      shiftKey: false,
      altKey: false,
      preventDefault,
    } as never);

    expect(props.href).toBe('/student/enrollment/applicants/lead-1?tab=next');
    expect(preventDefault).toHaveBeenCalledOnce();
    expect(onOpen).toHaveBeenCalledOnce();
  });

  it('leaves modified clicks to the browser for open-in-new-tab behavior', () => {
    const onOpen = vi.fn();
    const preventDefault = vi.fn();
    const props = createApplicantLinkNavigationProps({
      href: '/student/enrollment/applicants/lead-1?tab=next',
      onOpen,
    });

    props.onClick({
      button: 0,
      defaultPrevented: false,
      metaKey: false,
      ctrlKey: true,
      shiftKey: false,
      altKey: false,
      preventDefault,
    } as never);

    expect(preventDefault).not.toHaveBeenCalled();
    expect(onOpen).not.toHaveBeenCalled();
  });
});
