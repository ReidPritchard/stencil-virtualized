/* eslint-disable */
/* tslint:disable */
/**
 * This is an autogenerated file created by the Stencil compiler.
 * It contains typing information for all components that exist in this project.
 */
import { HTMLStencilElement, JSXBase } from "@stencil/core/internal";
export namespace Components {
    interface DemoList {
        /**
          * The number of items to render
         */
        "itemCount": number;
    }
    interface VirtualizedList {
        /**
          * The estimated height of each row. Once the items have rendered, the actual height will be calculated and applied.  For this example, we'll use 50px even though the actual rows are ~18.5px
         */
        "estimatedRowHeight": number;
        /**
          * The items to render
         */
        "items": any[];
        /**
          * The number of "padding" items to render above and below the visible items This can help reduce flickering when scrolling quickly
          * @default 5
         */
        "paddingItemCount": number;
        /**
          * An optional function to render each row This can be useful if you want to render a different component for specific rows
         */
        "renderRow"?: (item: (typeof this.items)[0]) => HTMLElement;
    }
}
declare global {
    interface HTMLDemoListElement extends Components.DemoList, HTMLStencilElement {
    }
    var HTMLDemoListElement: {
        prototype: HTMLDemoListElement;
        new (): HTMLDemoListElement;
    };
    interface HTMLVirtualizedListElement extends Components.VirtualizedList, HTMLStencilElement {
    }
    var HTMLVirtualizedListElement: {
        prototype: HTMLVirtualizedListElement;
        new (): HTMLVirtualizedListElement;
    };
    interface HTMLElementTagNameMap {
        "demo-list": HTMLDemoListElement;
        "virtualized-list": HTMLVirtualizedListElement;
    }
}
declare namespace LocalJSX {
    interface DemoList {
        /**
          * The number of items to render
         */
        "itemCount"?: number;
    }
    interface VirtualizedList {
        /**
          * The estimated height of each row. Once the items have rendered, the actual height will be calculated and applied.  For this example, we'll use 50px even though the actual rows are ~18.5px
         */
        "estimatedRowHeight"?: number;
        /**
          * The items to render
         */
        "items"?: any[];
        /**
          * The number of "padding" items to render above and below the visible items This can help reduce flickering when scrolling quickly
          * @default 5
         */
        "paddingItemCount"?: number;
        /**
          * An optional function to render each row This can be useful if you want to render a different component for specific rows
         */
        "renderRow"?: (item: (typeof this.items)[0]) => HTMLElement;
    }
    interface IntrinsicElements {
        "demo-list": DemoList;
        "virtualized-list": VirtualizedList;
    }
}
export { LocalJSX as JSX };
declare module "@stencil/core" {
    export namespace JSX {
        interface IntrinsicElements {
            "demo-list": LocalJSX.DemoList & JSXBase.HTMLAttributes<HTMLDemoListElement>;
            "virtualized-list": LocalJSX.VirtualizedList & JSXBase.HTMLAttributes<HTMLVirtualizedListElement>;
        }
    }
}
