# Talk Town 完整 AI 产品 PRD

> 版本：v1.0  
> 状态：技术与产品联合评审稿  
> 更新日期：2026-08-22  
> 替代范围：替代此前 PRD v0.3 和 MVP 执行文档 v1.0 作为主需求基线；旧文档仅保留决策历史

## 1. 文档目标

本文档同时定义 Talk Town 的产品需求、AI 能力、RAG 知识系统、数据生产流程、技术选型、成本基线、页面设计、评测体系和验收标准，使产品、设计、算法、前后端、内容和测试团队可以基于同一份基线进入实施。

本版包含两条必须闭环的主链路：

1. **学习链路**：目标输入 → 路线 → 场景训练 → AI 反馈 → 迁移测试 → 结果。
2. **知识生产链路**：资料进入 → 解析/OCR → 清洗 → 结构化 → 切块 → 审核 → 向量化 → 检索评测 → 发布。

## 2. 产品定位与验证目标

Talk Town 帮助近期准备出境旅游、英语基础薄弱的成年人，通过 AI 驱动的真实任务训练，掌握能够立即使用的英语表达。

### 2.1 核心产品价值

用户得到的不是“学完一课”，而是：

> 我比训练前更有能力完成一个明确的海外生活交流任务。

### 2.2 本期核心验证

一次 AI 引导的咖啡店点餐训练，能否让目标用户在没有完整答案提示的等价新任务中，比训练前完成更多必要交流步骤。

### 2.3 本期同时验证的系统能力

- AI 能否正确理解不标准但可以交流的英文；
- AI 反馈是否基于已审核知识，而不是临时编造；
- 路线和场景是否只引用已发布内容；
- 文本、图片和表格资料能否进入可追溯知识库；
- 检索、精排、生成和状态推进是否能被离线评测；
- 内容人员能否通过后台完成审核、发布和回滚。

### 2.4 验证边界

本期为文字问答网页，不验证发音、真实口语压力、长期记忆保持或订阅转化。图片能力用于知识资料和菜单/标牌理解，不等同于用户拍照学习功能已经产品化。

## 3. 目标用户与使用角色

### 3.1 学习用户

- 年满 18 周岁；
- 未来 6 个月内计划或强烈考虑出境旅游；
- 自评无法独立完成英文咖啡店点餐；
- 能识别英文字母和少量常见英文词；
- 能输入简单英文单词或短句；
- 主要使用简体中文界面。

### 3.2 内部角色

| 角色 | 权限与目标 |
| --- | --- |
| 内容编辑 | 上传资料、编辑结构化知识和修正切块 |
| 内容审核员 | 核查语言、来源、版权、难度和场景真实性 |
| 知识库管理员 | 管理分类、版本、索引、发布和回滚 |
| AI 产品/算法人员 | 调试检索、Prompt、模型路由和评测集 |
| 数据分析人员 | 查看学习、检索、质量和成本指标 |
| 系统管理员 | 管理角色、配置、密钥引用和审计日志 |

内容编辑不能直接把未审核内容发布到线上索引；发布至少需要审核员批准。

## 4. MVP 范围

### 4.1 P0 学习功能

1. 中文学习目标输入与 AI 结构化确认；
2. 基于已发布场景目录生成旅行学习路线；
3. 咖啡店点餐场景介绍与任务初始化；
4. 无提示基线任务；
5. AI 引导的 NPC 文字问答；
6. 四级回答判定和三级提示；
7. 无提示迁移任务；
8. 训练前后结果与关键表达回顾；
9. 匿名会话、进度恢复、记录清除；
10. 学习、AI、RAG 和成本埋点。

### 4.2 P0 知识与 RAG 功能

1. 知识来源登记和文件上传；
2. PDF、DOCX、PPTX、XLSX、CSV、HTML、Markdown、PNG、JPG 的解析；
3. 扫描件和图片 OCR；
4. 表格结构提取；
5. 数据清洗、去重、分段和元数据标注；
6. 场景知识结构编辑；
7. Chunk 预览、合并、拆分和禁用；
8. Dense + Sparse 混合检索；
9. 候选结果 Rerank；
10. 检索调试与评测集管理；
11. 草稿索引、审核、发布、版本和回滚；
12. 来源、版本、引用和审计追踪。

### 4.3 P1

- 语音对话和发音评分；
- 机场、酒店、购物等完整可训练场景；
- 跨设备账户；
- 长期学习 Memory；
- 动态难度和针对性练习；
- 订阅与付费；
- 用户直接拍照识别菜单；
- 通用 Agent 自主规划。

## 5. 总体技术选型

### 5.1 选型结论

| 层 | 本期选择 | 选择理由 |
| --- | --- | --- |
| 学习端与管理端 | Next.js + React + TypeScript | 同一技术栈支持响应式学习端和知识后台，服务端渲染与 API 集成成熟 |
| UI | Tailwind CSS + 可访问组件库 | 快速建立一致的移动端与后台界面；组件必须满足键盘与对比度要求 |
| AI/业务后端 | Python + FastAPI | 适合模型 SDK、解析、评测和异步任务生态；接口契约明确 |
| 异步任务 | Redis + Celery | 文档解析、OCR、Embedding、重建索引和批量评测脱离在线请求 |
| 业务数据库 | PostgreSQL | 用户、会话、知识实体、版本、权限和审计的系统事实源 |
| 向量数据库 | PostgreSQL + pgvector HNSW | 复用已有关系库保存知识、版本、权限和向量；早期组件最少、可事务化和完整重建 |
| 对象存储 | S3 兼容存储 | 保存原文件、页面图片、解析产物和导出报告 |
| RAG 框架 | LlamaIndex，仅用于摄取和检索组件 | 提供文档、Node、摄取管线和 Retriever 抽象；业务状态机不交给框架控制 |
| 在线业务编排 | 自研显式服务 + 确定性状态机 | 学习完成条件必须可测试、可审计，不能由自由 Agent 决定 |
| 文档解析 | Docling 为主 | 统一处理多种办公文档、PDF、布局和表格结构 |
| OCR | Docling OCR 管线；PaddleOCR 作为低质量扫描件补充 | 先保留布局，再对低置信页面补充 OCR |
| 生成模型 | GPT-5.6 Luna 默认；GPT-5.6 Terra 升级 | 默认低成本高频调用，复杂歧义、内容审核和低置信视觉升级到更强模型 |
| Embedding | `text-embedding-3-small`，默认 1536 维 | 成本低，支持维度控制；先用默认维度建立基线 |
| Rerank | Cohere Rerank 4 Fast，Feature Flag 默认关闭 | 组件已选；只有离线评测证明排序收益达到门槛后才在线启用，避免无收益增加成本和延迟 |
| 可观测性 | OpenTelemetry + Langfuse 或等价自托管追踪 | 记录模型、Prompt、检索、延迟、Token、成本和反馈 |

