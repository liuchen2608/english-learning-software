'use client';

import { FormEvent, KeyboardEvent, useEffect, useRef, useState } from 'react';

type View = 'home' | 'journey' | 'result' | 'library';
type GuideMessage = { id: number; role: 'assistant' | 'user'; content: string };

const initialGuideMessages: GuideMessage[] = [
  {
    id: 1,
    role: 'assistant',
    content: '你好，我是 Talk Town 的 AI 学习向导。告诉我你准备去哪里，以及最担心哪些交流场景，我会和你一起整理学习路线。',
  },
  {
    id: 2,
    role: 'user',
    content: '我要去美国旅游，想学会日常交流。',
  },
  {
    id: 3,
    role: 'assistant',
    content: '明白了。我建议先练机场、酒店和餐厅这三个高频场景。我们可以从最容易获得成功感的“咖啡店点餐”开始，你也可以继续告诉我具体担心的问题。',
  },
];

const lessonSteps = [
  { npc: 'Hi there! What can I get started for you?', zh: '你好！想点些什么？', prompt: '先告诉店员你想喝什么。', hint: '试试：Can I get a latte, please?', sample: 'Can I get a latte, please?' },
  { npc: 'Sure! What size would you like?', zh: '好的！你想要什么杯型？', prompt: '选择杯型：小杯、中杯或大杯。', hint: '试试：A medium, please.', sample: 'A medium, please.' },
  { npc: 'Would you like regular milk or oat milk?', zh: '你想要普通牛奶还是燕麦奶？', prompt: '告诉店员你的牛奶选择。', hint: '试试：Oat milk, please.', sample: 'Oat milk, please.' },
  { npc: 'That’ll be $5.50. Is card okay?', zh: '一共 5.5 美元。刷卡可以吗？', prompt: '确认支付方式，完成点单。', hint: '试试：Yes, I’ll pay by card.', sample: 'Yes, I’ll pay by card.' },
];

