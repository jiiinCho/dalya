/* eslint-disable react/prefer-stateless-function */
/* eslint-disable react/display-name */
import * as React from 'react';
import getDisplayName, { getFunctionName } from './getDisplayName';

describe('getDisplayName', () => {
  it('gets display name of a React component', () => {
    class SomeComponent extends React.Component {
      render() {
        return <div />;
      }
    }

    class SomeOtherComponent extends React.Component {
      static displayName = 'CustomDisplayName';

      render() {
        return <div />;
      }
    }

    function YetAnotherComponent() {
      return <div />;
    }

    function AndAnotherComponent() {
      return <div />;
    }

    const AnonymousForwardRefComponent = React.forwardRef<HTMLDivElement>((props, ref) => (
      <div {...props} ref={ref} />
    ));

    const ForwardRefComponent = React.forwardRef<HTMLDivElement>(function Div(props, ref) {
      return <div {...props} ref={ref} />;
    });

    const NamedForwardRefComponent = React.forwardRef<HTMLDivElement>((props, ref) => (
      <div {...props} ref={ref} />
    ));
    NamedForwardRefComponent.displayName = 'Div';

    const AnonymousMemoComponent = React.memo((props, ref) => <div {...props} ref={ref} />);

    const MemoComponent = React.memo(function Div(props, ref) {
      return <div {...props} ref={ref} />;
    });

    const NamedMemoComponent = React.memo((props, ref) => <div {...props} ref={ref} />);
    NamedMemoComponent.displayName = 'Div';

    const NamedContext = React.createContext(null);
    NamedContext.displayName = 'SomeContext';

    expect(getDisplayName(SomeComponent)).toBe('SomeComponent');
    expect(getDisplayName(SomeOtherComponent)).toBe('CustomDisplayName');
    expect(getDisplayName(YetAnotherComponent)).toBe('YetAnotherComponent');
    expect(getDisplayName(AndAnotherComponent)).toBe('AndAnotherComponent');
    expect(getDisplayName(AnonymousForwardRefComponent)).toBe('ForwardRef');
    expect(getDisplayName(ForwardRefComponent)).toBe('ForwardRef(Div)');
    expect(getDisplayName(NamedForwardRefComponent)).toBe('Div');
    expect(getDisplayName(AnonymousMemoComponent)).toBe('memo');
    expect(getDisplayName(MemoComponent)).toBe('memo(Div)');
    expect(getDisplayName(NamedMemoComponent)).toBe('Div');
    expect(getDisplayName(NamedContext.Provider)).toBe(undefined);
    expect(getDisplayName(NamedContext.Consumer)).toBe(undefined);
    // @ts-expect-error: invalid param
    expect(getDisplayName()).toBe(undefined);
    // @ts-expect-error: invalid param
    expect(getDisplayName(false)).toBe(undefined);
    // @ts-expect-error: invalid param
    expect(getDisplayName({})).toBe(undefined);
  });

  it('gets function name', () => {
    function SomeFunction() {
      return <div />;
    }

    expect(getFunctionName(SomeFunction)).toBe('SomeFunction');
  });
});
