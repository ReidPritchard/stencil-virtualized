import { h, Component, Element } from '@stencil/core';

@Component({
  tag: 'demo-list',
  shadow: true,
})
export class DemoList {
  /**
   * @description reference to DemoList element
   */
  @Element() hostElement: 'HTMLDemoListElement';

  private listData = Array.from({ length: 1000 }, (_, i) => i);

  private renderRow = (item: number) => {
    return (
      <div class="demo-list__item">
        <span>This is the item at index {item}</span>
      </div>
    );
  };

  render() {
    return (
      <div class="demo-list">
        <virtualized-list items={this.listData} renderRow={this.renderRow} />
      </div>
    );
  }
}
