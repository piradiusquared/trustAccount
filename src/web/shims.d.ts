declare module 'react' {
  export type ReactNode = unknown;
  export type ChangeEvent = { target: { value: string } };
  export type ClickEvent = { preventDefault(): void };

  export interface FormEvent<T = Element> {
    preventDefault(): void;
    currentTarget: T;
  }

  export function useEffect(effect: () => void | (() => void), deps?: readonly unknown[]): void;
  export function useMemo<T>(factory: () => T, deps: readonly unknown[]): T;
  export function useState<T>(initial: T | (() => T)): [T, (value: T | ((previous: T) => T)) => void];
  export const StrictMode: (props: { children?: ReactNode }) => ReactNode;
}

declare module 'react-dom/client' {
  export interface Root {
    render(node: unknown): void;
  }

  export function createRoot(container: Element | DocumentFragment): Root;
}

declare module 'react/jsx-runtime' {
  export const Fragment: unique symbol;
  export function jsx(type: unknown, props: unknown, key?: string): unknown;
  export function jsxs(type: unknown, props: unknown, key?: string): unknown;
}

declare namespace JSX {
  interface IntrinsicElementProps {
    [prop: string]: unknown;
    children?: import('react').ReactNode;
    onChange?: (event: import('react').ChangeEvent) => void;
    onClick?: (event: import('react').ClickEvent) => void;
  }

  interface IntrinsicElements {
    [elementName: string]: IntrinsicElementProps;
  }
}
