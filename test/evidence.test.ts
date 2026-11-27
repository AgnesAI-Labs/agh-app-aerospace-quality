import { mkdtemp, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import type { ToolContext } from '@agnes/extension-api'
import { createPluginTestHost } from '@agnes/host/author-testkit'
import type { UiSurface } from '@agnes/protocol'
import { afterEach, expect, it } from 'vitest'
import { main } from '../src/index.js'

const packageDir = fileURLToPath(new URL('../', import.meta.url))
const roots: string[] = []
afterEach(async () => {
  for (const root of roots.splice(0)) await rm(root, { recursive: true, force: true })
})

async function withRenderer(invoke: ToolContext['tools']['invoke']) {
  const storeDir = await mkdtemp(join(tmpdir(), 'agh-aero-evidence-'))
  roots.push(storeDir)
  return createPluginTestHost(main, {
    packageDir,
    storeDir,
    services: { skills: { register: () => () => {} } },
    context: { tools: { invoke, list: () => [] } },
  })
}

it.each([
  ['aero_investigate', { anomalyId: 'AN-027' }, 'AN-027', 'TC-026/current/66-70min'],
  ['aero_change_review', { ecrId: 'ECR-016' }, 'ECR-016', 'Additional screening'],
] as const)('keeps the exact %s JSON when the Host card limit is reached', async (name, args, id, value) => {
  const attempts: unknown[] = []
  let full = false
  const host = await withRenderer(async (tool, input) => {
    expect(tool).toBe('ui_render')
    attempts.push(input)
    return full
      ? { content: [], isError: true, structured: { code: 'UI_LIMIT', published: false } }
      : { content: [] }
  })
  try {
    const before = await host.invoke(name, args)
    full = true
    const after = await host.invoke(name, args)
    expect(before.isError).not.toBe(true)
    expect(after.isError).not.toBe(true)
    expect(after.structured).toEqual(before.structured)
    expect(after.content[0]).toEqual(before.content[0])
    expect(before.content).toHaveLength(1)
    expect(after.content[1]).toEqual({ type: 'text', text: expect.stringMatching(/card limit.*tool details.*Trace/) })
    expect(attempts).toHaveLength(2)
    const { surface } = attempts[0] as { surface: UiSurface }
    expect(surface.title).toContain(id)
    expect(surface.placement).toMatchObject({ inline: true, workbench: true })
    expect(surface.actions).toEqual([])
    expect(JSON.stringify(surface)).toContain(value)
    expect(await host.invokeProfileService('aero.snapshot', {})).toMatchObject({ revision: 1, audit: [] })
  } finally {
    await host.dispose()
  }
})

it('keeps tool details on renderer failure without claiming that the card limit was reached', async () => {
  const host = await withRenderer(async () => ({ content: [], isError: true, structured: { code: 'UI_LIMIT' } }))
  try {
    const result = await host.invoke('aero_investigate', { anomalyId: 'AN-027' })
    expect(result.isError).not.toBe(true)
    expect(result.structured).toMatchObject({ data: { anomalyId: 'AN-027' } })
    expect(result.content[1]).toEqual({ type: 'text', text: expect.stringMatching(/tool details.*Trace/) })
    expect(JSON.stringify(result.content[1])).not.toMatch(/card limit/)
  } finally {
    await host.dispose()
  }
})

it('does not turn cancellation during card publication into a successful evidence result', async () => {
  const controller = new AbortController()
  const host = await withRenderer(async () => {
    controller.abort(new Error('cancelled by caller'))
    return { content: [], isError: true }
  })
  try {
    await expect(host.invoke('aero_investigate', { anomalyId: 'AN-027' }, controller.signal)).rejects.toThrow(
      'cancelled by caller',
    )
  } finally {
    await host.dispose()
  }
})
