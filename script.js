// URL твоего Render-сервиса
const API_BASE = "https://questionnaire-decoder-api.onrender.com";

const fileEl = document.getElementById("file");
const outEl = document.getElementById("out");
const hintEl = document.getElementById("hint");
const goBtn = document.getElementById("go");

goBtn.onclick = async () => {
  const f = fileEl.files[0];
  if (!f) return alert("Загрузи .docx файл опросника");

  outEl.textContent = "Отправляю файл на распознавание…";
  hintEl.textContent = "";

  const fd = new FormData();
  fd.append("file", f);

  try {
    // ВАЖНО: слэш в конце
    const res = await fetch(`${API_BASE}/decode/`, {
      method: "POST",
      body: fd
    });

    if (!res.ok) {
      const txt = await res.text();
      throw new Error(`API error ${res.status}: ${txt}`);
    }

    const data = await res.json();

    hintEl.textContent =
      `Найдено: ${data.matched?.length ?? 0} | Не сопоставилось: ${data.missed?.length ?? 0}`;

    // ===== ВОТ ГЛАВНОЕ ИЗМЕНЕНИЕ =====
    let out = "";

    out += data.report_markdown || "Пусто.";

    if (data.missed?.length) {
      out += "\n\n--------------------\n";
      out += "❌ НЕ СОПОСТАВИЛОСЬ (нет в базе):\n";
      out += data.missed.map(x => "• " + x).join("\n");
    }

    if (data.extracted?.length) {
      out += "\n\n--------------------\n";
      out += "📋 ВСЕ ОТМЕЧЕННЫЕ ПУНКТЫ:\n";
      out += data.extracted.map(x => "• " + x).join("\n");
    }

    if (data.missed_suggestions && Object.keys(data.missed_suggestions).length) {
      out += "\n\n--------------------\n";
      out += "🧠 ПОХОЖИЕ СОВПАДЕНИЯ (подсказки):\n";
      for (const [k, v] of Object.entries(data.missed_suggestions)) {
        out += `• ${k}\n  ↳ похоже на: ${v}\n`;
      }
    }

    outEl.textContent = out;
    // ===== КОНЕЦ ИЗМЕНЕНИЯ =====

  } catch (e) {
    outEl.textContent = "Ошибка: " + e.message;
  }
};
