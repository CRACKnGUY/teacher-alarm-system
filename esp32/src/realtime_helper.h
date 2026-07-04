#ifndef REALTIME_HELPER_H
#define REALTIME_HELPER_H

#include <Arduino.h>
#include <ArduinoJson.h>
#include "display_helper.h"
#include "buzzer_helper.h"

// ── Fill these in from your Supabase project ──
const char* SUPABASE_URL    = "https://YOUR_PROJECT.supabase.co";
const char* SUPABASE_ANON   = "YOUR_ANON_KEY";
const char* SUPABASE_WS_URL = "wss://YOUR_PROJECT.supabase.co/realtime/v1/websocket?apikey=YOUR_ANON_KEY";

WebSocketsClient webSocket;

void realtimeCallback(WStype_t type, uint8_t* payload, size_t length) {
  switch (type) {
    case WStype_DISCONNECTED:
      Serial.println("[RT] Disconnected");
      break;

    case WStype_CONNECTED:
      Serial.println("[RT] Connected");
      webSocket.sendTXT("[null,\"1\",\"realtime:slots\",\"phx_join\",{}]");
      break;

    case WStype_TEXT: {
      String msg = String((char*)payload);
      JsonDocument doc;
      DeserializationError err = deserializeJson(doc, msg);
      if (err) break;

      // ── Heartbeat reply ──
      if (doc[3] == "phx_reply") {
        String ref = doc[1].as<String>();
        webSocket.sendTXT("[null,\"" + ref + "\",\"phoenix\",\"heartbeat\",{}]");
      }

      // ── Postgres change: slots ──
      if (doc[3] == "postgres_changes" && doc[2] == "realtime:slots") {
        JsonObject data = doc[4]["data"];
        const char* eventType = data["type"];
        if (strcmp(eventType, "UPDATE") == 0 || strcmp(eventType, "INSERT") == 0) {
          JsonObject record = data["record"];
          String str = record["subject"].as<String>();
          if (str.length() > 0) {
            showOverlay(("Updated: " + str).c_str(), TFT_ORANGE);
          } else {
            showOverlay("Schedule updated", TFT_ORANGE);
          }
        }
      }

      break;
    }
    default:
      break;
  }
}

void initRealtime() {
  webSocket.begin(SUPABASE_WS_URL);
  webSocket.onEvent(realtimeCallback);
  webSocket.setReconnectInterval(5000);
}

void loopRealtime() {
  webSocket.loop();
}

#endif