### 5.2 为什么不把 LangGraph 作为 RAG 主框架

当前核心是确定的摄取、检索、生成和状态推进，不需要自主 Agent 循环。LangGraph 适合未来多工具、多分支、可恢复 Agent 工作流，但本期使用会增加状态边界。若未来加入“自动收集资料—多角色审核—主动修复知识缺口”，再单独评估。

### 5.3 RAG 框架决策矩阵

| 方案 | 文档摄取 | 检索组件 | Agent 编排 | 本期结论 |
| --- | --- | --- | --- | --- |
| LlamaIndex | 强；有 IngestionPipeline、Node 和转换缓存 | 强；支持 Retriever 与后处理 | 有 Workflows，但不是本期重点 | **选择**，只用于摄取和检索 |
| LangChain/LangGraph | LangChain 可检索；LangGraph 偏有状态 Agent | 可组合 | 强；适合 durable execution、HITL 和长流程 | 本期不选，未来复杂 Agent 再评估 |
| 完全自研 | 完全可控 | 完全可控 | 完全可控 | 简单业务规则自研；不重复造解析/Node 抽象 |

### 5.4 向量数据库决策矩阵

| 方案 | 优点 | 代价 | 本期结论 |
| --- | --- | --- | --- |
| PostgreSQL + pgvector | 与知识实体、版本、权限同库；支持精确检索、HNSW/IVFFlat 和 SQL 过滤；无独立软件费 | 混合/RRF 需应用层组合；超大规模需额外调优 | **选择** |
| Qdrant | 原生 dense/sparse、多向量、RRF、过滤和多阶段查询 | 增加独立基础设施与数据一致性边界 | 当原生混合能力或规模成为瓶颈时迁移 |
| Pinecone | 托管 Serverless，运维少，支持 hybrid 与 hosted rerank | SaaS 成本、最低消费、数据地域和供应商依赖 | 不作为本期默认 |

PostgreSQL 保存结构化事实、Chunk 和向量，原文件仍在对象存储。初期使用 pgvector HNSW + PostgreSQL 全文检索，在应用层执行 RRF。满足任一条件时启动 Qdrant 迁移评估：Chunk 超过约 10 万且目标并发下 P95 不达标；需要原生多向量/late-interaction；或混合检索运维复杂度明显高于独立服务。10 万是项目评估触发点，不是 pgvector 官方硬上限。

## 6. 大模型选择

### 6.1 模型职责拆分

| 任务 | 默认模型 | 升级条件 |
| --- | --- | --- |
| 目标解析 | GPT-5.6 Luna，低推理 | Schema 连续失败或目标歧义 |
| 路线说明生成 | GPT-5.6 Luna | 多约束冲突或低置信 |
| 用户回答判定 | GPT-5.6 Luna，低推理、结构化输出 | 置信度低、否定/修改/多意图冲突 |
| NPC 台词 | GPT-5.6 Luna，无/低推理 | 通常不升级，失败用模板 |
| 中文纠错 | GPT-5.6 Luna | 检索证据冲突或复杂语言解释 |
| 结果总结 | GPT-5.6 Luna | 通常不升级 |
| 图片语义理解 | GPT-5.6 Terra | OCR 无法表达图中关系时调用 |
| 内容结构化与审核建议 | GPT-5.6 Terra | 离线任务，可使用批处理 |
| 评测争议裁决 | GPT-5.6 Terra + 人工 | 不允许仅由另一个模型最终裁决高风险错误 |

### 6.2 选择方法，而不是只看榜单

使用 Talk Town 自建金标集进行候选模型 Bake-off，权重如下：

| 维度 | 权重 | 测量方式 |
| --- | ---: | --- |
| 回答判定与槽位准确性 | 30% | 与人工金标比较 |
| Groundedness/不编造 | 20% | 检索证据支持率与人工复核 |
| 初学者反馈质量 | 15% | 双人盲评 |
| 结构化输出稳定性 | 10% | Schema 成功率 |
| 中文解释与英文自然度 | 10% | 内容专家盲评 |
| P95 延迟 | 10% | 真实服务压测 |
| 单次任务成本 | 5% | 实际 Token 和调用费用 |

质量硬门槛未通过的模型，即使综合成本更低也不能成为默认模型。

### 6.3 模型切换规则

- 默认调用 Luna；
- 输出 Schema 失败后使用同模型重试一次；
- 置信度低于校准阈值、判定与确定性规则冲突或检测到复杂否定/修改时升级 Terra；
- Terra 失败时不继续升级无限调用，进入模板或人工标记降级；
- 模型 ID、Snapshot/版本、推理强度和 Prompt 版本均写入调用日志；
- 生产模型别名切换必须先跑全量离线回归。

## 7. 模型与系统成本

### 7.1 官方价格基线

以下均为 2026-08-22 查询到的公开标价，单位为美元/百万 Token；采购、地区、缓存、Batch、税费和后续调价可能改变实际费用：

