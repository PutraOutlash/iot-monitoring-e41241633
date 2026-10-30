#include <WiFi.h>
#include <HTTPClient.h>
#include "DHT.h"

#define DHTPIN 4
#define DHTTYPE DHT22 // Ganti jadi DHT11 jika menggunakan DHT11

const char* ssid = "NAMA_WIFI_ANDA";
const char* password = "PASSWORD_WIFI_ANDA";
const char* serverUrl = "http://IP_KOMPUTER_SERVER:3000/api/readings"; 
String deviceId = "GH-ESP32-1";

DHT dht(DHTPIN, DHTTYPE);

void setup() {
  Serial.begin(115200);
  dht.begin();
  
  WiFi.begin(ssid, password);
  Serial.print("Menghubungkan ke WiFi");
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("\nTerhubung!");
}

void loop() {
  if (WiFi.status() == WL_CONNECTED) {
    float h = dht.readHumidity();
    float t = dht.readTemperature();

    if (isnan(h) || isnan(t)) {
      Serial.println("Gagal membaca sensor DHT!");
      return;
    }

    HTTPClient http;
    http.begin(serverUrl);
    http.addHeader("Content-Type", "application/json");

    String payload = "{\"device_id\":\"" + deviceId + "\", \"suhu\":" + String(t) + ", \"kelembapan\":" + String(h) + "}";
    
    int httpResponseCode = http.POST(payload);
    if (httpResponseCode > 0) {
      Serial.print("Data Terkirim: ");
      Serial.println(httpResponseCode);
    } else {
      Serial.print("Error saat POST: ");
      Serial.println(httpResponseCode);
    }
    http.end();
  }
  delay(5000); // Sesuai syarat polling tugas: 5 detik
}