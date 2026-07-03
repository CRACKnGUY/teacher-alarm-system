#ifndef DISPLAY_HELPER_H
#define DISPLAY_HELPER_H

#include <TFT_eSPI.h>
#include "api_helper.h"

TFT_eSPI tft = TFT_eSPI();

#define BG_COLOR    TFT_BLACK
#define TEXT_COLOR  TFT_WHITE
#define DIM_TEXT    TFT_DARKGREY
#define ACCENT      TFT_ORANGE
#define DARK_BG     0x0841

void initDisplay() {
  tft.init();
  tft.setRotation(1);
  tft.fillScreen(BG_COLOR);
  tft.setTextColor(TEXT_COLOR, BG_COLOR);
}

void drawHeader(const StatusResponse& data) {
  tft.fillRect(0, 0, 320, 30, BG_COLOR);
  tft.setTextSize(1);

  tft.setTextColor(TEXT_COLOR, BG_COLOR);
  tft.setCursor(8, 8);
  tft.print(data.day);
  tft.setCursor(8, 18);
  tft.setTextColor(DIM_TEXT, BG_COLOR);
  tft.print(data.time);

  tft.setTextColor(ACCENT, BG_COLOR);
  tft.setCursor(220, 8);
  tft.print("Teacher");

  tft.drawFastHLine(0, 30, 320, DARK_BG);
}

void drawSchedule(const StatusResponse& data) {
  tft.fillRect(0, 33, 320, 250, BG_COLOR);

  int y = 38;
  tft.setTextSize(1);

  for (int i = 0; i < data.periodCount; i++) {
    const auto& p = data.periods[i];

    if (y > 290) break;

    if (p.type == "break") {
      tft.setTextColor(DIM_TEXT, BG_COLOR);
      tft.setCursor(10, y);
      tft.print(p.time);
      tft.setCursor(130, y);
      tft.setTextColor(DIM_TEXT, BG_COLOR);
      tft.print("Break");
      y += 18;
      continue;
    }

    if (p.type == "lunch") {
      tft.setTextColor(DIM_TEXT, BG_COLOR);
      tft.setCursor(10, y);
      tft.print(p.time);
      tft.setCursor(130, y);
      tft.setTextColor(DIM_TEXT, BG_COLOR);
      tft.print("Lunch");
      y += 18;
      continue;
    }

    bool hasSubject = p.subject && p.subject.length() > 0;

    tft.setTextColor(hasSubject ? TEXT_COLOR : DIM_TEXT, BG_COLOR);
    tft.setCursor(10, y);
    tft.print(p.time);

    if (hasSubject) {
      tft.fillRect(120, y - 2, 190, 16, DARK_BG);
      tft.setTextColor(TEXT_COLOR, DARK_BG);
      tft.setCursor(125, y);
      tft.print(p.subject);
    } else {
      tft.setTextColor(DIM_TEXT, BG_COLOR);
      tft.setCursor(130, y);
      tft.print("Free");
    }

    y += 20;
  }
}

void drawStatusBar(bool wifiOk, bool alarmActive) {
  tft.fillRect(0, 305, 320, 15, DARK_BG);

  tft.setTextSize(1);
  if (wifiOk) {
    tft.setTextColor(TFT_GREEN, DARK_BG);
    tft.setCursor(8, 307);
    tft.print("WiFi OK");
  } else {
    tft.setTextColor(TFT_RED, DARK_BG);
    tft.setCursor(8, 307);
    tft.print("WiFi X");
  }

  if (alarmActive) {
    tft.setTextColor(TFT_RED, DARK_BG);
    tft.setCursor(240, 307);
    tft.print("ALARM!");
  } else {
    tft.setTextColor(DIM_TEXT, DARK_BG);
    tft.setCursor(240, 307);
    tft.print("Standby");
  }
}

void showOverlay(const char* msg, uint16_t color) {
  tft.fillRect(40, 130, 240, 40, DARK_BG);
  tft.drawRect(40, 130, 240, 40, ACCENT);
  tft.setTextColor(color, DARK_BG);
  tft.setTextSize(2);
  tft.setCursor(60, 142);
  tft.print(msg);
  delay(1500);
  tft.fillRect(40, 130, 240, 40, BG_COLOR);
}

#endif
