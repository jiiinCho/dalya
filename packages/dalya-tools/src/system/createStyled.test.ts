import createStyled from './createStyled';

const isProductionMode = process.env.NODE_ENV !== 'production';

const itif = (name: string, shouldRunTest: boolean, cb: Function) => {
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
    itif('uses the `componentName` if set', isProductionMode, (done: jest.DoneCallback) => {
      const styled = createStyled({});
      const SomeDalyaComponent = styled('div', { name: 'SomeDalyaComponent' })({});

      expect(SomeDalyaComponent).toHaveProperty('displayName', 'SomeDalyaComponent');
      done();
    });
  });
});
