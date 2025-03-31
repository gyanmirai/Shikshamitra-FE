const capitalizeWords = (text: string): string =>
  text
    .toLowerCase() // Ensure all letters are lowercase first
    .replace(/\b\w/g, (char) => char.toUpperCase()); // Capitalize first letter of each word

export default capitalizeWords;
