const DATA_URL = "./data/iamb_animal_2024.csv";

const QUESTION_META = [
  { code: "MT05Q00100", short: "Políticas públicas para a causa animal", axis: "Governança", critical: true },
  { code: "MT05Q00200", short: "Previsão orçamentária no PPA, LDO e LOA", axis: "Governança", critical: true },
  { code: "MT05Q00300", short: "Legislação local de proteção animal", axis: "Governança", critical: true },
  { code: "MT05Q00400", short: "Ações de proteção e apuração de maus-tratos", axis: "Fiscalização", critical: true },
  { code: "MT05Q00500", short: "Identificação de animais domésticos", axis: "Prevenção", critical: false },
  { code: "MT05Q00600", short: "Campanhas de castração para baixa renda", axis: "Prevenção", critical: true },
  { code: "MT05Q00700", short: "Conscientização sobre posse responsável", axis: "Prevenção", critical: false },
  { code: "MT05Q00800", short: "Educação ambiental com proteção animal", axis: "Prevenção", critical: false },
  { code: "MT05Q00900", short: "Plano de emergência para resgate de animais", axis: "Resposta", critical: true },
  { code: "MT05Q01000", short: "Incentivos a clínicas veterinárias", axis: "Serviços", critical: false },
  { code: "MT05Q01100", short: "Vacinação anual para controle de zoonoses", axis: "Saúde", critical: true },
  { code: "MT05Q01200", short: "Zoonoses cobertas pela vacinação", axis: "Saúde", critical: false, informational: true },
  { code: "MT05Q01300", short: "Atendimento médico-veterinário gratuito", axis: "Serviços", critical: false },
  { code: "MT05Q01400", short: "Centro de acolhimento de animais resgatados", axis: "Serviços", critical: false },
  { code: "MT05Q01500", short: "Bem-estar no recolhimento de cães e gatos", axis: "Serviços", critical: false },
  { code: "MT05Q01600", short: "Centro de Controle de Zoonoses", axis: "Saúde", critical: false },
  { code: "MT05Q01700", short: "Parcerias com ONGs de proteção animal", axis: "Rede de apoio", critical: false },
  { code: "MT05Q01800", short: "Levantamento de animais abandonados", axis: "Monitoramento", critical: true },
  { code: "MT05Q01900", short: "Canal direto para denúncias de maus-tratos", axis: "Fiscalização", critical: true },
  { code: "MT05Q02000", short: "Levantamento de denúncias de maus-tratos e abandono", axis: "Fiscalização", critical: true },
  { code: "MT05Q02100", short: "Equipe especializada para apuração de denúncias", axis: "Fiscalização", critical: true }
];

const AXES = ["Governança", "Prevenção", "Saúde", "Serviços", "Fiscalização", "Monitoramento", "Resposta", "Rede de apoio"];
const SCORE_QUESTIONS = QUESTION_META.filter((question) => !question.informational);
const fmtPct = new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 0 });
const fmtNumber = new Intl.NumberFormat("pt-BR");

const els = {
  select: document.querySelector("#municipalitySelect"),
  search: document.querySelector("#municipalitySearch"),
  toast: document.querySelector("#statusToast"),
  currentScope: document.querySelector("#currentScope"),
  mainScore: document.querySelector("#mainScore"),
  scoreMeta: document.querySelector("#scoreMeta"),
  kpiGrid: document.querySelector("#kpiGrid"),
  axisChart: document.querySelector("#axisChart"),
  questionBars: document.querySelector("#questionBars"),
  questionBadge: document.querySelector("#questionBadge"),
  criticalList: document.querySelector("#criticalList"),
  topRanking: document.querySelector("#topRanking"),
  bottomRanking: document.querySelector("#bottomRanking"),
  zoonosisList: document.querySelector("#zoonosisList"),
  detailTitle: document.querySelector("#detailTitle"),
  questionTable: document.querySelector("#questionTable"),
  matrixHead: document.querySelector("#matrixHead"),
  matrixBody: document.querySelector("#matrixBody"),
  matrixCount: document.querySelector("#matrixCount")
};

const app = {
  rows: [],
  municipalities: [],
  selected: "",
  search: "",
  aggregate: null
};

boot();

