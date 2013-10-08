describe("Controller testing", function()
{
  var scope = {};
  var appCtrl = new appCtrl(scope);

  it("should have an appCtrl", function()
  {
    expect(appCtrl).not.toBe(undefined);
  });
});
