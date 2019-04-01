import Dimension from '../dimension';

describe('Dimension mocks', () => {
  describe('mock', () => {
    it('sets isMocked()', () => {
      const dimension = new Dimension();

      dimension.mock({
        scrollWidth: 200,
      });

      expect(dimension.isMocked()).toBe(true);
    });

    it('throws if it is already mocked', () => {
      const dimension = new Dimension();

      dimension.mock({
        scrollWidth: 200,
      });

      expect(() => {
        dimension.mock({
          scrollWidth: 200,
        });
      }).toThrow();
    });

    it('allows mocking all supported properties', () => {
      const dimension = new Dimension();

      expect(() => {
        dimension.mock({
          scrollWidth: 200,
          scrollHeight: 200,
          offsetWidth: 200,
          offsetHeight: 200,
        });
      }).not.toThrow();
    });
  });

  describe('restore', () => {
    it('sets isMocked', () => {
      const dimension = new Dimension();
      dimension.mock({
        scrollWidth: 200,
      });
      dimension.restore();

      expect(dimension.isMocked()).toBe(false);
    });

    it('throws if it has not yet been mocked', () => {
      const dimension = new Dimension();

      expect(() => {
        dimension.restore();
      }).toThrow();
    });
  });
});
