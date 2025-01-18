export function isJSONStringified(input: string) {
  if (typeof input !== 'string') {
    return false; // Only strings can be JSON.stringify output
  }
  try {
    const parsed = JSON.parse(input);
    // Optionally, check if re-serializing matches the input
    return JSON.stringify(parsed) === input.trim();
  } catch (e) {
    return false; // Parsing failed, so it's not valid JSON
  }
}