| 模型 | 输入 | 缓存输入 | 输出 | 用途判断 |
| --- | ---: | ---: | ---: | --- |
| GPT-5.6 Luna | $0.20 | $0.02 | $1.20 | 本期默认候选 |
| GPT-5.6 Terra | $2.00 | $0.20 | $12.00 | 复杂请求和离线审核 |
| GPT-5.6 Sol | $4.00 | $0.40 | $20.00 | 推广价至少至 2026-11-21；本期无常规使用必要 |
| Gemini 3.7 Flash | $0.75 | — | $3.75 | 生产级跨厂商主模型对照；该价格有效期以官方页为准 |
| Gemini 3.5 Flash-Lite | $0.30 | $0.03 | $2.50 | 跨厂商低成本备选 |
| Claude Haiku 4.5 | $1.00 | $0.10 | $5.00 | 候选对照模型 |
| Claude Sonnet 5 | $2.00 | $0.20 | $10.00 | 强模型对照 |
| `text-embedding-3-small` | $0.02 | — | — | 文本向量化 |

来源见第 22 节。价格只能作为预算输入，最终选型以自建评测为准。

### 7.2 单次完整学习任务估算

预算模型假设：

- 目标与路线调用 2 次；
- 基线、引导、迁移和总结合计约 15 次生成/判定调用；
- 总输入约 21,000 Token；
- 总输出约 2,100 Token；
- 默认使用 Luna，不含图片和极端重试。

估算：

```text
Luna 输入：0.021 × $0.20 = $0.0042
Luna 输出：0.0021 × $1.20 = $0.00252
基础生成成本约：$0.00672 / 完整任务
```

考虑少量 Terra 升级、Embedding、Rerank、失败重试和价格波动后，文字 MVP 的模型预算目标设为：

- **正常目标：≤ $0.02 / 完整任务**；
- **告警线：> $0.03 / 完整任务**；
- **阻断线：连续 7 天 P95 > $0.05 / 完整任务且无质量收益**。

如果全部调用 Terra，同样 Token 假设约为 $0.0672/任务，不能作为默认路线。

### 7.3 知识摄取成本

- `text-embedding-3-small` 官方标价为 $0.02/百万 Token；1000 万 Token 全量向量化的模型费用约 $0.20，不含解析、OCR、存储和重建作业成本。
- OCR 和图片语义理解按实际页面/图像 Token 计费，必须通过 100 页代表性样本测量，不能用文本 Token 直接外推。
- Rerank 4 的 API 按 Search 计费；一个 Search 最多包含 100 个待排文档，超长文档可能拆分计数。生产价格在采购前从 Cohere 控制台或合同确认。
- 开发环境 PostgreSQL/pgvector、对象存储、Redis 和可观测性预算建议合计 $100–300/月；这是内部预算区间，不是供应商报价。只有触发迁移门槛后，才单独测算 Qdrant 资源费用。

### 7.4 成本控制

- 固定系统指令使用 Prompt Cache；
- 每轮只发送结构化会话状态和必要最近对话；
- 场景包一次检索、会话内缓存，不在每轮重复全库搜索；
- 离线摄取与全量评测使用 Batch 或低优先级处理；
- 固定状态判断、排序和完成条件不用大模型；
- 按模型、功能、用户会话记录 Token、延迟、失败和美元成本。

## 8. 知识来源与合规

### 8.1 允许来源

按优先级使用：

1. Talk Town 自有、由英语内容专家编写并审核的场景任务；
2. 获得明确授权的出版社、教师或合作机构内容；
3. 明确开放许可的教育资源；
4. 政府、机场、交通、旅游管理等官方公开资料，用于流程和事实核验；
5. 品牌或服务机构的官方页面，用于核对真实服务流程，使用前确认条款；
6. 用户或合作方上传且声明拥有处理权限的资料。

### 8.2 禁止来源

- 未授权抓取付费课程、题库、词典或教材全文；
- 来源、许可或发布日期无法确认的转载内容；
- 将模型生成内容当作事实来源再次入库；
- 未经审核直接把搜索引擎摘要作为正式知识；
- 含有不必要个人信息、账号密钥或内部机密的文件。

### 8.3 来源元数据

每个 SourceDocument 必须保存：

- `source_id`、标题、发布者、原始 URL 或文件；
- 来源类型与所有者；
- 获取日期、发布日期和适用地区；
- 许可类型、使用限制和授权凭证引用；
- 文件 MIME、大小和 SHA-256；
- 语言、页数、解析器及版本；
- 审核人、审核时间、有效期；
- 当前状态和替代版本。

缺失来源或使用权限字段的内容不得进入 Published 索引。

## 9. 知识结构设计

### 9.1 领域层级

```text
Domain（出境旅行）
  → Journey（出发、抵达、住宿、餐饮、购物）
    → Scene（咖啡店）
      → Task（完成一次点餐）
        → Step（饮品、规格、定制、支付）
          → Intent（表达想要某饮品）
            → Slot（drink=latte）
            → Expression（A latte, please.）
            → Variant（Can I get a latte?）
            → ErrorPattern（Latte. / I want latte.）
            → FeedbackRule（可理解、如何优化）
```

与任务并列的知识类型：

- `CultureNote`：礼貌、习惯和地区差异；
- `ProcessFact`：机场、酒店等实际流程；
- `VocabularyItem`：词义、用法、同义表达；
- `DialogueExample`：完整但受控的示例对话；
- `AssessmentItem`：基线、训练和迁移任务；
- `Asset`：图片、菜单、标牌、音频或附件；
- `SourceDocument`：证据和许可来源；
- `Chunk`：只服务检索的派生单元，不是业务事实源。

### 9.2 事实源原则

- PostgreSQL 中的结构化知识实体是业务事实源；
- 原文件和解析产物保存在对象存储；
- PostgreSQL/pgvector 中的 Chunk、全文检索字段与向量均是可重建索引；若后续迁移到 Qdrant，Qdrant 同样只作为派生检索索引，不成为业务事实源；
- 删除或修改业务实体后必须生成新版本并重建受影响索引；
- 不允许只在向量库里手改内容而不回写事实源。

