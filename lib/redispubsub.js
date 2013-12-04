var redis = require("redis");
// Create a subscribe client and subscribe to messages related to the requested
// dataType.
var sclient = redis.createClient();
var pclient = redis.createClient();

var topics = {};

sclient.on("message", function(channel, message)
{
  callbacks = topics[channel];
  if (!callbacks) return;
  callbacks.forEach(function(callback)
  {
    callback.call(null, message);
  });
});

exports.unsub = function(topic)
{
  sclient.unsubscribe(topic);
  topics[topic] = [];
}

exports.sub = function(topic, callback)
{
  if (!topics[topic]) topics[topic] = [];
  topics[topic].push(callback);
  sclient.SUBSCRIBE(topic);
}

exports.pub = function(topic, message)
{
  pclient.PUBLISH(topic, message);
}
