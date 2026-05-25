// ============================================
//  EDF SOLDIER APTITUDE EVALUATION SYSTEM
//  TGS2026 D3PUBLISHER
// ============================================

// ---- Data ----

const QUESTIONS = [
  {
    text: "敵の大群が接近している。あなたは？",
    choices: [
      { text: "正面から真っ向迎撃する",   type: "ranger" },
      { text: "空中から高速奇襲をかける", type: "wingdiver" },
      { text: "すぐに支援要請を出す",     type: "airraider" },
      { text: "重装備で強引に突破する",   type: "fencer" },
    ]
  },
  {
    text: "仲間が敵に包囲された。あなたは？",
    choices: [
      { text: "迷わず救援に飛び込む",       type: "ranger" },
      { text: "上空から援護射撃する",       type: "wingdiver" },
      { text: "ビークル呼んで状況を変える", type: "airraider" },
      { text: "敵ごとまとめて押し返す",     type: "fencer" },
    ]
  },
  {
    text: "あなたの理想の戦い方は？",
    choices: [
      { text: "バランス重視で確実に攻める",   type: "ranger" },
      { text: "高機動で敵を翻弄する",         type: "wingdiver" },
      { text: "戦術と支援で戦場を支配する",   type: "airraider" },
      { text: "重火力でとにかく力で押しつぶす", type: "fencer" },
    ]
  },
  {
    text: "絶望的な状況。最後に頼るものは？",
    choices: [
      { text: "根拠のない勇気",   type: "ranger" },
      { text: "誰にも負けない速度", type: "wingdiver" },
      { text: "冷静な判断力",     type: "airraider" },
      { text: "鉄壁の防御力",     type: "fencer" },
    ]
  },
  {
    text: "EDFに配属されたら何をする？",
    choices: [
      { text: "最前線で戦い抜く",         type: "ranger" },
      { text: "空から地球を守る",         type: "wingdiver" },
      { text: "仲間を全力で支援し続ける", type: "airraider" },
      { text: "どんな攻撃も受け止める",   type: "fencer" },
    ]
  },
];

const TROOPS = {
  ranger: {
    name: "レンジャー", nameEn: "RANGER", icon: "🪖",
    comments: [
      "生還確率：極小。しかし司令部はあなたに最前線を命ずる。",
      "死ぬなよ。死んだら補充が面倒だ。——司令部より",
      "あなたの勇気は評価する。帰還は期待しないが。",
      "最前線送りを命ずる。異論は認めない。EDF!",
      "司令部はあなたの帰還を想定していません。それでも行くか？",
    ]
  },
  wingdiver: {
    name: "ウイングダイバー", nameEn: "WING DIVER", icon: "⚡",
    comments: [
      "空を駆けろ。着地することは帰還を意味しない。",
      "電磁コア残量に注意せよ。切れたら落ちる。当然だが。",
      "高機動適性：最高。ただし、空から見える絶望に備えよ。",
      "敵は上にも下にも横にもいる。それがあなたの戦場だ。",
      "翼がある。それが地球最後の希望かもしれない。",
    ]
  },
  airraider: {
    name: "エアレイダー", nameEn: "AIR RAIDER", icon: "📡",
    comments: [
      "戦術眼良好。ただし要請が通らない場合は自力でなんとかしろ。",
      "ビークルは生き物ではない。壊れたら諦めろ。",
      "あなたの要請が戦場を変える。通信は常時オープンに。",
      "補給は底をついている。それでもあなたに期待する。",
      "判断力は貴重だ。できれば生きて帰ってきてくれ。",
    ]
  },
  fencer: {
    name: "フェンサー", nameEn: "FENCER", icon: "🛡️",
    comments: [
      "重装甲で地球を支えろ。後退は許可しない。",
      "あなたが倒れた時、その後ろには何もない。",
      "電磁装甲起動確認。あなたの防御力に地球の命運を賭ける。",
      "死んでも立て。それがフェンサーの使命だ。",
      "最後の砦として配属を命ずる。倒れることは許されない。",
    ]
  },
};