async function boot() {
  try {
    const response = await fetch(DATA_URL, { cache: "no-store" });
    if (!response.ok) {
      throw new Error(`Falha ao carregar ${DATA_URL}`);
    }
    const buffer = await response.arrayBuffer();
    const text = new TextDecoder("utf-8").decode(buffer).replace(/\uFEFF/g, "").replace(/\0/g, "");
    app.rows = parseDelimited(text, ";");
    app.municipalities = buildMunicipalities(app.rows);
    app.aggregate = buildAggregate(app.municipalities, app.rows);
    bindEvents();
    renderMunicipalityOptions();
    render();
    hideToast();
  } catch (error) {
    showToast("Não foi possível carregar a base do painel.");
    console.error(error);
  }
}

function bindEvents() {
  els.select.addEventListener("change", () => {
    app.selected = els.select.value;
    render();
  });

  els.search.addEventListener("input", () => {
    app.search = els.search.value.trim();
    renderMunicipalityOptions();
    renderRankings();
    renderMatrix();
  });

  window.addEventListener("resize", debounce(() => {
    renderAxisChart(getCurrentAxisScores(), app.aggregate.axisScores);
  }, 120));
}

function parseDelimited(text, delimiter) {
  const records = [];
  let row = [];
  let value = "";
  let inQuotes = false;

  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];
    const next = text[index + 1];

    if (char === "\"") {
      if (inQuotes && next === "\"") {
        value += "\"";
        index += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (char === delimiter && !inQuotes) {
      row.push(value);
      value = "";
      continue;
    }

    if ((char === "\n" || char === "\r") && !inQuotes) {
      if (char === "\r" && next === "\n") {
        index += 1;
      }
      row.push(value);
      if (row.some((cell) => cell.length > 0)) {
        records.push(row);
      }
      row = [];
      value = "";
      continue;
    }

    value += char;
  }

  if (value.length || row.length) {
    row.push(value);
    records.push(row);
  }

  const headers = records.shift().map((header) => header.trim());
  return records.map((record) => {
    const item = {};
    headers.forEach((header, index) => {
      item[header] = (record[index] || "").trim();
    });
    return item;
  });
}

function buildMunicipalities(rows) {
  const grouped = new Map();

  rows.forEach((row) => {
    const name = row.municipio;
    if (!grouped.has(name)) {
      grouped.set(name, {
        name,
        ibge: row.codigo_ibge,
        ano: row.ano_ref,
        answers: new Map()
      });
    }
    grouped.get(name).answers.set(row.chave_questao, row);
  });

  return Array.from(grouped.values())
    .map((municipality) => ({
      ...municipality,
      stats: computeStats(municipality.answers)
    }))
    .sort((a, b) => a.name.localeCompare(b.name, "pt-BR"));
}

function buildAggregate(municipalities, rows) {
  const questionStats = QUESTION_META.map((question) => computeQuestionStats(question, rows));
  const scoreValues = municipalities.map((item) => item.stats.score).filter(Number.isFinite);
  const avgScore = average(scoreValues);
  const axisScores = computeAggregateAxis(municipalities);
  const yesTotal = municipalities.reduce((sum, item) => sum + item.stats.yes, 0);
  const noTotal = municipalities.reduce((sum, item) => sum + item.stats.no, 0);
  const naTotal = municipalities.reduce((sum, item) => sum + item.stats.na, 0);
  const scoreableTotal = yesTotal + noTotal;
  const criticalStats = questionStats.filter((item) => item.meta.critical);
  const criticalScore = average(criticalStats.map((item) => item.rate).filter(Number.isFinite));
  const worstQuestion = questionStats
    .filter((item) => !item.meta.informational && Number.isFinite(item.rate))
    .sort((a, b) => a.rate - b.rate)[0];

  return {
    score: avgScore,
    yes: yesTotal,
    no: noTotal,
    na: naTotal,
    scoreable: scoreableTotal,
    municipalities: municipalities.length,
    questionStats,
    axisScores,
    criticalScore,
    worstQuestion,
    aboveHalf: municipalities.filter((item) => item.stats.score >= 50).length
  };
}

function computeStats(answers) {
  let yes = 0;
  let no = 0;
  let na = 0;
  const axis = new Map();

  SCORE_QUESTIONS.forEach((question) => {
    const row = answers.get(question.code);
    const state = classifyAnswer(question, row ? row.resposta : "");
    const current = axis.get(question.axis) || { yes: 0, no: 0, na: 0 };

    if (state.kind === "yes") {
      yes += 1;
      current.yes += 1;
    } else if (state.kind === "no") {
      no += 1;
      current.no += 1;
    } else if (state.kind === "na") {
      na += 1;
      current.na += 1;
    }

    axis.set(question.axis, current);
  });

  const scoreable = yes + no;
  return {
    yes,
    no,
    na,
    scoreable,
    score: scoreable ? (yes / scoreable) * 100 : 0,
    axisScores: Object.fromEntries(AXES.map((axisName) => {
      const values = axis.get(axisName) || { yes: 0, no: 0 };
      const total = values.yes + values.no;
      return [axisName, total ? (values.yes / total) * 100 : null];
    }))
  };
}

