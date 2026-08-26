import fs from 'node:fs/promises';
import { Presentation, PresentationFile } from '@oai/artifact-tool';

const OUT = '/Users/m4air/Documents/ChatGPT/英语学习软件开发/Talk-Town-项目基础功能与框架-小组会议.pptx';
const TMP = '/Users/m4air/Documents/ChatGPT/英语学习软件开发/ppt-build';
const W = 1280;
const H = 720;

const C = {
  ink: '#17342F',
  green: '#1E4B42',
  mint: '#CBE7DA',
  paleMint: '#EAF4EF',
  coral: '#F26F52',
  paleCoral: '#FCE5DE',
  yellow: '#F2C45E',
  paleYellow: '#FFF2C9',
  paper: '#F7F4EC',
  white: '#FFFFFF',
  panel: '#ECEDE8',
  rule: '#C8CBC5',
  muted: '#6E7C77',
  black: '#111514',
};

const F = 'PingFang SC';

async function bytes(path) {
  const b = await fs.readFile(path);
  return b.buffer.slice(b.byteOffset, b.byteOffset + b.byteLength);
}

function box(slide, name, x, y, w, h, fill = C.white, lineFill = 'none', radius = 0) {
  return slide.shapes.add({
    geometry: radius ? 'roundRect' : 'rect',
    name,
    position: { left: x, top: y, width: w, height: h },
    fill,
    line: { style: 'solid', fill: lineFill, width: lineFill === 'none' ? 0 : 1 },
    ...(radius ? { borderRadius: radius } : {}),
  });
}

function text(slide, name, value, x, y, w, h, size, color = C.ink, opts = {}) {
  const shape = slide.shapes.add({
    geometry: 'textbox',
    name,
    position: { left: x, top: y, width: w, height: h },
    fill: 'none',
    line: { style: 'solid', fill: 'none', width: 0 },
  });
  shape.text = value;
  shape.text.style = {
    fontSize: size,
    typeface: opts.typeface ?? F,
    color,
    bold: opts.bold ?? false,
    alignment: opts.align ?? 'left',
    verticalAlignment: opts.valign ?? 'top',
    autoFit: opts.autoFit ?? 'shrinkText',
  };
  return shape;
}

function line(slide, name, x, y, w, h = 0, color = C.rule, width = 1) {
  return slide.shapes.add({
    geometry: 'line',
    name,
    position: { left: x, top: y, width: w, height: h },
    fill: 'none',
    line: { style: 'solid', fill: color, width },
  });
}

function title(slide, eyebrow, headline, number, dark = false) {
  const ink = dark ? C.white : C.ink;
  const sub = dark ? '#B8D0C7' : C.muted;
  text(slide, `eyebrow-${number}`, eyebrow.toUpperCase(), 52, 40, 420, 24, 14, sub, { bold: true });
  text(slide, `title-${number}`, headline, 52, 72, 1120, 70, 38, ink, { bold: true });
  text(slide, `number-${number}`, String(number).padStart(2, '0'), 1180, 42, 45, 24, 13, sub, { align: 'right' });
}

function note(slide, sourceLines) {
  slide.speakerNotes.textFrame.setText(`[Sources]\n${sourceLines.map((s) => `- ${s}`).join('\n')}\n[/Sources]`);
}

function addImage(slide, name, blob, alt, x, y, w, h, opts = {}) {
  if (opts.backing) box(slide, `${name}-backing`, x - 7, y + 7, w, h, opts.backing, 'none', opts.radius ?? 18);
  return slide.images.add({
    blob,
    contentType: 'image/png',
    alt,
    fit: opts.fit ?? 'cover',
    position: { left: x, top: y, width: w, height: h },
    geometry: 'roundRect',
    borderRadius: opts.radius ?? 18,
    ...(opts.crop ? { crop: opts.crop } : {}),
  });
}

function chip(slide, label, x, y, w, fill, color = C.ink) {
  box(slide, `chip-${label}`, x, y, w, 34, fill, 'none', 17);
  text(slide, `chip-text-${label}`, label, x + 9, y + 7, w - 18, 20, 13, color, { bold: true, align: 'center' });
}

