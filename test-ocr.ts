import { extractDocumentFields } from "./lib/ai/gemini.ts";

async function test() {
  // 1x1 black pixel base64
  const dummyImage = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=";
  const result = await extractDocumentFields(dummyImage, "image/png", "nin");
  console.log("Result:", result);
}

test().catch(console.error);