### 9.3 生命周期

```text
draft → parsed → needs_review → approved → indexed_staging
      → evaluation_passed → published → deprecated/rolled_back
```

发布采用版本化别名切换；新索引未通过评测时不能覆盖线上版本。

## 10. 数据摄取、清洗与解析

### 10.1 摄取流程

```text
登记来源与权限
  → 文件安全/MIME/大小校验
  → SHA-256 精确去重
  → 版面解析
  → OCR/表格/图片提取
  → 文本规范化与噪声清理
  → 结构化知识抽取
  → 语义去重与质量评分
  → 人工审核
  → 切块与元数据
  → Embedding/稀疏索引
  → Staging 检索评测
  → 发布
```

### 10.2 通用清洗标准

- 保留原文件和不可变解析快照；清洗不覆盖原始内容；
- 统一 Unicode、空白、换行和可确认的全半角字符；
- 修复跨行断词，但不合并真实段落；
- 去除重复页眉、页脚、页码和水印噪声；
- 保留标题层级、列表、段落、表格、图片与页码映射；
- 识别文档语言；中英混排不能只保留其中一种；
- 精确重复使用 SHA-256；近重复使用规范化文本指纹和相似度复核；
- 检测个人信息、密钥模式和异常脚本；命中后隔离而不是自动发布；
- 不用大模型“润色”原始证据文本；模型生成的摘要必须与原文分字段保存。

### 10.3 清洗验收

| 项目 | 标准 |
| --- | --- |
| 原文件可追溯 | 100% Chunk 能定位 source/version/page/section |
| 数字文本提取 | 人工标注样本字符准确率 ≥ 98% |
| OCR 文本 | 英文字符准确率 ≥ 95%，中文字符准确率 ≥ 93% |
| 页眉页脚去除 | 抽检误删正文率 ≤ 1% |
| 重复 Chunk | 发布索引近重复率 ≤ 1% |
| 个人信息/密钥 | 已知测试样本召回率 100%，命中内容必须隔离 |
| 孤立 Chunk | 0；每个 Chunk 必须有合法父实体和来源 |

阈值应使用 Talk Town 自建解析金标集测量，不能只使用解析器自报 confidence。

## 11. 图片识别

### 11.1 处理分层

1. **版面检测**：确定图片、文本块、表格和标题位置；
2. **OCR**：提取图片中的中英文、价格、规格和单位；
3. **结构恢复**：保留坐标、阅读顺序和图片所在页；
4. **语义理解**：仅当图片关系无法由 OCR 表达时，调用多模态模型生成结构化描述；
5. **人工复核**：菜单价格、过敏原、支付标志等影响任务的信息必须审核；
6. **派生知识**：生成 Asset、OCRBlock、Caption 和关联实体，不覆盖原图。

### 11.2 图片输出结构

```json
{
  "asset_id": "asset_123",
  "source_id": "source_123",
  "page": 4,
  "bbox": [120, 80, 960, 1240],
  "ocr_text": "Oat milk + $0.50",
  "caption": "菜单显示燕麦奶需要加价 0.50 美元",
  "entities": [
    {"type": "customization", "value": "oat_milk"},
    {"type": "price", "value": 0.5, "currency": "USD"}
  ],
  "ocr_confidence": 0.94,
  "review_status": "approved"
}
```

### 11.3 图片验收

- 文字、价格、小数点、货币符号和过敏原抽检字段准确率 ≥ 95%；
- OCR 低于 0.85、解析冲突或包含关键数字时进入人工审核；
- 图像语义描述必须引用 `asset_id` 和页面，不得生成图中不存在的信息；
- 图片删除或替换后，其派生 Chunk 必须失效并重建。

## 12. 表格处理

### 12.1 处理原则

- 优先读取原生 XLSX/CSV 单元格，不先转成图片 OCR；
- PDF 表格需恢复行列、表头、合并单元格和跨页关系；
- 保存原始单元格值、显示值、公式和 Sheet 名；
- 表头是语义的一部分，每个表格 Chunk 都重复必要表头；
- 不把一行数据拆到两个 Chunk；
- 合并单元格无法确定含义时进入人工复核。

### 12.2 表格标准化结构

```json
{
  "table_id": "table_123",
  "source_id": "source_123",
  "sheet_or_page": "Menu/4",
  "headers": ["Item", "Size", "Price"],
  "rows": [
    ["Latte", "Large", "$5.50"]
  ],
  "footnotes": [],
  "review_status": "approved"
}
```

### 12.3 表格验收

| 指标 | 标准 |
| --- | --- |
| 普通单元格结构与值准确率 | ≥ 98% |
| 表头映射准确率 | ≥ 98% |
| 行列顺序错误率 | ≤ 1% |
| 关键数字/货币/单位准确率 | 100%，上线知识须人工确认 |
| 跨页表关联 | 金标样本正确率 ≥ 95% |

## 13. 切块策略

### 13.1 原则

结构化的 Scene、Task、Step、Intent、Expression 不按固定 Token 暴力切割，而以业务实体为原子单元。只有长篇来源文档才使用层级感知的 Token 切块。

### 13.2 各类内容标准

| 内容类型 | Child Chunk | Parent Context | 重叠 |
| --- | --- | --- | --- |
| 长篇说明/政策 | 300–600 Token，硬上限 800 | 600–1200 Token | 60–100 Token |
| 任务步骤/意图 | 100–300 Token，一个完整意图 | 完整 Task | 不重叠 |
| 表达/错误模式 | 50–200 Token，一个知识原子 | 所属 Step | 不重叠 |
| 对话示例 | 200–500 Token，不拆断一轮问答 | 完整 Dialogue | 非必要不重叠 |
| 表格 | 10–25 行且 ≤ 600 Token | 完整表/章节摘要 | 每块重复表头 |
| 图片区域 | OCR + Caption ≤ 300 Token | 页面/章节摘要 | 不重叠 |

### 13.3 Chunk 必备字段

