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
    // 👇 ВАЖНО: слэш в конце /decode/
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

    outEl.textContent = data.report_markdown || "Пусто.";
  } catch (e) {
    outEl.textContent = "Ошибка: " + e.message;
  }
};
