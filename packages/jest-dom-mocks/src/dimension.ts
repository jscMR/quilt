import {memoize} from '@shopify/javascript-utilities/decorators';

const enum SupportedDimension {
  OffsetWidth = 'offsetWidth',
  OffsetHeight = 'offsetHeight',
  ScrollWidth = 'scrollWidth',
  ScrollHeight = 'scrollHeight',
}

type MockedGetter = () => number;
type Mock = MockedGetter | number;
type Mocks = Partial<{[T in SupportedDimension]: Mock}>;

function isGetterFunction(mock?: Mock): mock is MockedGetter {
  return mock != null && typeof mock === 'function';
}

export default class Dimension {
  private isUsingMock = false;
  private overwrittenImplementations: string[] = [];

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
  private get nativeImplementations(): Map<
    SupportedDimension,
    HTMLElement | Element
  > {
    return new Map([
      [SupportedDimension.OffsetWidth, HTMLElement.prototype],
      [SupportedDimension.OffsetHeight, HTMLElement.prototype],
      [SupportedDimension.ScrollWidth, Element.prototype],
      [SupportedDimension.ScrollHeight, Element.prototype],
    ]);
  }

  private setDimensionFns(mocks: Mocks) {
    Object.keys(mocks).forEach((key: SupportedDimension) => {
      const nativeSource = this.nativeImplementations.get(key);
      const mock = mocks[key];

      this.overwrittenImplementations.push(key);

      if (isGetterFunction(mock)) {
        Object.defineProperty(nativeSource, key, {
          get: mock,
          configurable: true,
        });
      } else {
        Object.defineProperty(nativeSource, key, {
          value: mocks[key],
          configurable: true,
        });
      }
    });
  }

  private restoreDimensionFns() {
    this.overwrittenImplementations.forEach((key: SupportedDimension) => {
      const mockedImplementation = this.nativeImplementations.get(key);

      if (mockedImplementation == null) {
        return;
      }

      delete mockedImplementation[key];
    });

    this.overwrittenImplementations = [];
  }
}