- `chunk_id`、`parent_id`、`source_id`、`source_version`；
- domain、journey、scene、task、step、intent；
- language、difficulty、region；
- title_path、page、bbox/table_id；
- content_type、raw_text、search_text；
- license、access_scope、review_status；
- parser_version、chunker_version、embedding_model；
- created_at、published_at、valid_from、valid_to。

### 13.4 Search Text 生成

向量化字段使用专门的 `search_text`，组合必要层级和同义信息，例如：

```text
场景：咖啡店点餐
步骤：选择杯型
意图：表达大杯
英文：A large, please. / Can I get a large?
中文：我要大杯。
常见非标准表达：big one
```

原始证据与 `search_text` 分开保存。`search_text` 可以重建，不能反向覆盖来源。

### 13.5 切块质量验收

- 100% Chunk 不跨越两个无关任务意图；
- 100% 表格 Chunk 保留表头；
- 100% Chunk 有来源、版本和权限元数据；
- 人工抽检“单 Chunk 可独立理解”合格率 ≥ 98%；
- 检索金标集 Recall@20 未达 95% 时，优先检查切块和元数据，不直接堆大模型。

## 14. RAG 检索与生成流程

### 14.1 什么时候调用 RAG

| 场景 | 是否调用 | 原因 |
| --- | --- | --- |
| 生成学习路线 | 是 | 只能推荐已发布、与目标匹配的场景 |
| 初始化场景 | 是，一次 | 加载完整且版本固定的任务包 |
| 每轮固定状态推进 | 否 | 使用会话缓存的任务包和状态机 |
| 用户回答纠错 | 条件调用 | 当前任务包不足或需要错误模式/表达证据时检索 |
| 文化/流程追问 | 是 | 需要来源与适用地区 |
| 结果总结 | 通常否 | 使用真实会话记录和任务包 |
| 内容编辑预览 | 是 | 检查新内容能否被正确召回 |

### 14.2 在线流程

```text
请求进入
  → 意图分类与查询规范化
  → 权限、语言、地区、场景、发布版本过滤
  → pgvector Dense Top 30 + PostgreSQL FTS/BM25 类词法 Top 30
  → RRF 合并、去重，保留最多 40 个候选
  → 规则预筛到 20 个候选
  → （满足启用门槛时）Rerank 精排
  → 选择 Top 5–8，Context 总量 ≤ 2400 Token
  → 生成结构化回答
  → 来源、Schema、状态与安全校验
  → 输出/降级
  → 保存检索 Trace、引用、版本、延迟和成本
```

### 14.3 Rerank 何时精排

Rerank 位于“高召回初检之后、上下文组装之前”。它不对全库执行，也不在摄取阶段执行。

候选参数：

- Dense 和 Sparse 各取 Top 30；
- RRF 合并后最多 40；
- 元数据、去重和最低分过滤后取前 20 给 Reranker；
- Reranker 返回 Top 8；
- Context Builder 根据来源多样性、父子关系和 2400 Token 上限选择最终 5–8 个。

Rerank 不是默认强制链路。Feature Flag 的启用条件必须同时满足：

- Recall@20 已达标，但 nDCG/MRR 或 Context Precision 未达标，证明问题是排序而不是召回；
- 相比“pgvector dense + FTS + RRF”，离线加权总分提升 ≥ 3 分；
- P95 增量延迟 ≤ 300ms；
- 单次检索增量成本符合预算；
- 无来源、权限或版本错误增加。

跳过精排的条件：

- 使用明确 `task_id/step_id/version` 精确加载任务包；
- 初检后只有不超过 5 个合格候选；
- 降级模式要求低延迟且当前任务包足以回答。

不能因为 Rerank 分数高而绕过权限、发布状态或来源有效期过滤。

### 14.4 Query 构造

查询由结构化上下文生成，不直接把整段聊天当查询：

```json
{
  "user_query": "big one",
  "normalized_query": "咖啡店点餐 选择大杯 big one large",
  "scene": "coffee_ordering",
  "step": "choose_size",
  "intent": "select_size",
  "language": ["en", "zh-CN"],
  "difficulty": "beginner",
  "region": "US",
  "knowledge_version": "2026.08.1"
}
```

### 14.5 Context 组装

- 优先选当前 Scene/Task/Step 的直接知识；
- 同一 Parent 下多个 Child 命中时合并 Parent，避免碎片堆积；
- 最多两条 Culture/ProcessFact，防止事实说明压过训练反馈；
- 来源冲突时不静默选择，使用优先级、适用地区和有效期；仍冲突则返回保守说明并标记审核；
- 用户可见回答不一定展示学术式引用，但后台必须保存 `source_id/chunk_id/version`；文化或流程事实应提供可查看来源。

### 14.6 生成与校验

生成模型必须返回结构化对象，至少包含：

- 回答文本；
- 使用的知识类型；
- 引用 Chunk；
- 是否充分支持；
- 是否需要澄清；
- 任务状态建议；
- 安全标签。

后置校验包括：

1. JSON Schema；
2. 引用 Chunk 是否确实在本次检索结果；
3. 关键事实是否能在证据中定位；
4. 状态建议是否满足状态机；
5. 难度和长度限制；
6. 内容安全；
7. 失败时使用已审核模板或明确“不确定”。

## 15. 页面设计

### 15.1 学习端页面

