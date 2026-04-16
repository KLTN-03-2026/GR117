// Tạo hướng dẫn cho prompt.
const buildInstructions = () =>
  [
    "Bạn là chuyên gia phân tích dữ liệu du lịch.",
    "Tôi sẽ cung cấp lịch trình 1 tour du lịch dưới dạng text tự do, có thể copy từ website, PDF hoặc tự viết.",
    "Hãy phân tích và chuyển đổi thành JSON theo đúng cấu trúc được yêu cầu.",
    "Chỉ trả về JSON hợp lệ.",
    "Không thêm giải thích.",
    "Không thêm markdown.",
    "Không thêm chữ nào ngoài JSON.",

    "Cấu trúc JSON bắt buộc:",
    "{",
    '  "service": {',
    '    "name": "string — Tên tour",',
    '    "description": "string — Mô tả chi tiết tour (2-3 đoạn, dùng \\\\n\\\\n ngăn đoạn)",',
    '    "price": 0,',
    '    "location": "string — Tỉnh/thành hoặc vùng",',
    '    "category": "string — 1 trong: Biển đảo | Văn hóa | Trekking | Ẩm thực | Nghỉ dưỡng | Khám phá",',
    '    "duration": "string — ví dụ: 3 ngày 2 đêm",',
    '    "mapQuery": "string — Google Maps query, dùng + thay dấu cách",',
    '    "highlights": ["string"],',
    '    "includes": ["string"]',
    "  },",
    '  "itinerary": [',
    "    {",
    '      "day": 1,',
    '      "title": "string — format: Điểm A — Điểm B — Điểm C",',
    '      "description": "string — Tóm tắt ngắn 1-2 câu về ngày này",',
    '      "accommodation": "string — Tên khách sạn/resort + hạng sao, hoặc Kết thúc tour nếu ngày cuối",',
    '      "meals": ["string — format: Bữa: Tên món"],',
    '      "activities": [',
    "        {",
    '          "time": "HH:mm",',
    '          "title": "string — Tên hoạt động ngắn gọn dưới 40 ký tự",',
    '          "description": "string — Mô tả chi tiết 1-3 câu",',
    '          "icon": "string — 1 trong 6 giá trị: transport | sightseeing | food | hotel | activity | photo"',
    "        }",
    "      ]",
    "    }",
    "  ]",
    "}",

    "Quy tắc phân loại icon:",
    "transport = di chuyển: bay, xe bus, tàu, taxi, đón/trả khách, ra sân bay.",
    "sightseeing = tham quan: điểm đến, di tích, bảo tàng, chùa, thác, hang động.",
    "food = ăn uống: bữa sáng, trưa, tối, quán ăn, ẩm thực địa phương.",
    "hotel = lưu trú: check-in, nhận phòng, nghỉ tại khách sạn hoặc resort.",
    "activity = trải nghiệm: kayak, lặn, trekking, workshop, cồng chiêng, chợ, hoạt động thực tế.",
    "photo = chụp ảnh: bình minh, hoàng hôn, điểm check-in, view đẹp.",

    "Quy tắc quan trọng:",
    "1. Luôn dùng thời gian format 24h HH:mm.",
    "2. Nếu text không ghi giờ cụ thể, hãy tự ước lượng hợp lý theo thứ tự hoạt động trong ngày: sáng 06:00-11:00, trưa 11:00-13:00, chiều 13:00-17:00, tối 17:00-21:00.",
    "3. Mỗi ngày nên có từ 4 đến 8 activities.",
    "4. Nếu text gộp nhiều việc vào 1 mục, hãy tách ra thành nhiều activities.",
    "5. Nếu text quá sơ sài, hãy bổ sung thêm hoạt động hợp lý như di chuyển, ăn uống, check-in.",
    '6. Meals luôn là mảng riêng, mỗi phần tử theo format: "Bữa: Tên món".',
    "7. Mỗi ngày thường có 2 đến 3 bữa nếu dữ liệu cho phép.",
    "8. Description của tour và description của từng activity phải tự nhiên, hấp dẫn, rõ ràng.",
    "9. Mỗi activity description nên dài từ 1 đến 3 câu.",
    '10. Title của ngày phải đúng format "Điểm A — Điểm B — Điểm C", dùng dấu —.',
    "11. Price phải là số nguyên, đơn vị VNĐ, không dấu chấm, không dấu phẩy.",
    "12. Nếu không có thông tin giá thì để 0.",
    '13. category chỉ được là 1 trong các giá trị: "Biển đảo", "Văn hóa", "Trekking", "Ẩm thực", "Nghỉ dưỡng", "Khám phá". Nếu không đủ dữ liệu thì chọn giá trị gần nhất dựa trên nội dung tour, không để rỗng.',
    "14. highlights là mảng string, tối đa 6 mục.",
    "15. includes là mảng string, tối đa 7 mục.",
    "16. highlights và includes cần trích từ text hoặc suy ra hợp lý từ lịch trình.",
    "17. Nếu thiếu dữ liệu ở field text thì dùng chuỗi rỗng, nếu thiếu danh sách thì dùng mảng rỗng.",
    "18. Không được thêm field ngoài schema đã yêu cầu.",
    "19. JSON trả về phải parse được bằng JSON.parse.",
  ].join("");

