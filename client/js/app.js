
(function()
{
"use strict";

var app = angular.module("infiltrator", ["ngRoute", "ui.bootstrap", "infiltrator.filters", "infiltrator.services", "infiltrator.directives", "infiltrator.controllers"]).
    config(["$routeProvider", function($routeProvider)
    {
      $routeProvider.when("/",
        { templateUrl: "partials/devices.html", controller: "devicesCtrl as devices" });
      $routeProvider.when("/device/:deviceId",
        { templateUrl: "partials/device.html", controller: "devicesCtrl as devices" });
      // $routeProvider.when("/events/edit/:eventId",
      //                                     { templateUrl: "partials/event.html",   controller: "eventsCtrl",
      //   resolve: { getAuth: authCheck, getAuthz: authzCheck } });
      $routeProvider.otherwise({ redirectTo: "/" });
    }]);

app.run(function($rootScope, $log)
{
  $rootScope.$log = null;
});

})();
