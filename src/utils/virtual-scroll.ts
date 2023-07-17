import { FenwickTree } from './fenwick-tree';

/**
 * A class representing a VirtualScroll. VirtualScroll helps optimize large lists rendering performance
 * by only rendering items currently visible. This class contains calculation logic for
 * determining which items should be rendered at any given scroll position.
 * Note: this class does not contain any DOM manipulation logic.
 */
export class VirtualScroll<T> {
  private items: T[] = [];
  private itemHeightTree: FenwickTree;

  /**
   * Constructs a new instance of VirtualScroll.
   * @param items - The items to be rendered.
   * @param windowContainer - The container for the rendered items.
   * @param scrollContainer - The container simulating full height for accurate scrollbar representation.
   * @param estimatedItemHeight - Estimated height of each item, used initially before actual item heights can be determined.
   * @param itemPadding - Padding between items.
   */
  constructor(
    items: T[] = [],
    private windowContainer: HTMLElement,
    private scrollContainer: HTMLElement,
    private estimatedItemHeight: number = 50,
    private itemPadding: number = 5,
  ) {
    this.items = items;
    this.initItemHeightData();
    this.updateTotalHeight();
  }

  /**
   * Initializes the itemHeightTree with estimated item heights.
   */
  private initItemHeightData(): void {
    this.itemHeightTree = new FenwickTree(
      new Array(this.items.length).fill(this.estimatedItemHeight),
    );
  }

  /**
   * Updates the total height of the scroll container to match the total height of all items.
   */
  public updateTotalHeight(): void {
    const totalHeight = this.itemHeightTree.query(
      this.itemHeightTree.length - 1,
    );
    this.scrollContainer.style.height = `${totalHeight}px`;
  }

  /**
   * Generator function for calculating the visible items within the scrolling window.
   * @param padding - Number of offscreen items to include in the rendering for smoother scrolling.
   * @returns An iterable of visible items and their indices.
   */
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
   * Performs binary search to find the index of the item with a cumulative height just greater than the given value.
   * @param value - The cumulative height to search for.
   * @returns The index of the item.
   */
  private binarySearch(value: number): number {
    let lowIndex = 0;
    let highIndex = this.itemHeightTree.length - 1;

    while (lowIndex < highIndex) {
      const midIndex = Math.floor((lowIndex + highIndex) / 2);
      const midValue = this.itemHeightTree.query(midIndex);

      if (midValue < value) {
        lowIndex = midIndex + 1;
      } else {
        highIndex = midIndex;
      }
    }

    return lowIndex;
  }

  /**
   * Updates the height of the item at the specified index. It also recalculates the total height.
   * @param index - The index of the item to update.
   * @param height - The new height of the item.
   */
  public updateItemData(index: number, height: number): void {
    this.itemHeightTree.update(
      index,
      height - this.itemHeightTree.queryRange(index, index),
    );

    this.updateTotalHeight();
  }

  /**
   * Retrieves the height and the cumulative height for items up to the specified item.
   * @param index - The index of the item.
   * @returns The height and top position of the item.
   */
  public getItemData(index: number): { height: number; top: number } {
    const height = this.itemHeightTree.queryRange(index, index);
    const top = this.itemHeightTree.query(index - 1);
    return { height, top };
  }
}
