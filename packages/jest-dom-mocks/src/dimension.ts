import {memoize} from '@shopify/javascript-utilities/decorators';

const enum SupportedDimension {
  OffsetWidth = 'offsetWidth',
  OffsetHeight = 'offsetHeight',
  ScrollWidth = 'scrollWidth',
  ScrollHeight = 'scrollHeight',
}

type Mocks = Partial<{[T in SupportedDimension]: number}>;

export default class Dimension {
  private isUsingMock = false;
  private nativeImplementation: Map<
    string,
    HTMLElement | Element | undefined
  > = new Map();

  mock(mocks: Mocks) {
    if (this.isUsingMock) {
      throw new Error(
        'Dimensions are already mocked, but you tried to mock them again.',
      );
    } else if (Object.keys(mocks).length === 0) {
      throw new Error('No dimensions provided for mocking');
    }

    this.setDimensionFns(mocks);
    this.isUsingMock = true;
  }

  restore() {
    if (!this.isUsingMock) {
      throw new Error(
        "Dimensions haven't been mocked, but you are trying to restore them.",
      );
    }

    this.restoreDimensionFns();
    this.isUsingMock = false;
  }

  isMocked() {
    return this.isUsingMock;
  }

  @memoize()
  private get implementationSources() {
    return new Map([
      [SupportedDimension.OffsetWidth, HTMLElement.prototype],
      [SupportedDimension.OffsetHeight, HTMLElement.prototype],
      [SupportedDimension.ScrollWidth, Element.prototype],
      [SupportedDimension.ScrollHeight, Element.prototype],
    ]);
  }

  private setDimensionFns(mocks: Mocks) {
    Object.keys(mocks).forEach((key: SupportedDimension) => {
      const source = this.implementationSources.get(key);

      // Backup native implementation
      this.nativeImplementation.set(key, source);

      // Overwrite native implementation
      Object.defineProperty(source, key, {
        value: mocks[key],
      });
    });
  }

  private restoreDimensionFns() {
    this.nativeImplementation.forEach((property, key: SupportedDimension) => {
      Object.defineProperty(this.implementationSources.get(key), key, {
        value: property,
      });
    });
  }
}
