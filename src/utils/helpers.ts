/**
 * Helper to chunk an array into smaller arrays
 * @param {any[]} array - The array to chunk.
 * @param {number} size - The size of each chunk.
 * @returns {any[][]} An array of arrays of the specified size.
 */
export function chunkArray(array: any[], size: number) {
  const chunks = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
}
