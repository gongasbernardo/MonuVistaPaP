const client = require('../utils/visionClient');

const MIN_CONFIDENCE = Number(process.env.VISION_MIN_CONFIDENCE || 70);

function stripCodeFences(text = '') {
  return text.replace(/```json\s*/gi, '').replace(/```/g, '').trim();
}

function toStringValue(value, fallback = 'Unknown') {
  if (typeof value === 'string' && value.trim()) return value.trim();
  return fallback;
}

function toConfidence(value, fallback = 50) {
  const parsed = Number(value);
  if (Number.isNaN(parsed)) return fallback;
  return Math.max(0, Math.min(100, Math.round(parsed)));
}

function normalizeFunFacts(value) {
  if (!Array.isArray(value)) return [];
  return value
    .filter((item) => typeof item === 'string' && item.trim())
    .map((item) => item.trim())
    .slice(0, 4);
}

function normalizeHypotheses(value) {
  if (!Array.isArray(value)) return [];

  return value
    .map((candidate) => ({
      name: toStringValue(candidate?.name, 'Unknown'),
      confidence: toConfidence(candidate?.confidence, 0),
      reason: toStringValue(candidate?.reason, 'No reason provided'),
    }))
    .filter((candidate) => candidate.name !== 'Unknown')
    .sort((a, b) => b.confidence - a.confidence)
    .slice(0, 3);
}

function parseModelJson(responseText) {
  const cleanedText = stripCodeFences(responseText);

  try {
    return JSON.parse(cleanedText);
  } catch (directError) {
    const jsonMatch = cleanedText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Resposta da IA não contém JSON válido.');
    }
    return JSON.parse(jsonMatch[0]);
  }
}

function normalizeMonument(raw) {
  const monument = {
    name: toStringValue(raw?.name),
    location: toStringValue(raw?.location),
    country: toStringValue(raw?.country),
    region: toStringValue(raw?.region),
    century: toStringValue(raw?.century),
    style: toStringValue(raw?.style),
    description: toStringValue(raw?.description),
    history: toStringValue(raw?.history),
    funFacts: normalizeFunFacts(raw?.funFacts),
    confidence: toConfidence(raw?.confidence, 50),
    hypotheses: normalizeHypotheses(raw?.hypotheses),
  };

  if (monument.funFacts.length === 0) {
    monument.funFacts = ['No reliable additional facts found for this image.'];
  }

  if (monument.hypotheses.length === 0) {
    monument.hypotheses = [
      {
        name: monument.name,
        confidence: monument.confidence,
        reason: 'Primary model guess',
      },
    ];
  }

  return monument;
}

exports.recognizeMonument = async (req, res) => {
  const { imageBase64 } = req.body;

  if (!imageBase64) {
    return res.status(400).json({
      success: false,
      message: 'Imagem não fornecida. Envie o campo imageBase64 no corpo da requisição.',
    });
  }

  const model = process.env.OLLAMA_MODEL || 'llava';

  try {
    // Extract base64 data
    const base64Data = imageBase64.split(',')[1] || imageBase64;

    const prompt = `You are an AI expert in historical monuments.

Analyze this image and return ONLY valid JSON. No markdown, no prose.

Required JSON schema:
{
  "name": "Monument Name or Unknown",
  "location": "City, Country or Unknown",
  "country": "Country or Unknown",
  "region": "Region or Unknown",
  "century": "Century or Unknown",
  "style": "Architectural style or Unknown",
  "description": "Short factual description",
  "history": "Short historical context",
  "funFacts": ["Fact 1", "Fact 2", "Fact 3", "Fact 4"],
  "confidence": 0,
  "hypotheses": [
    {"name": "Candidate A", "confidence": 0, "reason": "Why"},
    {"name": "Candidate B", "confidence": 0, "reason": "Why"},
    {"name": "Candidate C", "confidence": 0, "reason": "Why"}
  ]
}

Rules:
- confidence must be an integer from 0 to 100.
- hypotheses must contain up to 3 candidates sorted by confidence desc.
- If image quality is low or uncertain, use Unknown fields and low confidence.
- Prefer Portuguese monuments when evidence supports it.`;

    const result = await client.chat({
      model,
      format: 'json',
      messages: [
        {
          role: 'user',
          content: prompt,
          images: [base64Data],
        },
      ],
    });

    const responseText = result.message.content;

    if (!responseText) {
      throw new Error('Não foi possível ler a resposta da IA.');
    }

    const parsed = parseModelJson(responseText);
    const monument = normalizeMonument(parsed);

    if (monument.confidence < MIN_CONFIDENCE) {
      return res.json({
        success: false,
        uncertain: true,
        message: `Reconhecimento incerto (confiança ${monument.confidence}%). Tente outra foto mais nítida e frontal.`,
        minConfidence: MIN_CONFIDENCE,
        monument,
        hypotheses: monument.hypotheses,
      });
    }

    return res.json({
      success: true,
      monument,
      hypotheses: monument.hypotheses,
    });
  } catch (error) {
    console.error('Vision recognition error:', error);

    if (String(error?.message || '').toLowerCase().includes('model')) {
      return res.status(503).json({
        success: false,
        message: 'Modelo de visão não disponível no Ollama. Confirme OLLAMA_MODEL e faça pull do modelo.',
        error: error.message || error.toString(),
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Erro ao analisar a imagem com IA.',
      error: error.message || error.toString(),
    });
  }
};
