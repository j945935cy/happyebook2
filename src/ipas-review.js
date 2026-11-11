(() => {
  const checkboxes = [...document.querySelectorAll("[data-review-day]")];
  const progress = document.querySelector("[data-review-progress]");
  const resetButton = document.querySelector("[data-review-reset]");
  if (!checkboxes.length || !progress) return;

  const storageKey = "happyebook:ipas-review:v1";
  const readProgress = () => {
    try {
      const saved = JSON.parse(window.localStorage.getItem(storageKey) || "[]");
      return new Set(Array.isArray(saved) ? saved.map(String) : []);
    } catch {
      return new Set();
    }
  };
  const saveProgress = () => {
    const completed = checkboxes.filter((checkbox) => checkbox.checked).map((checkbox) => checkbox.dataset.reviewDay);
    progress.textContent = `已完成 ${completed.length} / ${checkboxes.length} 天`;
    try {
      window.localStorage.setItem(storageKey, JSON.stringify(completed));
    } catch {
      // Progress remains usable for this page view when browser storage is unavailable.
    }
  };

  const completedDays = readProgress();
  checkboxes.forEach((checkbox) => {
    checkbox.checked = completedDays.has(checkbox.dataset.reviewDay);
    checkbox.addEventListener("change", saveProgress);
  });
  saveProgress();
  resetButton?.addEventListener("click", () => {
    checkboxes.forEach((checkbox) => { checkbox.checked = false; });
    saveProgress();
  });
})();
