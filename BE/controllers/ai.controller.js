const buildInstructions = () =>
  [
    "Ban la AI ho tro he thong quan ly dich vu du lich.",
    "Nhiem vu cua ban la doc noi dung lich trinh tho do provider nhap va trich xuat thong tin de tu dien form them dich vu.",
    "Chi tra ve JSON hop le theo dung schema duoc yeu cau.",
    "Khong them giai thich, khong markdown, khong them chu ngoai JSON.",
    'Truong "category" chi duoc la mot trong cac gia tri: "Biển đảo", "Núi", "Văn hoá", "Ẩm thực", "Thành phố", "Mạo hiểm", hoac chuoi rong neu khong du du lieu.',
    'Truong "price" phai la chuoi so, vi du "4990000". Neu khong chac thi tra chuoi rong.',
    'Truong "highlights" phai la mang string.',
    'Truong "includes" phai la mang string.',
    'Truong "itinerary" phai la mang object.',
    'Moi phan tu trong "itinerary" gom: "day" la number, "title" la string, "description" la string, "meals" la mang string, "accommodation" la string, "activities" la mang object.',
    'Moi phan tu trong "activities" gom: "time" la string theo dinh dang HH:mm neu co the, "title" la string, "description" la string, "icon" la string.',
    'Chi duoc dung cac gia tri icon sau: "transport", "hotel", "food", "sightseeing", "activity", "photo".',
    "Neu thieu du lieu thi dung chuoi rong hoac mang rong.",
  ].join(" ");

const responseSchema = {
  type: "object",
  additionalProperties: false,
  properties: {
    name: { type: "string" },
    description: { type: "string" },
    price: { type: "string" },
    location: { type: "string" },
    category: { type: "string" },
    duration: { type: "string" },
    highlights: {
      type: "array",
      items: { type: "string" },
    },
    includes: {
      type: "array",
      items: { type: "string" },
    },
    itinerary: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        properties: {
          day: { type: "number" },
          title: { type: "string" },
          description: { type: "string" },
          meals: {
            type: "array",
            items: { type: "string" },
          },
          accommodation: { type: "string" },
          activities: {
            type: "array",
            items: {
              type: "object",
              additionalProperties: false,
              properties: {
                time: { type: "string" },
                title: { type: "string" },
                description: { type: "string" },
                icon: { type: "string" },
              },
              required: ["time", "title", "description", "icon"],
            },
          },
        },
        required: [
          "day",
          "title",
          "description",
          "meals",
          "accommodation",
          "activities",
        ],
      },
    },
  },
  required: [
    "name",
    "description",
    "price",
    "location",
    "category",
    "duration",
    "highlights",
    "includes",
    "itinerary",
  ],
};

const normalizeParsedData = (parsed) => ({
  name: parsed.name || "",
  description: parsed.description || "",
  price: parsed.price || "",
  location: parsed.location || "",
  category: parsed.category || "",
  duration: parsed.duration || "",
  highlights: Array.isArray(parsed.highlights) ? parsed.highlights : [],
  includes: Array.isArray(parsed.includes) ? parsed.includes : [],
  itinerary: Array.isArray(parsed.itinerary) ? parsed.itinerary : [],
});

const parseJsonOutput = (rawText) => {
  try {
    return JSON.parse(rawText);
  } catch (error) {
    const matched = String(rawText).match(/\{[\s\S]*\}/);
    if (matched) {
      return JSON.parse(matched[0]);
    }
    throw error;
  }
};

const callOpenAI = async (rawText) => {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error("Chua cau hinh OPENAI_API_KEY trong file .env");
  }

  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: process.env.OPENAI_MODEL || "gpt-4o-mini",
      instructions: buildInstructions(),
      input: `Noi dung provider nhap:\n${String(rawText).trim()}`,
      text: {
        format: {
          type: "json_schema",
          name: "parsed_service_form",
          strict: true,
          schema: responseSchema,
        },
      },
    }),
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result?.error?.message || "Loi khi goi OpenAI API");
  }

  return (
    result?.output?.[0]?.content?.find((item) => item.type === "output_text")
      ?.text || "{}"
  );
};

const callOllama = async (rawText) => {
  const ollamaUrl = process.env.OLLAMA_URL || "http://127.0.0.1:11434";
  const ollamaModel = process.env.OLLAMA_MODEL || "qwen2.5:7b";

  const prompt = [
    buildInstructions(),
    "",
    "Schema JSON bat buoc:",
    JSON.stringify(responseSchema),
    "",
    "Noi dung provider nhap:",
    String(rawText).trim(),
  ].join("\n");

  const response = await fetch(`${ollamaUrl}/api/generate`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: ollamaModel,
      prompt,
      stream: false,
      format: responseSchema,
    }),
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result?.error || "Loi khi goi Ollama API");
  }

  if (!result?.response) {
    throw new Error("Ollama khong tra ve du lieu hop le");
  }

  return result.response;
};

module.exports.parseServiceDraft = async (req, res) => {
  try {
    const { rawText } = req.body;

    if (!rawText || !String(rawText).trim()) {
      return res.status(400).json({
        success: false,
        message: "Vui long nhap noi dung de AI phan tich",
      });
    }

    const provider = (process.env.AI_PROVIDER || "openai").toLowerCase();
    const rawResult =
      provider === "ollama"
        ? await callOllama(rawText)
        : await callOpenAI(rawText);

    const parsed = parseJsonOutput(rawResult);

    return res.status(200).json({
      success: true,
      data: normalizeParsedData(parsed),
    });
  } catch (error) {
    const isOllamaError =
      (process.env.AI_PROVIDER || "").toLowerCase() === "ollama";

    return res.status(500).json({
      success: false,
      message: isOllamaError
        ? `${error.message}. Neu da cai Ollama, hay kiem tra server Ollama da chay chua.`
        : error.message || "Loi server",
    });
  }
};