function computeQuestionStats(question, rows) {
  const matches = rows.filter((row) => row.chave_questao === question.code);
  const counts = { yes: 0, no: 0, na: 0, info: 0, missing: 0 };
  const responses = new Map();

  matches.forEach((row) => {
    const state = classifyAnswer(question, row.resposta);
    counts[state.kind] = (counts[state.kind] || 0) + 1;
    const answer = row.resposta || "Sem resposta";
    responses.set(answer, (responses.get(answer) || 0) + 1);
  });

  const denominator = counts.yes + counts.no;
  return {
    meta: question,
    counts,
    rate: denominator ? (counts.yes / denominator) * 100 : null,
    responses: Array.from(responses.entries())
      .map(([answer, count]) => ({ answer, count }))
      .sort((a, b) => b.count - a.count || a.answer.localeCompare(b.answer, "pt-BR"))
  };
}

function computeAggregateAxis(municipalities) {
  return Object.fromEntries(AXES.map((axisName) => {
    const values = municipalities
      .map((item) => item.stats.axisScores[axisName])
      .filter((value) => Number.isFinite(value));
    return [axisName, values.length ? average(values) : null];
  }));
}

function classifyAnswer(question, answer) {
  if (!answer) {
    return { kind: "missing", label: "Sem resposta" };
  }

  if (question.informational) {
    return { kind: "info", label: answer };
  }

  const normalized = normalize(answer);
  if (normalized.startsWith("sim")) {
    return { kind: "yes", label: "Sim" };
  }
  if (normalized.startsWith("nao se aplica")) {
    return { kind: "na", label: "N/A" };
  }
  if (normalized.startsWith("nao")) {
    return { kind: "no", label: "Não" };
  }
  return { kind: "info", label: answer };
}

function normalize(value) {
  return String(value)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}

function renderMunicipalityOptions() {
  const current = app.selected;
  const filtered = getFilteredMunicipalities();
  const options = [
    `<option value="">Todos os municípios</option>`,
    ...filtered.map((item) => `<option value="${escapeHtml(item.name)}">${escapeHtml(item.name)}</option>`)
  ];
  els.select.innerHTML = options.join("");
  els.select.value = current && filtered.some((item) => item.name === current) ? current : "";
  if (current && els.select.value === "") {
    app.selected = "";
  }
}

function render() {
  const current = getCurrentMunicipality();
  const scopeStats = current ? current.stats : app.aggregate;
  const axisScores = current ? current.stats.axisScores : app.aggregate.axisScores;

  els.currentScope.textContent = current ? current.name : "Todos os municípios";
  els.mainScore.textContent = `${fmtPct.format(scopeStats.score)}%`;
  els.scoreMeta.textContent = current
    ? `${scopeStats.yes} respostas positivas em ${scopeStats.scoreable} perguntas avaliáveis`
    : `${fmtNumber.format(app.aggregate.scoreable)} respostas avaliáveis em ${app.aggregate.municipalities} municípios`;

  renderKpis(current, scopeStats);
  renderAxisChart(axisScores, app.aggregate.axisScores);
  renderQuestionBars(current);
  renderCriticalList();
  renderRankings();
  renderZoonosis(current);
  renderQuestionTable(current);
  renderMatrix();
}