const responseSchema = {
  type: "object",
  additionalProperties: false,
  properties: {
    service: {
      type: "object",
      additionalProperties: false,
      properties: {
        name: { type: "string" },
        description: { type: "string" },
        price: { type: "number" },
        location: { type: "string" },
        category: {
          type: "string",
          enum: [
            "Biển đảo",
            "Văn hóa",
            "Trekking",
            "Ẩm thực",
            "Nghỉ dưỡng",
            "Khám phá",
          ],
        },
        duration: { type: "string" },
        mapQuery: { type: "string" },
        highlights: {
          type: "array",
          items: { type: "string" },
          maxItems: 6,
        },
        includes: {
          type: "array",
          items: { type: "string" },
          maxItems: 7,
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
      ],
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
          accommodation: { type: "string" },
          meals: {
            type: "array",
            items: { type: "string" },
          },
          activities: {
            type: "array",
            items: {
              type: "object",
              additionalProperties: false,
              properties: {
                time: { type: "string" },
                title: { type: "string" },
                description: { type: "string" },
                icon: {
                  type: "string",
                  enum: [
                    "transport",
                    "sightseeing",
                    "food",
                    "hotel",
                    "activity",
                    "photo",
                  ],
                },
              },
              required: ["time", "title", "description", "icon"],
            },
          },
        },
        required: [
          "day",
          "title",
          "description",
          "accommodation",
          "meals",
          "activities",
        ],
      },
    },
  },
  required: ["service", "itinerary"],
};

// Chuẩn hóa chuỗi thời gian.
const normalizeTime = (value) => {
  const raw = String(value || "").trim();
  const match = raw.match(/^(\d{1,2})[:.](\d{2})$/);
  if (!match) return raw;

  const hours = String(Math.min(23, Math.max(0, Number(match[1])))).padStart(2, "0");
  const minutes = String(Math.min(59, Math.max(0, Number(match[2])))).padStart(2, "0");
  return `${hours}:${minutes}`;
};

