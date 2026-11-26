import { createHash } from 'node:crypto'
import type { ToolContext } from '@agnes/extension-api'

export type Evidence = { title: string; fields: readonly (readonly [label: string, value: string])[] }

type AnomalyRecord = {
  anomalyId: string
  campaign: string
  configuration: string
  lot: string
  unit: string
  peakA: number
  limitA: number
  windowMinutes: readonly number[]
  evidence: readonly string[]
  hypothesis: { 'zh-CN': string; en: string }
  assessmentScope: string
}

type ChangeRecord = {
  ecr: { id: string; from: string; to: string }
  requirements: readonly string[]
  interfaces: readonly string[]
  tests: readonly string[]
  ruleVersion: number | null
  screeningRequired: boolean
  ruleEvidence: readonly string[]
}

export function anomalyEvidence(data: AnomalyRecord): Evidence {
  return {
    title: `${data.anomalyId} · 异常调查证据 / Anomaly investigation`,
    fields: [
      ['试验 / Campaign', `${data.campaign} · ${data.configuration} · ${data.lot} · ${data.unit}`],
      ['峰值 / Peak', `${data.peakA.toFixed(3)} A`],
      ['上限 / Upper limit', `${data.limitA.toFixed(2)} A`],
      ['异常时窗 / Anomaly window', `${data.windowMinutes.join('–')} min`],
      ['受控证据 / Controlled evidence', data.evidence.join(' · ')],
      ['候选机理 / Hypothesis', `${data.hypothesis['zh-CN']} / ${data.hypothesis.en}`],
      ['判定范围 / Assessment scope', data.assessmentScope],
    ],
  }
}

export function changeEvidence(data: ChangeRecord): Evidence {
  return {
    title: `${data.ecr.id} · 更改影响评审 / Change impact review`,
    fields: [
      ['基线 / Baseline', `${data.ecr.from} → ${data.ecr.to}`],
      ['受影响需求 / Affected requirements', data.requirements.join(' · ') || '—'],
      ['受影响接口 / Affected interfaces', data.interfaces.join(' · ') || '—'],
      ['所需复验 / Required re-verification', data.tests.join(' · ') || '—'],
      ['规则版本 / Rule version', data.ruleVersion === null ? '—' : String(data.ruleVersion)],
      ['追加筛选 / Additional screening', data.screeningRequired ? '需要 / Required' : '未触发 / Not triggered'],
      ['规则证据 / Rule evidence', data.ruleEvidence.join(' · ') || '—'],
    ],
  }
}

export async function publishEvidence(
  ctx: ToolContext,
  evidence: Evidence,
  revision: number,
): Promise<string | undefined> {
  const id = `aero-record-${createHash('sha256').update(ctx.session.toolUseId).digest('hex').slice(0, 32)}`
  const fields = [{ key: 'revision', label: '项目修订 / Programme revision' }]
  const values: Record<string, string> = { revision: String(revision) }
  for (const [index, [label, value]] of evidence.fields.entries()) {
    const key = `field-${index}`
    fields.push({ key, label })
    values[key] = value
  }
  const original = '请在宿主工具详情或执行记录查看原始证据。 / See the original evidence in Host tool details or Trace.'
  let full = false
  try {
    const result = await ctx.tools.invoke(
      'ui_render',
      {
        surface: {
          id,
          revision: 1,
          title: evidence.title,
          placement: { inline: true, workbench: true, preferred: 'inline' },
          components: [{ id: 'record', kind: 'detail-card', dataKey: 'record', fields }],
          data: { record: values },
          actions: [],
        },
      },
      { signal: ctx.signal },
    )
    ctx.signal.throwIfAborted()
    if (!result.isError) return undefined
    const refused = result.structured
    full =
      !!refused &&
      typeof refused === 'object' &&
      'code' in refused &&
      refused.code === 'UI_LIMIT' &&
      'published' in refused &&
      refused.published === false
  } catch {
    ctx.signal.throwIfAborted()
  }
  return full
    ? `本会话的证据卡已达上限。 / This session reached its card limit. ${original}`
    : `证据卡不可用。 / The evidence card is unavailable. ${original}`
}
