(function()
{
"use strict";

angular.module('infiltrator.controllers', []).
  //
  // App controller. Handle basic functions.
  controller("appCtrl", function()
  {
    this.grock = function(input)
    {

    };
  })
  //
  // Devices controller.
  .controller("devicesCtrl", function($scope, Device, $routeParams, $location, $modal, topic)
  {
    this.devices = Device.items;

    // User wishes to view a particular device.
    if ($routeParams.deviceId)
    {
      var that = this;
      // console.log($routeParams.eventId);
      this.loadingMessage = "Loading device";
      Device.get($routeParams.deviceId).then(function(data)
      {
        // XXX hack
        that.device = data.data.device[0];
        Device.console($routeParams.deviceId);
      });
    }

    // View a particular device. Load the device and when that's done, reroute to device view.
    // Do not reroute if there is a problem loading device.
    // Display error in this case.
    // Display loading dialog during load.
    this.viewDevice = function(deviceId)
    {
      // If deviceId isn't valid, don't do anything.
      if (deviceId === null || deviceId === undefined) return;
      $location.path("/device/" + deviceId);
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