async function main() {
  const og = await bytes('/Users/m4air/Documents/ChatGPT/英语学习软件开发/talk-town-web/public/og.png');
  const home = await bytes(`${TMP}/screenshots/home.png`);
  const lesson = await bytes(`${TMP}/screenshots/lesson.png`);
  const library = await bytes(`${TMP}/screenshots/library.png`);

  const deck = Presentation.create({ slideSize: { width: W, height: H } });

  // 1 — cover, adapted from Codex Grid slide-08 split-image composition.
  {
    const s = deck.slides.add();
    s.background.fill = C.paper;
    box(s, 'cover-green-field', 0, 0, 696, H, C.ink);
    text(s, 'cover-kicker', 'AI 场景化旅行英语学习', 62, 62, 500, 28, 16, C.mint, { bold: true });
    text(s, 'cover-title', 'Talk Town', 62, 170, 570, 110, 72, C.white, { bold: true, typeface: 'Georgia' });
    text(s, 'cover-subtitle', '项目基础功能与系统框架', 62, 288, 550, 52, 30, C.white, { bold: true });
    line(s, 'cover-rule', 62, 370, 120, 0, C.coral, 5);
    text(s, 'cover-caption', '小组会议讨论稿  ·  MVP阶段', 62, 405, 500, 36, 18, '#B8D0C7');
    text(s, 'cover-quote', '出发前，练会真正用得上的英语。', 62, 570, 560, 60, 24, C.yellow, { bold: true });
    addImage(s, 'cover-image', og, 'Talk Town旅行咖啡店品牌视觉', 696, 0, 584, 720, { radius: 0, crop: { left: 0.62, top: 0, right: 0, bottom: 0 } });
    note(s, ['Talk Town 完整 AI 产品 PRD v1.0（项目定位与目标）', 'Talk Town 原创品牌视觉 public/og.png']);
  }

  // 2 — problem, image split.
  {
    const s = deck.slides.add();
    s.background.fill = C.white;
    title(s, '01 · WHY NOW', '用户缺的不是课程，而是“马上能用”的交流能力', 2);
    text(s, 'problem-lead', '“我要去美国旅游”背后，是一组明确的真实任务。', 54, 165, 500, 70, 25, C.ink, { bold: true });
    const items = [
      ['01', '不知道该学什么', '目标很明确，但无法拆成机场、酒店、餐厅等任务。'],
      ['02', '学完不会用', '传统内容与真实对话脱节，用户不知道何时开口。'],
      ['03', '反馈来得太慢', '学习周期过长，出发前无法建立可见的成功感。'],
    ];
    items.forEach(([n, h, b], i) => {
      const y = 270 + i * 104;
      text(s, `p-num-${i}`, n, 54, y, 48, 28, 15, C.coral, { bold: true });
      text(s, `p-head-${i}`, h, 105, y - 2, 300, 28, 20, C.ink, { bold: true });
      text(s, `p-body-${i}`, b, 105, y + 32, 405, 51, 16, C.muted);
    });
    addImage(s, 'home-screenshot', home, 'Talk Town首页旅行目标输入和学习路线', 594, 165, 630, 430, { radius: 18, backing: C.yellow, crop: { left: 0.02, top: 0, right: 0.02, bottom: 0.12 } });
    text(s, 'screen-caption', '当前Demo：用一句中文目标进入学习路线', 594, 615, 630, 28, 15, C.muted, { align: 'center' });
    note(s, ['Talk Town 完整 AI 产品 PRD v1.0，第2节“产品定位与验证目标”', 'Talk Town 当前前端Demo首页截图']);
  }

  // 3 — positioning, adapted from Codex Grid slide-13 2x2 points.
  {
    const s = deck.slides.add();
    s.background.fill = C.paper;
    title(s, '02 · PRODUCT DEFINITION', 'Talk Town 把学习结果定义为“完成真实任务”', 3);
    const blocks = [
      ['目标用户', '近期准备出境旅游、英语基础薄弱的成年人', C.paleMint, '18+ / 简体中文 / 能输入短句'],
      ['学习对象', '不是语法知识，而是机场、酒店、餐厅中的交流任务', C.paleCoral, '任务驱动，而非课程驱动'],
      ['首发边界', '网页端文字问答；暂不做语音、发音评分和订阅', C.paleYellow, '先验证场景学习是否有效'],
      ['成功定义', '训练后能在等价新任务中独立完成更多必要步骤', '#E8E8F2', '以迁移任务证明能力'],
    ];
    blocks.forEach(([h, b, fill, foot], i) => {
      const x = 52 + (i % 2) * 604;
      const y = 175 + Math.floor(i / 2) * 230;
      box(s, `position-block-${i}`, x, y, 570, 196, fill, 'none', 18);
      text(s, `position-label-${i}`, h, x + 26, y + 22, 150, 30, 17, C.coral, { bold: true });
      text(s, `position-body-${i}`, b, x + 26, y + 62, 510, 76, 23, C.ink, { bold: true });
      line(s, `position-rule-${i}`, x + 26, y + 147, 64, 0, C.ink, 2);
      text(s, `position-foot-${i}`, foot, x + 105, y + 141, 420, 28, 14, C.muted);
    });
    note(s, ['Talk Town 完整 AI 产品 PRD v1.0，第2—4节（定位、用户、MVP范围）']);
  }

  // 4 — user flow. Connectors are created before nodes.
  {
    const s = deck.slides.add();
    s.background.fill = C.white;
    title(s, '03 · USER JOURNEY', '一条主链路串起目标、路线、训练与结果', 4);
    const xs = [54, 293, 532, 771, 1010];
    for (let i = 0; i < xs.length - 1; i++) {
      const arrow = s.shapes.add({ geometry: 'rightArrow', name: `flow-arrow-${i}`, position: { left: xs[i] + 176, top: 285, width: 62, height: 34 }, fill: C.mint, line: { style: 'solid', fill: 'none', width: 0 } });
      arrow.sendToBack();
    }
    const stages = [
      ['01', '输入目标', '“我要去美国旅游”'],
      ['02', '生成路线', '机场 · 酒店 · 餐厅'],
      ['03', '选择场景', '咖啡店点餐'],
      ['04', 'AI问答训练', '判断 · 解释 · 推进'],
      ['05', '完成任务', '迁移测试与结果'],
    ];
    stages.forEach(([n, h, b], i) => {
      const x = xs[i];
      box(s, `flow-node-${i}`, x, 205, 182, 195, i === 3 ? C.ink : C.paper, i === 3 ? 'none' : C.rule, 18);
      text(s, `flow-num-${i}`, n, x + 20, 225, 42, 28, 15, i === 3 ? C.yellow : C.coral, { bold: true });
      text(s, `flow-head-${i}`, h, x + 20, 273, 142, 42, 21, i === 3 ? C.white : C.ink, { bold: true });
      text(s, `flow-body-${i}`, b, x + 20, 330, 142, 50, 15, i === 3 ? '#B8D0C7' : C.muted);
    });
    box(s, 'flow-example', 54, 470, 1138, 120, C.paleYellow, 'none', 18);
    text(s, 'flow-example-label', '结果不是', 82, 492, 140, 28, 16, C.muted, { bold: true });
    text(s, 'flow-example-old', '“我学完了一节课”', 82, 526, 300, 36, 23, C.muted);
    text(s, 'flow-example-arrow', '→', 480, 514, 60, 48, 34, C.coral, { bold: true, align: 'center' });
    text(s, 'flow-example-new', '“我现在可以完成一次咖啡店点单”', 582, 512, 570, 46, 26, C.ink, { bold: true });
    note(s, ['Talk Town 完整 AI 产品 PRD v1.0，第1节两条主链路、第4节P0学习功能']);
  }

  // 5 — four capabilities.
  {
    const s = deck.slides.add();
    s.background.fill = C.paper;
    title(s, '04 · MVP CAPABILITIES', 'MVP先做好四项基础能力', 5);
    const caps = [
      ['A', '理解学习目标', '把自然语言目标转成目的地、场景和学习意图。', 'AI Goal Understanding'],
      ['B', '生成可学路线', '只推荐已经审核并可训练的真实任务。', 'Scene & Route'],
      ['C', 'NPC问答训练', '通过角色台词、用户输入与任务状态推进剧情。', 'Guided Practice'],
      ['D', '即时纠错反馈', '判断是否能被理解，并用中文给出可执行优化。', 'Feedback & Record'],
    ];
    caps.forEach(([n, h, b, en], i) => {
      const x = 54 + (i % 2) * 604;
      const y = 176 + Math.floor(i / 2) * 226;
      line(s, `cap-top-${i}`, x, y, 566, 0, i === 0 ? C.coral : C.ink, 3);
      text(s, `cap-n-${i}`, n, x, y + 24, 45, 45, 27, C.coral, { bold: true, typeface: 'Georgia' });
      text(s, `cap-h-${i}`, h, x + 65, y + 22, 430, 40, 25, C.ink, { bold: true });
      text(s, `cap-b-${i}`, b, x + 65, y + 77, 470, 58, 17, C.muted);
      text(s, `cap-en-${i}`, en.toUpperCase(), x + 65, y + 145, 420, 24, 12, C.muted, { bold: true });
    });
    chip(s, 'P1 暂缓：语音 · 发音评分 · 社交 · 复杂课程 · 付费', 54, 626, 590, C.ink, C.white);
    note(s, ['Talk Town 完整 AI 产品 PRD v1.0，第4节“MVP范围”']);
  }

  // 6 — first scenario with screenshot, adapted from slide-08.
  {
    const s = deck.slides.add();
    s.background.fill = C.white;
    title(s, '05 · FIRST SCENARIO', '咖啡店点餐是第一条可验证训练闭环', 6);
    text(s, 'scenario-lead', '高频、流程固定、反馈明确，适合验证“做完任务”而不是“学完课程”。', 54, 155, 480, 80, 22, C.ink, { bold: true });
    const steps = ['表达想喝什么', '选择杯型', '添加牛奶/糖等需求', '确认支付方式'];
    steps.forEach((label, i) => {
      const y = 265 + i * 73;
      box(s, `scenario-step-${i}`, 54, y, 44, 44, i === 0 ? C.coral : C.paleMint, 'none', 22);
      text(s, `scenario-num-${i}`, String(i + 1), 54, y + 10, 44, 22, 14, i === 0 ? C.white : C.ink, { bold: true, align: 'center' });
      text(s, `scenario-label-${i}`, label, 122, y + 7, 390, 32, 19, C.ink, { bold: true });
      if (i < steps.length - 1) line(s, `scenario-vline-${i}`, 76, y + 48, 0, 24, C.rule, 2);
    });
    box(s, 'scenario-success', 54, 585, 460, 60, C.paleYellow, 'none', 14);
    text(s, 'scenario-success-text', '成功条件：四项必要意图全部完成', 74, 603, 420, 26, 16, C.ink, { bold: true });
    addImage(s, 'lesson-screenshot', lesson, 'Talk Town咖啡店NPC问答训练页面', 560, 155, 665, 490, { radius: 18, backing: C.coral, crop: { left: 0.06, top: 0.02, right: 0.02, bottom: 0.02 } });
    note(s, ['Talk Town 完整 AI 产品 PRD v1.0，第4节P0学习功能及咖啡店场景设计', 'Talk Town 当前前端Demo训练页截图']);
  }

  // 7 — architecture diagram. Arrows first, then layers.
  {
    const s = deck.slides.add();
    s.background.fill = C.ink;
    title(s, '06 · SYSTEM FRAMEWORK', '系统分为体验层、业务层、AI层和知识层', 7, true);
    const ys = [170, 274, 378, 482];
    for (let i = 0; i < ys.length - 1; i++) {
      s.shapes.add({ geometry: 'downArrow', name: `arch-arrow-${i}`, position: { left: 604, top: ys[i] + 78, width: 34, height: 30 }, fill: C.coral, line: { style: 'solid', fill: 'none', width: 0 } });
    }
    const layers = [
      ['体验层', 'Next.js网页端 · 学习路线 · NPC聊天 · 知识后台', C.paleYellow],
      ['业务层', 'FastAPI · 确定性任务状态机 · 会话与学习记录', C.paleCoral],
      ['AI层', 'Luna默认 / Terra升级 · LlamaIndex检索 · Rerank条件启用', C.paleMint],
      ['知识层', 'PostgreSQL + pgvector · 对象存储 · 版本与审计', '#E7E8EF'],
    ];
    layers.forEach(([h, b, fill], i) => {
      box(s, `arch-layer-${i}`, 120, ys[i], 1000, 78, fill, 'none', 13);
      text(s, `arch-label-${i}`, h, 147, ys[i] + 21, 150, 34, 21, C.ink, { bold: true });
      line(s, `arch-rule-${i}`, 305, ys[i] + 17, 0, 44, C.rule, 1);
      text(s, `arch-body-${i}`, b, 336, ys[i] + 21, 750, 34, 17, C.ink);
    });
    text(s, 'arch-principle', '关键原则：学习任务推进由确定性状态机负责；RAG提供证据，不决定用户是否完成任务。', 120, 610, 1000, 45, 19, C.yellow, { bold: true, align: 'center' });
    note(s, ['Talk Town 完整 AI 产品 PRD v1.0，第5节“总体技术选型”、第14节“RAG检索与生成流程”']);
  }

  // 8 — current status and next stages with knowledge screenshot.
  {
    const s = deck.slides.add();
    s.background.fill = C.white;
    title(s, '07 · DELIVERY STATUS', '当前是高保真Demo；完整MVP还要接上真实系统', 8);
    addImage(s, 'library-screenshot', library, 'Talk Town知识库管理工作台页面', 54, 168, 660, 438, { radius: 18, backing: C.mint, crop: { left: 0.03, top: 0.01, right: 0.02, bottom: 0.06 } });
    const milestones = [
      ['当前', '高保真前端Demo', '验证界面、流程和任务体验', C.paleMint],
      ['下一阶段', '可测试产品MVP', '接入模型、后端、数据和会话记录', C.paleYellow],
      ['完整基线', 'AI + RAG知识系统', '解析、检索、评测、发布与回滚', C.paleCoral],
    ];
    milestones.forEach(([tag, h, b, fill], i) => {
      const y = 168 + i * 147;
      box(s, `milestone-${i}`, 756, y, 468, 122, fill, 'none', 16);
      text(s, `milestone-tag-${i}`, tag, 780, y + 16, 110, 22, 13, C.coral, { bold: true });
      text(s, `milestone-head-${i}`, h, 780, y + 43, 390, 30, 21, C.ink, { bold: true });
      text(s, `milestone-body-${i}`, b, 780, y + 78, 400, 26, 15, C.muted);
    });
    text(s, 'timeline-note', '完整AI MVP新基线：约12周、130–160人日', 756, 629, 468, 28, 16, C.ink, { bold: true, align: 'center' });
    note(s, ['Talk Town 完整 AI 产品 PRD v1.0，第20节“里程碑与资源影响”', 'Talk Town 当前前端Demo知识库页面截图']);
  }

  // 9 — close with decisions, adapted from Codex Grid slide-18 three milestones.
  {
    const s = deck.slides.add();
    s.background.fill = C.paper;
    title(s, '08 · MEETING OUTPUT', '本次会议需要对齐三个决定', 9);
    const decisions = [
      ['01', '范围', '是否以“网页文字问答 + 咖啡店闭环 + 知识系统”为完整MVP范围？', C.paleMint],
      ['02', '架构', '是否确认pgvector、LlamaIndex与确定性状态机的组合？', C.paleYellow],
      ['03', '验证', '是否批准四套金标集和“任务迁移效果”作为上线依据？', C.paleCoral],
    ];
    decisions.forEach(([n, h, b, fill], i) => {
      const x = 54 + i * 403;
      box(s, `decision-${i}`, x, 180, 370, 330, fill, 'none', 18);
      text(s, `decision-num-${i}`, n, x + 28, 205, 70, 42, 27, C.coral, { bold: true, typeface: 'Georgia' });
      text(s, `decision-head-${i}`, h, x + 28, 270, 310, 48, 30, C.ink, { bold: true });
      line(s, `decision-rule-${i}`, x + 28, 335, 72, 0, C.ink, 2);
      text(s, `decision-body-${i}`, b, x + 28, 370, 310, 98, 19, C.ink, { bold: true });
    });
    box(s, 'next-action', 54, 560, 1176, 92, C.ink, 'none', 18);
    text(s, 'next-action-label', 'NEXT', 82, 584, 86, 28, 14, C.yellow, { bold: true });
    text(s, 'next-action-text', '形成评审结论 → 更新立项基线 → 进入交互细化与技术拆解', 190, 578, 980, 42, 24, C.white, { bold: true });
    note(s, ['Talk Town 完整 AI 产品 PRD v1.0，第23节“开发前必须确认”']);
  }

  await fs.mkdir(`${TMP}/rendered`, { recursive: true });
  for (const [i, slide] of deck.slides.items.entries()) {
    const stem = `slide-${String(i + 1).padStart(2, '0')}`;
    const png = await deck.export({ slide, format: 'png', scale: 1 });
    await fs.writeFile(`${TMP}/rendered/${stem}.png`, new Uint8Array(await png.arrayBuffer()));
    const layout = await slide.export({ format: 'layout' });
    await fs.writeFile(`${TMP}/rendered/${stem}.layout.json`, await layout.text());
  }
  const montage = await deck.export({ format: 'webp', montage: true, scale: 1 });
  await fs.writeFile(`${TMP}/deck-montage.webp`, new Uint8Array(await montage.arrayBuffer()));
  const pptx = await PresentationFile.exportPptx(deck);
  await pptx.save(OUT);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
