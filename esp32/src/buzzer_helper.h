#ifndef BUZZER_HELPER_H
#define BUZZER_HELPER_H

#define BUZZER_PIN 33

void initBuzzer() {
  pinMode(BUZZER_PIN, OUTPUT);
  digitalWrite(BUZZER_PIN, LOW);
}

void buzzerBeep(int durationMs = 100) {
  digitalWrite(BUZZER_PIN, HIGH);
  delay(durationMs);
  digitalWrite(BUZZER_PIN, LOW);
}

void buzzerAlarm() {
  for (int i = 0; i < 5; i++) {
    digitalWrite(BUZZER_PIN, HIGH);
    delay(200);
    digitalWrite(BUZZER_PIN, LOW);
    delay(100);
  }
}

void buzzerOff() {
  digitalWrite(BUZZER_PIN, LOW);
}

#endif
