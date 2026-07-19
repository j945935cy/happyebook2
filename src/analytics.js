(() => {
  "use strict";

  const measurementId = "G-YQTPYTCR01";
  const productionHosts = new Set(["happyebook.com", "www.happyebook.com"]);

  if (!productionHosts.has(window.location.hostname)) return;

  window.dataLayer = window.dataLayer || [];
  window.gtag = window.gtag || function gtag() {
    window.dataLayer.push(arguments);
  };

  if (!document.querySelector(`script[data-happyebook-ga4="${measurementId}"]`)) {
    const googleTag = document.createElement("script");
    googleTag.async = true;
    googleTag.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(measurementId)}`;
    googleTag.dataset.happyebookGa4 = measurementId;
    document.head.appendChild(googleTag);
  }

  window.gtag("js", new Date());
  window.gtag("config", measurementId);

  const track = (eventName, parameters = {}) => {
    window.gtag("event", eventName, parameters);
  };

  window.happyebookTrack = track;

  const cleanText = (value) => String(value || "").replace(/\s+/g, " ").trim().slice(0, 100);
  const currentBookId = () => {
    const queryId = new URLSearchParams(window.location.search).get("id");
    if (queryId) return queryId;
    const match = window.location.pathname.match(/\/books\/([^/]+)\.html$/i);
    return match ? decodeURIComponent(match[1]) : "";
  };
  const isBookstoreHost = (hostname) => (
    /(^|\.)books\.google\./i.test(hostname)
    || hostname === "play.google.com"
    || /(^|\.)books\.com\.tw$/i.test(hostname)
  );

  const initializeTracking = () => {
    const bookId = currentBookId();
    if (bookId) {
      track("view_book", {
        book_id: bookId,
        book_title: cleanText(document.querySelector("main h1")?.textContent || document.title)
      });
    }

    document.addEventListener("click", (event) => {
      const target = event.target instanceof Element ? event.target : event.target?.parentElement;
      const link = target?.closest("a[href]");
      if (!link) return;

      let targetUrl;
      try {
        targetUrl = new URL(link.href, window.location.href);
      } catch {
        return;
      }

      const linkText = cleanText(link.textContent || link.getAttribute("aria-label"));

      if (link.closest(".route-actions")) {
        track("route_click", {
          link_text: linkText,
          link_url: targetUrl.href
        });
      }

      if (isBookstoreHost(targetUrl.hostname)) {
        track("outbound_store_click", {
          book_id: bookId,
          book_title: cleanText(link.closest(".book-card")?.querySelector("h3")?.textContent || document.querySelector("main h1")?.textContent),
          link_text: linkText,
          link_url: targetUrl.href,
          store_host: targetUrl.hostname
        });
      }

      if (/\/resources\/ipas-ai-7-day-review\.html$/i.test(targetUrl.pathname)) {
        track("resource_open", {
          resource_name: "iPAS AI 考前 7 日複習表",
          link_text: linkText
        });
      }
    });

    document.addEventListener("submit", (event) => {
      const form = event.target;
      if (!(form instanceof HTMLFormElement)) return;

      if (form.matches("[data-resource-form]")) {
        track("lead_submit", {
          resource_name: form.dataset.resourceName || "網站資源",
          submission_method: form.dataset.resourceEndpoint || form.dataset.resourceSubmitEndpoint ? "endpoint" : "mailto_local"
        });
      }

      if (form.matches("[data-contact-form]")) {
        track("contact_submit", {
          submission_method: "mailto"
        });
      }
    });
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initializeTracking, { once: true });
  } else {
    initializeTracking();
  }
})();
