export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    const apiKey = process.env.GEMINI_API_KEY; 
    if (!apiKey) {
        return res.status(500).json({ error: 'API Key가 설정되지 않았습니다.' });
    }

    const { message } = req.body;
    
    const systemPrompt = "너는 초등학교 사회 학습을 돕는 친절한 맵봇(Map-Bot)이야. 13세 미만 초등학생들을 대하므로, 정치적, 폭력적, 성적, 부적절한 질문이나 교육과 무관한 내용은 '그것은 도와드릴 수 없습니다.'라고 단호하고 친절하게 거절해. 설명은 초등학생 눈높이에 맞춰 쉽고 다정하게 해줘.";

    // 변경된 부분: 가장 안정적으로 인식되는 gemini-1.5-flash-latest 로 모델명 교체
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${apiKey}`;

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
        
        // 추가된 안전장치: 구글에서 404 등의 에러를 보냈다면, 프론트엔드에도 동일한 에러 상태를 정확히 알려주도록 처리
        if (!response.ok) {
            return res.status(response.status).json(data);
        }
        
        res.status(200).json(data);
    } catch (error) {
        console.error('Error fetching Gemini API:', error);
        res.status(500).json({ error: 'Failed to fetch response' });
    }
}