const RANKS = {
  S: { stars: "★★★★★", color: "#FF1111" },
  A: { stars: "★★★★☆", color: "#FF7700" },
  B: { stars: "★★★☆☆", color: "#FFD700" },
  C: { stars: "★★☆☆☆", color: "#BBBBBB" },
  D: { stars: "★☆☆☆☆", color: "#777777" },
  E: { stars: "☆☆☆☆☆", color: "#444444" },
};

const CLEARANCE_LEVELS = ["ALPHA-1", "BETA-2", "DELTA-4", "OMEGA-7", "SIGMA-9", "THETA-3"];

const ANALYZE_LINES = [
  "> 適性データ収集 ............ [OK]",
  "> 戦闘パターン分析 .......... [OK]",
  "> 兵科マッチング実行 ......... [--]",
  "> 生存率計算中 .............. [OK]",
  "> 部隊ランク判定 ............ [OK]",
  "> 配属先データベース照合 ..... [--]",
  "> 司令部承認待ち ............",
  "> CLASSIFICATION COMPLETE",
  "> DEPLOYING NOW...",
];

// ---- State ----
let currentQ   = 0;
let scores     = { ranger: 0, wingdiver: 0, airraider: 0, fencer: 0 };
let playerId   = "";
let resultData = null;

// ---- Utilities ----

function rand(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }
function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

function genPlayerId() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let id = "EDF-";
  for (let i = 0; i < 8; i++) id += chars[rand(0, chars.length - 1)];
  return id;
}

function genTerminalId() { return String(rand(1000, 9999)); }

function calcRank(scores) {
  const max = Math.max(...Object.values(scores));
  if (max === 5) return "S";
  if (max === 4) return "A";
  if (max === 3) return "B";
  if (max === 2) return rand(0,1) ? "C" : "D";
  return rand(0,1) ? "D" : "E";
}

function survivalForRank(rank) {
  const map = { S:[62,98], A:[38,70], B:[18,48], C:[8,28], D:[4,16], E:[3,10] };
  const [lo, hi] = map[rank];
  return rand(lo, hi);
}

function showScreen(id) {
  document.querySelectorAll(".screen").forEach(s => s.classList.remove("active"));
  document.getElementById(id).classList.add("active");
}

// ---- Screens ----

function initStart() {
  document.getElementById("terminalId").textContent = genTerminalId();
  playerId = genPlayerId();
}

function startDiagnosis() {
  currentQ = 0;
  scores   = { ranger: 0, wingdiver: 0, airraider: 0, fencer: 0 };
  showScreen("screen-question");
  renderQuestion();
}

function renderQuestion() {
  const q = QUESTIONS[currentQ];
  const pct = ((currentQ + 1) / QUESTIONS.length) * 100;

  document.getElementById("qNum").textContent       = "Q." + String(currentQ + 1).padStart(2, "0");
  document.getElementById("progressLabel").textContent = `${currentQ + 1} / ${QUESTIONS.length}`;
  document.getElementById("progressFill").style.width  = pct + "%";
  document.getElementById("questionText").textContent  = q.text;

  const wrap = document.getElementById("choicesWrap");
  wrap.innerHTML = "";
  q.choices.forEach(c => {
    const btn = document.createElement("button");
    btn.className   = "choice-btn";
    btn.textContent = c.text;
    btn.addEventListener("click", () => onChoice(c.type, btn));
    wrap.appendChild(btn);
  });
}

function onChoice(type, btn) {
  btn.classList.add("selected");
  scores[type]++;
  setTimeout(() => {
    currentQ++;
    if (currentQ < QUESTIONS.length) renderQuestion();
    else startAnalyzing();
  }, 320);
}

// ---- Analyzing ----

function startAnalyzing() {
  showScreen("screen-analyzing");
  const log = document.getElementById("analyzeLog");
  log.innerHTML = "";

  ANALYZE_LINES.forEach((line, i) => {
    setTimeout(() => {
      const div = document.createElement("div");
      div.className   = "log-line";
      div.textContent = line;
      log.appendChild(div);
      log.scrollTop   = log.scrollHeight;
    }, i * 280);
  });

  setTimeout(buildResult, ANALYZE_LINES.length * 280 + 600);
}

// ---- Result ----

