# Talk Town AI 技术选型官方资料研究

> 查询日期：2026-08-22  
> 资料范围：仅使用厂商官方文档、项目官方文档或项目官方 GitHub 仓库；未使用博客测评、媒体文章或社区回答。  
> 价格口径：美元；生成模型与 Embedding 如无特别说明均为每 100 万 token。价格、模型可用区和版本会变化，采购前必须重新打开链接核价。  
> 标注规则：“官方事实”表示来源明确写出的能力；“Talk Town 建议”是基于项目规模和产品目标做出的工程判断，不是厂商标准。

## 1. 研究结论摘要

### 1.1 对 Talk Town 的直接建议

1. **当前单一咖啡店训练 MVP 不应引入 RAG。**固定场景、任务步骤、槽位和通关条件应放在版本化的结构化内容与状态机中。RAG 不能替代业务状态机，也不能保证剧情推进正确。
2. **当前 MVP 不需要 LangGraph。**一次用户回答只需完成“解析意图与槽位—依据规则判定—生成解释—状态机推进”，普通服务编排足够。以后出现可恢复的长流程、多个工具、人工审核或循环检索时再引入 LangGraph。
3. **主模型应通过 Talk Town 自有数据盲测选择，而不是按厂商宣传直接决定。**候选至少包含一个低成本模型和一个质量基准模型。建议先用 `gpt-5.6-luna`、`claude-sonnet-5`、`gemini-3.7-flash` 做同一评测集对比；如果低成本模型在关键错误率上过线，生产默认用低成本模型，困难样本再升级。
4. **未来做知识库时优先 PostgreSQL + pgvector。**Talk Town 已需要用户、场景、任务、步骤、表达、来源、审核状态等关系数据；在早期规模下复用 PostgreSQL 可减少一套基础设施。Qdrant/Pinecone 作为规模、检索功能或运维需求变化后的备选。
5. **未来 RAG 首选 2-Step RAG，不首选 Agentic RAG。**英语场景知识问答需要可预测、低延迟、可解释；LangChain 官方也将 2-Step RAG描述为简单、可预测，Agentic RAG 的延迟与控制更不稳定。
6. **Rerank 放在混合召回之后、Prompt 组装之前。**只有当离线评测证明“相关内容已召回但排序靠后”时才启用；不要因为技术栈完整而默认增加一次付费推理。
7. **文档解析建议 Docling 本地方案为默认，Unstructured 作为云端/连接器丰富的备选。**图片和表格不能只转成一段扁平文本，必须保留页码、坐标、标题、表头、单元格结构和原始文件引用。
8. **切块按知识原子而非统一字符数。**对 Talk Town，场景步骤、意图、表达、错误反馈、FAQ 都应独立成块；长叙述内容再以 250–450 token、约 15% overlap 作为首轮实验值，通过检索评测调参。

### 1.2 为什么 MVP 暂不使用 RAG

