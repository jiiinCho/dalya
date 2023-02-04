import { ComponentClass, ElementType, FunctionComponent } from 'react';
import { ForwardRef, Memo } from 'react-is';

const fnNameMatchRegex = /^\s*function(?:\s|\s*\/\*.*\*\/\s*)+([^(\s/]*)\s*/;
export function getFunctionName(fn: any): string {
  const match = `${fn}`.match(fnNameMatchRegex);
  const name = match && match[1]; // name is second match
  return name || '';
}

function getFunctionComponentName(
  Component: FunctionComponent | ComponentClass,
  fallback = '',
): string {
  return Component.displayName || Component.name || getFunctionName(Component) || fallback;
}

function getWrappedName(outerType: any, innerType: any, wrapperName: string) {
  const functionName = getFunctionComponentName(innerType);
  return (
    outerType.displayName || (functionName !== '' ? `${wrapperName}(${functionName})` : wrapperName)
  );
}

function getDisplayName(Component: ElementType): string | undefined {
  if (typeof Component === 'string') {
    return Component;
  }

  if (typeof Component === 'function') {
    return getFunctionComponentName(Component, 'Component');
  }

  // $$typeof is internal field in react component
  if (typeof Component === 'object') {
    switch ((Component as any).$$typeof) {
      case ForwardRef:
        return getWrappedName(Component, (Component as any).render, 'ForwardRef');
      case Memo:
        return getWrappedName(Component, (Component as any).type, 'memo');
      default:
        return undefined;
    }
  }
  return undefined;
}

export default getDisplayName;
/*
<marquee bgcolor="#ffa7c4">hi</marquee>
=> 
const element = React.createElement('marquee',{ bgcolor: '#ffa7c4' },'hi')
=>
const element = {
  type: 'marquee',
  props: {
    bgcolor: '#ffa7c4',
    children: 'hi',
  },
  key: null,
  ref: null,
  $$typeof: Symbol.for('react.element')
}
*/