function buildResult() {
  const max      = Math.max(...Object.values(scores));
  const topTypes = Object.keys(scores).filter(k => scores[k] === max);
  const troopKey = pick(topTypes);
  const troop    = TROOPS[troopKey];
  const rank     = calcRank(scores);
  const rankData = RANKS[rank];
  const survival = survivalForRank(rank);
  const comment  = pick(troop.comments);

  resultData = { troopKey, troop, rank, rankData, survival, comment };

  // populate card
  const now    = new Date();
  const dateStr = `${now.getFullYear()}.${String(now.getMonth()+1).padStart(2,"0")}.${String(now.getDate()).padStart(2,"0")}`;

  document.getElementById("resPlayerId").textContent  = playerId;
  document.getElementById("resDate").textContent      = dateStr;
  document.getElementById("resTroopIcon").textContent = troop.icon;
  document.getElementById("resTroopName").textContent = troop.name;
  document.getElementById("resTroopEn").textContent   = troop.nameEn;
  document.getElementById("resSurvival").textContent  = survival;
  document.getElementById("resSurvivalBar").style.width = survival + "%";

  const rankEl = document.getElementById("resRank");
  rankEl.textContent = rank;
  rankEl.className   = "card-stat-rank rank-" + rank;
  rankEl.style.color = rankData.color;

  document.getElementById("resStars").textContent    = rankData.stars;
  document.getElementById("resComment").textContent  = comment;
  document.getElementById("resClearance").textContent = pick(CLEARANCE_LEVELS);

  showScreen("screen-result");

  // scroll to top
  document.getElementById("screen-result").scrollTop = 0;

  // animations
  setTimeout(() => {
    document.getElementById("cardFlash").classList.add("go");
  }, 80);
  setTimeout(() => {
    document.getElementById("cardStamp").classList.add("appear");
  }, 900);

  // start PV after card animations settle
  setTimeout(startResultPv, 1200);
}

// ---- Result PV ----

function startResultPv() {
  document.getElementById("resultPvIframe").src =
    "https://www.youtube.com/embed/VVBWGyMBHGE?autoplay=1&rel=0";
}

function stopResultPv() {
  document.getElementById("resultPvIframe").src = "";
}

// ---- Share Modal ----

function openShareModal() {
  document.getElementById("shareModal").classList.add("active");
}

function closeShareModal() {
  document.getElementById("shareModal").classList.remove("active");
  document.getElementById("modalStepGuide").classList.remove("visible");
  const certBtn = document.querySelector("#btnShareWithCert .modal-btn-label");
  if (certBtn) certBtn.textContent = "配属証明書付きSNSシェア";
  const certBtnEl = document.getElementById("btnShareWithCert");
  if (certBtnEl) certBtnEl.disabled = false;
}

// ---- Image Generation ----

async function generateCardBlob() {
  await document.fonts.ready;
  const flash = document.getElementById("cardFlash");
  flash.style.display = "none";
  try {
    const canvas = await html2canvas(document.getElementById("resultCard"), {
      scale: 2, useCORS: true, backgroundColor: "#040404",
      logging: false, allowTaint: true,
    });
    flash.style.display = "";
    return new Promise(resolve => canvas.toBlob(resolve, "image/png"));
  } catch (e) {
    flash.style.display = "";
    throw e;
  }
}

function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a   = document.createElement("a");
  a.href = url; a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// ---- Result page: save button (direct download) ----

async function saveCardImage() {
  const btn  = document.getElementById("btnSaveResult");
  const orig = btn.textContent;
  btn.disabled = true;
  btn.textContent = "生成中...";
  try {
    const blob     = await generateCardBlob();
    const filename = `EDF_CERTIFICATE_${playerId}.png`;
    const file     = new File([blob], filename, { type: "image/png" });
    let saved = false;
    if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
      try {
        await navigator.share({ files: [file], title: "EDF 緊急配属証明書" });
        saved = true;
      } catch (e) {
        if (e.name === "AbortError") {
          btn.textContent = orig;
          btn.disabled = false;
          return;
        }
        downloadBlob(blob, filename);
        saved = true;
      }
    } else {
      downloadBlob(blob, filename);
      saved = true;
    }
    if (saved) {
      btn.textContent = "① 保存しました ✓";
      showStepGuide("saveStepGuide", "btnOpenXResult");
    }
  } catch (e) {
    btn.textContent = orig;
    btn.disabled = false;
  }
}

// ---- Share text builder ----