function renderKpis(current, scopeStats) {
  const channel = getQuestionStat("MT05Q01900");
  const castration = getQuestionStat("MT05Q00600");
  const legislation = getQuestionStat("MT05Q00300");
  const vaccination = getQuestionStat("MT05Q01100");

  const cards = current
    ? [
        {
          label: "Perguntas positivas",
          value: `${scopeStats.yes}/${scopeStats.scoreable}`,
          note: `${scopeStats.no} negativas e ${scopeStats.na} não aplicáveis`
        },
        {
          label: "Média estadual",
          value: `${fmtPct.format(app.aggregate.score)}%`,
          note: deltaText(scopeStats.score, app.aggregate.score)
        },
        {
          label: "Canal direto para denúncias",
          value: answerLabel(current, "MT05Q01900"),
          note: `${fmtPct.format(channel.rate)}% dos municípios responderam Sim`
        },
        {
          label: "Vacinação anual para zoonoses",
          value: answerLabel(current, "MT05Q01100"),
          note: `${fmtPct.format(vaccination.rate)}% dos municípios responderam Sim`
        }
      ]
    : [
        {
          label: "Municípios avaliados",
          value: fmtNumber.format(app.aggregate.municipalities),
          note: "Bloco MT05Q00100 a MT05Q02100"
        },
        {
          label: "Aderência crítica",
          value: `${fmtPct.format(app.aggregate.criticalScore)}%`,
          note: "Média das perguntas estruturantes"
        },
        {
          label: "Municípios sem canal direto para denúncias",
          value: fmtNumber.format(channel.counts.no),
          note: `${fmtPct.format(channel.rate)}% possuem canal direto`
        },
        {
          label: "Municípios sem campanhas de castração",
          value: fmtNumber.format(castration.counts.no),
          note: `${fmtPct.format(castration.rate)}% realizam campanhas`
        },
        {
          label: "Legislação local de proteção animal",
          value: `${fmtPct.format(legislation.rate)}%`,
          note: `${fmtNumber.format(legislation.counts.yes)} municípios responderam Sim`
        },
        {
          label: "Vacinação anual para zoonoses",
          value: `${fmtPct.format(vaccination.rate)}%`,
          note: `${fmtNumber.format(vaccination.counts.yes)} municípios responderam Sim`
        }
      ];

  els.kpiGrid.innerHTML = cards.map((card) => `
    <article class="kpi-card">
      <span>${escapeHtml(card.label)}</span>
      <strong>${escapeHtml(card.value)}</strong>
      <small>${escapeHtml(card.note)}</small>
    </article>
  `).join("");
}

function renderAxisChart(currentScores, averageScores) {
  const canvas = els.axisChart;
  const context = canvas.getContext("2d");
  const ratio = window.devicePixelRatio || 1;
  const width = canvas.clientWidth || 520;
  const height = canvas.clientHeight || 260;
  canvas.width = Math.round(width * ratio);
  canvas.height = Math.round(height * ratio);
  context.setTransform(ratio, 0, 0, ratio, 0, 0);
  context.clearRect(0, 0, width, height);

  const padding = { top: 18, right: 88, bottom: 30, left: 118 };
  const plotWidth = Math.max(120, width - padding.left - padding.right);
  const rowHeight = Math.max(24, (height - padding.top - padding.bottom) / AXES.length);

  context.font = "700 12px Segoe UI, Arial, sans-serif";
  context.textBaseline = "middle";
  context.lineWidth = 1;

  AXES.forEach((axisName, index) => {
    const y = padding.top + index * rowHeight + rowHeight / 2;
    const current = Number.isFinite(currentScores[axisName]) ? currentScores[axisName] : 0;
    const averageScore = Number.isFinite(averageScores[axisName]) ? averageScores[axisName] : 0;
    const currentWidth = (plotWidth * current) / 100;
    const averageX = padding.left + (plotWidth * averageScore) / 100;

    context.fillStyle = "#607067";
    context.fillText(axisName, 0, y);

    context.fillStyle = "#e9eee8";
    roundRect(context, padding.left, y - 7, plotWidth, 14, 7);
    context.fill();

    context.fillStyle = barColor(current);
    roundRect(context, padding.left, y - 7, currentWidth, 14, 7);
    context.fill();

    context.strokeStyle = "#172019";
    context.beginPath();
    context.moveTo(averageX, y - 10);
    context.lineTo(averageX, y + 10);
    context.stroke();

    context.fillStyle = "#172019";
    context.textAlign = "right";
    context.fillText(`${fmtPct.format(current)}%`, width - 2, y);
    context.textAlign = "left";
  });

  context.fillStyle = "#607067";
  context.font = "700 11px Segoe UI, Arial, sans-serif";
  context.fillText("Traço preto: média estadual", padding.left, height - 10);
}

function roundRect(context, x, y, width, height, radius) {
  const safeWidth = Math.max(0, width);
  const safeRadius = Math.min(radius, safeWidth / 2, height / 2);
  context.beginPath();
  context.moveTo(x + safeRadius, y);
  context.arcTo(x + safeWidth, y, x + safeWidth, y + height, safeRadius);
  context.arcTo(x + safeWidth, y + height, x, y + height, safeRadius);
  context.arcTo(x, y + height, x, y, safeRadius);
  context.arcTo(x, y, x + safeWidth, y, safeRadius);
  context.closePath();
}

