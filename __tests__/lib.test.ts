import {expect, it} from '@jest/globals';

import {themes} from '@rvmob/lib/themes';
import {getColour} from '@rvmob/lib/utils/colourUtils';

// TODO: add more gradient tests
it('returns the right colour values', () => {
  // test --var (expected value is from default dark mode)
  expect(getColour('var(--error)', themes.Dark)).toBe(themes.Dark.error);
  // test linear gradient (should return the first colour in the gradient)
  expect(
    getColour('linear-gradient(90deg, #ff0000, #00ff00, #0000ff)', themes.Dark),
  ).toBe('#ff0000');
  // test hex value (should return itself)
  expect(getColour('#FFFFFF', themes.Dark)).toBe('#FFFFFF');
});

// TODO: test other functions?
