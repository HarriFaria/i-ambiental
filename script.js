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
const SUMMARY_GROUPS = [
  {
    id: "governance",
    title: "Base normativa e orçamento",
    legal: "Constituição Federal, art. 225",
    codes: ["MT05Q00100", "MT05Q00200", "MT05Q00300"],
    actionCurrent: "Formalizar política, norma local e previsão no PPA/LDO/LOA para dar sustentação administrativa às ações.",
    actionAggregate: "Priorizar municípios sem lei local ou sem previsão orçamentária para induzir política pública mínima."
  },
  {
    id: "enforcement",
    title: "Maus-tratos: denúncia e apuração",
    legal: "Lei 9.605/1998, art. 32",
    codes: ["MT05Q00400", "MT05Q01900", "MT05Q02000", "MT05Q02100"],
    actionCurrent: "Criar ou reforçar canal direto, registro de denúncias e equipe/fluxo de apuração de maus-tratos e abandono.",
    actionAggregate: "Cobrar fluxo mínimo de recebimento, triagem, apuração e encaminhamento das denúncias de maus-tratos."
  },
  {
    id: "prevention",
    title: "Prevenção de abandono",
    legal: "Dever de proteção da fauna e vedação à crueldade",
    codes: ["MT05Q00600", "MT05Q00700", "MT05Q01800"],
    actionCurrent: "Mapear abandono, manter campanhas de castração e comunicar posse responsável com foco preventivo.",
    actionAggregate: "Usar levantamento de abandonados e castração como critérios de priorização territorial."
  },
  {
    id: "health",
    title: "Zoonoses e vacinação",
    legal: "Proteção animal integrada à saúde pública",
    codes: ["MT05Q01100", "MT05Q01600"],
    actionCurrent: "Comprovar programa anual de vacinação e informar Raiva entre as zoonoses cobertas quando aplicável.",
    actionAggregate: "Tratar ausência de programa anual ou de Raiva informada como prioridade de verificação sanitária."
  },
  {
    id: "rescue",
    title: "Resgate e acolhimento",
    legal: "Lei 9.605/1998, arts. 25 e 32",
    codes: ["MT05Q00900", "MT05Q01400", "MT05Q01500"],
    actionCurrent: "Definir plano de emergência, acolhimento e bem-estar no recolhimento de cães e gatos.",
    actionAggregate: "Verificar capacidade mínima de resposta para resgate, guarda temporária e destinação adequada."
  }
];
const LEGAL_REFERENCES = [
  {
    label: "Constituição Federal, art. 225, § 1º, VII",
    text: "O Poder Público deve proteger a fauna e vedar práticas que submetam animais à crueldade."
  },
  {
    label: "Lei 9.605/1998, art. 32",
    text: "Maus-tratos, ferimentos ou mutilação de animais são crime ambiental; por isso denúncia e apuração são pontos sensíveis."
  },
  {
    label: "Lei 9.605/1998, art. 25",
    text: "Animais apreendidos ou resgatados precisam de guarda, cuidado e destinação compatíveis com o bem-estar."
  },
  {
    label: "Lei 14.064/2020",
    text: "Reforça a resposta penal nos casos de maus-tratos contra cão ou gato, elevando a prioridade desses fluxos."
  }
];
const VACCINATION_PROGRAM_CODE = "MT05Q01100";
const VACCINATION_ZOONOSES_CODE = "MT05Q01200";
const SCORE_QUESTIONS = QUESTION_META.filter((question) => !question.informational);
const fmtPct = new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 0 });
const fmtNumber = new Intl.NumberFormat("pt-BR");

const els = {
  select: document.querySelector("#municipalitySelect"),
  search: document.querySelector("#municipalitySearch"),
  tabButtons: document.querySelectorAll("[data-view]"),
  dashboardView: document.querySelector("#dashboardView"),
  summaryView: document.querySelector("#summaryView"),
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
  rabiesAnalysis: document.querySelector("#rabiesAnalysis"),
  detailTitle: document.querySelector("#detailTitle"),
  questionTable: document.querySelector("#questionTable"),
  matrixHead: document.querySelector("#matrixHead"),
  matrixBody: document.querySelector("#matrixBody"),
  matrixCount: document.querySelector("#matrixCount"),
  summaryScopeBadge: document.querySelector("#summaryScopeBadge"),
  summaryStatus: document.querySelector("#summaryStatus"),
  summaryTitle: document.querySelector("#summaryTitle"),
  summaryLead: document.querySelector("#summaryLead"),
  summaryFacts: document.querySelector("#summaryFacts"),
  summaryCriticalList: document.querySelector("#summaryCriticalList"),
  summaryLegalList: document.querySelector("#summaryLegalList"),
  summaryActions: document.querySelector("#summaryActions")
};

