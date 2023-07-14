/**
 * A virtual scroll implementation that calculates which items should be rendered based on the current scroll position.
 */
export class VirtualScroll<T> {
  private items: T[] = [];
  private itemHeightFenwickTree: number[] = [];

  /**
   * @param {T[]} items - The items to be rendered.
   * @param {HTMLElement} windowContainer - The user's "view" of the items. This is the container that has the scrollbar.
   * @param {HTMLElement} scrollContainer - The container that "holds all the items" (or at least pretends to). This container is translated up and down to simulate scrolling.
   * @param {number} estimatedItemHeight - The estimated height of each item. This is used to calculate the total height of all items.
   *                                      If the actual height of an item is different, the item's "expected" height will be updated
   */
  constructor(
    items: T[],
    private windowContainer: HTMLElement,
    private scrollContainer: HTMLElement,
    private estimatedItemHeight: number = 50,
    private itemPadding: number = 5,
  ) {
    if (!items || items.length === 0) {
      throw new Error('Items array cannot be empty');
    }

    this.items = items;
    this.estimatedItemHeight = estimatedItemHeight;

    this.initItemHeightData();
    this.updateTotalHeight();
  }

  /**
   * This method initializes the itemData array. Each item is given an initial height of
   * estimatedItemHeight and a top value that is the sum of the heights of all previous items.
   */
  private initItemHeightData() {
    this.itemHeightFenwickTree = this.initFenwickTree(
      new Array(this.items.length).fill(this.estimatedItemHeight),
    );
  }

  private initFenwickTree(itemHeights: number[]): number[] {
    const fenwickTree = new Array(itemHeights.length + 1).fill(0);
    for (let i = 0; i < itemHeights.length; i++) {
      this.updateFenwickTree(fenwickTree, i, itemHeights[i]);
    }
    return fenwickTree;
  }

  private updateFenwickTree(
    fenwickTree: number[],
    index: number,
    value: number,
  ) {
    index++;
    while (index < fenwickTree.length) {
      fenwickTree[index] += value;
      index += index & -index;
    }
  }

  private queryFenwickTree(fenwickTree: number[], index: number): number {
    let sum = 0;
    index++;
    while (index > 0) {
      sum += fenwickTree[index];
      index -= index & -index;
    }
    return sum;
  }

  /**
   * This method updates the totalHeight property, which is the sum of the heights of all items.
   * This is used to set the height of the container, so the scrollbar accurately reflects the
   * total height of the items.
   */
  public updateTotalHeight() {
    const totalHeight = this.queryFenwickTree(
      this.itemHeightFenwickTree,
      this.itemHeightFenwickTree.length - 1,
    );
    this.scrollContainer.style.height = `${totalHeight}px`;
  }

  public *calculateVisibleItemsGenerator(
    padding: number = this.itemPadding,
  ): Generator<{ item: T; index: number }> {
    const scrollTop = this.windowContainer.scrollTop;

    const lowerBound = Math.max(
      0,
      scrollTop - padding * this.estimatedItemHeight,
    );
    const upperBound =
      scrollTop +
      this.windowContainer.clientHeight +
      padding * this.estimatedItemHeight;

    const startIndex = this.binarySearch(lowerBound);
    const endIndex = this.binarySearch(upperBound) + 1;

    for (let i = startIndex; i < endIndex; i++) {
      yield {
        item: this.items[i],
        index: i,
      };
    }
  }

  /**
   * Binary search implementation.
   * This is an optimization that allows for a faster search of the itemData array when calculating which items should be rendered.
   * Find the index of the first item with a top value greater than the given value.
   * @param {number} value - The value to search for.
   * @returns {number} The index of the first item with a top value greater than the given value.
   */
  private binarySearch(value: number): number {
    let lowIndex = 0;
    let highIndex = this.itemHeightFenwickTree.length - 1;
    let midIndex: number;

    while (lowIndex < highIndex) {
      midIndex = Math.floor((lowIndex + highIndex) / 2);
      const midValue = this.queryFenwickTree(
        this.itemHeightFenwickTree,
        midIndex,
      );

      if (midValue < value) {
        lowIndex = midIndex + 1;
      } else if (midValue > value) {
        highIndex = midIndex;
      } else {
        return midIndex;
      }
    }

    return lowIndex - 1;
  }

  /**
   * This method updates the height and top values of the item at the specified index.
   * It also updates the height and top values of all following items.
   * @param {number} index - The index of the item to update.
   * @param {number} height - The new height of the item.
   */
  public updateItemData(index: number, height: number) {
    this.updateFenwickTree(this.itemHeightFenwickTree, index, height);
    this.updateTotalHeight();
  }

  /**
   * This method gets the height and top value for the specified item.
   * @param {number} index - The index of the item.
   */
  public getItemData(index: number) {
    return {
      height: this.queryFenwickTree(this.itemHeightFenwickTree, index),
      top:
        index === 0
          ? 0
          : this.queryFenwickTree(this.itemHeightFenwickTree, index - 1),
    };
  }
}
