#include <Arduino.h>
#include "wifi_helper.h"
#include "api_helper.h"
#include "display_helper.h"
#include "rfid_helper.h"
#include "buzzer_helper.h"
#include "realtime_helper.h"

unsigned long lastApiCall = 0;
const unsigned long API_INTERVAL = 30000;
unsigned long lastPeriodCheck = 0;
const unsigned long PERIOD_CHECK_INTERVAL = 3000;

StatusResponse currentStatus;
const char* STRUCTURE = "secondary";

// ── Alarm state machine ──
String prevAlarmStatus = "ok";
unsigned long buzzerStartMs = 0;
int buzzerDurationMs = 0;
bool buzzerOn = false;
bool buzzerPulseToggle = false;
unsigned long lastPulseToggleMs = 0;
String lastAlarmSubject = "";

void startBuzzer(int durationMs, bool continuous = true) {
  buzzerOn = true;
  buzzerStartMs = millis();
  buzzerDurationMs = durationMs;
  if (continuous) {
    digitalWrite(BUZZER_PIN, HIGH);
  }
  buzzerPulseToggle = true;
  lastPulseToggleMs = millis();
}

void stopBuzzer() {
  digitalWrite(BUZZER_PIN, LOW);
  buzzerOn = false;
}

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
  initRealtime();
  Serial.println("[RT] Connecting to Supabase Realtime...");
}

void handleAlarm(CurrentPeriodResponse& pr) {
  unsigned long nowMs = millis();

  // ── Attendance recorded → stop everything ──
  if (pr.attendanceRecorded && pr.subjectAssigned) {
    if (prevAlarmStatus != "ok") {
      stopBuzzer();
      prevAlarmStatus = "ok";
      lastAlarmSubject = "";
      drawSchedule(currentStatus);
      Serial.println("[ALARM] Attendance recorded — alarms cleared");
    }
    return;
  }

  // ── No active period → reset ──
  if (!pr.isActive || !pr.subjectAssigned || pr.alarmStatus == "ok") {
    if (prevAlarmStatus != "ok") {
      stopBuzzer();
      prevAlarmStatus = "ok";
      lastAlarmSubject = "";
      if (pr.isActive) drawSchedule(currentStatus);
    }
    return;
  }

  String status = pr.alarmStatus;
  String subject = pr.subject;

  // ── PERIOD START (active, first 5 min) ──
  if (status == "active" && prevAlarmStatus != "active") {
    prevAlarmStatus = "active";
    lastAlarmSubject = subject;
    startBuzzer(5000, true);
    showOverlay((subject + " - " + pr.periodTime).c_str(), TFT_ORANGE);
    Serial.printf("[ALARM] Period start: %s\n", subject.c_str());
  }

  // ── LATE (5-10 min) ──
  if (status == "late" && prevAlarmStatus != "late") {
    prevAlarmStatus = "late";
    lastAlarmSubject = subject;
    startBuzzer(10000, true);
    showOverlay(("Late to " + subject + "!").c_str(), TFT_RED);
    Serial.printf("[ALARM] Late: %s\n", subject.c_str());
  }

  // ── ESCALATED (10+ min) ──
  if (status == "escalated" && prevAlarmStatus != "escalated") {
    prevAlarmStatus = "escalated";
    lastAlarmSubject = subject;
    startBuzzer(10000, true);
    showOverlay(("Escalated: " + subject).c_str(), TFT_RED);
    Serial.printf("[ALARM] Escalated: %s\n", subject.c_str());
  }

  // ── Non-blocking buzzer timing ──
  if (buzzerOn) {
    // Pulsing mode for escalated (after initial buzzer)
    if (status == "escalated" && nowMs - buzzerStartMs > 10000) {
      if (nowMs - lastPulseToggleMs > 2000) {
        buzzerPulseToggle = !buzzerPulseToggle;
        lastPulseToggleMs = nowMs;
        digitalWrite(BUZZER_PIN, buzzerPulseToggle ? HIGH : LOW);
      }
    }
    // Stop after duration for active/late (or initial escalated buzz)
    else if (status != "escalated" && nowMs - buzzerStartMs >= buzzerDurationMs) {
      stopBuzzer();
      Serial.println("[ALARM] Buzzer stopped");
    }
    else if (status == "escalated" && nowMs - buzzerStartMs >= 10000 && nowMs - buzzerStartMs >= buzzerDurationMs) {
      // Initial 10s done, switching to pulse mode — don't stop, just let pulse logic run
    }
  }
}

void loop() {
  loopRealtime();

  unsigned long now = millis();

  // ── Period check (every 3s) ──
  if (now - lastPeriodCheck >= PERIOD_CHECK_INTERVAL) {
    lastPeriodCheck = now;

    if (isWiFiConnected()) {
      CurrentPeriodResponse pr;
      if (fetchCurrentPeriod(pr, STRUCTURE)) {
        handleAlarm(pr);
      }
    }
  }

  // ── Status fetch (every 30s) ──
  if (now - lastApiCall >= API_INTERVAL) {
    lastApiCall = now;

    if (isWiFiConnected()) {
      bool ok = fetchStatus(currentStatus);

      if (ok) {
        drawHeader(currentStatus);
        drawSchedule(currentStatus);
        drawStatusBar(true, currentStatus.hasAlarm);
      } else {
        drawStatusBar(false, false);
      }
    } else {
      drawStatusBar(false, false);
      connectWiFi();
    }
  }

  // ── RFID ──
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
