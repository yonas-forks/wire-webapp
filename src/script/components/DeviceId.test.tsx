/*
 * Wire
 * Copyright (C) 2021 Wire Swiss GmbH
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

import {render} from '@testing-library/react';

import {DeviceId} from './DeviceId';

describe('DeviceId', () => {
  it('can print device id', () => {
    const {getAllByTestId} = render(<DeviceId deviceId={'66e66c79e8d1dea4'} />);

    const deviceIdParts = getAllByTestId('element-device-id-part').map(node => node.textContent);

    expect(deviceIdParts).toEqual(['66', 'e6', '6c', '79', 'e8', 'd1', 'de', 'a4']);
  });

  it('can print device id and apply padding', () => {
    const {getAllByTestId} = render(<DeviceId deviceId={'6e66c79e8d1dea4'} />);

    const deviceIdParts = getAllByTestId('element-device-id-part').map(node => node.textContent);

    expect(deviceIdParts).toEqual(['06', 'e6', '6c', '79', 'e8', 'd1', 'de', 'a4']);
  });
});
