(function()
{
"use strict";

angular.module('infiltrator.services', ["ngResource", "eugeneware.shoe"]).
  //
  // Device service.
  factory("Device", function(reconnect)
  {
    var Device = {
      items: {},
      get: function(id)
      {
        return this.items[id];
      }
    };

    reconnect(function(stream)
    {
      stream.on("data", function(msg)
      {
        var data = JSON.parse(msg);
        if (data.req == "register")
        {
          Device.items[data.id] = data;
          return;
        }

        var devices = data;
        console.log(devices);
        devices.forEach(function(device)
        {
          Device.items[device.id] = device;
        });
        console.log(Device.items);
      });
      stream.write(JSON.stringify({ req: "device" }));
      stream.write(JSON.stringify({ sub: "register" }));
    }).connect("/data");

    return Device;
  }).
  // Topic (sub/pub)
  factory("topic", function()
  {
    // Place to register topics.
    var topics = {};
    // Return module.
    return {
      // Publish: causes execution of all subscribed callbacks.
      publish: function(topic, args)
      {
        // When publish is used, execute callbacks for each subscribe to the topic.
        angular.forEach(topics[topic], function(item, index)
        {
          // This is doing something I don't fully understand. Right, well, It's simply executing
          // a function with a certain context - in this case null - and with a supplied argument list.
          item.apply(null, args || []);
        });
      },
      // Subscribe: register a callback to be executed when topic message is received.
      subscribe: function(topic, callback)
      {
        // If topic doesn't exist, create array for topic.
        if (!topics[topic])
        {
          topics[topic] = [];
        }
        // Add callback to topic array.
        topics[topic].push(callback);
        // Return array of topic and callback for, I assume, use in unsubbing.
        return [topic, callback];
      },
      // Unsubscribe: remove callback from array of subs in topic.
      unsubscribe: function(handle)
      {
        var topic = handle[0];
        angular.forEach(topics[topic], function(item, index)
        {
          // If stored function is same as handle callback, remove element from array.
          if (item === handle[1])
          {
            topics[topic].splice(index, 1);
          }
        });
      }
    };
  }).
  // Event system.
  factory("events", function($http, topic)
  {
    var reqEvent = function()
    {
      $http({ method: "GET", url: "/evt" })
      // On success, immediately ask for more events.
      .success(function(data, status)
      {
        topic.publish("evt/load");
        topic.publish("evt/" + data.mType, [data]);
        // console.dir(data);
      })
      // Try again after a respectful pause.
      .error(function(data, status, headers, config)
      {
        setTimeout(function()
        {
          topic.publish("evt/load");
        }, 10000);
      });
    };
    // When the evt/load message is published, go and get events from the server.
    topic.subscribe("evt/load", reqEvent);
    // Kick off point for event gathering.
    topic.publish("evt/load");
  });
})();
