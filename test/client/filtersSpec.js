describe("filter", function()
{
  beforeEach(angular.mock.module("infiltrator.filters"));

  describe("boolString", function() {
    it("should return string representation of boolean", inject(function(boolStringFilter)
    {
      expect(boolStringFilter(false)).toEqual("false");
      expect(boolStringFilter(true)).toEqual("true");
      expect(boolStringFilter("random input")).toEqual("true");
      expect(boolStringFilter(0)).toEqual("false");
      expect(boolStringFilter(1)).toEqual("true");
      // Are these really optimal?
      expect(boolStringFilter()).toEqual("false");
      expect(boolStringFilter(undefined)).toEqual("false");
    }));
  });
});