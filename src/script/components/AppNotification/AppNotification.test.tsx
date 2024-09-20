/*
 * Wire
 * Copyright (C) 2024 Wire Swiss GmbH
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program. If not, see http://www.gnu.org/licenses/.
 *
 */

import {render, fireEvent, act} from '@testing-library/react';

import {AppNotification, showAppNotification} from './AppNotification';

jest.useFakeTimers();

describe('AppNotification', () => {
  afterEach(() => {
    jest.clearAllTimers();
  });

  it('renders the message correctly', () => {
    const message = 'Test notification';
    const onClose = jest.fn();
    const {getByText} = render(<AppNotification message={message} onClose={onClose} />);

    expect(getByText(message)).toBeDefined();
  });

  it('calls onClose when the close button is clicked', () => {
    const message = 'Test notification';
    const onClose = jest.fn();
    const {getByRole} = render(<AppNotification message={message} onClose={onClose} />);
    const button = getByRole('button');

    fireEvent.click(button);

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('calls onClose after the notificationTimeout', () => {
    const message = 'Test notification';
    const onClose = jest.fn();
    const notificationTimeout = 3000;

    render(<AppNotification message={message} onClose={onClose} notificationTimeout={notificationTimeout} />);

    act(() => {
      jest.advanceTimersByTime(notificationTimeout);
    });

    expect(onClose).toHaveBeenCalledTimes(1);
  });
});

describe('showAppNotification', () => {
  afterEach(() => {
    jest.clearAllTimers();
    const appNotificationContainer = document.querySelector('#app-notification');
    if (appNotificationContainer) {
      appNotificationContainer.innerHTML = '';
    }
  });

  it('renders AppNotification into the container', () => {
    const appNotificationContainer = document.createElement('div');
    appNotificationContainer.setAttribute('id', 'app-notification');
    document.body.appendChild(appNotificationContainer);

    const message = 'Test notification';

    act(() => {
      showAppNotification(message);
    });

    expect(appNotificationContainer.textContent).toContain(message);
  });
});
