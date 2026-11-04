# 穹序航天研制质量台

[English](README.md) | 简体中文

一个可安装、显式采纳的 [AGH](https://github.com/AgnesAI-Labs/agnes-harness) 应用插件
（`@agnes-showcase/aerospace-quality`），面向**虚构**的 QV-X27 航天推进阀驱动分系统研制项目。
穹序 / Qiongxu、供应单元、器件、测量和历史审批全部为合成数据，不代表真实公司、客户项目或已获认证的质量体系。

## 做什么

一个包提供五个角色智能体（质量、追溯、异常诊断、MRB、技术状态）、六个业务页面、亮暗皮肤、严格输入的工具、
按所有者和档案绑定的数据、证据卡、报告和可选的每周自动化。合成数据含 39 条需求、32 个验证用例、
6 个试验活动（484 个采样点）、18 个 NCR、12 个 ECR、4 个基线、24 个器件和双五条十项证据，业务快照固定在 2026-10-20。

- **需求与试验：** 需求、设计、验证的追溯，缺口与孤儿过滤；电流、温度、真空证据，突出 AN-027 异常时间窗。
- **MRB：** 比较五种处置方案，保存理由，请求人工批准。`dispositioned` 表示批准执行，不表示已返工或放行，硬件保持隔离。
- **技术状态：** 基线登记与 ECR 影响图；批准的更改会使受影响验证失效，并保持目标基线。
- **归零：** 双五条十项标准；证据不全时即使有批准也拒绝关闭。
- **权限：** MRB 处置、技术状态更改、规则启用和归零关闭属于业务行为，须由人工一次性 `business.confirm` 签署，
  签署绑定确切参数和版本。报告是草稿，不会把缺失的验证写成通过。
- **报告：** `aero_report` 在授权工作区的 `aero-output/` 下生成 Markdown 和带打印样式的 HTML，并作为会话交付物发布。

安装本包不会自动采纳应用，也不会授予执行权限。演示脚本见 [DEMO.md](DEMO.md)，标准引用与建模限制见
[DOMAIN-NOTES.md](DOMAIN-NOTES.md)。

## 安装

从 Git 安装（仓库已提交构建好的 `dist/`，无需再构建）：

```sh
agh plugins add git:https://github.com/AgnesAI-Labs/agh-app-aerospace-quality#v1.1.4
```

或使用 .tgz：

```sh
git clone https://github.com/AgnesAI-Labs/agh-app-aerospace-quality && cd agh-app-aerospace-quality
agh plugins pack . aerospace-quality.tgz
agh plugins add ./aerospace-quality.tgz
```

`agh plugins add` 会列出申请的能力，确认后安装、信任并启用该版本（`--yes` 跳过确认；之后可用
`agh plugins trust|enable <id>`）。然后采纳应用：在 Web 的「设置 → 应用」，或命令行：

```sh
agh app preview '@agnes-showcase/aerospace-quality#qiongxu-aerospace-quality'
agh app adopt   '@agnes-showcase/aerospace-quality#qiongxu-aerospace-quality' --yes
```

采纳后可用智能体 `@agnes-showcase/aerospace-quality#quality`、`#trace`、`#investigator`、`#mrb`、`#configuration`。
`/?admin` 或 `agh app clear` 可恢复宿主界面。每周 NCR 摘要的定时任务只由显式执行 `automation.mjs` 创建（见开发）。

## 申请的能力

声明在 `package.json` 的 `agnes.plugins` 中：

| 插件行 | 能力 |
|---|---|
| `main` | `ui`；`store`；`tools.invoke`；前缀为 `aero_` 的工具（`aero_playbook`、`aero_trace`、`aero_investigate`、`aero_change_review`、`aero_quality`、`aero_mrb_draft`、`aero_rule_propose`、`aero_decide`、`aero_report`、`aero_skill_candidate`、`aero_briefing`）；文件读写仅限 `aero-output/**`；注入工具、服务和技能 |
| `cards` | `ui`（证据卡） |
| `review-policy` | 不申请能力；提供 `aero-human-review` 工具策略 |

不申请网络、命令行或其他文件系统访问。运行时依赖（`@agnes/plugin-runtime`、`@agnes/extension-api`、
`@sinclair/typebox`）由宿主提供。

## 开发

```sh
npm run build       # 重新生成 dist/index.js（esbuild 0.28.2），并提交结果
npm run check:dist  # dist 与源码不一致时失败
npm test            # vitest，见下
```

测试依赖未发布的 `@agnes/*` 源码包，所以借用本机开源仓 checkout 的 vitest：
`AGNES_HARNESS=/path/to/agnes-harness npm test`（默认 `~/agnes-harness`，需已安装依赖）。
`vitest.config.mjs` 通过该 checkout 的包导出解析 `@agnes/*`。

`adopt.mjs`（用 SDK 预览/采纳）和 `automation.mjs`（创建每周摘要定时任务）从同一 checkout 读取 SDK：

```sh
cd "$AGH_SOURCE" && AGH_SOURCE="$PWD" node --import tsx /path/to/agh-app-aerospace-quality/adopt.mjs [--adopt]
cd "$AGH_SOURCE" && AGH_SOURCE="$PWD" AERO_WORKSPACE=/path/to/workspace node --import tsx /path/to/agh-app-aerospace-quality/automation.mjs
```

`test/acceptance.e2e.mjs` 是单体仓时代的验收脚本，仅留作参考，使用前需要移植。

许可证：Apache-2.0。
