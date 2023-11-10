import {expect, it} from '@jest/globals';

import {getColour} from '@rvmob/lib/utils/colourUtils';
import {themes} from '@rvmob/Theme';

// TODO: add more gradient tests
it('returns the right colour values', () => {
  // test --var (expected value is from default dark mode)
  expect(getColour('var(--error)')).toBe(themes.Dark.error);
  // test linear gradient (should return the first colour in the gradient)
  expect(getColour('linear-gradient(90deg, #ff0000, #00ff00, #0000ff)')).toBe(
    '#ff0000',
  );
  // test hex value (should return itself)
  expect(getColour('#FFFFFF')).toBe('#FFFFFF');
});

// TODO: test other functions?
