#ifndef RFID_HELPER_H
#define RFID_HELPER_H

#include <SPI.h>
#include <MFRC522.h>

#define RFID_SS  5
#define RFID_RST 22

MFRC522 rfid(RFID_SS, RFID_RST);

void initRFID() {
  SPI.begin();
  rfid.PCD_Init();
}

bool readRFID(String& uid) {
  if (!rfid.PICC_IsNewCardPresent()) return false;
  if (!rfid.PICC_ReadCardSerial()) return false;

  uid = "";
  for (byte i = 0; i < rfid.uid.size; i++) {
    if (rfid.uid.uidByte[i] < 0x10) uid += "0";
    uid += String(rfid.uid.uidByte[i], HEX);
  }
  uid.toUpperCase();

  rfid.PICC_HaltA();
  rfid.PCD_StopCrypto1();

  return true;
}

#endif
