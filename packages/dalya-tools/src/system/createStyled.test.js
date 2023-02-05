/**
 * @jest-environment jsdom
 */
import React from 'react';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import createStyled from './createStyled';

const isProductionMode = process.env.NODE_ENV !== 'production';

const itif = (name, shouldRunTest, cb) => {
  // eslint-disable-next-line jest/valid-title, jest/no-done-callback
  it(name, (done) => {
    if (shouldRunTest) {
      cb(done);
    } else {
      console.warn(`[skipped]: ${name}`);
      done();
    }
  });
};

describe('createStyled', () => {
  describe('displayName', () => {
    // display names are dev-only
    itif('uses the `componentName` if set', isProductionMode, (done) => {
      const styled = createStyled({});
      const SomeDalyaComponent = styled('div', { name: 'SomeDalyaComponent' })({});

      // eslint-disable-next-line jest/no-standalone-expect
      expect(SomeDalyaComponent).toHaveProperty('displayName', 'SomeDalyaComponent');
      done();
    });
    // fallback: return to the prior level of a system, default
    itif('falls back to the decorated tag name', isProductionMode, (done) => {
      const styled = createStyled({});
      const SomeDalyaComponent = styled('div')({});

      // eslint-disable-next-line jest/no-standalone-expect
      expect(SomeDalyaComponent).toHaveProperty('displayName', 'Styled(div)');
      done();
    });

    itif('falls back to the decorated computed displayName', isProductionMode, (done) => {
      const styled = createStyled({});
      const SomeDalyaComponent = styled(function SomeDalyaComponent() {
        return null;
      })({});

      // eslint-disable-next-line jest/no-standalone-expect
      expect(SomeDalyaComponent).toHaveProperty('displayName', 'Styled(SomeDalyaComponent)');
      done();
    });

    itif('has a fallback name if the display name cannot be computed', isProductionMode, (done) => {
      const styled = createStyled({});
      const SomeDalyaComponent = styled(() => {
        return null;
      })({});

      // eslint-disable-next-line jest/no-standalone-expect
      expect(SomeDalyaComponent).toHaveProperty('displayName', 'Styled(Component)');
      done();
    });
  });

  describe('createStyled', () => {
    const styled = createStyled({});

    /* TODO: After <ThemeProvider />
    const ButtonRoot = styled('button', {
      name: 'DalyaButton',
      slot: 'Root',
      overrideResolver: (props, styles) => [
        styles.root,
        { [`& .DalyaButton-avatar`]: styles.avatar },
      ],
    })({});

    const ButtonIcon = styled('span', {
      name: 'DalyaButton',
      slot: 'Icon',
      overridesResolver: (props, styles) => styles.icon,
    })({});

    function Button({ children, startIcon, endIcon, color = 'primary', ...props }) {
      const ownerState = { startIcon, endIcon, color, ...props };
      return (
        <ButtonRoot ownerState={ownerState}>
          {startIcon && <ButtonIcon ownerState={ownerState}>{startIcon}</ButtonIcon>}
          {children}
          {endIcon && <ButtonIcon ownerState={ownerState}>{endIcon}</ButtonIcon>}
        </ButtonRoot>
      );
    }
    */

    // ownerState: state from top-level component (the `owner`)
    // https://mui.com/base/getting-started/customization/#overriding-subcomponent-slots
    it('does not forward `ownerState` prop to DOM', () => {
      const Button = styled('button')({});
      const { container } = render(<Button ownerState={{}} />);
      expect(container.firstChild).not.toHaveAttribute('ownerState');
    });

    it('does not forward invalid props to DOM if no `slot` specified', () => {
      // This scenario is usually used by library consumers
      const Button = styled('button')({});

      const { container } = render(
        <Button color="red" shouldBeRemoved data-foo="bar">
          Link
        </Button>,
      );

      expect(container.firstChild).toHaveAttribute('data-foo', 'bar');
      expect(container.firstChild).toHaveAttribute('color', 'red');
      expect(container.firstChild).not.toHaveAttribute('shouldBeRemoved');
    });

    it('can use `as` prop', () => {
      const Button = styled('button')({});

      const { container } = render(<Button as="a" href="/" />);

      expect(container.firstChild).toContainHTML('a');
    });

    it('ables to pass props to `as` styled component', () => {
      const ChildRoot = styled('div')({});
      // eslint-disable-next-line react/prop-types
      function Child({ component }) {
        return <ChildRoot as={component}>content</ChildRoot>;
      }
      const Button = styled('button')({});

      const { container } = render(<Button as={Child} component="span" />);

      expect(container.firstChild).toContainHTML('<span class="css-0">content</span>');
    });
  });
});
