enum SupportedDimension {
  OffsetWidth = 'offsetWidth',
  OffsetHeight = 'offsetHeight',
  ScrollWidth = 'scrollWidth',
  ScrollHeight = 'scrollHeight',
}

type DimensionMap = {[T in SupportedDimension]: HTMLElement | Element};
type MockedDimensions = {[T in SupportedDimension]: number};

export default class Dimension {
  private isUsingMock = false;
  private mocks: Partial<MockedDimensions> = {};
  private dimensionMap: DimensionMap = {
    [SupportedDimension.OffsetWidth]: HTMLElement.prototype,
    [SupportedDimension.OffsetHeight]: HTMLElement.prototype,
    [SupportedDimension.ScrollWidth]: Element.prototype,
    [SupportedDimension.ScrollHeight]: Element.prototype,
  };

  mock(mocks: Partial<MockedDimensions>) {
    if (this.isUsingMock) {
      throw new Error(
        'Dimensions are already mocked, but you tried to mock them again.',
      );
    }

    this.mocks = mocks;

    this.assignDimensionProperties(this.mocks);
    this.isUsingMock = true;
  }

  restore() {
    if (!this.isUsingMock) {
      throw new Error(
        "Dimensions haven't been mocked, but you are trying to restore them.",
      );
    }

    this.removeDimensionProperties(this.mocks);
    this.isUsingMock = false;
  }

  isMocked() {
    return this.isUsingMock;
  }

  private assignDimensionProperties(properties: Partial<MockedDimensions>) {
    let key: SupportedDimension;
    for (key in properties) {
      if (properties.hasOwnProperty(key)) {
        Object.defineProperty(this.dimensionMap[key], key, {
          value: properties[key],
        });
      }
    }
  }

  private removeDimensionProperties(properties: Partial<MockedDimensions>) {
    let key: SupportedDimension;
    for (key in properties) {
      if (properties.hasOwnProperty(key)) {
        delete properties[key];
      }
    }
  }
}
