/**
 * @format
 */

import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import {App} from '../App';

test('renders correctly', async () => {
  await ReactTestRenderer.act(() => {
    ReactTestRenderer.create(<App />);
  });
});

/* FIXME: sort out import problems
 * (appear to be problems with ESM modules - looks like we need to set up Jest ESM support somehow? hmmm)
 * and get tests running, then uncomment
 **/

// it('is skipped', () => {
//   console.warn('Skipping App.test.tsx for now - see file comments');
//   expect(true).toBe(true);
// });
