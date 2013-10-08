(function()
{
"use strict";

angular.module('infiltrator.filters', []).
  //
  // Meh.
  filter("boolString", function()
  {
    return function(bool)
    {
      return bool ? "true" : "false";
    };
  });
})();
