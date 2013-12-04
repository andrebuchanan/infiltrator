(function()
{
"use strict";

angular.module('infiltrator.controllers', []).
  //
  // App controller. Handle basic functions.
  controller("appCtrl", function(events)
  {
    this.grock = function(input)
    {

    };
  })
  //
  // Devices controller.
  .controller("devicesCtrl", function($scope, Device, $routeParams, $location, $modal, topic)
  {
    this.devices = [
      {
        name: "iPhone#927",
        type: "iphone",
        lastComm: "2 seconds",
        status: "Achieved self-awareness",
        lines: [
          { out: "Lorem" },
          { out: "ipsum" },
          { out: "dolor" },
          { out: "sit" },
          { out: "amet" },
          { out: "consectetur" },
          { out: "adipisicing" },
          { out: "elit" },
          { out: "Soluta" },
          { out: "fugiat" },
          { out: "distinctio" },
          { out: "non" },
          { out: "quasi" },
          { out: "voluptatum" },
          { out: "voluptatibus" },
          { out: "ipsum" },
          { out: "optio" },
          { out: "corporis" },
          { out: "porro" },
          { out: "quisquam" },
          { out: "tempore" },
          { out: "officia" },
          { out: "rem" },
          { out: "error" },
          { out: "vel" },
          { out: "dicta" },
          { out: "sed" },
          { out: "facilis" },
          { out: "odit" },
          { out: "nesciunt" }
        ]
      },
      {
        name: "iPood",
        type: "android aphone",
        lastComm: "many times",
        status: "Messy"
      }
    ];
    this.devices = Device.query();

    // User wishes to view a particular device.
    if ($routeParams.deviceId)
    {
      // console.log($routeParams.eventId);
      this.loadingMessage = "Loading device";
      this.device = Device.get({ id: $routeParams.deviceId });
      // this.arbEvent = Event.get({ _id: { $oid: $routeParams.eventId }}, function()
      // {
      //   $this.loadingMessage = false;
      // });
    }

    // View a particular device. Load the device and when that's done, reroute to device view.
    // Do not reroute if there is a problem loading device.
    // Display error in this case.
    // Display loading dialog during load.
    this.viewDevice = function(number)
    {
      // If number isn't valid, don't do anything.
      if (number === null || number === undefined) return;
      $location.path("/device/" + number);
    };

    //
    // Open a dialog for display of device information.
    this.deviceInfo = function(device)
    {
      $modal.open({
        templateUrl: "partials/deviceInfoDialog.html",
        resolve: {
          device: function()
          {
            return $scope.devices.device;
          }
        },
        controller: "modalInstanceCtrl as modal"
      });
    };
  })
  //
  // Controller for modal
  .controller("modalInstanceCtrl", function($scope, $modalInstance, device)
  {
    this.device = device;
    this.close = function()
    {
      $modalInstance.close();
    };
  });
})();
