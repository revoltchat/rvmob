import { Theme } from '@rvmob/lib/themes';

/**
 * Returns the correct colour as a HEX string/theme variable. Supports regular HEX colours, client variables (e.g. `var(--accent)`)
 * and gradient roles (which, for now, will return as the first colour from the gradient - this will change if React Native adds support for gradients).
 * @param c The string to check over
 */
export function getColour(c: string, theme: Theme) {
  // first check for css variables...
  const isVariable = c.match('var');
  if (isVariable) {
    switch (c) {
      case 'var(--error)':
        return theme.error;
      case 'var(--accent)':
        return theme.accentColorForeground;
      case 'var(--foreground)':
        return theme.foregroundPrimary;
      case 'var(--background)':
        return theme.backgroundPrimary;
      default:
        break;
    }
  }

  // ...then check for gradients
  const gradientRegex = /(linear|conical|radial)-gradient\s*\(/;
  const degRegex = /[0-9]{0,3}deg,\s*/;
  const bracketRegex = /\)\s*(text)?$/;
  const percentRegex = /[0-9]{0,3}%(,|\))?\s*/;

  const isGradient = c.match(gradientRegex);
  if (isGradient) {
    const filteredC = c
      .replace(gradientRegex, '')
      .replace(bracketRegex, '')
      .replace(degRegex, '')
      .replace(percentRegex, '');

    const filteredAsArray = filteredC.split(',');

    console.log(
      `[UTILS] getColour detected a gradient role: ${c}, filtered: ${filteredC}, to array: ${filteredAsArray}, ${filteredAsArray[0]}`,
    );

    if (c.match('linear')) {
      return filteredAsArray[0];
    }

    return c;
  }

  // at this point, c is probably just a regular HEX code so return it directly
  return c;
}