// Chuẩn hóa icon của hoạt động.
const normalizeIcon = (value) => {
  const allowed = new Set([
    "transport",
    "sightseeing",
    "food",
    "hotel",
    "activity",
    "photo",
  ]);

  const normalized = String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[`"' ]+/g, "");

  return allowed.has(normalized) ? normalized : "activity";
};

// Phân tách dòng bữa ăn.
const parseMealsLine = (value) => {
  const raw = String(value || "").trim();
  if (!raw) return [];

  return raw
    .split("|")
    .map((item) => item.trim())
    .filter(Boolean);
};

// Phân tích lịch trình từ văn bản thô.
const parseItineraryFromText = (rawText) => {
  const text = String(rawText || "").replace(/\r/g, "");
  const lines = text.split("\n");

  const stripDiacritics = (value) =>
    String(value || "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");

  const normalizeForMatch = (value) =>
    stripDiacritics(value).toUpperCase().trim();

  const dayHeaderNormalizedRegex = /^\s*NG.?Y\s*(\d+)\s*:\s*(.+?)\s*$/i;
  const dayIndexes = [];

  for (let index = 0; index < lines.length; index += 1) {
    const normalizedLine = normalizeForMatch(lines[index]);
    if (dayHeaderNormalizedRegex.test(normalizedLine)) {
      dayIndexes.push(index);
    }
  }

  if (dayIndexes.length === 0) return null;

  const dayBlocks = dayIndexes.map((startIndex, index) => {
    const endIndex = index < dayIndexes.length - 1 ? dayIndexes[index + 1] : lines.length;
    return lines.slice(startIndex, endIndex);
  });

  const itinerary = dayBlocks
    .map((block) => {
      const headerLine = String(block[0] || "");
      const headerNormalized = normalizeForMatch(headerLine);
      const headerMatch = headerNormalized.match(dayHeaderNormalizedRegex);
      if (!headerMatch) return null;

      const day = Number(headerMatch[1]);
      const title = headerLine.split(":").slice(1).join(":").trim();

      const findMetaLine = (predicate) =>
        block.find((line) => predicate(normalizeForMatch(line)));

      const descriptionLine = findMetaLine(
        (normalized) => normalized.includes(":") && normalized.startsWith("MO"),
      );
      const accommodationLine = findMetaLine(
        (normalized) => normalized.includes(":") && normalized.startsWith("CH"),
      );
      const mealsLine = findMetaLine(
        (normalized) => normalized.includes(":") && normalized.startsWith("BU"),
      );

      const separatorIndexInBlock = block.findIndex((line) => /^\s*\|\s*-{3,}/.test(line));
      const metaScanEnd = separatorIndexInBlock !== -1 ? separatorIndexInBlock : Math.min(block.length, 12);
      const metaCandidates = block
        .slice(1, metaScanEnd)
        .map((line) => String(line || "").trim())
        .filter((line) => Boolean(line) && line.includes(":"));

      const pickMetaValue = (line) =>
        String(line || "").split(":").slice(1).join(":").trim();

      const byKeyword = (keyword) =>
        metaCandidates.find((line) => normalizeForMatch(line).includes(keyword));

      const fallbackDescriptionLine = byKeyword("MO") || metaCandidates[0];
      const fallbackAccommodationLine = byKeyword("CHO") || metaCandidates[1];
      const fallbackMealsLine = byKeyword("BUA") || metaCandidates[2];

      const description = descriptionLine
        ? String(descriptionLine.split(":").slice(1).join(":")).trim()
        : fallbackDescriptionLine
          ? pickMetaValue(fallbackDescriptionLine)
        : "";
      const accommodation = accommodationLine
        ? String(accommodationLine.split(":").slice(1).join(":")).trim()
        : fallbackAccommodationLine
          ? pickMetaValue(fallbackAccommodationLine)
        : "";
      const meals = mealsLine
        ? parseMealsLine(String(mealsLine.split(":").slice(1).join(":")).trim())
        : fallbackMealsLine
          ? parseMealsLine(pickMetaValue(fallbackMealsLine))
        : [];

      const activities = [];

      if (separatorIndexInBlock !== -1) {
        const tableLines = block.slice(separatorIndexInBlock + 1);
        for (const line of tableLines) {
          const trimmed = String(line || "").trim();
          if (!trimmed) continue;
          if (!trimmed.startsWith("|")) break;
          if (/^\s*\|\s*-{3,}/.test(trimmed)) continue;

          const cells = trimmed
            .replace(/^\|/, "")
            .replace(/\|$/, "")
            .split("|")
            .map((cell) => cell.trim())
            .filter((cell) => cell !== "");

          if (cells.length < 4) continue;

          const time = normalizeTime(cells[0]);
          const actTitle = cells[1] || "";
          const icon = normalizeIcon(cells[cells.length - 1]);
          const detail = cells.slice(2, cells.length - 1).join(" | ").trim();

          activities.push({
            time,
            title: actTitle,
            description: detail,
            icon,
          });
        }
      }

      if (!Number.isFinite(day) || !title || activities.length === 0) {
        return null;
      }

      return {
        day,
        title,
        description,
        accommodation,
        meals,
        activities,
      };
    })
    .filter(Boolean);

  return itinerary.length > 0 ? itinerary : null;
};

// Chuẩn hóa dữ liệu dịch vụ.
const normalizeService = (service) => ({
  name: String(service?.name || ""),
  description: String(service?.description || ""),
  price: Number(service?.price || 0),
  location: String(service?.location || ""),
  category: String(service?.category || "Khám phá"),
  duration: String(service?.duration || ""),
  mapQuery: String(service?.mapQuery || ""),
  highlights: Array.isArray(service?.highlights) ? service.highlights : [],
  includes: Array.isArray(service?.includes) ? service.includes : [],
});

// Chuẩn hóa dữ liệu trả về từ AI.
const normalizeParsedData = (parsed) => {
  if (!parsed || typeof parsed !== "object") {
    return { service: normalizeService({}), itinerary: [] };
  }

  const service = parsed.service || parsed;
  const itinerary = Array.isArray(parsed.itinerary) ? parsed.itinerary : [];

  return {
    service: normalizeService(service),
    itinerary,
  };
};

// Phân tích JSON đầu ra thô.
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

// Phân tích bản nháp dịch vụ từ AI.
module.exports.parseServiceDraft = async (req, res) => {
  try {
    const { rawText } = req.body;

    if (!rawText || !String(rawText).trim()) {
      return res.status(400).json({
        success: false,
        message: "Vui long nhap noi dung de AI phan tich",
      });
    }

    const parsedItinerary = parseItineraryFromText(rawText);
    if (parsedItinerary) {
      return res.status(200).json({
        success: true,
        data: {
          service: normalizeService({}),
          itinerary: parsedItinerary,
          source: "rule_parser",
        },
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
      data: {
        ...normalizeParsedData(parsed),
        source: "llm",
      },
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

// Xuất các helper nội bộ để debug.
module.exports._internal = {
  parseItineraryFromText,
  normalizeIcon,
  normalizeTime,
};





