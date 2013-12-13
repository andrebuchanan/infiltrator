(function()
{
"use strict";

angular.module('infiltrator.services', ["ngResource", "eugeneware.shoe"]).
  //
  // Socket data service.
  factory("Data", function(reconnect)
  {
    var reqId = 0;
    var Data = {
      // Convert to string.
      tos: function(json)
      {
        return JSON.stringify(json);
      },
      // Subscribe to incoming messages of certain types.
      subs: {},
      sub: function(channel, cb)
      {
        var handle = [channel, cb];
        if (!this.subs[channel]) this.subs[channel] = [];
        this.subs[channel].push(cb);
        console.log("subbing ", channel, this.subs[channel]);
        this.sendSub(channel);
        return handle;
      },
      // Send subscription request.
      sendSub: function(channel)
      {
        this.send({ sub: channel, req: "sub" });
      },
      // Unsubscribe from a channel.
      unsub: function(handle)
      {
        var channel = handle[0];
        angular.forEach(this.subs[channel], function(item, index)
        {
          // If stored function is same as handle callback, remove element from array.
          if (item === handle[1])
          {
            this.subs[channel].splice(index, 1);
          }
        });
        // If there are no more callbacks for channel, send unsub request.
        if (this.subs[channel].length === 0) this.send({ sub: channel, req: "sub" });
      },
      _send: function(json)
      {
        this.stream.write(this.tos(json));
      },
      send: function(json)
      {
        if (!this.stream)
        {
          setTimeout(function()
          {
            Data.send(json);
          }, 200);
          return;
        }
        this._send(json);
      },
      stream: null
    };

    // Use the reconnect function to establish and maintain connection to server.
    reconnect(function(stream)
    {
      Data.stream = stream;
      stream.on("data", function(msg)
      {
        var data = {};
        // Grab the contents of the message. Technically the server shouldn't be
        // sending enborkend messages, but just in case...
        try
        {
          data = JSON.parse(msg);
        }
        catch(e) { console.log(e); }

        // If there was valid data in the tubes, try to use it.
        var channel = data.req + "";
        delete data.req;
        // For each subscription to the channel, run the callback with
        // the supplied data.
        console.log(channel);
        (Data.subs[channel] ? Data.subs[channel] : []).forEach(function(callback)
        {
          callback(data);
        });
      });

      // On reconnection, resub if there are callbacks.
      for (var ch in Data.subs)
      {
        if (Data.subs[ch].length > 0) Data.sendSub(ch);
      }
    }).connect("/data");

    return Data;
  }).
  //
  // Device service.
  factory("Device", function(Data, $http, $rootScope)
  {
    var Device = {
      items: {},
      // Get device info
      get: function(id)
      {
        return $http({ method: "GET", url: "/device/" + (id ? id : "") }).
        success(function(data)
        {
          data.forEach(function(device)
          {
            Device.items[device.id] = device;
          });
        });
      },
      // Get console messages for device.
      console: function(id)
      {
        return $http({ method: "GET", url: "/device/console/" + id }).
        success(function(data)
        {
          console.log(data);
          // $rootScope.$apply(function()
          // {
          Device.items[id].console = data;
          // });
        });
      }
    };

    Device.get();

    // Execute this callback when registration messages are received.
    Data.sub("register", function(device)
    {
      Device.items[device.register.id] = device.register;
    });

    // Execute this callback when console messages are received.
    Data.sub("console", function(msg)
    {
      if (Device.items[msg.console.id])
      {
        var device = Device.items[msg.console.id];
        if (!device.console) device.console = [];
        device.console.push(msg.console);
      }
    });

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