| 编号 | 页面 | 关键区域 | 主要状态 | 验收重点 |
| --- | --- | --- | --- | --- |
| U-01 | 首页/目标输入 | 价值说明、目标输入、示例 | 空、输入中、越界、提交中 | 中文可理解，不要求先选课程 |
| U-02 | 目标确认 | AI 摘要、目的地、修改 | 正常、低置信、解析失败 | 不虚构缺失信息 |
| U-03 | 学习路线 | 场景卡、能力结果、开放状态 | 生成中、成功、降级 | 只把已发布内容标成可学习 |
| U-04 | 场景说明 | 角色、任务、成功条件、来源版本 | 可开始、内容失效 | 用户知道要完成四项意图 |
| U-05 | 基线任务 | NPC、输入框、进度 | 等待、判定中、网络失败 | 不泄露答案和纠错 |
| U-06 | AI 引导训练 | NPC、中文辅助、输入、反馈、提示 | 四级判定、三级提示 | 反馈基于任务包/RAG证据 |
| U-07 | 迁移任务 | 新变体 NPC、输入 | 等待、判定、异常 | 与基线同评分且不提示答案 |
| U-08 | 结果页 | 前后对比、能力项、关键表达 | 独立/辅助、数据不足 | 不宣称口语能力 |
| U-09 | 设置与数据 | 匿名说明、清除记录 | 确认、成功、失败 | 用户可清除当前标识数据 |

### 15.2 核心学习页布局

移动端从上到下：

1. 场景标题、当前步骤和退出入口；
2. NPC 角色、英文台词；
3. 可折叠中文辅助；
4. 对话历史，默认只展示最近必要轮次；
5. 当前反馈卡；
6. 英文输入框与提交按钮；
7. 分级提示区域；
8. 网络、AI 降级和恢复状态。

桌面端保持同一信息顺序，不新增与学习无关的侧栏。主要行动每屏只有一个。

### 15.3 学习页验收

- 375px 宽度下不出现横向滚动；
- 用户提交后 300ms 内出现处理状态；
- 重复点击只生成一个 Turn；
- 刷新后恢复最近确认状态；
- `retry_required` 不推进进度；
- 中文辅助不默认展示完整答案；
- 键盘可完成全部主链路；
- 错误状态不能只依赖颜色。

## 16. 知识库管理页面

### 16.1 页面清单

| 编号 | 页面 | 核心能力 |
| --- | --- | --- |
| K-01 | 知识库概览 | 来源数、待审核、解析失败、Chunk、索引版本、质量与成本 |
| K-02 | 来源管理 | 搜索、筛选、来源/许可/有效期、上传和停用 |
| K-03 | 导入向导 | 文件、URL、来源权利、语言、地区、分类、解析配置 |
| K-04 | 解析审阅 | 原页面与解析结果并排，查看 OCR、表格、图片和置信度 |
| K-05 | 知识结构编辑 | 编辑 Domain→Scene→Task→Step→Intent→Expression |
| K-06 | Chunk 管理 | 预览、来源定位、合并、拆分、禁用、重建 Embedding |
| K-07 | 检索调试台 | 输入 Query、过滤条件，查看 pgvector Dense/FTS/RRF/Rerank 各阶段 |
| K-08 | 评测中心 | 数据集、运行记录、维度分数、失败样本和回归对比 |
| K-09 | 版本与发布 | Staging 版本、评测门槛、审批、发布、回滚 |
| K-10 | Trace 与成本 | 用户请求链路、引用、模型、Token、延迟、费用和错误 |
| K-11 | 权限与审计 | 角色、操作记录、导出、删除和敏感动作审批 |

### 16.2 K-03 导入向导

步骤：

1. 选择文件或填写 URL；
2. 填写发布者、许可、授权凭证和适用地区；
3. 选择知识分类与目标语言；
4. 预估页数、图片、表格和处理成本；
5. 提交异步处理；
6. 展示各阶段进度和失败原因。

验收：缺失来源权利、文件类型不支持、文件损坏或命中敏感扫描时不能进入自动发布。

### 16.3 K-04 解析审阅

三栏布局：

- 左：原 PDF/图片/Sheet；
- 中：结构化正文、表格、图片区域；
- 右：元数据、置信度、问题和审核动作。

审核员可纠正文本、表头、阅读顺序和图片说明；每次修改保留差异和操作者。

### 16.4 K-06 Chunk 管理

必须展示：

- Chunk 正文与 Token 数；
- Parent/Child 和相邻 Chunk；
- 来源页、标题路径、表格或图片定位；
- 元数据、Embedding 模型和状态；
- 预计命中的测试 Query；
- 合并、拆分、禁用、重新向量化。

手工修改 Chunk 必须同步修改结构化事实源或标记为派生覆盖，不能制造无法追溯的“幽灵知识”。

### 16.5 K-07 检索调试台

调试台逐阶段展示：

1. 原始 Query 与规范化 Query；
2. 元数据过滤；
3. Dense Top-K；
4. Sparse Top-K；
5. RRF 合并；
6. Rerank 前后排名和分数；
7. 最终 Context；
8. 生成结果、引用和后置校验；
9. 各阶段耗时和成本。

可将当前 Query 和人工相关性标注保存为评测集样本。

### 16.6 知识后台验收

- 未审核内容无法进入线上索引；
- 发布必须记录版本、审批人和评测报告；
- 回滚后 5 分钟内所有新请求使用目标旧版本；
- 任意线上回答可定位到模型、Prompt、Chunk、来源和知识版本；
- 权限越权请求返回 403 并记录审计；
- 解析、Embedding 或索引失败可以从失败阶段重试，不重复整条流水线；
- 删除来源后，其派生实体和 Chunk 被标记失效并触发索引更新。

## 17. 评测体系与权重

### 17.1 评测集

上线前建立四类版本化金标集：

| 数据集 | MVP 最低规模 | 内容 |
| --- | ---: | --- |
| Retrieval Gold | 200 Query | 每个 Query 的相关/不相关 Chunk、必要过滤条件 |
| Turn Evaluation | 300 Turn | 四级判定、意图、槽位、是否推进、推荐表达 |
| Parsing Gold | 100 页 | 数字 PDF、扫描 PDF、图片、表格、中英混排 |
| Safety/Injection | 100 Case | 越权、提示注入、敏感数据、伪造完成、来源冲突 |

### 17.2 检索评分（100 分）

