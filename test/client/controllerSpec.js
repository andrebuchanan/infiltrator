describe("Controller testing", function()
{
  var appCtrl;
  beforeEach(module("infiltrator.controllers"));
  beforeEach(inject(function($controller)
  {
    appCtrl = $controller("appCtrl");
  }));

  describe("AppCtrl", function()
  {
    it("should be defined", function()
    {
      expect(appCtrl).not.toBe(undefined);
    });

    it("should have a grock function", function()
    {
      expect(appCtrl.grock).toBeDefined();
    });
  });
});
