/**
 * This class contains the implementation for a Fenwick tree (also known as a Binary Indexed Tree),
 * which is a data structure providing efficient methods for calculation of prefix sums.
 * It is particularly useful in scenarios where the frequency of updates is high and query time needs to be as fast as possible.
 * The prefix sum is calculated in O(log n) time and updates are processed in O(log n) time.
 */
export class FenwickTree {
  private tree: number[] = [];

  /**
   * Instantiates the Fenwick Tree with initial values.
   * @param values - array of initial values for the tree.
   */
  constructor(values: number[]) {
    this.initFenwickTree(values);
  }

  /**
   * Initializes the Fenwick Tree from the given array of values.
   * @param values - array of initial values for the tree.
   */
  private initFenwickTree(values: number[]): void {
    this.tree = new Array(values.length + 1).fill(0);

    for (let i = 0; i < values.length; i++) {
      this.update(i, values[i]);
    }
  }

  /**
   * Returns the number of elements in the Fenwick Tree.
   * @returns The length of the Fenwick Tree.
   */
  get length(): number {
    return this.tree.length - 1; // We subtract one because our Fenwick Tree has an extra element at the start
  }

  /**
   * Updates the value at the given index in the Fenwick Tree.
   * @param index - The index to update.
   * @param value - The value to add at the given index.
   */
  public update(index: number, value: number) {
    index++;
    while (index < this.tree.length) {
      this.tree[index] += value;
      index += index & -index;
    }
  }

  /**
   * Queries the sum of values up to the given index.
   * @param index - The index to query up to.
   * @returns The sum of values up to the given index.
   */
  public query(index: number): number {
    let sum = 0;
    index++;
    while (index > 0) {
      sum += this.tree[index];
      index -= index & -index;
    }
    return sum;
  }

  /**
   * Queries the sum of values between the given range of indices.
   * @param startIndex - The start index of the range.
   * @param endIndex - The end index of the range.
   * @returns The sum of values in the given range.
   */
  public queryRange(startIndex: number, endIndex: number): number {
    return (
      this.query(endIndex) - (startIndex > 0 ? this.query(startIndex - 1) : 0)
    );
  }
}
