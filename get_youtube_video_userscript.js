// ==UserScript==
// @name         HSA Education Video Extractor
// @namespace    http://tampermonkey.net/
// @version      1.4
// @description  Extract and open YouTube URL of current lesson on hsavnu.edu.vn with detailed logs
// @match        https://*.hsavnu.edu.vn/*bai-giang/*
// @match        https://hsavnu.edu.vn/*bai-giang/*
// @grant        GM_openInTab
// ==/UserScript==

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

  const LOG_PREFIX = "%c[HSA Education Video Extractor]";
  const log = {
    info: (...a) => console.log(LOG_PREFIX, "color: #10b981; font-weight: bold;", ...a),
    warn: (...a) => console.warn(LOG_PREFIX, "color: #f59e0b; font-weight: bold;", ...a),
    error: (...a) => console.error(LOG_PREFIX, "color: #ef4444; font-weight: bold;", ...a),
    debug: (...a) => console.debug(LOG_PREFIX, "color: #3b82f6; font-weight: bold;", ...a),
  };

  function readTokenFromFireBaseDB() {
    return new Promise((resolve) => {
      log.debug("Opening IndexedDB database:", CONFIG.IDB_NAME);
      const request = indexedDB.open(CONFIG.IDB_NAME);

      request.onupgradeneeded = () => {
        log.warn("IndexedDB upgrade triggered. Aborting request.");
        request.transaction?.abort();
        request.result?.close?.();
        resolve(null);
      };

      request.onerror = (e) => {
        log.error("IndexedDB opening failed:", e);
        resolve(null);
      };

      request.onsuccess = () => {
        const db = request.result;

        if (!db.objectStoreNames.contains(CONFIG.IDB_STORE)) {
          log.warn(`Store '${CONFIG.IDB_STORE}' not found in DB.`);
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
            if (token) {
              log.info("Successfully fetched auth token from IDB.");
              return resolve(token);
            }
          }
          log.warn("No token found inside storage records.");
          resolve(null);
        };

        all.onerror = (e) => {
          log.error("Failed to read storage records:", e);
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
    const url = `${CONFIG.API_BASE}/lessons/${lessonId}`;

    log.debug("Sending request to API:", url);

    try {
      const res = await fetch(url, {
        method: "GET",
        headers: {
          authorization: `Bearer ${token}`,
          "login-signature": localStorage.getItem(CONFIG.LOGIN_SIGNATURE_KEY) || "",
          accept: "application/json",
        },
        signal: controller.signal,
      });

      log.debug(`Response status: ${res.status} ${res.statusText}`);

      if (!res.ok) {
        const hint = res.status === 401 ? " (Token expired)" : "";
        log.error(`API response failed: HTTP ${res.status}${hint}`);
        return null;
      }

      return await res.json();
    } catch (err) {
      if (err.name === "AbortError") {
        log.error(`API request timed out after ${CONFIG.FETCH_TIMEOUT_MS / 1000}s.`);
      } else {
        log.error("Fetch failed:", err.message);
      }
      return null;
    } finally {
      clearTimeout(timer);
    }
  }

  // FLOW
  log.info("Initialized on page:", location.href);

  const lessonId = getLessonId();
  if (!lessonId) {
    log.error("Current URL is not a valid lesson path. Aborting.");
    return;
  }
  log.info("Extracted Lesson ID:", lessonId);

  const token = await readTokenFromFireBaseDB();
  if (!token) {
    log.error("Token missing. Cannot query lesson endpoint.");
    return;
  }
  log.debug("Token snippet:", `${token.slice(0, 16)}...`);

  const data = await fetchLesson(lessonId, token);
  if (!data) {
    log.error("Could not retrieve lesson data.");
    return;
  }

  const videoGuid = data?.video?.videoGuid;
  if (!videoGuid) {
    log.warn("Lesson data received, but 'videoGuid' is missing:", data);
    return;
  }

  const videoUrl = `https://www.youtube.com/watch?v=${videoGuid}`;
  log.info("Target URL:", videoUrl);

  const userConfirmed = confirm(`[HSA Education Video Extractor]\n\nFound Video:\n${videoUrl}\n\nOpen?`);
  if (userConfirmed) {
    log.info("User accepted prompt. Opening tab...");
    GM_openInTab(videoUrl, { active: true, insert: true });
  } else {
    log.warn("User declined opening tab.");
  }
})();
