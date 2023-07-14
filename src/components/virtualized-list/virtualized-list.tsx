import { Component, h, Element, State, Watch, Prop } from '@stencil/core';
import { VirtualScroll } from '../../utils/virtual-scroll';
import debounce from 'lodash-es/debounce';
import { HTMLClasses, HTMLIds, HTMLQueries, VisibleItem } from './interfaces';

@Component({
  tag: 'virtualized-list',
  styleUrl: 'virtualized-list.css',
  shadow: true,
})
export class VirtualizedList {
  @Element() host: HTMLElement;

  @Prop() items: any[] = [];

  @Prop() renderRow?: (item: (typeof this.items)[0]) => HTMLElement;

  @State() visibleItems: VisibleItem<any>[] = [];

  private virtualScroll: VirtualScroll<any>;
  private contentElement: HTMLElement;
  private windowElement: HTMLElement;
  private animationFrame: number;

  private debouncedResize = debounce(() => this.scheduleUpdate(), 100);

  @Watch('items')
  itemsChanged(newValue: any[], oldValue: any[]) {
    if (newValue !== oldValue) {
      this.scheduleUpdate();
      this.updateVirtualScroll();
    }
  }

  componentWillLoad() {
    // Since the container is not rendered yet, we can't calculate the visible items
    this.visibleItems = [];
    window.addEventListener('resize', this.debouncedResize);
  }

  componentDidLoad() {
    this.updateVirtualScroll();

    this.updateScrollContainerHeight();
    this.scheduleUpdate();
  }

  componentDidRender() {
    this.animationFrame = undefined;
  }

  disconnectedCallback() {
    window.removeEventListener('resize', this.debouncedResize);
    if (this.animationFrame) {
      window.cancelAnimationFrame(this.animationFrame);
    }
  }

  private updateVirtualScroll() {
    this.windowElement =
      this.windowElement ||
      this.host.shadowRoot.querySelector(HTMLQueries.windowElement);
    this.contentElement =
      this.contentElement ||
      this.host.shadowRoot.querySelector(HTMLQueries.contentElement);

    this.virtualScroll = new VirtualScroll<(typeof this.items)[0]>(
      this.items,
      this.windowElement,
      this.contentElement,
    );
  }

  private processVisibleItems() {
    if (!this.virtualScroll) return;

    const newVisibleItems = this.virtualScroll.calculateVisibleItemsGenerator();
    let index = 0;
    let nextItem = newVisibleItems.next();
    while (!nextItem.done) {
      if (
        !this.visibleItems[index] ||
        this.visibleItems[index].index !== nextItem.value.index
      ) {
        // If the item is new or has changed, we know we need to update the rest of the items
        // However, we don't want to update the entire array, so we only update the items that
        // are left in the generator (since we know they are new or have changed)
        this.visibleItems = [
          ...this.visibleItems.slice(0, index),
          nextItem.value,
          ...Array.from(newVisibleItems),
        ];
        break;
      }
      index++;
      nextItem = newVisibleItems.next();
    }
  }

  private updateScrollContainerHeight() {
    this.virtualScroll.updateTotalHeight();
  }

  private onScroll() {
    this.scheduleUpdate();
  }

  render() {
    return (
      <div
        id={HTMLIds.windowElement}
        onScroll={debounce(() => this.onScroll(), 10)}
      >
        <div id={HTMLIds.contentElement}>
          {this.visibleItems.map(({ item, index }) => {
            const top = this.virtualScroll?.getItemData(index).top || 0;
            return (
              <div
                class={HTMLClasses.listItem}
                style={{ transform: `translateY(${top}px)` }}
                ref={el => this.updateItemHeight(index, el)}
              >
                {this.renderRow ? this.renderRow(item) : item}
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  /**
   * @category private
   * @description
   * Update visible items as performant as possible
   */
  private scheduleUpdate() {
    // Only schedule an update if one is not already scheduled
    if (this.animationFrame === undefined) {
      this.animationFrame = window.requestAnimationFrame(() =>
        this.processVisibleItems(),
      );
    }
  }

  /**
   * @category private
   * @description
   * Update the height of an item in the virtual scroll instance.
   * This is used to calculate the top value for each item.
   */
  private updateItemHeight(index: number, el: HTMLElement) {
    const currentHeight = el?.getBoundingClientRect().height;
    const previousHeight = this.virtualScroll.getItemData(index)?.height;
    console.log('updateItemHeight', index, currentHeight, previousHeight);
    if (currentHeight && previousHeight !== currentHeight) {
      this.virtualScroll.updateItemData(index, currentHeight);
    }
  }
}
