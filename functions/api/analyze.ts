export async function onRequestPost(context: any) {
  try {
    const { request, env } = context;
    const body = await request.json();
    const { imageBase64 } = body;

    if (!imageBase64) {
      return new Response(JSON.stringify({ error: '이미지가 제공되지 않았습니다.' }), { 
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const GEMINI_API_KEY = env.GEMINI_API_KEY;
    if (!GEMINI_API_KEY) {
      return new Response(JSON.stringify({ error: '서버 설정 오류: API Key가 없습니다.' }), { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const base64Data = imageBase64.replace(/^data:image\/(png|jpeg|jpg|webp);base64,/, "");

    const prompt = "당신은 세계 최고의 관상가이며 심리학자입니다. 첨부된 사진의 안면 특징(눈, 코, 입, 이마, 턱의 조화 및 기운)을 심도 있게 분석하여 관상 보고서를 작성해주세요. 성격의 장단점, 재물운, 직업운, 그리고 삶의 조언을 포함하여 4~5문장으로 깊이 있게 설명해주세요.";

    // 최신 Thinking 모델 적용
    const model = "gemini-2.0-flash-thinking-preview-01-21"; 
    const geminiEndpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GEMINI_API_KEY}`;
    
    const geminiPayload = {
      contents: [{
        parts: [
          { text: prompt },
          {
            inlineData: {
              mimeType: "image/jpeg",
              data: base64Data
            }
          }
        ]
      }],
      generationConfig: {
        thinkingConfig: {
          includeThoughts: false
        }
      }
    };

    const response = await fetch(geminiEndpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(geminiPayload)
    });

    const data = await response.json();
    
    if (!response.ok) {
        console.error("Gemini API Error:", data);
        return new Response(JSON.stringify({ error: 'AI 분석 중 오류가 발생했습니다.' }), { 
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        });
    }

    const resultText = data.candidates[0].content.parts[0].text;

    return new Response(JSON.stringify({ result: resultText }), {
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error("Error in analyze function:", error);
    return new Response(JSON.stringify({ error: 'Internal Server Error' }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}