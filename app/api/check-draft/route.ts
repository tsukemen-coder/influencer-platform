import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";

export async function POST(req: Request) {
  try {
    const { draftText, project } = await req.json();

    if (!draftText || !project) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

    const prompt = `
あなたはインフルエンサーマーケティングの品質管理AIアドバイザーです。
以下の「オリエン要件」とインフルエンサーが作成した「提出下書き」を精査し、要件を満たしているかチェックしてください。

【オリエン要件】
・案件名: ${project.title}
・必須ハッシュタグ: ${project.hashtags || "なし"}
・必須メンション: ${project.mention || "なし"}
・必須カット・撮影指示: ${project.requiredCuts || "なし"}
・キャプション記載注意点: ${project.captionRules || "なし"}

【インフルエンサー提出下書き】
${draftText}

【判定ルール】
1. 指定されたハッシュタグ（例: #PR #ブランド名）が漏れなく下書きに含まれているか
2. 指定されたメンション（例: @account）が含まれているか
3. 撮影カットや内容が要件に沿っているか

【出力フォーマット】
以下のJSON形式のみで回答してください。思考プロセスや装飾文字は除外してください。

{
  "isPassed": true/false (すべての必須ハッシュタグ・メンションを満たし、内容に大きな不備がなければtrue),
  "score": 0〜100の点数 (例: 85),
  "missingHashtags": ["不足しているハッシュタグ1", "不足しているハッシュタグ2"],
  "missingMentions": ["不足しているメンション"],
  "feedback": [
    "具体的で親切な改善アドバイス文1",
    "アドバイス文2"
  ]
}
`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });

    const text = response.text || "";
    const cleanJson = text.replace(/```json/g, "").replace(/```/g, "").trim();
    const result = JSON.parse(cleanJson);

    return NextResponse.json(result);
  } catch (error: any) {
    console.error("AI Check Error:", error);
    return NextResponse.json(
      {
        isPassed: false,
        score: 0,
        missingHashtags: [],
        missingMentions: [],
        feedback: ["AI自動チェック中にエラーが発生しました。時間を置いて再度お試しください。"],
        rawAnalysis: error.message,
      },
      { status: 500 }
    );
  }
}