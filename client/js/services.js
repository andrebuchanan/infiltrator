(function()
{
"use strict";

angular.module('infiltrator.services', ["ngResource"]).
  //
  // Device service.
  factory("Device", function($resource)
  {
    var Device = $resource("/device/");
    return Device;
  });
})();
