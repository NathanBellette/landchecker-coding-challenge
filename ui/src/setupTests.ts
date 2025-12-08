import '@testing-library/jest-dom';

// Polyfill for structuredClone (needed in Jest/jsdom environment)
if (typeof global.structuredClone === 'undefined') {
  global.structuredClone = (obj: any) => {
    if (obj === undefined) return undefined;
    return JSON.parse(JSON.stringify(obj));
  };
}