| 维度 | 权重 | 门槛 |
| --- | ---: | --- |
| Recall@20 | 25% | ≥ 95% |
| nDCG@10 | 20% | ≥ 0.85 |
| MRR@10 | 10% | ≥ 0.80 |
| 元数据过滤正确率 | 15% | ≥ 98% |
| 来源/版本正确率 | 15% | 100% 关键样本 |
| Context 冗余与多样性 | 5% | 人工合格率 ≥ 90% |
| P95 检索+精排延迟 | 5% | ≤ 800ms |
| 单次检索成本 | 5% | 符合预算线 |

检索综合分需 ≥ 85，且来源/权限错误为硬失败，不能被其他维度抵消。

### 17.3 生成与教学评分（100 分）

| 维度 | 权重 | 门槛 |
| --- | ---: | --- |
| Faithfulness/Groundedness | 25% | ≥ 90% |
| 任务与意图正确性 | 20% | ≥ 90% |
| 纠错可执行性 | 15% | ≥ 85% |
| 初学者难度匹配 | 10% | ≥ 85% |
| 回答相关性 | 10% | ≥ 90% |
| 中文解释清晰度 | 8% | ≥ 85% |
| 英文自然度与真实性 | 7% | ≥ 90% |
| 引用正确性 | 5% | ≥ 98% |

生成综合分需 ≥ 85。严重安全问题、无证据编造关键事实或错误推进任务均为硬失败。

### 17.4 端到端 AI 总分

```text
总分 = 检索质量 30% + 生成与教学 35% + 回答判定/状态正确性 25% + 延迟成本 10%
```

上线条件：

- 总分 ≥ 85；
- 回答判定人工一致率 ≥ 90%；
- 关键槽位准确率 ≥ 95%；
- 离线金标集错误推进率 = 0%；线上错误推进率设为 P0 事故并立即回归；
- 结构化输出有效率 ≥ 99%；
- 所有硬失败项为 0。

### 17.5 人工评测

- 每个主观样本由两名标注员独立评分；
- 分歧超过 1 分或判定等级不同，由英语内容负责人裁决；
- 模型作为评委只能用于预筛，不能替代关键上线指标的人工金标；
- 每次模型、Prompt、Embedding、切块或 Rerank 变更都运行回归；
- 线上低评分、用户纠错和无结果 Query 进入候选评测集，人工审核后才能成为金标。

## 18. 功能验收标准

### 18.1 学习链路

1. 用户输入旅行目标后，系统只推荐已发布场景；
2. 咖啡店基线、训练和迁移任务均覆盖四个必要意图；
3. 基线和迁移不泄露答案；
4. 非标准但可理解表达不会被语法完美主义阻断；
5. 提示按三级逐步增强，完整示例使用被记录；
6. 多信息一句输入可以填充多个槽位；
7. 状态刷新、重复提交和模型异常不造成重复推进；
8. 结果页展示可解释的训练前后变化，不宣称真实口语能力。

### 18.2 RAG 链路

1. 任意生成答案可以追踪到本次检索 Chunk 和来源版本；
2. 线上检索只包含 Published 且权限允许的内容；
3. Dense、Sparse、RRF、Rerank 和最终 Context 均可在 Trace 中查看；
4. 来源冲突、证据不足或版本失效时不生成确定性事实；
5. Rerank 失败时可以使用 RRF 结果降级；
6. pgvector/FTS 检索索引可由 PostgreSQL 事实源和对象存储产物完全重建；
7. 检索与生成达到第 17 节门槛。

### 18.3 摄取链路

1. 所有支持格式至少有 10 个代表性文件通过测试；
2. 文本、图片和表格达到第 10–12 节准确率门槛；
3. 低置信、来源不明、权限不明和敏感内容进入人工审核；
4. 每个 Chunk 有来源、父实体、版本、许可和审核状态；
5. 修改、停用、删除和回滚均能更新线上索引；
6. 失败任务可重试且不会重复生成知识实体。

### 18.4 页面与权限

1. 学习端 375px 宽度可用，核心流程支持键盘；
2. 管理端内容编辑、审核、发布权限分离；
3. 所有高风险操作有二次确认和审计；
4. 未发布内容无法通过学习端或线上 API 获取；
5. 知识版本发布和回滚均在 5 分钟内生效。

## 19. 非功能要求

### 19.1 性能

- 非 AI API P95 ≤ 1 秒；
- 单轮学习交互端到端 P95 ≤ 8 秒；
- 检索+精排 P95 ≤ 800ms；
- 页面提交 300ms 内展示处理状态；
- 知识发布后 5 分钟内新版本可用；
- 50 页以内普通数字 PDF 解析目标 ≤ 5 分钟，超出转后台并显示进度。

### 19.2 可靠性

- 每个有效 Turn 和知识流水线阶段幂等；
- 原文件、解析结果、知识实体和索引版本可追溯；
- 模型、Rerank、向量库故障均有明确降级；
- Staging 与 Production 索引隔离；
- 发布使用原子版本切换，支持回滚。

### 19.3 安全与隐私

- 用户输入和外部文件视为不可信内容；
- 文件执行内容、宏和脚本不运行；
- Prompt 注入不能改变权限、发布或状态机；
- 密钥保存在密钥管理服务，不进入代码、Prompt 或日志；
- 学习用户使用匿名 ID，并提供数据清除；
- 原始学习对话建议保留 90 天；正式上线前完成适用地区隐私评审；
- 管理后台采用 RBAC，发布和权限变更写入不可篡改审计日志。

## 20. 里程碑与资源影响

加入完整知识摄取、RAG 和管理后台后，此项目已不再是此前约 7 周、75 人日的轻量验证项目。建议新基线：

| 阶段 | 周期 | 交付 |
| --- | --- | --- |
| 方案冻结 | 2 周 | 技术 Spike、模型 Bake-off、页面原型、知识 Schema |
| 知识摄取与后台 | 3 周 | 上传、解析、审核、切块、版本和发布 |
| 学习端与 AI/RAG | 3 周 | 学习流程、状态机、检索、生成和结果 |
| 联调与离线评测 | 2 周 | 金标集、性能、成本、安全和修复 |
| 用户验证 | 2 周 | 5 人可用性 + 30 人方向性验证 |
| **总计** | **约 12 周** | 可验证的完整 AI MVP |