const app = {
  rows: [],
  municipalities: [],
  selected: "",
  search: "",
  activeView: "dashboard",
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
    setActiveView(getInitialView());
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

  els.tabButtons.forEach((button) => {
    button.addEventListener("click", () => {
      setActiveView(button.dataset.view);
    });
  });

  window.addEventListener("resize", debounce(() => {
    renderAxisChart(getCurrentAxisScores(), app.aggregate.axisScores);
  }, 120));
}

function setActiveView(view) {
  app.activeView = view === "summary" ? "summary" : "dashboard";
  const isSummary = app.activeView === "summary";

  els.dashboardView.hidden = isSummary;
  els.summaryView.hidden = !isSummary;
  els.dashboardView.classList.toggle("is-active", !isSummary);
  els.summaryView.classList.toggle("is-active", isSummary);

  els.tabButtons.forEach((button) => {
    const selected = button.dataset.view === app.activeView;
    button.classList.toggle("is-active", selected);
    button.setAttribute("aria-selected", String(selected));
  });

  if (!isSummary) {
    renderAxisChart(getCurrentAxisScores(), app.aggregate.axisScores);
  }
}

function getInitialView() {
  const params = new URLSearchParams(window.location.search);
  const requested = params.get("aba") || params.get("view") || window.location.hash.replace("#", "");
  return ["resumo", "summary"].includes(normalize(requested)) ? "summary" : "dashboard";
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
  renderRabiesAnalysis(current);
  renderSummary(current);
  renderQuestionTable(current);
  renderMatrix();
}

