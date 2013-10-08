(function()
{
"use strict";

angular.module("infiltrator.directives", []).
  //
  // Version directive
  directive("version", function(version) {
    return {
      replace: true,
      restrict: "E",
      template: "<div>AngualrJS v{{ver}}</div>",
      link: function(scope)
      {
        scope.ver = angular.version.full;
      }
    };
  })
  //
  // Device information directive.
  // Note: Isolate scope must be = and object must be passed to directive without {{}}.
  // Eg: <div info="object"></div>
  .directive("deviceinfo", function()
  {
    return {
      templateUrl: "partials/deviceInfo.html",
      scope: { info: '=' }
    };
  });
})();
