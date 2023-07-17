import { h, Component, Element, Prop } from '@stencil/core';

@Component({
  tag: 'demo-list',
  shadow: true,
})
export class DemoList {
  /**
   * @description reference to DemoList element
   */
  @Element() hostElement: 'HTMLDemoListElement';

  /**
   * The number of items to render
   */
  @Prop() itemCount: number = 1000;

  /**
   * The items to render
   */
  private listData: number[] = [];

  private renderRow = (item: number) => {
    const isMultipleOfTen = item % 10 === 0;

    return (
      <div
        class="demo-list__item"
        style={{
          backgroundColor: isMultipleOfTen ? '#f0f0f0' : '#fff',
        }}
      >
        <span>This is the item at index {item}</span>
        <br />
        {isMultipleOfTen && <span>This is a multiple of 10!</span>}
      </div>
    );
  };

  render() {
    this.listData = Array.from({ length: this.itemCount }, (_, i) => i);

    return (
      <div class="demo-list">
        <virtualized-list items={this.listData} renderRow={this.renderRow} />
      </div>
    );
  }
}
