export const HTMLIds = {
  windowElement: 'virtual-scroll-window',
  contentElement: 'virtual-scroll-content',
} as const;

export const HTMLQueries = {
  windowElement: `#${HTMLIds.windowElement}`,
  contentElement: `#${HTMLIds.contentElement}`,
} as const;

export const HTMLClasses = {
  listItem: 'virtual-scroll-list-item',
} as const;

export type VisibleItem<T> = {
  index: number;
  item: T;
};
