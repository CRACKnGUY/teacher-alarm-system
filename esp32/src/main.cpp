#include <Arduino.h>
#include "wifi_helper.h"
#include "api_helper.h"
#include "display_helper.h"
#include "rfid_helper.h"
#include "buzzer_helper.h"

unsigned long lastApiCall = 0;
const unsigned long API_INTERVAL = 30000;

StatusResponse currentStatus;
bool alarmHandled = false;

void setup() {
  Serial.begin(115200);

  initDisplay();
  initRFID();
  initBuzzer();

  tft.setTextSize(2);
  tft.setTextColor(TFT_WHITE, TFT_BLACK);
  tft.setCursor(60, 120);
  tft.print("Connecting...");

  connectWiFi();

  if (isWiFiConnected()) {
    tft.setCursor(60, 150);
    tft.setTextColor(TFT_GREEN, TFT_BLACK);
    tft.print("Connected!");
  } else {
    tft.setCursor(60, 150);
    tft.setTextColor(TFT_RED, TFT_BLACK);
    tft.print("WiFi Failed");
  }

  delay(1000);
}

void loop() {
  unsigned long now = millis();

  if (now - lastApiCall >= API_INTERVAL) {
    lastApiCall = now;

    if (isWiFiConnected()) {
      bool ok = fetchStatus(currentStatus);

      if (ok) {
        drawHeader(currentStatus);
        drawSchedule(currentStatus);
        drawStatusBar(true, currentStatus.hasAlarm);

        if (currentStatus.hasAlarm) {
          if (!alarmHandled) {
            alarmHandled = true;
            buzzerAlarm();
            showOverlay("ALARM!", TFT_RED);
          }
        } else {
          alarmHandled = false;
        }
      } else {
        drawStatusBar(false, false);
      }
    } else {
      drawStatusBar(false, false);
      connectWiFi();
    }
  }

  String uid;
  if (readRFID(uid)) {
    Serial.print("RFID: ");
    Serial.println(uid);

    buzzerBeep(80);
    showOverlay(uid.c_str(), TFT_GREEN);

    WiFiClientSecure client;
    client.setInsecure();

    if (client.connect(API_HOST, API_PORT)) {
      String json = "{\"uid\":\"" + uid + "\"}";

      client.print(String("POST /api/attendance HTTP/1.1\r\n") +
                   "Host: " + API_HOST + "\r\n" +
                   "Content-Type: application/json\r\n" +
                   "Content-Length: " + json.length() + "\r\n" +
                   "Connection: close\r\n\r\n" + json);

      while (client.connected() && !client.available()) delay(10);

      String response;
      while (client.available()) {
        response += (char)client.read();
      }

      Serial.print("Response: ");
      Serial.println(response);
      client.stop();
    } else {
      showOverlay("API Error", TFT_RED);
    }

    delay(2000);
  }
}
