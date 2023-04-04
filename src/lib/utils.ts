import {currentTheme} from '../Theme';

/**
 * Returns the correct colour as a HEX string/theme variable. Supports regular HEX colours, client variables (e.g. `var(--accent)`)
 * and gradient roles (which, for now, will return as the first colour from the gradient - this will change if React Native adds support for gradients).
 * @param c The string to check over
 */
export function getColour(c: string) {
  // first check for css variables...
  const isVariable = c.match('var');
  if (isVariable) {
    switch (c) {
      case 'var(--error)':
        return currentTheme.error;
      case 'var(--accent)':
        return currentTheme.accentColorForeground;
      case 'var(--foreground)':
        return currentTheme.foregroundPrimary;
      case 'var(--background)':
        return currentTheme.backgroundPrimary;
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
    console.log(
      `[UTILS] getColour detected a gradient role: ${c}, filtered: ${c
        .replace(gradientRegex, '')
        .replace(bracketRegex, '')
        .replace(degRegex, '')
        .replace(percentRegex, '')}`,
    );
    return c;
  }

  // at this point, c is probably just a regular HEX code so return it directly
  return c;
}

/**
 * Sleep for the specified amount of milliseconds before continuing.
 * @param ms The amount of time to sleep for in milliseconds
 */
export const sleep = (ms: number | undefined) =>
  new Promise((r: any) => setTimeout(r, ms));