function renderQuestionBars(current) {
  const rows = SCORE_QUESTIONS.map((question) => {
    const stat = getQuestionStat(question.code);
    const selectedAnswer = current ? classifyAnswer(question, current.answers.get(question.code)?.resposta || "") : null;
    const value = current
      ? (selectedAnswer.kind === "yes" ? 100 : selectedAnswer.kind === "no" ? 0 : null)
      : stat.rate;
    return { question, stat, selectedAnswer, value };
  })
    .sort((a, b) => {
      if (current) {
        const order = { no: 0, missing: 1, na: 2, info: 3, yes: 4 };
        return order[a.selectedAnswer.kind] - order[b.selectedAnswer.kind] || a.stat.rate - b.stat.rate;
      }
      return a.stat.rate - b.stat.rate;
    })
    .slice(0, 10);

  els.questionBadge.textContent = current ? current.name : "MT";
  els.questionBars.innerHTML = rows.map(({ question, stat, selectedAnswer, value }) => {
    const pct = Number.isFinite(value) ? value : stat.rate;
    const label = current ? selectedAnswer.label : `${fmtPct.format(stat.rate)}%`;
    return `
      <div class="bar-row">
        <div class="bar-label">
          <span>${question.code}</span>
          ${escapeHtml(question.short)}
        </div>
        <div class="bar-track">
          <div class="bar-fill ${barClass(pct)}" style="width: ${clamp(pct, 0, 100)}%"></div>
        </div>
        <div class="bar-value">${escapeHtml(label)}</div>
      </div>
    `;
  }).join("");
}

function renderCriticalList() {
  const critical = app.aggregate.questionStats
    .filter((item) => item.meta.critical && Number.isFinite(item.rate))
    .sort((a, b) => a.rate - b.rate)
    .slice(0, 6);

  els.criticalList.innerHTML = critical.map((item) => `
    <div class="critical-item">
      <strong>${escapeHtml(item.meta.short)}</strong>
      <span>${item.meta.code} · ${fmtPct.format(item.rate)}% Sim · ${fmtNumber.format(item.counts.no)} respostas Não</span>
    </div>
  `).join("");
}

function renderRankings() {
  const filtered = getFilteredMunicipalities();
  const top = [...filtered].sort((a, b) => b.stats.score - a.stats.score || a.name.localeCompare(b.name, "pt-BR")).slice(0, 7);
  const bottom = [...filtered].sort((a, b) => a.stats.score - b.stats.score || a.name.localeCompare(b.name, "pt-BR")).slice(0, 7);
  els.topRanking.innerHTML = renderRankingItems(top);
  els.bottomRanking.innerHTML = renderRankingItems(bottom);
}

function renderRankingItems(items) {
  if (!items.length) {
    return `<div class="critical-item"><strong>Nenhum município encontrado</strong><span>Busca atual sem resultado</span></div>`;
  }

  return items.map((item) => `
    <button class="ranking-item" type="button" data-municipality="${escapeHtml(item.name)}">
      <span>
        <strong>${escapeHtml(item.name)}</strong>
        <span>${item.stats.yes} Sim · ${item.stats.no} Não · ${item.stats.na} N/A</span>
      </span>
      <span class="rank-score">${fmtPct.format(item.stats.score)}%</span>
    </button>
  `).join("");
}

function renderZoonosis(current) {
  const question = QUESTION_META.find((item) => item.code === "MT05Q01200");
  if (current) {
    const answer = current.answers.get(question.code)?.resposta || "Sem resposta";
    els.zoonosisList.innerHTML = `
      <div class="zoonosis-item">
        <strong>${escapeHtml(answer)}</strong>
        <span>${escapeHtml(current.name)}</span>
      </div>
    `;
    return;
  }

  const stat = getQuestionStat(question.code);
  els.zoonosisList.innerHTML = stat.responses.slice(0, 8).map((item) => {
    const pct = (item.count / app.aggregate.municipalities) * 100;
    return `
      <div class="zoonosis-item">
        <strong>${escapeHtml(item.answer)}</strong>
        <span>${fmtNumber.format(item.count)} municípios · ${fmtPct.format(pct)}%</span>
      </div>
    `;
  }).join("");
}

