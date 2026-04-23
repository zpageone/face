export async function onRequestPost(context: any) {
  try {
    const { request, env } = context;
    const body = await request.json();
    const { imageBase64 } = body;

    if (!imageBase64) {
      return new Response(JSON.stringify({ error: 'No image provided' }), { 
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Cloudflare 환경 변수에서 Gemini API 키를 가져옵니다.
    const GEMINI_API_KEY = env.GEMINI_API_KEY;
    if (!GEMINI_API_KEY) {
      return new Response(JSON.stringify({ error: 'Server configuration error: Missing API Key' }), { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // base64 문자열에서 헤더 부분(data:image/jpeg;base64,)을 제거합니다.
    const base64Data = imageBase64.replace(/^data:image\/(png|jpeg|jpg|webp);base64,/, "");

    // 관상 분석을 위한 프롬프트
    const prompt = "당신은 현대적인 시각으로 관상을 풀이하는 '인상학 및 관상 분석 전문가'입니다. 전통적인 관상학(Mian Xiang)의 데이터와 현대 인지심리학의 '첫인상 분석'을 결합하여, 사용자에게 신뢰감 있고 다정한 조언을 제공합니다. 주로 20~30대 여성이며, 이들은 자신의 연애운, 재물운(커리어), 그리고 타인에게 비치는 자신의 이미지를 궁금해합니다. 삼정(三停) 분석: 이마(초년/부모), 눈코입(중년/의지), 하관(말년/결실)의 균형을 분석합니다. 부위별 상세 풀이: 이마: 커리어 운과 지성적인 매력.눈 & 눈썹: 연애운, 상대의 속마음을 읽는 능력, 감수성.코: 자기주관과 재물운(SGD 환산 가치 기준의 경제적 감각).입 & 턱: 대인관계의 원만함과 애정 표현 방식.톤앤매너는 무조건적인 비판보다는 보완법(메이크업이나 태도)을 함께 제시하세요.당신은 ~할 운명입니다라는 단정보다는 ~한 기운이 강해 인연운이 상승하는 시기입니다라는 부드러운 화법을 사용합니다.전체적인 인상 한 줄 요약 (예: 맑은 호수처럼 지혜로운 인상) [부위별 분석] 이마, 눈, 코, 입 순으로 핵심 특징 기술, [연애 & 인연] 현재의 연애운과 잘 맞는 이성상 추천 [커리어 & 재물] 본인의 강점을 살릴 수 있는 방향 [인상 보완 팁] 행운을 부르는 메이크업이나 표정 습관 제안";

    const geminiEndpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${AIzaSyBMllhrul1kmLJuscHGeXJ4_T57B5AZEgQ}`;
    
    const geminiPayload = {
      contents: [{
        parts: [
          { text: prompt },
          {
            inlineData: {
              mimeType: "image/jpeg", // 업로드된 이미지의 실제 mime-type으로 변경 가능
              data: base64Data
            }
          }
        ]
      }]
    };

    const response = await fetch(geminiEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(geminiPayload)
    });

    const data = await response.json();
    
    if (!response.ok) {
        console.error("Gemini API Error:", data);
        return new Response(JSON.stringify({ error: 'Failed to analyze image from Gemini API' }), { 
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        });
    }

    // Gemini API 응답에서 텍스트 추출
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