建议投入约 130–160 人日，核心角色包括产品、设计、前端、后端/AI、数据/知识工程、测试、英语内容和用户研究。项目立项书需据此更新，原 ¥15,000 现金预算不能直接沿用。

## 21. 发布决策

### 21.1 可以发布验证

- P0 功能完成；
- 摄取、RAG、AI 和页面验收通过；
- 评测总分及硬门槛通过；
- 知识来源、许可和版本完整；
- 成本在预算线内；
- 没有阻断缺陷和严重安全事件。

### 21.2 只能继续内部迭代

- 检索召回不足、错误推进超标或来源无法追踪；
- 图片/表格关键字段准确率不达标；
- 知识后台不能可靠审核、发布或回滚；
- 用户训练表现改善但系统质量不稳定。

### 21.3 停止扩展

- 学习链路可用但训练后迁移表现没有改善；
- 改善主要来自复述完整答案；
- 在代表性金标集上持续无法控制错误推进或事实编造；
- 单次任务成本持续超过阻断线且没有对应质量收益。

## 22. 官方资料来源

本节只收录厂商或开源项目官方资料，查询日期为 2026-08-22。价格与 Preview 能力上线前必须再次确认。

- [OpenAI 模型目录与 GPT-5.6 价格/能力](https://developers.openai.com/api/docs/models)
- [OpenAI GPT-5.6 模型比较](https://developers.openai.com/api/docs/models/compare)
- [OpenAI GPT-5.6 Luna](https://developers.openai.com/api/docs/models/gpt-5.6-luna)
- [OpenAI GPT-5.6 Terra](https://developers.openai.com/api/docs/models/gpt-5.6-terra)
- [OpenAI GPT-5.6 Sol](https://developers.openai.com/api/docs/models/gpt-5.6-sol)
- [OpenAI text-embedding-3-small](https://developers.openai.com/api/docs/models/text-embedding-3-small)
- [OpenAI Embeddings 指南与维度说明](https://developers.openai.com/api/docs/guides/embeddings)
- [OpenAI Embeddings API](https://developers.openai.com/api/reference/ruby/resources/embeddings/methods/create)
- [Google Gemini API 定价](https://ai.google.dev/gemini-api/docs/pricing)
- [Google Gemini 3.7 Flash](https://ai.google.dev/gemini-api/docs/models/gemini-3.7-flash)
- [Google 图片理解](https://ai.google.dev/gemini-api/docs/image-understanding)
- [Anthropic Claude API 定价](https://platform.claude.com/docs/en/about-claude/pricing)
- [Anthropic Claude 模型概览](https://platform.claude.com/docs/en/about-claude/models/overview)
- [LangChain Retrieval 与 2-Step/Agentic RAG](https://docs.langchain.com/oss/python/langchain/retrieval)
- [LangGraph Overview](https://docs.langchain.com/oss/python/langgraph/overview)
- [LlamaIndex Ingestion Pipeline](https://docs.llamaindex.ai/en/stable/module_guides/loading/ingestion_pipeline/)
- [LlamaIndex Node Parser](https://docs.llamaindex.ai/en/stable/module_guides/loading/node_parsers/)
- [LlamaIndex Querying 与 Postprocessing](https://docs.llamaindex.ai/en/stable/understanding/querying/querying.html)
- [pgvector 官方仓库](https://github.com/pgvector/pgvector)
- [Qdrant Hybrid and Multi-Stage Queries](https://qdrant.tech/documentation/search/hybrid-queries/)
- [Qdrant Hybrid Search with Reranking](https://qdrant.tech/documentation/tutorials-basics/reranking-hybrid-search/)
- [Qdrant Production Checklist](https://qdrant.tech/documentation/production-checklist/)
- [Pinecone Hybrid Search](https://docs.pinecone.io/guides/search/hybrid-search)
- [Pinecone Rerank](https://docs.pinecone.io/guides/search/rerank-results)
- [Cohere Rerank 概览](https://docs.cohere.com/v2/docs/rerank-overview)
- [Cohere 价格与 Rerank Search 定义](https://cohere.com/pricing)
- [Docling 官方仓库](https://github.com/docling-project/docling)
- [Unstructured Partitioning](https://docs.unstructured.io/open-source/core-functionality/partitioning)
- [Unstructured Chunking](https://docs.unstructured.io/open-source/core-functionality/chunking)
- [PaddleOCR PP-StructureV3](https://github.com/PaddlePaddle/PaddleOCR/blob/main/docs/version3.x/pipeline_usage/PP-StructureV3.en.md)
- [Ragas 官方评测指标](https://docs.ragas.io/en/stable/concepts/metrics/available_metrics/)
- [DeepEval RAG Evaluation](https://github.com/confident-ai/deepeval/blob/main/docs/guides/guides-rag-evaluation.mdx)
- [Langfuse Scores](https://langfuse.com/docs/evaluation/scores/overview)
- [Langfuse Experiments](https://langfuse.com/docs/evaluation/experiments/data-model)
- [官方资料研究底稿：Talk Town AI 技术选型](./Talk-Town-AI技术选型官方资料研究-2026-08-22.md)

## 23. 开发前必须确认

1. 接受完整 AI MVP 的范围和约 12 周新基线；
2. 同意 PostgreSQL + pgvector 作为本期事实源与向量检索基线，并以客观迁移门槛决定是否引入 Qdrant；
3. 同意 GPT-5.6 Luna 默认、Terra 升级，并在金标集上与至少一个跨厂商模型比较；
4. 同意 LlamaIndex 只负责摄取/检索组件，业务状态机自研；
5. 确认允许入库的来源和版权审批负责人；
6. 确认知识后台角色及发布审批流程；
7. 批准 Parsing、Retrieval、Turn 和 Safety 四套金标集建设；
8. 根据新范围重新审批人员、周期和现金预算。
