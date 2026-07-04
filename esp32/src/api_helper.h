#ifndef API_HELPER_H
#define API_HELPER_H

#include <WiFiClientSecure.h>
#include <ArduinoJson.h>

const char* API_HOST = "teacher-alarm-system.vercel.app";
const int API_PORT = 443;

struct StatusResponse {
  String day;
  String time;
  bool hasAlarm;
  String alarmMessage;

  struct Period {
    String time;
    String type;
    String subject;
  };

  Period periods[12];
  int periodCount;
};

bool fetchStatus(StatusResponse& out) {
  WiFiClientSecure client;
  client.setInsecure();

  if (!client.connect(API_HOST, API_PORT)) {
    return false;
  }

  client.print(String("GET /api/status HTTP/1.1\r\n") +
               "Host: " + API_HOST + "\r\n" +
               "Connection: close\r\n\r\n");

  while (client.connected() && !client.available()) {
    delay(10);
  }

  String body;
  bool headersDone = false;
  while (client.available()) {
    String line = client.readStringUntil('\n');
    if (!headersDone) {
      if (line == "\r") headersDone = true;
      continue;
    }
    body += line;
  }

  client.stop();

  JsonDocument doc;
  DeserializationError err = deserializeJson(doc, body);
  if (err) return false;

  out.day = doc["day"].as<String>();
  out.time = doc["time"].as<String>();
  out.hasAlarm = doc["alarm"] | false;
  out.alarmMessage = doc["alarm_message"].as<String>();
  out.periodCount = 0;

  JsonArray periods = doc["periods"].as<JsonArray>();
  for (JsonObject p : periods) {
    if (out.periodCount >= 12) break;
    out.periods[out.periodCount].time = p["time"].as<String>();
    out.periods[out.periodCount].type = p["type"].as<String>();
    out.periods[out.periodCount].subject = p["subject"].as<String>();
    out.periodCount++;
  }

  return true;
}

struct CurrentPeriodResponse {
  String day;
  String serverTime;
  int periodIndex;
  String periodTime;
  String periodType;
  String subject;
  bool isActive;
  bool subjectAssigned;
  int elapsedMinutes;
  bool attendanceRecorded;
  String alarmStatus;
  String alarmMessage;
};

bool fetchCurrentPeriod(CurrentPeriodResponse& out, const char* structure = "secondary") {
  WiFiClientSecure client;
  client.setInsecure();

  if (!client.connect(API_HOST, API_PORT)) {
    return false;
  }

  client.print(String("GET /api/current-period?structure=") + structure + " HTTP/1.1\r\n" +
               "Host: " + API_HOST + "\r\n" +
               "Connection: close\r\n\r\n");

  while (client.connected() && !client.available()) {
    delay(10);
  }

  String body;
  bool headersDone = false;
  while (client.available()) {
    String line = client.readStringUntil('\n');
    if (!headersDone) {
      if (line == "\r") headersDone = true;
      continue;
    }
    body += line;
  }

  client.stop();

  JsonDocument doc;
  DeserializationError err = deserializeJson(doc, body);
  if (err) return false;

  out.day = doc["day"].as<String>();
  out.serverTime = doc["server_time"].as<String>();
  out.periodIndex = doc["period_index"] | -1;
  out.periodTime = doc["period_time"].as<String>();
  out.periodType = doc["period_type"].as<String>();
  out.subject = doc["subject"].as<String>();
  out.isActive = doc["is_active"] | false;
  out.subjectAssigned = doc["subject_assigned"] | false;
  out.elapsedMinutes = doc["elapsed_minutes"] | 0;
  out.attendanceRecorded = doc["attendance_recorded"] | false;
  out.alarmStatus = doc["alarm_status"].as<String>();
  out.alarmMessage = doc["alarm_message"].as<String>();

  return true;
}

#endif
