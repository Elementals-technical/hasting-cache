// Реальна функція для підключення до PDF Generator API
async function generateFakePdfData(shortId, base64Image = null) {
  try {
    // Динамічний імпорт для node-fetch ES модуля
    const fetch = (await import("node-fetch")).default;
    const FormData = require('form-data');

    let requestBody;
    let headers = {};

    if (base64Image) {
      // Якщо є base64 зображення, використовуємо FormData
      const formData = new FormData();
      formData.append("shortId", shortId);
      
      // Формуємо правильний формат data URL для snapshot
      const dataUrl = `data:image/png;base64,${base64Image}`;
      formData.append("snapshot", dataUrl);
      
      requestBody = formData;
      headers = formData.getHeaders();
      
      console.log('Sending FormData request with snapshot, shortId:', shortId);
    } else {
      // Якщо немає зображення, використовуємо JSON
      requestBody = JSON.stringify({ shortId });
      headers = {
        "Content-Type": "application/json",
      };
      
      console.log('Sending JSON request, shortId:', shortId);
    }

    const response = await fetch(
      "https://fanatics.3dconfiguration.com/pdf-generator?env=preview",
      {
        method: "POST",
        headers: headers,
        body: requestBody,
      }
    );

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status}`);
    }

    const data = await response.json();
    console.log("data", data);

    // Повертаємо формат, який очікує фронтенд
    return {
      svgUrl: data.svg, // URL може містити як PDF, так і SVG контент
      pdfUrl: data.pdf,
    };
  } catch (error) {
    console.error("PDF Generator API Error:", error);

    // Fallback до фейкових даних при помилці
    return {
      svgUrl: `https://example.com/preview/${shortId}.svg`,
      pdfUrl: `https://example.com/pdf/${shortId}.pdf`,
      error: "API temporarily unavailable, showing fallback URLs",
    };
  }
}

module.exports = { generateFakePdfData };
