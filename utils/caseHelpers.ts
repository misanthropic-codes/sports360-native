// utils/caseHelpers.ts

/**
 * Convert a string to Proper Case (capitalize first letter of each word).
 * Example: "hello world" → "Hello World"
 */
export const toProperCase = (str: string): string => {
  if (!str) return "";
  return str.replace(
    /\w\S*/g,
    (txt: string) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
  );
};
