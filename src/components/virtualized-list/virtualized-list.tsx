import { Component, h, Element, State, Watch, Prop } from '@stencil/core';
import { VirtualScroll } from '../../utils/virtual-scroll';
import debounce from 'lodash-es/debounce';
import throttle from 'lodash-es/throttle';
import { HTMLClasses, HTMLIds, HTMLQueries, VisibleItem } from './interfaces';

@Component({
  tag: 'virtualized-list',
  styleUrl: 'virtualized-list.css',
  shadow: true,
})
export class VirtualizedList {
  @Element() host: HTMLElement;

  /**
   * The items to render
   */
  @Prop() items: any[] = [];

  @Watch('items')
  itemsChanged(newValue: any[], oldValue: any[]) {
    if (newValue !== oldValue) {
      this.scheduleUpdate();
      this.updateVirtualScroll();
    }
  }

  /**
   * The number of "padding" items to render above and below the visible items
   * This can help reduce flickering when scrolling quickly
   * @default 5
   */
  @Prop() paddingItemCount: number = 5;

  /**
   * The estimated height of each row.
   * Once the items have rendered, the actual height will be calculated and applied.
   *
   * For this example, we'll use 50px even though the actual rows are ~18.5px
   */
  @Prop() estimatedRowHeight: number = 50;

  /**
   * An optional function to render each row
   * This can be useful if you want to render a different component for specific rows
   */
  @Prop() renderRow?: (item: (typeof this.items)[0]) => HTMLElement;

  /**
   * The rows that are currently visible / within the "window"
   */
  @State() visibleItems: VisibleItem<any>[] = [];

  /**
   * The virtual scroll instance
   * The majority of the logic is handled by this class
   */
  private virtualScroll: VirtualScroll<any>;

  /**
   * The container element that holds all items in the list
   * (or at least mimics that behavior)
   */
  private contentElement: HTMLElement;

  /**
   * The viewport element that is used to determine which items are visible
   */
  private windowElement: HTMLElement;

  /**
   * A reference to the animation frame
   */
  private animationFrame: number;

  /**
   * A reference to the resize observer
   */
  private resizeObserver: ResizeObserver;

  /**
   * A Map of the observed elements
   */
  private observedElements: Map<number, HTMLElement> = new Map();

  /**
   * A helper function to schedule an update when the window is resized
   */
  private debouncedResize = debounce(() => this.scheduleUpdate(), 100);

  /**
   * A throttled helper to schedule an update when the window is scrolled
   * This is throttled to prevent the handler from being overwhelmed (which can cause "missed" resize events)
   *
   * A throttle is used rather than a debounce since high refresh rate screens can cause animation frames to be called
   * more frequently.
   *
   * A time of 16.67ms (60fps) is used as a baseline for the throttle. Since most screens are 60hz, this should be
   * sufficient to prevent the handler from being called too frequently while still being performant. This can be
   * adjusted based on the performance of the virtual scroll, however anything below 16.67ms will likely end up with
   * little to no performance gain and even use more resources than necessary (decreasing performance)
   *
   * @see https://developer.mozilla.org/en-US/docs/Web/Performance/How_long_is_too_long#animation_goal
   */
  private throttledUpdate = throttle(() => this.scheduleUpdate(), 1000 / 60, {
    trailing: true,
  });

  componentWillLoad() {
    // Since the container is not rendered yet, we can't calculate the visible items
    window.addEventListener('resize', this.debouncedResize);
  }

  componentDidLoad() {
    // Now that the containers are rendered, we can calculate the visible items
    this.setupResizeObserver();
    this.updateVirtualScroll();

    this.scheduleUpdate();
  }

  disconnectedCallback() {
    window.removeEventListener('resize', this.debouncedResize);
    if (this.animationFrame) {
      window.cancelAnimationFrame(this.animationFrame);
    }
    this.resizeObserver.disconnect();
  }

  /**
   * Since when the component first loads/renders, the containers are not present,
   * we need to update/re-create the virtual scroll instance once they are
   * This is a helper to do that
   * @category private
   */
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
      this.estimatedRowHeight,
      this.paddingItemCount,
    );
  }

  /**
   * This is a helper function to setup the resize observer
   */
  private setupResizeObserver() {
    this.resizeObserver = new ResizeObserver(entries => {
      for (let entry of entries) {
        const target = entry.target as HTMLElement;
        const index = parseInt(target.dataset.index, 10);
        const height = entry.contentRect.height;

        console.log('item height changed', index, height);

        this.virtualScroll.updateItemHeight(index, height);
      }
    });
  }

  /**
   * This is the main function that is called to update the visible items
   * The virtual scroll instance is used to perform the calculations
   */
  private processVisibleItems() {
    const newVisibleItems = this.virtualScroll.calculateVisibleItemsGenerator();
    this.visibleItems = Array.from(newVisibleItems);
  }

  private onScroll() {
    this.throttledUpdate();
  }

  render() {
    return (
      <div id={HTMLIds.windowElement} onScroll={() => this.onScroll()}>
        <div id={HTMLIds.contentElement}>
          {this.visibleItems.map(({ item, index }) => {
            const top = this.virtualScroll?.getItemData(index).top || 0;
            return (
              <div
                class={HTMLClasses.listItem}
                style={{ transform: `translateY(${top}px)` }}
                data-index={index}
                ref={el => {
                  if (el && !this.observedElements.has(index)) {
                    this.observedElements.set(index, el);
                    this.resizeObserver.observe(el);
                  } else {
                    const element = this.observedElements.get(index);
                    if (element) {
                      this.resizeObserver.unobserve(element);
                      this.observedElements.delete(index);
                    }
                  }
                }}
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
      this.animationFrame = window.requestAnimationFrame(() => {
        this.processVisibleItems();
        this.animationFrame = undefined;
      });
    }
  }
}
