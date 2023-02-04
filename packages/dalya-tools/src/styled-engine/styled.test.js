import { styled } from '.';

// test.js => This test is for use case without type support
describe('styled', () => {
  const logSpy = jest.spyOn(global.console, 'error');

  it('should help debug empty args', () => {
    const component = 'span';
    styled(component)();

    const noArgumentErrorMessage = [
      `You called \`styled("${component}")()\` without a \`style\` argument.`,
      'You must provide a `styles` argument: `styled("div")(styleYouForgetToPass)`.',
    ].join('\n');
    expect(logSpy).toHaveBeenCalledWith(noArgumentErrorMessage);
  });

  it('should help debug undefined args', () => {
    const component = 'span';
    styled(component)(undefined, { color: 'red' });

    expect(logSpy).toHaveBeenCalledWith(
      `styled("${component}")(...args) API requires all its args to be defined.`,
    );
  });
});
