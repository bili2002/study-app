// storage.js: load/save and import/export
const STORAGE_KEY = 'studyData';

export function loadData() {
  if (typeof localStorage === 'undefined') return { topics: [] };
  return JSON.parse(localStorage.getItem(STORAGE_KEY)) || { topics: [] };
}

export function saveData(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function exportData(data) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'studyData.json';
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export function setupImport(onImport) {
  const input = document.getElementById('import-file');
  document.getElementById('import-btn').onclick = () => input.click();
  input.onchange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const imported = JSON.parse(evt.target.result);
        if (imported.topics && Array.isArray(imported.topics)) {
          onImport(imported);
          alert('Import successful!');
        } else alert('Invalid data format');
      } catch {
        alert('Error parsing JSON');
      }
    };
    reader.readAsText(file);
  };
}