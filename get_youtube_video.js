/**
 * HSAVNU Video Extractor
 * Get YouTube URL of current lesson on hsavnu.edu.vn
 * Required: logged in, currently on page /bai-giang/<id>
 */
(async () => {
  "use strict";

  const CONFIG = {
    API_BASE: "https://api.hsavnu.edu.vn",
    IDB_NAME: "firebaseLocalStorageDb",
    IDB_STORE: "firebaseLocalStorage",
    LOGIN_SIGNATURE_KEY: "hsa_login_signature_id",
    LESSON_URL_REGEX: /\/bai-giang\/(\d+)/,
    FETCH_TIMEOUT_MS: 10_000,
  };

  const log = (...a) => console.log("%c[HSA]", "color:#059669;font-weight:bold", ...a);
  const warn = (...a) => console.warn("%c[HSA]", "color:#d97706;font-weight:bold", ...a);
  const error = (...a) => console.error("%c[HSA]", "color:#dc2626;font-weight:bold", ...a);

  function readTokenFromFireBaseDB() {
    return new Promise((resolve) => {
      const request = indexedDB.open(CONFIG.IDB_NAME);

      request.onupgradeneeded = () => {
        request.transaction?.abort();
        request.result?.close?.();
        resolve(null);
      };

      request.onerror = () => resolve(null);

      request.onsuccess = () => {
        const db = request.result;

        if (!db.objectStoreNames.contains(CONFIG.IDB_STORE)) {
          db.close();
          return resolve(null);
        }

        const store = db
          .transaction(CONFIG.IDB_STORE, "readonly")
          .objectStore(CONFIG.IDB_STORE);

        const all = store.getAll();

        all.onsuccess = () => {
          db.close();
          for (const record of all.result || []) {
            const token = record?.value?.stsTokenManager?.accessToken;
            if (token) return resolve(token);
          }
          resolve(null);
        };

        all.onerror = () => {
          db.close();
          resolve(null);
        };
      };
    });
  }

  function getLessonId() {
    const match = location.pathname.match(CONFIG.LESSON_URL_REGEX);
    return match ? match[1] : null;
  }

  async function fetchLesson(lessonId, token) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), CONFIG.FETCH_TIMEOUT_MS);

    try {
      const res = await fetch(`${CONFIG.API_BASE}/lessons/${lessonId}`, {
        method: "GET",
        headers: {
          authorization: `Bearer ${token}`,
          "login-signature": localStorage.getItem(CONFIG.LOGIN_SIGNATURE_KEY) || "",
          accept: "application/json",
        },
        signal: controller.signal,
      });

      if (!res.ok) {
        const hint = res.status === 401 ? " — token hết hạn" : "";
        throw new Error(`HTTP ${res.status}${hint}`);
      }

      return await res.json();
    } finally {
      clearTimeout(timer);
    }
  }

  // MAIN
  const lessonId = getLessonId();
  if (!lessonId) {
    error("URL không phải trang bài giảng (/bai-giang/<id>)");
    return;
  }
  log("Lesson ID:", lessonId);

  const token = await readTokenFromFireBaseDB();
  if (!token) {
    error("Không lấy được token.");
    return;
  }
  log("Token:", token.slice(0, 16) + "…");

  try {
    const data = await fetchLesson(lessonId, token);
    const videoGuid = data?.video?.videoGuid;

    if (!videoGuid) {
      error("Response không có videoGuid.");
      warn("Dữ liệu trả về:", data);
      return;
    }

    const videoUrl = `https://www.youtube.com/watch?v=${videoGuid}`;
    log("Video URL:", videoUrl);

    return { lessonId, videoGuid, videoUrl, data };
  } catch (e) {
    if (e.name === "AbortError") {
      error(`Timeout sau ${CONFIG.FETCH_TIMEOUT_MS / 1000}s — API không phản hồi.`);
    } else {
      error("Lỗi:", e.message);
    }
  }
})();
