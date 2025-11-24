import { GoogleGenAI } from "@google/genai";

const getClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API Key is missing.");
  }
  return new GoogleGenAI({ apiKey });
};

export const analyzeStrategy = async (code: string): Promise<string> => {
  try {
    const ai = getClient();
    const prompt = `
      You are a Senior Python Quant Developer. Review the following Python trading strategy code.
      
      Code:
      \`\`\`python
      ${code}
      \`\`\`

      Please provide a concise analysis in Chinese covering:
      1. **Logic Check**: Are there potential infinite loops or blocking calls?
      2. **Risk Assessment**: Any obvious risks in the order logic?
      3. **Optimization**: One specific suggestion to improve performance or safety.
      
      Format the output as Markdown. Keep it professional and brief.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    return response.text || "无法生成分析结果。";
  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    return "AI 分析服务暂时不可用，请检查 API Key 或网络连接。";
  }
};