function renderQuestionTable(current) {
  els.detailTitle.textContent = current ? `Respostas de ${current.name}` : "Respostas por pergunta";

  els.questionTable.innerHTML = QUESTION_META.map((question) => {
    const stat = getQuestionStat(question.code);
    const row = current ? current.answers.get(question.code) : null;
    const state = current ? classifyAnswer(question, row?.resposta || "") : null;
    const topResponse = stat.responses[0];
    const response = current
      ? statusPill(state.kind, row?.resposta || "Sem resposta")
      : question.informational && topResponse
        ? `${escapeHtml(topResponse.answer)} · ${fmtNumber.format(topResponse.count)} municípios`
      : `${fmtPct.format(stat.rate || 0)}% Sim · ${fmtNumber.format(stat.counts.no)} Não`;
    const rate = question.informational ? "Informativo" : `${fmtPct.format(stat.rate)}%`;

    return `
      <tr>
        <td class="code-cell">${question.code}</td>
        <td>${escapeHtml(row?.questao || getQuestionText(question.code) || question.short)}</td>
        <td>${response}</td>
        <td>${rate}</td>
      </tr>
    `;
  }).join("");
}

function renderMatrix() {
  const filtered = getFilteredMunicipalities();
  const questions = SCORE_QUESTIONS;
  els.matrixCount.textContent = `${fmtNumber.format(filtered.length)} municípios`;
  els.matrixHead.innerHTML = [
    `<th>Município</th>`,
    `<th>Score</th>`,
    ...questions.map((question) => `<th class="matrix-code" title="${escapeHtml(question.short)}">${question.code.slice(5, 8)}</th>`)
  ].join("");

  els.matrixBody.innerHTML = filtered.map((municipality) => `
    <tr>
      <td><button class="municipality-link" type="button" data-municipality="${escapeHtml(municipality.name)}">${escapeHtml(municipality.name)}</button></td>
      <td><strong>${fmtPct.format(municipality.stats.score)}%</strong></td>
      ${questions.map((question) => {
        const state = classifyAnswer(question, municipality.answers.get(question.code)?.resposta || "");
        return `<td class="matrix-code">${matrixDot(state)}</td>`;
      }).join("")}
    </tr>
  `).join("");

  document.querySelectorAll("[data-municipality]").forEach((button) => {
    button.addEventListener("click", () => {
      app.selected = button.dataset.municipality;
      app.search = "";
      els.search.value = "";
      renderMunicipalityOptions();
      els.select.value = app.selected;
      render();
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  });
}

function matrixDot(state) {
  const label = state.kind === "yes" ? "S" : state.kind === "no" ? "N" : "·";
  return `<span class="matrix-dot dot-${state.kind}" title="${escapeHtml(state.label)}">${label}</span>`;
}

function statusPill(kind, label) {
  return `<span class="status-pill status-${kind}">${escapeHtml(label)}</span>`;
}

function getCurrentMunicipality() {
  return app.selected ? app.municipalities.find((item) => item.name === app.selected) : null;
}

function getCurrentAxisScores() {
  const current = getCurrentMunicipality();
  return current ? current.stats.axisScores : app.aggregate.axisScores;
}

function getFilteredMunicipalities() {
  const term = normalize(app.search);
  if (!term) {
    return app.municipalities;
  }
  return app.municipalities.filter((item) => normalize(item.name).includes(term));
}

function getQuestionStat(code) {
  return app.aggregate.questionStats.find((item) => item.meta.code === code);
}

function getQuestionText(code) {
  const row = app.rows.find((item) => item.chave_questao === code);
  return row ? row.questao : "";
}

function answerLabel(municipality, code) {
  const question = QUESTION_META.find((item) => item.code === code);
  const row = municipality.answers.get(code);
  return classifyAnswer(question, row?.resposta || "").label;
}

function deltaText(value, reference) {
  const delta = value - reference;
  if (Math.abs(delta) < 0.5) {
    return "Na média estadual";
  }
  const direction = delta > 0 ? "acima" : "abaixo";
  return `${fmtPct.format(Math.abs(delta))} p.p. ${direction} da média estadual`;
}

function average(values) {
  if (!values.length) {
    return 0;
  }
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function barColor(value) {
  if (value < 35) return "#b33d32";
  if (value < 60) return "#b46b1f";
  return "#2f7d57";
}

function barClass(value) {
  if (value < 35) return "danger";
  if (value < 60) return "warn";
  return "";
}

function clamp(value, min, max) {
  return Math.min(Math.max(value || 0, min), max);
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function debounce(fn, wait) {
  let timer = null;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), wait);
  };
}

function showToast(message) {
  els.toast.textContent = message;
  els.toast.classList.remove("is-hidden");
}

function hideToast() {
  window.setTimeout(() => {
    els.toast.classList.add("is-hidden");
  }, 500);
}
