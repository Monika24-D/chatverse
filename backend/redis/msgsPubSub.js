import dotenv from "dotenv";
dotenv.config();

import Redis from "ioredis";

console.log("HOST:", process.env.REDIS_HOST);
console.log("PORT:", process.env.REDIS_PORT);
console.log("USER:", process.env.REDIS_USER);

// Subscriber
const subscriber = new Redis({
  host: process.env.REDIS_HOST,
  port: process.env.REDIS_PORT,
  username: process.env.REDIS_USER,
  password: process.env.REDIS_PWD,
  tls: {},
});

// Publisher
const publisher = new Redis({
  host: process.env.REDIS_HOST,
  port: process.env.REDIS_PORT,
  username: process.env.REDIS_USER,
  password: process.env.REDIS_PWD,
  tls: {},
});

// Connection Logs
subscriber.on("connect", () => {
  console.log("✅ Subscriber connected to Valkey");
});

publisher.on("connect", () => {
  console.log("✅ Publisher connected to Valkey");
});

subscriber.on("error", (err) => {
  console.log("❌ Subscriber Error:", err);
});

publisher.on("error", (err) => {
  console.log("❌ Publisher Error:", err);
});

// Subscribe
export function subscribe(channel, callback) {
  subscriber.subscribe(channel, (err) => {
    if (err) {
      console.log("Error subscribing:", err);
      return;
    }

    console.log(`Subscribed to ${channel}`);
  });

  subscriber.on("message", (subscribedChannel, message) => {
    console.log(
      "Subscriber",
      subscribedChannel,
      "received message:",
      message
    );

    if (subscribedChannel === channel) {
      callback(message);
    }
  });
}

// Unsubscribe
export function unsubscribe(channel) {
  subscriber.unsubscribe(channel, (err) => {
    if (err) {
      console.log("Error unsubscribing:", err);
      return;
    }

    console.log(`Unsubscribed from ${channel}`);
  });
}

// Publish
export async function publish(channel, message) {
  try {
    await publisher.publish(channel, message);
    console.log(`Published to ${channel}: ${message}`);
  } catch (error) {
    console.log("Publish Error:", error);
  }
}