function renderKpis(current, scopeStats) {
  const channel = getQuestionStat("MT05Q01900");
  const castration = getQuestionStat("MT05Q00600");
  const legislation = getQuestionStat("MT05Q00300");
  const vaccination = getQuestionStat(VACCINATION_PROGRAM_CODE);

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
          value: answerLabel(current, VACCINATION_PROGRAM_CODE),
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
  const question = QUESTION_META.find((item) => item.code === VACCINATION_ZOONOSES_CODE);
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

function renderRabiesAnalysis(current) {
  const rows = getRabiesRows(app.municipalities);
  if (current) {
    const row = getRabiesRows([current])[0];
    const ok = row.programState.kind === "yes" && row.hasRabies;
    const status = ok ? "OK" : "Atenção";
    const issue = getRabiesIssue(row);

    els.rabiesAnalysis.innerHTML = `
      <div class="rabies-main">
        <span>Leitura do município</span>
        <strong class="${ok ? "ok" : "warn"}">${status}</strong>
        <p>${escapeHtml(issue)}</p>
      </div>
      <div class="rabies-copy">
        <p>Regra de análise: a vacinação antirrábica de cães e gatos é tratada como obrigação sanitária em todo o território nacional. Ausência de programa anual ou resposta sem Raiva deve acionar acompanhamento.</p>
        <div class="rabies-metrics">
          ${rabiesMetric("Programa anual", row.programState.label, "MT05Q01100")}
          ${rabiesMetric("Raiva informada", row.hasRabies ? "Sim" : "Não", "MT05Q01200")}
          ${rabiesMetric("Zoonoses declaradas", row.zoonoses || "Sem resposta", "Resposta do município")}
        </div>
      </div>
    `;
    return;
  }

  const total = rows.length;
  const withProgram = rows.filter((row) => row.programState.kind === "yes").length;
  const withRabies = rows.filter((row) => row.hasRabies).length;
  const withoutProgram = rows.filter((row) => row.programState.kind !== "yes").length;
  const priority = rows.filter((row) => row.programState.kind !== "yes" || !row.hasRabies).length;
  const programRate = total ? (withProgram / total) * 100 : 0;
  const rabiesRate = total ? (withRabies / total) * 100 : 0;

  els.rabiesAnalysis.innerHTML = `
    <div class="rabies-main">
      <span>Cobertura declarada</span>
      <strong>${fmtPct.format(programRate)}%</strong>
      <p>${fmtNumber.format(withProgram)} de ${fmtNumber.format(total)} municípios informam programa municipal anual de vacinação para controle de zoonoses.</p>
    </div>
    <div class="rabies-copy">
      <p>Regra de análise: a vacinação antirrábica de cães e gatos é tratada como obrigação sanitária em todo o território nacional. Por isso, o painel sinaliza municípios sem programa anual ou que não mencionam Raiva entre as zoonoses cobertas.</p>
      <div class="rabies-metrics">
        ${rabiesMetric("Com programa anual", fmtNumber.format(withProgram), `${fmtPct.format(programRate)}% da base`)}
        ${rabiesMetric("Com Raiva informada", fmtNumber.format(withRabies), `${fmtPct.format(rabiesRate)}% da base`)}
        ${rabiesMetric("Sem programa anual", fmtNumber.format(withoutProgram), "Resposta diferente de Sim")}
        ${rabiesMetric("Prioridade de verificação", fmtNumber.format(priority), "Sem programa ou sem Raiva")}
      </div>
    </div>
  `;
}

function renderSummary(current) {
  const summary = current ? buildMunicipalitySummary(current) : buildAggregateSummary();

  els.summaryScopeBadge.textContent = current ? current.name : "MT";
  els.summaryStatus.className = `summary-status ${summary.tone}`;
  els.summaryStatus.textContent = summary.status;
  els.summaryTitle.textContent = summary.title;
  els.summaryLead.textContent = summary.lead;
  els.summaryFacts.innerHTML = summary.facts.map(renderSummaryFact).join("");
  els.summaryCriticalList.innerHTML = summary.items.map(renderSummaryRow).join("");
  els.summaryLegalList.innerHTML = LEGAL_REFERENCES.map(renderLegalReference).join("");
  els.summaryActions.innerHTML = summary.actions.map(renderSummaryAction).join("");
}

function buildAggregateSummary() {
  const criticalScore = app.aggregate.criticalScore;
  const risk = getSummaryRisk(criticalScore);
  const worst = app.aggregate.questionStats
    .filter((item) => item.meta.critical && Number.isFinite(item.rate))
    .sort((a, b) => a.rate - b.rate)
    .slice(0, 3);
  const worstText = worst.map((item) => item.meta.short).join("; ");
  const legislation = getQuestionStat("MT05Q00300");
  const channel = getQuestionStat("MT05Q01900");
  const team = getQuestionStat("MT05Q02100");
  const rabiesPriority = getRabiesRows(app.municipalities)
    .filter((row) => row.programState.kind !== "yes" || !row.hasRabies)
    .length;
  const items = SUMMARY_GROUPS.map(buildAggregateSummaryGroup).sort(sortSummaryItems);
  const priorityItems = items.filter((item) => item.tone !== "ok");

  return {
    status: risk.label,
    tone: risk.tone,
    title: risk.title,
    lead: `No recorte estadual, os gargalos mais sensíveis são: ${worstText}.`,
    facts: [
      { label: "Aderência crítica", value: formatPercent(criticalScore), note: "média das questões estruturantes" },
      { label: "Sem lei local", value: fmtNumber.format(legislation.counts.no), note: `${formatPercent(legislation.rate)} responderam Sim` },
      { label: "Sem canal direto", value: fmtNumber.format(channel.counts.no), note: "denúncias de maus-tratos" },
      { label: "Sem equipe", value: fmtNumber.format(team.counts.no), note: "apuração especializada" },
      { label: "Prioridade antirrábica", value: fmtNumber.format(rabiesPriority), note: "sem programa anual ou sem Raiva" }
    ],
    items,
    actions: buildSummaryActions(priorityItems, false)
  };
}

function buildMunicipalitySummary(municipality) {
  const criticalScore = computeMunicipalityCriticalScore(municipality);
  const risk = getSummaryRisk(criticalScore);
  const items = SUMMARY_GROUPS.map((group) => buildMunicipalitySummaryGroup(municipality, group)).sort(sortSummaryItems);
  const priorityItems = items.filter((item) => item.tone !== "ok");
  const priorityText = priorityItems.length
    ? priorityItems.slice(0, 2).map((item) => item.title).join(" e ")
    : "sem pendência crítica declarada nos grupos avaliados";
  const rabiesRow = getRabiesRows([municipality])[0];

  return {
    status: risk.label,
    tone: risk.tone,
    title: `${municipality.name}: ${risk.title}`,
    lead: `Aderência geral de ${formatPercent(municipality.stats.score)} e aderência crítica de ${formatPercent(criticalScore)}. Prioridade: ${priorityText}.`,
    facts: [
      { label: "Aderência geral", value: formatPercent(municipality.stats.score), note: `${municipality.stats.yes}/${municipality.stats.scoreable} respostas positivas` },
      { label: "Aderência crítica", value: formatPercent(criticalScore), note: "questões estruturantes" },
      { label: "Lei local", value: answerLabel(municipality, "MT05Q00300"), note: "proteção animal" },
      { label: "Canal de denúncias", value: answerLabel(municipality, "MT05Q01900"), note: "maus-tratos e abandono" },
      { label: "Raiva", value: rabiesRow.hasRabies ? "Informada" : "Não informada", note: answerLabel(municipality, VACCINATION_PROGRAM_CODE) }
    ],
    items,
    actions: buildSummaryActions(priorityItems, true)
  };
}

function buildAggregateSummaryGroup(group) {
  const stats = group.codes.map(getQuestionStat).filter(Boolean);
  const rates = stats.map((item) => item.rate).filter(Number.isFinite);
  const score = rates.length ? average(rates) : 0;
  const worst = [...stats]
    .filter((item) => Number.isFinite(item.rate))
    .sort((a, b) => a.rate - b.rate)[0];

  return {
    id: group.id,
    title: group.title,
    tone: getSummaryTone(score),
    score,
    meta: `${formatPercent(score)} aderência média`,
    text: worst
      ? `${group.legal}. Gargalo: ${worst.meta.short} (${formatAnswerBreakdown(worst)}).`
      : `${group.legal}. Sem dados avaliáveis para o grupo.`,
    action: group.actionAggregate
  };
}

function formatAnswerBreakdown(stat) {
  const denominator = stat.counts.yes + stat.counts.no;
  const yesRate = denominator ? (stat.counts.yes / denominator) * 100 : 0;
  const noRate = denominator ? (stat.counts.no / denominator) * 100 : 0;
  return `Sim: ${formatPercent(yesRate)} (${fmtNumber.format(stat.counts.yes)}); Não: ${formatPercent(noRate)} (${fmtNumber.format(stat.counts.no)})`;
}

function buildMunicipalitySummaryGroup(municipality, group) {
  const answers = group.codes.map((code) => {
    const meta = getQuestionMeta(code);
    const state = classifyAnswer(meta, municipality.answers.get(code)?.resposta || "");
    return { meta, state };
  });
  const scoreable = answers.filter((item) => ["yes", "no", "missing"].includes(item.state.kind));
  const yes = scoreable.filter((item) => item.state.kind === "yes").length;
  const pending = scoreable.filter((item) => item.state.kind !== "yes");
  const score = scoreable.length ? (yes / scoreable.length) * 100 : 0;
  const pendingText = pending.slice(0, 3)
    .map((item) => `${item.meta.short}: ${item.state.label}`)
    .join("; ");
  const isOk = pending.length === 0 && scoreable.length > 0;

  return {
    id: group.id,
    title: group.title,
    tone: isOk ? "ok" : getSummaryTone(score),
    score,
    meta: `${yes}/${scoreable.length} itens positivos`,
    text: pending.length
      ? `${group.legal}. Pendências: ${pendingText}.`
      : `${group.legal}. Itens essenciais declarados como atendidos.`,
    action: group.actionCurrent
  };
}

function buildSummaryActions(priorityItems, isCurrent) {
  const items = priorityItems.length
    ? priorityItems.slice(0, 3)
    : [{
        title: "Manter evidências atualizadas",
        action: isCurrent
          ? "Registrar documentos, canais, relatórios e fluxos que comprovem as respostas declaradas."
          : "Manter monitoramento anual e preservar trilha de evidências para os municípios com boa aderência."
      }];

  return items.map((item) => ({
    title: item.title,
    text: item.action
  }));
}

function renderSummaryFact(item) {
  return `
    <div class="summary-fact">
      <span>${escapeHtml(item.label)}</span>
      <strong>${escapeHtml(item.value)}</strong>
      <small>${escapeHtml(item.note)}</small>
    </div>
  `;
}

function renderSummaryRow(item) {
  return `
    <div class="summary-row summary-${item.tone}">
      <div>
        <strong>${escapeHtml(item.title)}</strong>
        <p>${escapeHtml(item.text)}</p>
      </div>
      <span>${escapeHtml(item.meta)}</span>
    </div>
  `;
}

function renderLegalReference(item) {
  return `
    <div class="summary-row legal-row">
      <div>
        <strong>${escapeHtml(item.label)}</strong>
        <p>${escapeHtml(item.text)}</p>
      </div>
    </div>
  `;
}

function renderSummaryAction(item, index) {
  return `
    <div class="summary-action">
      <span>${index + 1}</span>
      <div>
        <strong>${escapeHtml(item.title)}</strong>
        <p>${escapeHtml(item.text)}</p>
      </div>
    </div>
  `;
}

function computeMunicipalityCriticalScore(municipality) {
  const states = QUESTION_META
    .filter((question) => question.critical)
    .map((question) => classifyAnswer(question, municipality.answers.get(question.code)?.resposta || ""))
    .filter((state) => ["yes", "no", "missing"].includes(state.kind));
  const yes = states.filter((state) => state.kind === "yes").length;
  return states.length ? (yes / states.length) * 100 : 0;
}

function getSummaryRisk(score) {
  if (score < 50) {
    return { label: "Risco alto", tone: "danger", title: "fragilidade estrutural" };
  }
  if (score < 70) {
    return { label: "Atenção", tone: "warn", title: "resposta parcial" };
  }
  return { label: "Monitorar", tone: "ok", title: "base declarada consistente" };
}

function getSummaryTone(score) {
  if (score < 50) return "danger";
  if (score < 70) return "warn";
  return "ok";
}

function sortSummaryItems(a, b) {
  const order = { danger: 0, warn: 1, ok: 2 };
  return order[a.tone] - order[b.tone] || a.score - b.score || a.title.localeCompare(b.title, "pt-BR");
}

function getRabiesRows(municipalities) {
  const programQuestion = QUESTION_META.find((item) => item.code === VACCINATION_PROGRAM_CODE);
  return municipalities.map((municipality) => {
    const programAnswer = municipality.answers.get(VACCINATION_PROGRAM_CODE)?.resposta || "";
    const zoonoses = municipality.answers.get(VACCINATION_ZOONOSES_CODE)?.resposta || "";
    return {
      municipality,
      programState: classifyAnswer(programQuestion, programAnswer),
      zoonoses,
      hasRabies: mentionsRabies(zoonoses)
    };
  });
}

function getRabiesIssue(row) {
  const hasProgram = row.programState.kind === "yes";
  if (hasProgram && row.hasRabies) {
    return "O município informa programa anual e inclui Raiva entre as zoonoses cobertas.";
  }
  if (hasProgram && !row.hasRabies) {
    return "O município informa programa anual, mas a resposta das zoonoses não menciona Raiva.";
  }
  if (!hasProgram && row.hasRabies) {
    return "A resposta cita Raiva, mas o município não informa programa anual de vacinação.";
  }
  return "O município não informa programa anual e também não menciona Raiva nas zoonoses cobertas.";
}

function mentionsRabies(value) {
  return normalize(value).includes("raiva");
}

function rabiesMetric(label, value, note) {
  return `
    <div class="rabies-metric">
      <span>${escapeHtml(label)}</span>
      <strong>${escapeHtml(value)}</strong>
      <small>${escapeHtml(note)}</small>
    </div>
  `;
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

function getQuestionMeta(code) {
  return QUESTION_META.find((item) => item.code === code);
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

function formatPercent(value) {
  return Number.isFinite(value) ? `${fmtPct.format(value)}%` : "--";
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
