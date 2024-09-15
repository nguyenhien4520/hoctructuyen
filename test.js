const OpenAI = require("openai");
require('dotenv').config();

const openai = new OpenAI({
    apiKey: process.env.KEY
});

async function main() {
  const completion = await openai.chat.completions.create({
    messages: [{ role: "system", content: "who is president of us" }],
    model: "gpt-4o-mini",
  });

  console.log(completion.choices[0].message.content);
}

main();