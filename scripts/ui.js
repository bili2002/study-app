import { loadData, saveData, exportData, setupImport } from './storage.js';
import { questionGrade, topicGrade, gradientColor } from './grading.js';

let data  = loadData();
let mode  = 'hard';

const openTopics = new Set();   // names (or IDs) of expanded topics

/* ---------- bootstrap ---------- */
function init() {
  // export
  document.getElementById('export-btn').onclick = () => exportData(data);

  // import
  setupImport(imp => { data = imp; saveAndRender(); });
  
  // mode buttons
  document.querySelectorAll('.mode-btn').forEach(btn => {
    btn.onclick = () => {
      mode = btn.dataset.mode;
      document
        .querySelectorAll('.mode-btn')
        .forEach(b => b.classList.toggle('active', b === btn));
      render();
    };
  });

  document
    .querySelector(`.mode-btn[data-mode="${mode}"]`)
    .classList.add('active');
    
  render();
}

document.addEventListener('DOMContentLoaded', init);

/* ---------- helpers ---------- */
function saveAndRender() {
  saveData(data);
  render();
}

/* ---------- render ---------- */
function render() {
  renderTopics();

  if (window.MathJax) MathJax.typesetPromise();
}

function renderTopics() {
  const container = document.getElementById('topics-container');
  container.innerHTML = '';

  data.topics.forEach(topic => {
    const tGrade = topicGrade(topic);

    /* --- outer box --- */
    const box = document.createElement('div');
    box.className = 'topic-box';
    if (mode === 'summary') {
          '--grade-color',
          nowOpen ? '#fff'
                  : gradientColor(tGrade)
    }

    /* --- header --- */
    const header = document.createElement('div');
    header.className = 'topic-header';

    if (mode === 'summary') {
        header.classList.add('summary-mode');
        header.textContent = topic.name;

        const pct = document.createElement('span');
        pct.className = 'grade-pct';
        pct.textContent = `${(tGrade * 100).toFixed(0)}%`;
        header.appendChild(pct);
    } else {
        header.textContent = topic.name;
    }

    header.onclick = () => {
        const nowOpen = body.style.display === 'none';
        body.style.display = nowOpen ? 'block' : 'none';
    
        /* in summary mode: pastel when collapsed, white when open */
        if (mode === 'summary') {
            box.style.setProperty(
                '--grade-color',
                nowOpen ? '#fff' : gradientColor(tGrade)
            );
        }

        if (nowOpen)  openTopics.add(topic.name);
        else          openTopics.delete(topic.name);
    };

    /* --- body (collapsible) --- */
    const body = document.createElement('div');
    body.className = 'topic-body';
    body.style.display = openTopics.has(topic.name) ? 'block' : 'none';


    topic.questions.forEach(q => renderQuestion(q, mode, body));

    box.append(header, body);
    container.appendChild(box);
  });
}

function renderQuestion(q, mode, parent) {
  // Hard mode hides questions already > 90 %
  if (mode === 'hard' && questionGrade(q) > 0.85) return;

  /* ============= Summary mode ============= */
  if (mode === 'summary') {
    const g   = questionGrade(q);

    const row = document.createElement('div');
    row.className = 'summary-row';
    
    const qtxt = document.createElement('span');
    qtxt.textContent = q.q;
    
    const pct = document.createElement('span');
    pct.className = 'grade-pct';
    pct.textContent = `${(g * 100).toFixed(0)}%`;
    
    row.append(qtxt, pct);

    row.style.backgroundColor = gradientColor(g);
    row.style.color = '#000';
    parent.appendChild(row);
    return;
  }

  /* ============= Study / Hard mode ============= */
  const qBox = document.createElement('div');
  qBox.className = 'question-box';

  /* --- row with question text + button --- */
  const row = document.createElement('div');
  row.className = 'question-row';

  const txt = document.createElement('div');
  txt.textContent = q.q;

  const btn = document.createElement('button');
  btn.textContent = q.a ? 'Show Answer' : 'Add Answer';

  row.append(txt, btn);
  qBox.appendChild(row);

  /* --- answer/edit area --- */
  const area = document.createElement('div');
  area.className = 'answer-area';
  area.style.display = 'none';
  setupAnswerUI(q, area);
  btn.onclick = () => {
    area.style.display = area.style.display === 'none' ? 'block' : 'none';
  };

  qBox.appendChild(area);
  parent.appendChild(qBox);
}

/* ---------- answer UI ---------- */
function setupAnswerUI(q, area) {
  /* header row: answer text on the left, Edit/Save on the right */
  const header   = document.createElement('div');
  header.className = 'answer-header';

  const ansText  = document.createElement('div');
  ansText.className = 'answer-text';
  ansText.textContent = q.a || '';

  const textarea = document.createElement('textarea');
  textarea.value = q.a || '';
  textarea.style.display = 'none';

  const editBtn  = document.createElement('button');
  editBtn.textContent = q.a ? 'Edit Answer' : 'Save Answer';
  editBtn.className  = 'edit-btn';
  
  header.append(ansText, editBtn);
  area.append(header, textarea);

  if (!q.a) {
    textarea.style.display = 'block';
    ansText.style.display  = 'none';
  }

  editBtn.onclick = () => {
    // entering edit mode
    if (textarea.style.display !== 'block') {
      textarea.style.display = 'block';
      ansText.style.display  = 'none';
      editBtn.textContent    = 'Save Answer';
    } else {
      // save
      const val = textarea.value.trim();
      if (!val) return alert('Answer cannot be empty');
      q.a = val;
      saveAndRender();
    }
  };

  // grading buttons once an answer exists
  if (q.a) {
    const statDiv = document.createElement('div');
    ['wrong','partial','correct'].forEach(s => {
      const b = document.createElement('button');
      b.className = `status-btn ${s}`; 
      b.textContent = s[0].toUpperCase() + s.slice(1);
      b.onclick = () => {
        q.history = q.history || [];
        q.history.push({ status: s, date: new Date() });
        saveAndRender();
        area.style.display = 'none';
      };
      statDiv.appendChild(b);
    });
    area.appendChild(statDiv);
  }
}
