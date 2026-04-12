const Groq = require('groq-sdk');
require('dotenv').config();

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

async function test() {
  console.log("🚀 Test de l'IA Groq en cours...");
  try {
    const start = Date.now();
    const chat = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [{ role: "user", content: "Salam, wach 3ndkom sardine?" }],
      max_tokens: 50
    });
    const end = Date.now();
    console.log("✅ Réponse reçue en", end - start, "ms");
    console.log("🤖 IA dit :", chat.choices[0].message.content);
  } catch (e) {
    console.error("❌ Erreur Groq :", e.message);
  }
}
test();