export default function Home() {
  const [view, setView] = useState<View>('home');
  const [goal, setGoal] = useState('');
  const [routeReady, setRouteReady] = useState(true);
  const [guideMessages, setGuideMessages] = useState<GuideMessage[]>(initialGuideMessages);
  const [lessonStep, setLessonStep] = useState(0);
  const [answer, setAnswer] = useState('');
  const [feedback, setFeedback] = useState(false);
  const [hintOpen, setHintOpen] = useState(false);
  const guideLogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!guideLogRef.current) return;
    guideLogRef.current.scrollTo({ top: guideLogRef.current.scrollHeight, behavior: 'smooth' });
  }, [guideMessages, routeReady]);

  const startLesson = () => {
    setLessonStep(0);
    setFeedback(false);
    setHintOpen(false);
    setAnswer('');
    setView('journey');
  };

  const generateRoute = (event: FormEvent) => {
    event.preventDefault();
    const message = goal.trim();
    if (!message || !routeReady) return;

    setGuideMessages((current) => [
      ...current,
      { id: Date.now(), role: 'user', content: message },
    ]);
    setGoal('');
    setRouteReady(false);

    window.setTimeout(() => {
      const reply = /咖啡|点餐/.test(message)
        ? '好，我们先从咖啡店点餐开始。我会带你完成点饮品、选大小、添加需求和付款。路线已经准备好，点击下方“开始训练”就可以进入模拟对话。'
        : /机场|值机|行李|登机/.test(message)
          ? '收到。机场最需要先练值机、托运行李和寻找登机口。我已经把这些任务加入路线，也会优先教你简短、容易开口的表达。'
          : /酒店|入住|预订/.test(message)
            ? '了解。我们会重点练确认预订、办理入住和询问酒店设施。你可以继续告诉我是否还担心押金、早餐或延迟退房。'
            : '收到，我会根据你的目的地和真实任务调整路线。你还可以告诉我出发时间、英语基础，或者最不敢开口的场景。';

      setGuideMessages((current) => [
        ...current,
        { id: Date.now() + 1, role: 'assistant', content: reply },
      ]);
      setRouteReady(true);
    }, 650);
  };

  const submitQuickPrompt = (message: string) => {
    setGoal(message);
    window.requestAnimationFrame(() => {
      const form = document.querySelector<HTMLFormElement>('.guide-composer');
      form?.requestSubmit();
    });
  };

  const handleGuideKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      event.currentTarget.form?.requestSubmit();
    }
  };

  const submitAnswer = (event: FormEvent) => {
    event.preventDefault();
    if (!answer.trim()) return;
    setFeedback(true);
  };

  const nextStep = () => {
    if (lessonStep === lessonSteps.length - 1) {
      setView('result');
      return;
    }
    setLessonStep((current) => current + 1);
    setAnswer('');
    setFeedback(false);
    setHintOpen(false);
  };

  return (
    <main className="app-shell">
      <aside className="sidebar">
        <button className="brand-mark" aria-label="返回 Talk Town 首页" onClick={() => setView('home')}>T<span>T</span></button>
        <nav aria-label="主导航">
          <button className={`nav-item ${view === 'home' ? 'active' : ''}`} onClick={() => setView('home')} aria-label="首页"><span>⌂</span><small>首页</small></button>
          <button className={`nav-item ${view === 'journey' ? 'active' : ''}`} onClick={startLesson} aria-label="场景训练"><span>◎</span><small>训练</small></button>
          <button className={`nav-item ${view === 'result' ? 'active' : ''}`} onClick={() => setView('result')} aria-label="学习记录"><span>▤</span><small>记录</small></button>
          <button className={`nav-item ${view === 'library' ? 'active' : ''}`} onClick={() => setView('library')} aria-label="知识库"><span>◇</span><small>知识库</small></button>
        </nav>
        <button className="profile" aria-label="个人设置">旅</button>
      </aside>

      {view === 'home' && (
        <section className="workspace page-enter">
          <header className="topbar">
            <div><p className="eyebrow">SATURDAY · 10:30</p><h1>早上好，准备去哪里？</h1></div>
            <div className="streak"><span>✦</span><b>连续 3 天</b></div>
          </header>

          <section className="guide-chat-card" aria-label="AI 学习向导对话">
            <header className="guide-chat-head">
              <div>
                <span className="pill">AI 学习向导</span>
                <h2>告诉我你的旅行计划</h2>
                <p>用中文聊一聊目的地、出发时间和担心的场景，我会边问边生成学习路线。</p>
              </div>
              <span className="guide-online">在线</span>
            </header>

            <div className="guide-chat-log" ref={guideLogRef} aria-live="polite">
              {guideMessages.map((message) => (
                <div className={`guide-message ${message.role}`} key={message.id}>
                  {message.role === 'assistant' && <span className="guide-avatar ai">TT</span>}
                  <div className="guide-bubble">
                    {message.role === 'assistant' && <b>Talk Town</b>}
                    <p>{message.content}</p>
                  </div>
                  {message.role === 'user' && <span className="guide-avatar traveler">我</span>}
                </div>
              ))}
              {!routeReady && (
                <div className="guide-message assistant">
                  <span className="guide-avatar ai">TT</span>
                  <div className="guide-bubble typing" aria-label="AI 正在回复"><i /><i /><i /></div>
                </div>
              )}
            </div>

            <div className="guide-quick-prompts" aria-label="快捷问题">
              {['我想先练咖啡店点餐', '我最担心机场值机', '我需要练酒店入住'].map((item) => (
                <button type="button" key={item} onClick={() => submitQuickPrompt(item)} disabled={!routeReady}>{item}</button>
              ))}
            </div>

            <form className="guide-composer" onSubmit={generateRoute}>
              <textarea
                rows={1}
                aria-label="给 AI 学习向导发送消息"
                placeholder="输入你的旅行计划或想练习的场景…"
                value={goal}
                onChange={(event) => setGoal(event.target.value)}
                onKeyDown={handleGuideKeyDown}
              />
              <button aria-label="发送消息" disabled={!goal.trim() || !routeReady}>↑</button>
              <small>Enter 发送 · Shift + Enter 换行</small>
            </form>
          </section>

          <section className="section-head">
            <div><p className="eyebrow">YOUR JOURNEY</p><h2>为你准备的旅行路线</h2></div>
            <button className="text-button">查看全部 →</button>
          </section>

          <section className="journey-grid">
            <article className="journey-card ready">
              <div className="card-number">01</div><div className="card-icon coffee">☕</div><span className="status">现在可以学</span>
              <h3>咖啡店点餐</h3><p>点饮品、选大小、提出需求并完成付款。</p>
              <div className="card-footer"><span>约 8 分钟</span><button onClick={startLesson}>开始训练 →</button></div>
            </article>
            <article className="journey-card">
              <div className="card-number">02</div><div className="card-icon airport">✈</div><span className="status muted">即将开放</span>
              <h3>机场沟通</h3><p>值机、行李托运与寻找登机口。</p><div className="progress-line"><i style={{ width: '72%' }} /></div>
            </article>
            <article className="journey-card">
              <div className="card-number">03</div><div className="card-icon hotel">◆</div><span className="status muted">即将开放</span>
              <h3>酒店入住</h3><p>确认预订、办理入住和询问设施。</p><div className="progress-line"><i style={{ width: '42%' }} /></div>
            </article>
          </section>
        </section>
      )}

      {view === 'journey' && (
        <section className="lesson-page page-enter">
          <header className="lesson-header">
            <button className="back-button" onClick={() => setView('home')}>← 返回路线</button>
            <div className="lesson-title"><span className="mini-icon">☕</span><div><p>旅行英语 · 场景 01</p><h1>咖啡店点餐</h1></div></div>
            <div className="step-count"><b>{lessonStep + 1}</b> / {lessonSteps.length}</div>
          </header>
          <div className="lesson-progress"><i style={{ width: `${((lessonStep + 1) / lessonSteps.length) * 100}%` }} /></div>

          <div className="lesson-layout">
            <aside className="mission-card">
              <p className="eyebrow">YOUR MISSION</p><h2>完成一次点单</h2>
              <ul>
                {['选择饮品', '选择杯型', '添加需求', '确认支付'].map((item, index) => (
                  <li key={item} className={index < lessonStep ? 'done' : index === lessonStep ? 'current' : ''}><span>{index < lessonStep ? '✓' : index + 1}</span>{item}</li>
                ))}
              </ul>
              <div className="mission-tip"><b>小提醒</b><p>不用追求完美语法。先让对方听懂，再慢慢说得自然。</p></div>
            </aside>

            <section className="conversation-card">
              <div className="scene-banner"><div className="barista"><span>J</span></div><div><p>JAMIE · 店员</p><b>Morning Brew Coffee</b></div><span className="live-dot">场景进行中</span></div>
              <div className="chat-area" aria-live="polite">
                <div className="npc-line"><div className="avatar">J</div><div className="bubble npc"><p>{lessonSteps[lessonStep].npc}</p><span>{lessonSteps[lessonStep].zh}</span></div></div>
                {feedback && <div className="user-line"><div className="bubble user"><p>{answer}</p></div><div className="avatar user-avatar">你</div></div>}
                {feedback && (
                  <div className="feedback-card">
                    <span className="feedback-icon">✓</span>
                    <div><b>表达清楚，对方能理解</b><p>你的回答完成了当前任务。加上 <em>please</em> 会听起来更自然、更礼貌。</p><button onClick={nextStep}>{lessonStep === lessonSteps.length - 1 ? '查看训练结果' : '继续对话'} →</button></div>
                  </div>
                )}
              </div>

              {!feedback && (
                <form className="answer-area" onSubmit={submitAnswer}>
                  <div className="coach-line"><span>✦</span><p>{lessonSteps[lessonStep].prompt}</p></div>
                  {hintOpen && <div className="hint-box"><span>可以这样说</span><button type="button" onClick={() => setAnswer(lessonSteps[lessonStep].sample)}>{lessonSteps[lessonStep].hint}</button></div>}
                  <div className="answer-input"><input autoFocus aria-label="用英文回答" placeholder="用英文回答…" value={answer} onChange={(event) => setAnswer(event.target.value)} /><button aria-label="发送回答">↑</button></div>
                  <button type="button" className="hint-button" onClick={() => setHintOpen((open) => !open)}>◎ {hintOpen ? '收起提示' : '我需要一点提示'}</button>
                </form>
              )}
            </section>

            <aside className="phrase-panel">
              <p className="eyebrow">USEFUL PHRASES</p><h3>这一步可能用到</h3>
              {[['Can I get…?', '我可以点……吗？'], ['I’d like…', '我想要……'], ['…, please.', '……，谢谢。']].map(([en, zh]) => <button key={en} onClick={() => setAnswer(en)}><b>{en}</b><span>{zh}</span></button>)}
              <div className="confidence"><span>本轮目标</span><b>先开口，再优化</b></div>
            </aside>
          </div>
        </section>
      )}

      {view === 'result' && (
        <section className="result-page page-enter">
          <header className="simple-header"><button className="back-button" onClick={() => setView('home')}>← 返回首页</button><div className="streak"><span>✦</span><b>训练已保存</b></div></header>
          <div className="result-hero"><div className="result-burst">✓</div><p className="eyebrow">MISSION COMPLETE</p><h1>你完成了一次<br />完整的咖啡店点单。</h1><p>不是背完一节课，而是已经能完成一个真实交流任务。</p><div className="result-actions"><button onClick={startLesson}>再练一次</button><button className="secondary" onClick={() => setView('home')}>返回路线</button></div></div>
          <div className="result-grid">
            <article><span className="result-label">独立完成</span><strong>4 / 4</strong><p>饮品、杯型、定制与支付</p></article>
            <article><span className="result-label">表达升级</span><strong>3</strong><p>更自然的实用表达</p></article>
            <article><span className="result-label">本次用时</span><strong>6:42</strong><p>比上次快了 48 秒</p></article>
          </div>
          <section className="takeaway"><div><p className="eyebrow">TAKE IT WITH YOU</p><h2>出发时记住这三句</h2></div><ol><li><span>01</span><b>Can I get a latte, please?</b><small>我可以点一杯拿铁吗？</small></li><li><span>02</span><b>A medium with oat milk.</b><small>中杯，加燕麦奶。</small></li><li><span>03</span><b>I’ll pay by card.</b><small>我刷卡支付。</small></li></ol></section>
        </section>
      )}

      {view === 'library' && (
        <section className="admin-page page-enter">
          <header className="admin-header"><div><p className="eyebrow">KNOWLEDGE STUDIO</p><h1>知识库工作台</h1><p>管理 Talk Town 的真实场景、表达和来源证据。</p></div><button className="primary-action">＋ 导入资料</button></header>
          <section className="metrics-grid">
            {[['已发布知识', '1,248', '+32 本周'], ['待审核', '18', '6 条高优先级'], ['检索质量', '92.4', 'Recall@20 · 96%'], ['知识版本', '08.22.3', '线上稳定']].map(([label, value, note], index) => <article key={label}><div className={`metric-dot m${index}`} /><span>{label}</span><strong>{value}</strong><small>{note}</small></article>)}
          </section>
          <section className="admin-grid">
            <article className="admin-card source-card"><div className="admin-card-head"><div><p className="eyebrow">SOURCES</p><h2>最近资料</h2></div><button>查看全部 →</button></div>
              <div className="source-table"><div className="table-row table-head"><span>资料名称</span><span>类型</span><span>状态</span><span>更新时间</span></div>
                {[['咖啡店任务专家稿 v3','DOCX','已发布','刚刚'],['菜单样本 · 美国西海岸','PDF','待审核','18 分钟前'],['常见点单错误表达','XLSX','处理中','1 小时前']].map((row, index) => <div className="table-row" key={row[0]}><span><i className={`file-icon f${index}`}>{row[1][0]}</i><b>{row[0]}</b></span><span>{row[1]}</span><span><em className={`state s${index}`}>{row[2]}</em></span><span>{row[3]}</span></div>)}
              </div>
            </article>
            <article className="admin-card pipeline-card"><div className="admin-card-head"><div><p className="eyebrow">INGESTION</p><h2>处理流水线</h2></div><span className="healthy">● 正常</span></div>
              <div className="pipeline"><div><span>01</span><b>解析</b><small>24 页完成</small></div><i /><div><span>02</span><b>清洗</b><small>2 条待确认</small></div><i /><div><span>03</span><b>切块</b><small>186 chunks</small></div><i /><div><span>04</span><b>索引</b><small>排队中</small></div></div>
            </article>
            <article className="admin-card quality-card"><div className="admin-card-head"><div><p className="eyebrow">RETRIEVAL QUALITY</p><h2>检索质量</h2></div><button>运行评测</button></div>
              <div className="quality-score"><strong>92.4</strong><span>/ 100</span></div>
              {[['Recall@20',96],['nDCG@10',89],['来源正确率',100]].map(([label, score]) => <div className="quality-row" key={String(label)}><span>{label}</span><div><i style={{ width: `${score}%` }} /></div><b>{score}%</b></div>)}
            </article>
            <article className="admin-card review-card"><div className="review-visual"><span>COFFEE MENU</span><div>Latte <b>$5.50</b></div><div>Oat milk <b>+$0.50</b></div></div><div><span className="status">需要确认</span><h2>菜单表格解析</h2><p>价格字段 OCR 置信度 94%，需要审核员确认表头与币种。</p><button>开始审核 →</button></div></article>
          </section>
        </section>
      )}
    </main>
  );
}