function buildShareText(includeVideo) {
  const { troop, rank, survival } = resultData;
  let text =
`【EDF隊員適性診断】
私の兵科適性は「${troop.name}」
生存率：${survival}%
部隊ランク：${rank}

TGS2026 D3PUBLISHERブースで出撃準備完了。
地球は任せろ。

#EDF #地球防衛軍 #TGS2026 #D3PUBLISHER #EDF隊員適性診断`;
  if (includeVideo) text += "\nhttps://www.youtube.com/watch?v=VVBWGyMBHGE";
  return text;
}

function openX(text) {
  window.open("https://twitter.com/intent/tweet?text=" + encodeURIComponent(text), "_blank");
}

// ---- Modal share buttons ----

async function shareWithCert() {
  if (!resultData) return;
  const btn     = document.getElementById("btnShareWithCert");
  const labelEl = btn.querySelector(".modal-btn-label");
  const orig    = labelEl.textContent;
  btn.disabled  = true;
  labelEl.textContent = "生成中...";
  try {
    const blob     = await generateCardBlob();
    const filename = `EDF_CERTIFICATE_${playerId}.png`;
    const file     = new File([blob], filename, { type: "image/png" });

    if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
      // iOS / Android: ネイティブ共有シートで画像＋テキストをまとめて渡す
      try {
        await navigator.share({ files: [file], title: "EDF 緊急配属証明書", text: buildShareText(false) });
        labelEl.textContent = "✓ シェアしました！";
        setTimeout(() => { labelEl.textContent = orig; btn.disabled = false; }, 2200);
      } catch (e) {
        if (e.name === "AbortError") {
          labelEl.textContent = orig;
          btn.disabled = false;
          return;
        }
        // 共有失敗→ダウンロードしてステップガイドを表示
        downloadBlob(blob, filename);
        labelEl.textContent = "① 保存しました ✓";
        showStepGuide("modalStepGuide", "btnOpenXModal");
      }
    } else {
      // Desktop: ダウンロード＋ステップガイドを表示
      downloadBlob(blob, filename);
      labelEl.textContent = "① 保存しました ✓";
      showStepGuide("modalStepGuide", "btnOpenXModal");
    }
  } catch (e) {
    labelEl.textContent = orig;
    btn.disabled = false;
  }
}

// ---- Step guide helper ----

function showStepGuide(guideId, openBtnId) {
  const guide = document.getElementById(guideId);
  guide.classList.add("visible");
  document.getElementById(openBtnId).onclick = () => openX(buildShareText(false));
  guide.scrollIntoView({ behavior: "smooth", block: "nearest" });
}

function hideStepGuides() {
  document.getElementById("saveStepGuide").classList.remove("visible");
  document.getElementById("modalStepGuide").classList.remove("visible");
  const saveBtn = document.getElementById("btnSaveResult");
  if (saveBtn) saveBtn.textContent = "緊急配属証明書を保存";
}

function shareWithVideo() {
  if (!resultData) return;
  openX(buildShareText(true));
}

function sharePlain() {
  if (!resultData) return;
  openX(buildShareText(false));
}

function resetDiagnosis() {
  closeShareModal();
  stopResultPv();
  hideStepGuides();
  currentQ   = 0;
  scores     = { ranger: 0, wingdiver: 0, airraider: 0, fencer: 0 };
  resultData = null;
  playerId   = genPlayerId();

  document.getElementById("cardStamp").classList.remove("appear");
  document.getElementById("cardFlash").classList.remove("go");

  initStart();
  showScreen("screen-start");
}

// ---- Boot ----
document.addEventListener("DOMContentLoaded", () => {
  initStart();
  document.getElementById("btnStart").addEventListener("click", startDiagnosis);
  document.getElementById("btnShare").addEventListener("click", openShareModal);
  document.getElementById("btnSaveResult").addEventListener("click", saveCardImage);
  document.getElementById("btnRetry").addEventListener("click", resetDiagnosis);
  document.getElementById("btnModalClose").addEventListener("click", closeShareModal);
  document.getElementById("btnShareWithCert").addEventListener("click", shareWithCert);
  document.getElementById("btnShareWithVideo").addEventListener("click", shareWithVideo);
  document.getElementById("btnSharePlain").addEventListener("click", sharePlain);
});