RAG 官方定义的价值是让模型在回答时获取外部知识，以缓解有限上下文与静态训练知识问题。当前 MVP 的咖啡店流程只有少量、稳定、人工可审的规则，不存在“大型外部语料无法放入上下文”的问题。[LangChain Retrieval 官方文档](https://docs.langchain.com/oss/python/langchain/retrieval)（查：2026-08-22）

因此，Talk Town 当前应把以下内容作为**权威结构化数据**而不是向量知识：

- 任务状态与允许转移；
- 每步必填槽位；
- 可接受意图与等价表达；
- 禁止推进条件；
- 提示等级；
- 评分 rubric；
- 已审核的中文解释和示例表达。

RAG 的启用门槛建议是：场景和资料增长后，无法在单个受控 Prompt 中低成本地维护；用户开始提出跨场景、开放式知识问题；或产品需要从大量已审核资料中引用依据。该判断是 Talk Town 工程建议，不是官方阈值。

---

## 2. 大模型能力与官方 API 价格

### 2.1 OpenAI

OpenAI 当前模型目录说明，GPT-5.6 系列支持文本和图片输入、文本输出，具有多语言和视觉能力；官方定位分别是 Sol 偏最高能力、Terra 平衡能力与成本、Luna 面向成本敏感和高吞吐。[OpenAI 模型目录](https://developers.openai.com/api/docs/models)（查：2026-08-22）

| 模型 | 官方定位/适用点 | 上下文与输出 | 标准价格：输入 / 缓存输入 / 输出 | Talk Town 用法判断 |
|---|---|---:|---:|---|
| `gpt-5.6-sol`（别名 `gpt-5.6`） | 最高能力档，文本、视觉、推理 | 1.05M / 128K | $4 / $0.40 / $20；官方页注明推广价至少至 2026-11-21 | 作为离线教师模型或困难样本升级，不建议全量调用 |
| `gpt-5.6-terra` | 能力/成本平衡 | 1.05M / 128K | $2 / $0.20 / $12 | 可作为高质量线上候选 |
| `gpt-5.6-luna` | 成本敏感、高吞吐 | 1.05M / 128K | $0.20 / $0.02 / $1.20 | 建议进入 MVP 主模型盲测 |

直接来源：[Sol](https://developers.openai.com/api/docs/models/gpt-5.6-sol)、[Terra](https://developers.openai.com/api/docs/models/gpt-5.6-terra)、[Luna](https://developers.openai.com/api/docs/models/gpt-5.6-luna)（均查：2026-08-22）。这些模型在单次输入超过 272K token 时存在长上下文价格倍率；Talk Town 在线请求不应接近该规模。

OpenAI 模型支持 Structured Outputs 和函数调用的事实应以所选模型详情页为准。Talk Town 必须要求模型返回 JSON Schema，例如 `intent`、`slots`、`quality_level`、`can_advance`、`feedback_zh`；但业务服务仍需二次校验，不能把模型 JSON 视为业务真值。

### 2.2 Anthropic

Anthropic 官方模型对比说明当前 Claude 支持文本和图片输入、文本输出、多语言和视觉。[Claude 模型概览](https://platform.claude.com/docs/en/about-claude/models/overview)（查：2026-08-22）

| 模型 | 官方定位/适用点 | 上下文 | 标准价格：输入 / 输出 | Talk Town 用法判断 |
|---|---|---:|---:|---|
| `claude-fable-5` | 最高通用能力、长时间 Agent | 1M | $10 / $50 | 不适合 MVP 全量调用 |
| `claude-opus-5` | 复杂 Agent、企业知识工作 | 1M | $5 / $25 | 可作为高质量离线对照 |
| `claude-sonnet-5` | 速度和能力平衡 | 1M | $2 / $10（截至 2026-08-31 的介绍价） | 建议进入主模型盲测 |
| `claude-haiku-4-5` | 高吞吐、低成本 | 200K | $1 / $5 | 可用于分类或低风险解释候选 |

缓存读取价依次为 $1、$0.50、$0.20、$0.10；5 分钟缓存写入为基础输入价格的 1.25 倍。直接来源：[Anthropic 定价](https://platform.claude.com/docs/en/about-claude/pricing)（查：2026-08-22）。

Anthropic 官方明确说明**不提供自有 Embedding 模型**，使用 Claude 并不意味着向量模型也必须来自 Anthropic；其文档指向外部 Embedding 提供方。[Anthropic Embeddings 指南](https://platform.claude.com/docs/en/build-with-claude/embeddings)（查：2026-08-22）

### 2.3 Google Gemini

Google 将 `gemini-3.7-flash` 定位为生产级工作模型，支持文本、图片、视频、音频和 PDF 输入、文本输出，输入上下文 1,048,576 token，最大输出 65,536 token。[Gemini 3.7 Flash 模型页](https://ai.google.dev/gemini-api/docs/models/gemini-3.7-flash)（查：2026-08-22）

| 模型 | 输入模态 | 标准价格：输入 / 输出 | Batch/Flex | Talk Town 用法判断 |
|---|---|---:|---:|---|
| `gemini-3.7-flash` | 文本、图片、视频、音频、PDF | $0.75 / $3.75（官方注明至 2026-12-31） | $0.375 / $1.875 | 建议进入主模型与图片理解盲测 |
| `gemini-3.5-flash-lite` | 文本、图片、视频、音频 | $0.30 / $2.50 | $0.15 / $1.25 | 成本敏感候选 |

直接来源：[Gemini API 定价](https://ai.google.dev/gemini-api/docs/pricing)（查：2026-08-22）。Google 免费层和付费层的数据使用口径不同；官方价格页说明免费层提交数据可能用于改进产品，付费层不用于该目的，因此真实用户内容不应在未完成隐私评审时进入免费层。

### 2.4 Talk Town 的模型选择标准

供应商和模型不能只按单价选择。建议使用同一套 300–500 条 Talk Town 金标样本，所有候选保持相同结构化输出字段，盲测以下硬门槛：

- 错误推进率必须为 0%（最高优先级）；
- 必填槽位抽取准确率 ≥ 98%；
- 可接受表达误拒率 ≤ 3%；
- 明显错误误接受率 ≤ 1%；
- JSON Schema 成功率 ≥ 99.9%；
- 中文解释 4/5 分及以上样本占比 ≥ 90%；
- P95 完整响应 ≤ 3 秒；若采用流式首字，则首字 P95 ≤ 1.2 秒；
- 单个完整任务模型成本满足预算。

这些数值是 Talk Town 建议的上线门槛，不是厂商官方基准。实际冻结前应用首轮真实用户数据校正。

---

## 3. Embedding 模型与维度

### 3.1 OpenAI Embedding

| 模型 | 官方能力 | 默认维度 | 标准价格 | 限制/说明 |
|---|---|---:|---:|---|
| `text-embedding-3-small` | 低成本文本 Embedding | 1,536 | $0.02 | 文本输入；适合先做成本基线 |
| `text-embedding-3-large` | OpenAI 能力最高的英文与非英文文本 Embedding | 3,072 | $0.13 | 文本输入；质量优先候选 |

两者都支持用 `dimensions` 参数缩短输出；Embedding 单输入最多 8,192 token。来源：[OpenAI Embeddings 指南](https://developers.openai.com/api/docs/guides/embeddings)、[small 模型页](https://developers.openai.com/api/docs/models/text-embedding-3-small)、[large 模型页](https://developers.openai.com/api/docs/models/text-embedding-3-large)、[Embedding API 参数](https://developers.openai.com/api/reference/ruby/resources/embeddings/methods/create)（查：2026-08-22）。

OpenAI 官方说明 `text-embedding-3-large` 可由默认 3,072 维缩短到 1,024、256 等维度，以存储与检索成本换取一定准确率；官方示例表明 256 维的 large 在其引用的 MTEB 示例中仍优于 1,536 维旧模型，但这不等于在 Talk Town 数据上必然更好。[OpenAI Embedding 发布说明](https://openai.com/index/new-embedding-models-and-api-updates/)（查：2026-08-22）

### 3.2 Google Embedding

| 模型 | 输入/输出 | 维度 | 标准价格 |
|---|---|---:|---:|
| `gemini-embedding-2` | 文本、图片、视频、音频、PDF → 向量 | 128–3,072；官方推荐档 768/1,536/3,072 | 文本 $0.20；图片 $0.45；音频 $6.50；视频 $12 |
| `gemini-embedding-001` | 文本 → 向量 | 128–3,072 | $0.15 |

Batch 为标准价 50%。`-001` 与 `-2` 的向量空间不兼容，迁移时必须重做全库 Embedding，不能混查。来源：[Gemini Embeddings](https://ai.google.dev/gemini-api/docs/embeddings)、[Gemini 定价](https://ai.google.dev/gemini-api/docs/pricing)（查：2026-08-22）。

### 3.3 Talk Town Embedding 建议

- MVP：不用 Embedding。
- 第一期知识库：以 `text-embedding-3-small` 1,536 维作为成本基线；同步抽样测试 `text-embedding-3-large` 的 1,024/1,536 维或 Google 候选。
- 只有当 Recall@20、MRR/NDCG 和跨语言查询表现显著提升时才选择更大向量；“维度更高”不是独立验收标准。
- 一旦索引上线，记录 `embedding_provider`、`embedding_model`、`dimensions`、`embedding_version`；更换模型或不兼容空间必须建新索引并双跑，禁止在同一集合中混入不同向量空间。

---

## 4. RAG 编排框架：LangGraph 与 LlamaIndex

### 4.1 LangGraph 的能力边界

官方将 LangGraph 定义为用于长时间、有状态 Agent 的**低层编排框架和运行时**，核心能力包括 durable execution、streaming、human-in-the-loop 和 persistence；它不替你抽象 Prompt 或决定 Agent 架构。[LangGraph Overview](https://docs.langchain.com/oss/python/langgraph/overview)（查：2026-08-22）

LangGraph 自带 checkpoint 持久化，可支持人工介入、会话记忆、时间回放和故障恢复。[LangGraph Persistence](https://docs.langchain.com/oss/python/langgraph/persistence)（查：2026-08-22）

LangChain 官方把 RAG 分为：

- 2-Step RAG：检索总在生成前执行，控制强、延迟更可预测；
- Agentic RAG：模型决定何时及如何检索，灵活但控制更弱、延迟可变；
- Hybrid RAG：增加查询改写、检索验证、答案验证等步骤。

来源：[LangChain Retrieval / RAG architectures](https://docs.langchain.com/oss/python/langchain/retrieval)（查：2026-08-22）。

**Talk Town 判断：**当前固定训练回合不需要 LangGraph；当后续出现“查询改写—多知识源—检索不足重试—人工内容审核—失败后恢复”的真实长流程，再引入 LangGraph。LangGraph 是编排层，不是文档解析器、向量库或自动质量保证系统。

### 4.2 LlamaIndex 的能力边界

LlamaIndex `IngestionPipeline` 可把一系列 transformations 应用于文档，缓存 node + transformation 结果，并可直接写入向量库；官方示例包含 SentenceSplitter、TitleExtractor 和 Embedding。[LlamaIndex Ingestion Pipeline](https://docs.llamaindex.ai/en/stable/module_guides/loading/ingestion_pipeline/)（查：2026-08-22）

LlamaIndex 将文档切成 `Node`，支持句子、token、语义等 Node Parser；官方示例展示 `SentenceSplitter(chunk_size=1024, chunk_overlap=20)`，这只是示例，不是通用最佳值。[LlamaIndex Node Parser](https://docs.llamaindex.ai/en/stable/module_guides/loading/node_parsers/)（查：2026-08-22）

查询后处理可做相似度阈值过滤、关键词过滤、上下文扩展、重排等；官方文档将 rerank/filter 放在 retrieval 之后、response synthesis 之前。[LlamaIndex Querying](https://docs.llamaindex.ai/en/stable/understanding/querying/querying.html)（查：2026-08-22）

LlamaIndex 旧 `QueryPipeline` 已进入 feature-freeze/deprecation，官方建议编排模块改看 Workflows。[LlamaIndex Query Pipeline](https://docs.llamaindex.ai/en/stable/module_guides/querying/pipeline/)（查：2026-08-22）

**Talk Town 判断：**如果未来需要较快搭建文档 ingestion/retrieval，可以选 LlamaIndex；若只有少量内部 Markdown/JSON，直接写明确的数据管道更容易测试。不要同时引入 LangGraph、LlamaIndex 和多个 Retriever 抽象而没有真实复杂度。

---

## 5. 向量数据库选型

### 5.1 官方能力对比

| 方案 | 官方能力 | 部署与计费入口 | Talk Town 判断 |
|---|---|---|---|
| PostgreSQL + pgvector | 默认精确近邻；HNSW、IVFFlat 近似索引；向量、halfvec、bit、sparsevec；元数据 SQL 过滤；可结合 PostgreSQL 全文检索做 hybrid search | 开源 PostgreSQL License，无独立软件使用费；自建或使用支持扩展的托管 PostgreSQL，成本是数据库基础设施 | **早期推荐**。关系数据、审计、版本、权限与向量共库，组件最少 |
| Qdrant | dense/sparse/named/multivector；metadata/payload 过滤；hybrid、RRF/DBSF、多阶段查询、ColBERT late interaction；开源与托管云 | [Qdrant Cloud Pricing](https://qdrant.tech/pricing/)：免费层 0.5 vCPU、1 GB RAM、4 GB disk；标准层按 vCPU、RAM、磁盘和备份小时计费，具体价格用计算器 | 当需要原生 dense+sparse、多向量、分布式或独立向量服务时考虑 |
| Pinecone | 托管 serverless 向量库；dense/sparse/hybrid；metadata filter；集成 Embedding 与 hosted rerank；最终一致性 | [Pinecone Pricing](https://www.pinecone.io/pricing/)；Serverless 按 read units、write units、storage 计费，Standard 有月度最低消费；具体区域单价以页面为准 | 运维人力极少、愿意接受 SaaS 与持续费用时考虑 |

pgvector 来源：[官方仓库 README](https://github.com/pgvector/pgvector) 与 [LICENSE](https://github.com/pgvector/pgvector/blob/master/LICENSE)（查：2026-08-22）。官方说明 HNSW 的速度/召回权衡优于 IVFFlat，但构建慢、内存更高；IVFFlat 构建更快、内存更低。`vector` 的 HNSW/IVFFlat 索引上限为 2,000 维，`halfvec` 为 4,000 维；因此 OpenAI 3,072 维 full vector 若使用 pgvector ANN 索引，应采用 `halfvec`、缩短维度或换存储策略。

Qdrant 来源：[Vectors](https://qdrant.tech/documentation/manage-data/vectors/)、[Hybrid Search](https://qdrant.tech/documentation/search/text-search/hybrid-search/)、[Hybrid and Multi-Stage Queries](https://qdrant.tech/documentation/search/hybrid-queries/)、[Cloud Pricing](https://qdrant.tech/pricing/)（查：2026-08-22）。Qdrant 官方说明多阶段查询可先用便宜/短向量扩大召回，再用更精确表示重打分。

Pinecone 来源：[Hybrid Search](https://docs.pinecone.io/guides/search/hybrid-search)、[Rerank Results](https://docs.pinecone.io/guides/search/rerank-results)、[Understanding Cost](https://docs.pinecone.io/guides/manage-cost/understanding-cost)、[Pricing](https://www.pinecone.io/pricing/)（查：2026-08-22）。Pinecone Serverless 查询 RU 随命名空间大小线性变化，单次最少 0.25 RU；官方也提示写入后的查询可见性是最终一致性。

### 5.2 推荐决策顺序

1. 低于约十万知识块、QPS 低、团队已有 PostgreSQL：pgvector。
2. 需要独立向量服务、原生混合/多向量和高级两阶段查询：Qdrant。
3. 不希望运维向量服务，愿意用托管 SaaS 并接受最低消费/出境与供应商依赖：Pinecone。

“十万知识块”是 Talk Town 的经验性切换参考，不是产品硬上限。真正切换标准应是：在目标并发下无法满足 P95、Recall@K 或运维成本目标。

---

## 6. Rerank：什么时候做精排

### 6.1 官方事实

Cohere Rerank 接收 query 与候选 documents，返回按语义相关度排序的结果；`rerank-v4.0-pro` 偏质量，`rerank-v4.0-fast` 偏低延迟/高吞吐，均支持多语言和半结构化数据，32K 上下文。[Cohere Rerank 模型文档](https://docs.cohere.com/docs/rerank)、[Rerank API](https://docs.cohere.com/reference/rerank)（查：2026-08-22）

Cohere 建议单请求不要超过 1,000 个候选文档。公开计费页定义一个 search unit 为一次查询最多排序 100 个文档；超过 500 token 的文档会自动切成多块并分别计数。公开页面未给出当前 PAYG 每 search unit 的美元单价，因此不能从第一方公开信息核验具体按次价格。[Cohere Pricing](https://cohere.com/pricing)（查：2026-08-22）

公开的 dedicated Model Vault 价格：Rerank 4 Fast Medium 为 $5/小时或 $3,250/月；Rerank 4 Pro Medium 同价，Large 为 $10/小时或 $6,500/月。[Cohere Model Vault Pricing](https://docs.cohere.com/docs/model-vault/standard/pricing)（查：2026-08-22）

Pinecone 官方将 rerank 描述为两阶段检索：先检索更多候选，再按 query-document 语义相关度重排并返回更小的 top-n。[Pinecone Rerank Results](https://docs.pinecone.io/guides/search/rerank-results)（查：2026-08-22）

### 6.2 Talk Town 精排位置与触发条件

推荐流程：

`query → 权限/场景 metadata filter → dense top 20 + lexical top 20 → RRF 去重 → rerank 候选 20 → top 5 → 上下文组装 → LLM`

启用 Rerank 的条件：

- Recall@20 已高，但 MRR/NDCG@5 低，说明“找到了但排得不好”；
- 同义表达与精确术语混合，融合排序不稳定；
- 生成模型输入被无关块污染，Context Precision 不达标；
- 离线 A/B 显示 rerank 对加权总分提升 ≥ 3 分，且 P95 增量 ≤ 300ms、单任务增量成本可接受。

跳过 Rerank 的条件：

- 权威内容很少，metadata filter 后候选本来就少于 8 个；
- 召回阶段根本没找到相关文档，此时 rerank 无法创造缺失候选；
- 相关块已稳定处于 top 3，增加精排没有可测收益。

数值门槛是 Talk Town 建议，需用真实集调优。

---

## 7. 文档、图片和表格解析

### 7.1 Unstructured

Unstructured 的 `partition` 会把原始文件解析成 `Title`、`NarrativeText`、`ListItem`、`Table` 等结构化 elements；官方支持 PDF、图片、Word、PowerPoint、Excel、HTML、Markdown 等多种格式。[Unstructured Partitioning](https://docs.unstructured.io/open-source/core-functionality/partitioning)、[Supported File Types](https://docs.unstructured.io/open-source/ingestion/supported-file-types)（查：2026-08-22）

PDF/图片策略包括：

- `fast`：有可提取文本时的快速解析；
- `hi_res`：布局识别，表格和图片元素提取需要此类高分辨率策略；
- `ocr_only`：使用 OCR 后按文本处理；
- `auto`：依据文件和参数选择。

官方说明 `hi_res` 对多栏、不可提取文本的文档可能存在阅读顺序困难，这种情况下可测试 `ocr_only`。[Unstructured Partitioning](https://docs.unstructured.io/open-source/core-functionality/partitioning)（查：2026-08-22）

Unstructured chunking 使用解析后的 element 与 metadata；`basic` 会在 hard max/soft max 下合并顺序元素，而 `Table` 始终隔离，不和其它 element 混合。`by_title` 能保持章节边界。[Unstructured Chunking](https://docs.unstructured.io/open-source/core-functionality/chunking)（查：2026-08-22）

### 7.2 Docling

Docling 官方项目支持 PDF、DOCX、PPTX、XLSX、HTML、Markdown、CSV、图片等输入，转为统一 `DoclingDocument`，可导出 Markdown 或结构化 JSON；支持 PDF 布局、阅读顺序、表格结构和扫描 PDF OCR。[Docling 官方仓库](https://github.com/docling-project/docling)（查：2026-08-22）

Docling CLI 可选择标准/VLM 管道、OCR 引擎、OCR 语言、`fast`/`accurate` 表格模式，并可启用图片分类、图片描述、图表数据抽取；图片可嵌入或单独导出。[Docling CLI Reference](https://github.com/docling-project/docling/blob/main/docs/reference/cli.md)（查：2026-08-22）

Docling 的 `TableItem` 可导出为 DataFrame、Markdown/HTML，并保留统一文档结构。[Docling v2 文档](https://github.com/docling-project/docling/blob/main/docs/v2.md)（查：2026-08-22）

### 7.3 Talk Town 解析选择

- 本地可控、隐私优先：Docling standard pipeline；扫描件启用 OCR；复杂图表单独走视觉模型。
- 已有大量云端连接器、希望 element 化后直接进入 ingestion：评估 Unstructured。
- 不应直接将整份 PDF 丢给通用大模型作为唯一数据管道。通用视觉模型适合补充图片语义、处理失败页和质量抽检，不负责版本、来源、去重、权限和可重复解析。

### 7.4 PaddleOCR / PP-StructureV3

PaddleOCR 官方提供通用 OCR、文档图像预处理、表格识别、版面解析、公式识别，以及 PP-StructureV3 等独立管道。[PaddleOCR/PaddleX Quick Start](https://github.com/PaddlePaddle/PaddleOCR/blob/main/docs/version3.x/paddlex/quick_start.en.md)（查：2026-08-22）

PP-StructureV3 将版面分析、OCR、可选文档预处理、表格、印章、公式与图表解析组合为结构化文档管道；官方说明其增强了多栏阅读顺序恢复、表格/公式识别、图表理解与 Markdown 转换，也支持各子模块独立训练和推理。[PP-StructureV3 Pipeline](https://github.com/PaddlePaddle/PaddleOCR/blob/main/docs/version3.x/pipeline_usage/PP-StructureV3.en.md)（查：2026-08-22）

**Talk Town 判断：**若中文/英文扫描件 OCR 是主要瓶颈，应把 PaddleOCR/PP-StructureV3 加入 Docling OCR 后端或独立解析 A/B；选择依据是项目金标集上的 CER、表格结构准确率、GPU/CPU 延迟和部署复杂度，不能仅按官方演示效果决定。Docling 更适合统一文档表示和多格式流程，PaddleOCR 更像可训练的 OCR/版面/表格能力组件，两者不是严格互斥。

### 7.5 图片处理标准（Talk Town 建议）

1. 识别 MIME、尺寸、页码和来源哈希。
2. 装饰图片直接标记 `decorative=true`，不做 Embedding。
3. 含文字图片先 OCR，保留原图坐标和 OCR 置信度。
4. 流程图、菜单、标牌等有学习价值的图片，用视觉模型生成结构化描述；描述必须链接原图与页码。
5. 对关键图片抽样人工核验，不以视觉模型描述替代原图证据。
6. OCR 字符准确率抽检 ≥ 95%；关键信息（价格、规格、否定词、单位）准确率 100%；否则进入人工复核。

Google 官方说明 Gemini 可做图片描述、分类、视觉问答、目标检测和分割，支持 URL、inline data 或 File API 输入。[Gemini Image Understanding](https://ai.google.dev/gemini-api/docs/image-understanding)（查：2026-08-22）。该能力证明“可做视觉理解”，不等于自动满足 Talk Town 的 OCR 或业务正确率。

### 7.6 表格处理标准（Talk Town 建议）

1. 表格独立成块，禁止把表格和相邻正文机械拼成同一块。
2. 保存原始表格 HTML/JSON、Markdown 展示版、caption、页码、bbox、表头层级。
3. 合并单元格必须展开明确的 row/column header 关系；每一数据单元格能追溯到行头和列头。
4. 跨页表格合并前检查表头一致性；不一致则保留为多表。
5. 表格用于检索时，除整表块外可生成“表头 + 单行/行组”的检索块，但必须链接同一 `table_id`。
6. 金标抽检要求：关键表头 100% 正确，普通单元格结构准确率 ≥ 98%，数值/单位准确率 100%。未达标进入人工复核。

上述数值是 Talk Town 数据准入标准，不是 Unstructured/Docling 的官方性能承诺。

---

## 8. 数据清洗和质量门禁

### 8.1 入库流程

`来源登记 → 文件安全/格式检查 → 原文件哈希 → 解析 → 结构保留 → 文本规范化 → 去重 → 语言/内容分类 → 质量检查 → 人工审核 → 切块 → Embedding → 索引 → 发布`

### 8.2 清洗规则（Talk Town 建议）

- 保留 raw、parsed、clean 三层，不覆盖原文；
- Unicode NFKC 规范化、统一换行和不可见字符；
- 不把展示文本强制全部转小写；检索规范化字段可另建；
- 删除重复页眉/页脚、页码和导航噪声，但保留页码 metadata；
- 精确去重用文件/内容 SHA-256；近重复用规范化文本相似度，人工确认后合并；
- 每条知识必须保留 `source_url/file_id`、`source_owner`、`license`、`published_at`、`retrieved_at`、`effective_from/to`、`review_status`；
- 自动生成的表达和反馈必须标记 `generated=true`、模型和 Prompt 版本，未经审核不能成为最高权威来源；
- 涉及真实用户对话时，先脱敏再进入分析库；姓名、邮箱、电话、支付信息和精确行程不得进入长期知识库。

### 8.3 发布门禁

- 解析成功率 ≥ 99%；
- 来源与版本 metadata 完整率 100%；
- 重复率 ≤ 1%；
- 空块、乱码块 0%；
- 所有 P0 学习内容有人工审核人和审核时间；
- 所有数值、否定条件、关键槽位与原始来源一致率 100%；
- 随机抽样内容正确率 ≥ 98%。

这些是项目验收建议，不是解析框架的官方指标。

---

## 9. 知识结构设计

### 9.1 权威层级

1. **L0 产品规则**：状态机、评分规则、安全规则，代码/版本化配置，禁止 RAG 覆盖。
2. **L1 已审核教学知识**：场景、任务、步骤、意图、槽位、表达、错误类型、解释、文化提示。
3. **L2 来源资料**：官方旅游/机场/商家说明、教材授权内容、内部专家资料，可被引用与追溯。
4. **L3 AI 生成候选**：同义表达、练习变体、反馈草稿；需自动检查和人工审核后才能晋级 L1。
5. **L4 用户行为数据**：会话、错误、提示使用、表现；与公共知识库隔离，仅用于个性化与分析。

### 9.2 核心实体

```text
LearningGoal
  └── Scenario
      └── Task
          └── Step
              ├── Intent
              ├── SlotDefinition
              ├── AcceptedExpression
              ├── ErrorPattern
              ├── FeedbackTemplate
              └── Hint

SourceDocument
  └── DocumentVersion
      └── Element
          └── Chunk

User
  └── Session
      └── Attempt
          ├── DetectedIntent
          ├── SlotValue
          ├── ErrorEvent
          └── MasteryEvidence
```

### 9.3 Chunk metadata 最小集合

```json
{
  "chunk_id": "uuid",
  "document_id": "uuid",
  "document_version": 3,
  "knowledge_type": "expression|procedure|culture|faq|table_row|image_caption",
  "scenario_id": "coffee_ordering",
  "task_id": "order_drink",
  "step_id": "choose_size",
  "language": "en|zh-CN|bilingual",
  "difficulty": "pre-A1|A1|A2",
  "region": "US",
  "source_uri": "...",
  "page": 4,
  "bbox": [0, 0, 100, 100],
  "review_status": "draft|approved|rejected|expired",
  "effective_from": "2026-08-22",
  "embedding_model": "text-embedding-3-small",
  "embedding_dimensions": 1536,
  "content_hash": "sha256:..."
}
```

---

## 10. 切块设计

### 10.1 官方资料能证明什么

LangChain 推荐一般文本先尝试 `RecursiveCharacterTextSplitter`，其逻辑是尽量保持段落、句子、词语等更大语义单位完整；官方示例使用 1,000 characters 与 200 overlap，但未称其为通用最优值。[LangChain Text Splitters](https://docs.langchain.com/oss/python/integrations/splitters/index)、[Semantic Search 示例](https://docs.langchain.com/oss/python/langchain/knowledge-base)（查：2026-08-22）

LlamaIndex 官方示例有 1,024 token / 20 overlap；Unstructured 则按 element 和标题边界切块，并始终隔离表格。这些差异本身说明框架没有统一最佳 chunk size。[LlamaIndex Node Parser](https://docs.llamaindex.ai/en/stable/module_guides/loading/node_parsers/)、[Unstructured Chunking](https://docs.unstructured.io/open-source/core-functionality/chunking)（查：2026-08-22）

### 10.2 Talk Town 首轮参数

| 知识类型 | 切块方法 | 初始大小/重叠 |
|---|---|---|
| 场景任务步骤 | 一步一个原子块，附任务和前后步骤 metadata | 通常 80–250 token，不强行补满 |
| 表达/同义句 | 同一 intent + slot 约束为一块 | 50–200 token，0 overlap |
| 错误模式与反馈 | 一个错误类型一块 | 80–250 token，0 overlap |
| FAQ | 一个 question + approved answer 一块 | 100–300 token，0 overlap |
| 长叙述/文化提示 | 按标题→段落→句子递归 | 250–450 token，约 15% overlap |
| 表格 | 整表结构块 + 表头/单行检索块 | 不跨表拆；行块保留完整表头 |
| 图片 | OCR 文本块 + 人工/模型描述块 | 与原图和 bbox 绑定 |

硬上限建议 800 token；超过时继续按语义边界拆分。不要把完整场景的多个通关条件塞进同一块，也不要为追求固定长度切断一组问答、否定条件或表头关系。

### 10.3 切块验收

- Gold query 的 Recall@20 ≥ 95%；
- top-5 中至少一个完整支持答案的块占比 ≥ 95%；
- 单块语义完整率 ≥ 98%；
- 跨块依赖导致无法理解的样本 ≤ 2%；
- 冗余上下文比例 ≤ 30%；
- 任何块均能追溯到原文页码/元素/版本。

这些是 Talk Town 首轮门槛，必须通过 chunk size × overlap × embedding × top-k 网格实验更新，不能只凭经验冻结。

---

## 11. RAG 生成流程

### 11.1 离线 Ingestion

```text
资料进入候选区
  → 来源/授权登记
  → 文件类型、病毒、大小校验
  → 文档解析（正文/标题/表格/图片/OCR/坐标）
  → 清洗与结构规范化
  → 精确/近重复检测
  → 质量评分与人工审核
  → 按知识原子切块
  → metadata 补全
  → Embedding 批处理
  → 写入新版本索引
  → 离线检索回归测试
  → 达标后原子切换为 active index
```

### 11.2 在线 2-Step RAG

```text
用户问题
  → 安全与意图分类
  → 场景/语言/地区/难度/权限过滤
  → 查询规范化；必要时做受控 query rewrite
  → dense + lexical 并行召回
  → RRF/融合与去重
  → （条件启用）Rerank
  → top context 组装与 token budget 控制
  → LLM 依据上下文生成结构化答案
  → 引用、Schema、事实支持度与业务规则校验
  → 不足则明确“资料不足”，不得用模型常识补成确定答案
  → 返回答案、来源和 trace_id
```

### 11.3 生成约束

- Prompt 明确：仅将检索内容作为事实依据；不支持的内容标记未知。
- 来源片段与用户指令分区，防止知识库中的 Prompt Injection 变成系统指令。
- 最终输出包含 `answer`、`citations[]`、`confidence`、`unsupported_claims[]`。
- 状态机推进结果由业务规则决定；RAG 只能提供解释或知识，不得直接改通关状态。
- 检索空结果、Rerank 失败、模型超时均有可观测降级路径。

---

## 12. RAG 与 AI 评测框架

### 12.1 Ragas 官方指标

Ragas 官方列出的 RAG 指标包括 Context Precision、Context Recall、Context Entities Recall、Noise Sensitivity、Response Relevancy、Faithfulness、Multimodal Faithfulness、Multimodal Relevance；也提供 Agent、自然语言比较和通用 rubric 指标。[Ragas Available Metrics](https://docs.ragas.io/en/stable/concepts/metrics/available_metrics/)（查：2026-08-22）

### 12.2 DeepEval 官方指标

DeepEval 的 RAG 检索指标包括：

- Contextual Precision：相关上下文是否排在不相关上下文前；
- Contextual Recall：是否取回支持期望答案的信息；
- Contextual Relevancy：取回内容是否与输入相关、噪声是否过多。

生成指标包括 Answer Relevancy 与 Faithfulness；Faithfulness 将输出 claims 与 retrieval context 对照。DeepEval 建议分开评估 retriever 与 generator，并支持把 chunk size、top-k、embedding、LLM 等作为实验超参数记录。[DeepEval RAG Evaluation](https://github.com/confident-ai/deepeval/blob/main/docs/guides/guides-rag-evaluation.mdx)、[Faithfulness](https://deepeval.com/docs/metrics-faithfulness)（查：2026-08-22）

### 12.3 Talk Town 建议权重（总分 100）

> 下列权重为项目建议，Ragas 与 DeepEval 均未规定统一权重。

| 层级 | 指标 | 权重 | 硬门槛 |
|---|---|---:|---:|
| 检索 | Context Recall / Recall@20 | 10 | ≥ 0.95 |
| 检索 | Context Precision / nDCG@5 | 8 | ≥ 0.85 |
| 检索 | Context Relevancy | 7 | ≥ 0.85 |
| 生成 | Faithfulness | 15 | ≥ 0.95 |
| 生成 | Answer correctness（人工金标/自定义 rubric） | 10 | ≥ 0.90 |
| 生成 | Answer relevancy | 5 | ≥ 0.90 |
| 教学 | 难度匹配与中文解释清晰度 | 10 | ≥ 4/5 |
| 教学 | 反馈可执行性 | 8 | ≥ 4/5 |
| 业务 | 状态推进正确性 | 12 | 错误推进 0% |
| 业务 | 槽位抽取与意图判断 | 7 | ≥ 98% |
| 体验 | P95 延迟 | 4 | ≤ 3 秒 |
| 运营 | 单任务 AI 成本 | 2 | 预算内 |
| 安全 | PII、越权指令和有害输出 | 2 | 严重事件 0 |

总分 ≥ 85 才可发布；同时必须满足所有硬门槛。总分不能抵消“错误推进”“来源虚构”“关键数值错误”等红线。

### 12.4 评测数据集结构

至少包含：

- 正确完整回答、部分正确、无关、中文、拼音、混合语言、拼写错误；
- 一句话包含多个槽位、修改订单、否定、反悔和重复输入；
- 英美地区差异、同义表达和礼貌程度；
- 检索同义词、精确关键词、否定条件、多跳问题、无答案问题；
- 表格查询、图片/OCR 查询、跨页信息；
- Prompt injection、要求忽略规则、索取隐私信息；
- 低质量 OCR、过期文档、冲突来源和重复版本。

模型 Judge 结果必须用人工标注子集校准；不能只让被测模型或同供应商模型给自己打分。

### 12.5 Langfuse 的角色

Langfuse 的 Scores 是存放人工标注、LLM Judge、代码检查或用户反馈结果的统一对象，可挂到 trace、observation、session 或 dataset run；支持 numeric、categorical、boolean 和 text 类型。[Langfuse Scores](https://langfuse.com/docs/evaluation/scores/overview)（查：2026-08-22）

Langfuse Datasets/Experiments 可记录 input、expected output、actual output、metadata 和 scores，并比较 Prompt、模型或管道版本。[Langfuse Experiments Data Model](https://langfuse.com/docs/evaluation/experiments/data-model)、[Experiments API](https://langfuse.com/docs/api-and-data-platform/features/experiments-api)（查：2026-08-22）

Langfuse 可开源自托管；官方自托管价格页称核心 tracing、evaluation、prompt management、datasets 等 OSS 功能可免费使用，基础设施成本由部署方承担。[Langfuse Self-host Pricing](https://langfuse.com/pricing-self-host)、[Self Hosting](https://langfuse.com/self-hosting)（查：2026-08-22）

**Talk Town 判断：**Ragas/DeepEval 用于计算评测指标，Langfuse 用于 trace、Prompt/模型版本、成本、数据集运行和评分结果的持久化与对比。Langfuse 不是另一个 RAG 算法，也不自动产生可信金标；生产环境必须脱敏，避免把原始用户对话或 PII 无限制写入观测平台。

---

## 13. 成本计算示例

### 13.1 文本对话

成本公式：

```text
单回合成本 = 输入 token / 1,000,000 × 输入单价
           + 缓存输入 token / 1,000,000 × 缓存价
           + 输出 token / 1,000,000 × 输出单价
单任务成本 = 各回合成本 + Embedding + Rerank + 解析/存储分摊
```

示例假设：一个任务 8 次模型调用，每次 800 个非缓存输入 token、150 个输出 token，不含重试、长思考、图片和工具费。

| 模型 | 估算单任务模型费 |
|---|---:|
| `gpt-5.6-luna`（$0.20/$1.20） | 约 $0.00272 |
| `claude-sonnet-5`（$2/$10） | 约 $0.0224 |
| `gemini-3.7-flash`（$0.75/$3.75） | 约 $0.00834 |

这是按名义 token 的演算，不是账单承诺。真实成本需记录 provider usage、thinking token、重试、缓存命中和地域价格后按日回算。

### 13.2 Embedding

一百万 token 文本一次性入库：

- `text-embedding-3-small`：约 $0.02；
- `text-embedding-3-large`：约 $0.13；
- `gemini-embedding-001`：约 $0.15。

Embedding API 费用通常不是小型知识库的主要成本；向量存储、文档解析、重建索引、Rerank 和生成调用更应纳入 TCO。

---

## 14. 推荐技术基线与替换条件

| 层 | MVP 基线 | 知识库阶段建议 | 替换条件 |
|---|---|---|---|
| Web | 响应式网页、简体中文 | 保持 | 不是本研究范围 |
| AI 编排 | 代码内显式状态机 | 2-Step RAG；复杂长流程再 LangGraph | 出现循环检索、人工审核、跨工具恢复 |
| 主模型 | 三家候选盲测；生产优先通过门槛的最低成本模型 | 主/备模型路由 | 质量、延迟或合规不达标 |
| 规则 | JSON Schema + 服务端状态机 | 同左 | 不允许交给 RAG/LLM 替代 |
| 文档解析 | 暂无 | Docling 本地优先，Unstructured 备选 | 解析金标质量、运维和格式覆盖 |
| Embedding | 无 | `text-embedding-3-small` 1,536 维作为基线 | Recall/nDCG 不达标再升级 |
| 向量库 | 无 | PostgreSQL + pgvector HNSW | 规模/原生 hybrid/运维指标不达标 |
| 召回 | 无 | metadata filter + dense + PostgreSQL FTS + RRF | 评测决定参数 |
| Rerank | 无 | 默认关闭；命中触发条件后 Cohere/Pinecone/本地 cross-encoder A/B | ≥3 分收益且延迟/成本过线 |
| 评测 | 状态机与回答判定金标 | Ragas/DeepEval 指标 + 产品自定义 rubric | 框架只是计算器，金标和门槛由产品负责 |
| 可观测性 | 结构化日志 + trace_id | Langfuse Cloud 或脱敏后自托管 | 需要 Prompt/模型/成本/评分跨版本对比时启用 |

---

## 15. 尚不能从官方公开资料确认的事项

1. Cohere 当前 PAYG Rerank 每 search unit 的公开美元单价：官方公开页定义了 search unit，但未显示可核验的具体单价。
2. Qdrant Standard 的统一固定美元单价：官方按区域与资源配置通过计算器报价。
3. Pinecone 具体月账单：取决于区域、RU、WU、storage、计划和最低消费，必须按预计语料/QPS用官方计算方式估算。
4. 任意框架的“最佳切块大小、最佳 top-k、最佳 overlap、最佳评测权重”：官方均没有给出适用于所有业务的数值，必须用 Talk Town 金标集实验确定。
5. 任一通用视觉模型对 Talk Town 菜单、标牌、表格 OCR 的稳定准确率：厂商能力页不能替代项目数据测试。

## 16. 官方资料入口汇总

- OpenAI：[Models](https://developers.openai.com/api/docs/models) · [Pricing](https://platform.openai.com/pricing) · [Embeddings](https://developers.openai.com/api/docs/guides/embeddings)
- Anthropic：[Models](https://platform.claude.com/docs/en/about-claude/models/overview) · [Pricing](https://platform.claude.com/docs/en/about-claude/pricing) · [Embeddings](https://platform.claude.com/docs/en/build-with-claude/embeddings)
- Google：[Models](https://ai.google.dev/gemini-api/docs/models) · [Pricing](https://ai.google.dev/gemini-api/docs/pricing) · [Embeddings](https://ai.google.dev/gemini-api/docs/embeddings) · [Image Understanding](https://ai.google.dev/gemini-api/docs/image-understanding)
- LangChain/LangGraph：[Retrieval](https://docs.langchain.com/oss/python/langchain/retrieval) · [LangGraph Overview](https://docs.langchain.com/oss/python/langgraph/overview)
- LlamaIndex：[Ingestion](https://docs.llamaindex.ai/en/stable/module_guides/loading/ingestion_pipeline/) · [Node Parser](https://docs.llamaindex.ai/en/stable/module_guides/loading/node_parsers/) · [Querying](https://docs.llamaindex.ai/en/stable/understanding/querying/querying.html)
- 向量库：[pgvector](https://github.com/pgvector/pgvector) · [Qdrant](https://qdrant.tech/documentation/) · [Pinecone](https://docs.pinecone.io/)
- Rerank：[Cohere Rerank](https://docs.cohere.com/docs/rerank) · [Cohere Pricing](https://cohere.com/pricing)
- 文档解析：[Unstructured](https://docs.unstructured.io/open-source/core-functionality/partitioning) · [Docling](https://github.com/docling-project/docling) · [PaddleOCR/PP-StructureV3](https://github.com/PaddlePaddle/PaddleOCR/blob/main/docs/version3.x/pipeline_usage/PP-StructureV3.en.md)
- 评测与观测：[Ragas Metrics](https://docs.ragas.io/en/stable/concepts/metrics/available_metrics/) · [DeepEval RAG Evaluation](https://github.com/confident-ai/deepeval/blob/main/docs/guides/guides-rag-evaluation.mdx) · [Langfuse Evaluation](https://langfuse.com/docs/evaluation/scores/overview)

> 上述所有入口最后查询于 2026-08-22。正式立项采购、上线或复核成本时，应记录当日页面快照、计费区域、API 层级和模型快照 ID。
