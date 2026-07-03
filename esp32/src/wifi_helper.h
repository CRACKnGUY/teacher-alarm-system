#ifndef WIFI_HELPER_H
#define WIFI_HELPER_H

#include <WiFi.h>

const char* WIFI_SSID = "your_wifi_ssid";
const char* WIFI_PASS = "your_wifi_password";

void connectWiFi() {
  WiFi.mode(WIFI_STA);
  WiFi.begin(WIFI_SSID, WIFI_PASS);

  int attempts = 0;
  while (WiFi.status() != WL_CONNECTED && attempts < 40) {
    delay(500);
    attempts++;
  }
}

bool isWiFiConnected() {
  return WiFi.status() == WL_CONNECTED;
}

#endif
