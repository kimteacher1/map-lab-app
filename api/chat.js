// api/chat.js
export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    // Vercel 환경 변수에서 API 키를 가져옵니다. (코드에 직접 노출되지 않음!)
    const apiKey = process.env.GEMINI_API_KEY; 
    if (!apiKey) {
        return res.status(500).json({ error: 'API Key가 설정되지 않았습니다.' });
    }

    const { message } = req.body;
    
    // 학생들을 위한 맵봇 기본 프롬프트를 프론트엔드에서 서버로 옮겨 더 안전하게 보호합니다.
    const systemPrompt = "너는 초등학교 사회 학습을 돕는 친절한 맵봇(Map-Bot)이야. 13세 미만 초등학생들을 대하므로, 정치적, 폭력적, 성적, 부적절한 질문이나 교육과 무관한 내용은 '그것은 도와드릴 수 없습니다.'라고 단호하고 친절하게 거절해. 설명은 초등학생 눈높이에 맞춰 쉽고 다정하게 해줘.";

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [
                    { role: "user", parts: [{ text: systemPrompt + "\n\n학생의 질문: " + message }]}
                ]
            })
        });

        const data = await response.json();
        res.status(200).json(data);
    } catch (error) {
        console.error('Error fetching Gemini API:', error);
        res.status(500).json({ error: 'Failed to fetch response' });
    }
}
