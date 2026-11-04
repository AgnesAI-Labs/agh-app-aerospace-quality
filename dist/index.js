// src/index.ts
import { readFileSync } from "node:fs";
import { defineAgnesPlugin, defineTool, toolError } from "@agnes/plugin-runtime";
import { Type } from "@sinclair/typebox";

// src/model.ts
var text = (zh, en) => ({ "zh-CN": zh, en });
function confirmationLabel(mode, principal, locale) {
  const zh = locale === "zh-CN";
  if (mode === "auto-confirmed under full access")
    return zh ? `\u5B8C\u5168\u8BBF\u95EE\u4E0B\u81EA\u52A8\u786E\u8BA4\uFF08\u4E3B\u4F53 ${principal}\uFF09` : `Auto-confirmed under full access (principal ${principal})`;
  if (mode === "manual") return zh ? `\u5DF2\u7531\u771F\u4EBA\u7B7E\u7F72: ${principal}` : `Signed by ${principal}`;
  return zh ? `\u786E\u8BA4\u65B9\u5F0F\u672A\u8BB0\u5F55\uFF08\u4E3B\u4F53 ${principal}\uFF09` : `Confirmation mode not recorded (principal ${principal})`;
}

// src/seed.ts
var RULE = "Flag ECRs that change part lots on thermally cycled assemblies for additional TVAC screening. Require evidence and human configuration approval; never release hardware automatically. / \u70ED\u5FAA\u73AF\u7EC4\u4EF6\u66F4\u6362\u5143\u5668\u4EF6\u6279\u6B21\u65F6\uFF0C\u8FFD\u52A0\u70ED\u771F\u7A7A\u7B5B\u9009\uFF1B\u8981\u6C42\u8BC1\u636E\u548C\u4EBA\u5DE5\u6280\u672F\u72B6\u6001\u5BA1\u6279\uFF0C\u4E0D\u81EA\u52A8\u653E\u884C\u786C\u4EF6\u3002";
var n = (value) => String(value).padStart(3, "0");
function seed() {
  const tests = Array.from({ length: 32 }, (_, i) => ({
    id: `VT-${n(i + 1)}`,
    title: text(
      [
        "\u51B7\u5E73\u53F0\u9A71\u52A8\u7535\u6D41",
        "\u9600\u95E8\u52A8\u4F5C\u5EF6\u65F6",
        "\u7EDD\u7F18\u7535\u963B",
        "\u632F\u52A8\u540E\u529F\u80FD",
        "\u7535\u78C1\u517C\u5BB9",
        "\u63A5\u53E3\u5BA1\u67E5",
        "\u6750\u6599\u68C0\u9A8C",
        "\u70ED\u5206\u6790"
      ][i % 8],
      [
        "Cold plateau drive current",
        "Valve response",
        "Insulation resistance",
        "Post-vibration function",
        "EMC",
        "Interface review",
        "Material inspection",
        "Thermal analysis"
      ][i % 8]
    ),
    status: i === 0 ? "failed" : i % 7 === 0 ? "pending" : "passed",
    configuration: i < 8 ? "BL-C" : "BL-B",
    evidence: i % 7 === 0 ? "" : `EV-VT-${n(i + 1)}-R1`
  }));
  const requirements = [
    {
      id: "SYS-001",
      parent: null,
      title: text("\u63A8\u8FDB\u9600\u9A71\u52A8\u5206\u7CFB\u7EDF\u4EFB\u52A1\u53EF\u9760\u6027", "Propulsion valve-driver mission reliability"),
      method: "analysis",
      design: ["SYS-SPEC-C"],
      tests: ["VT-008"],
      verified: true
    }
  ];
  for (let i = 0; i < 6; i++)
    requirements.push({
      id: `SUB-${n(i + 1)}`,
      parent: "SYS-001",
      title: text(
        ["\u7535\u6C14\u9A71\u52A8", "\u70ED\u73AF\u5883\u9002\u5E94", "\u673A\u68B0\u73AF\u5883\u9002\u5E94", "\u7535\u78C1\u517C\u5BB9", "\u5B89\u5168\u4E0E\u63A5\u53E3", "\u6750\u6599\u4E0E\u5DE5\u827A"][i],
        [
          "Electrical drive",
          "Thermal environment",
          "Mechanical environment",
          "EMC",
          "Safety and interfaces",
          "Materials and processes"
        ][i]
      ),
      method: ["test", "test", "test", "test", "demonstration", "inspection"][i],
      design: [`SUB-SPEC-${i + 1}-C`],
      tests: [`VT-${n(i + 1)}`],
      verified: tests[i].status === "passed"
    });
  for (let i = 0; i < 32; i++)
    requirements.push({
      id: `CMP-${n(i + 1)}`,
      parent: i === 31 ? null : `SUB-${n(Math.floor(i / 6) + 1)}`,
      title: i === 0 ? text("\u221240 \xB0C \u51B7\u5E73\u53F0\u5CF0\u503C\u7535\u6D41 \u2264 1.80 A", "Peak current \u2264 1.80 A at \u221240 \xB0C plateau") : text(`${tests[i].title["zh-CN"]}\u9A8C\u6536\u6761\u76EE ${i + 1}`, `${tests[i].title.en} acceptance ${i + 1}`),
      method: ["test", "analysis", "inspection", "demonstration"][i % 4],
      design: i === 30 ? [] : [`DRV-DWG-${n(i + 1)}-C`],
      tests: i === 29 ? [] : [tests[i].id],
      verified: tests[i].status === "passed" && i !== 29
    });
  const campaigns = Array.from({ length: 6 }, (_, i) => ({
    id: `TC-${n(26 + i)}`,
    title: text(
      [
        "\u70ED\u771F\u7A7A\u9274\u5B9A \xB7 \u51B7\u5E73\u53F0",
        "\u968F\u673A\u632F\u52A8 \xB7 \u4E09\u8F74",
        "\u7535\u78C1\u517C\u5BB9 \xB7 \u4F20\u5BFC\u53D1\u5C04",
        "\u9600\u95E8\u5BFF\u547D\u5FAA\u73AF",
        "\u5143\u5668\u4EF6\u6279\u6B21\u9A8C\u6536",
        "\u70ED\u771F\u7A7A\u590D\u73B0\u8BD5\u9A8C"
      ][i],
      [
        "TVAC qualification \xB7 cold plateau",
        "Random vibration \xB7 three axes",
        "EMC \xB7 conducted emissions",
        "Valve endurance cycling",
        "Component lot acceptance",
        "TVAC reproduction"
      ][i]
    ),
    status: ["hold", "passed", "passed", "running", "pending", "pending"][i],
    configuration: i < 4 ? "BL-C" : "BL-D-draft",
    unit: `PVD-${n(11 + i)}`,
    lot: i === 1 ? "L2607-A" : "L2609-B",
    started: `2026-10-${18 + i % 3}T02:00:00Z`,
    samples: Array.from({ length: i >= 4 ? 0 : 121 }, (_2, minute) => ({
      minute,
      current: Number(
        ((i === 0 && minute >= 66 && minute <= 70 ? 2.18 : 1.22) + Math.sin(minute * 0.6) * 0.05).toFixed(3)
      ),
      temperature: Number(
        (minute < 30 ? 20 - minute * 2 : minute < 90 ? -40 + Math.sin(minute) * 0.3 : -40 + (minute - 90) * 2).toFixed(2)
      ),
      pressure: Number((3e-5 + Math.abs(Math.cos(minute)) * 2e-6).toFixed(7)),
      limit: 1.8,
      anomaly: i === 0 && minute >= 66 && minute <= 70
    })),
    logs: i >= 4 ? [] : [
      {
        at: "02:30Z",
        message: text(
          "\u8FBE\u5230\u51B7\u5E73\u53F0 \u221240 \xB0C\uFF1B\u771F\u7A7A\u5EA6 3\xD710\u207B\u2075 Pa",
          "Cold plateau \u221240 \xB0C reached; vacuum 3\xD710\u207B\u2075 Pa"
        )
      },
      {
        at: "03:06Z",
        message: i === 0 ? text(
          "\u7535\u6D41\u8D8A\u9650\uFF1B\u64CD\u4F5C\u5458\u4E2D\u6B62\u5E76\u9694\u79BB PVD-011",
          "Current limit exceeded; operator aborted and quarantined PVD-011"
        ) : text("\u6309\u7A0B\u5E8F\u8BB0\u5F55\uFF1B\u65E0\u65B0\u589E\u5F02\u5E38", "Procedure logged; no new anomaly")
      }
    ]
  }));
  const ncrs = Array.from({ length: 18 }, (_, i) => ({
    id: `NCR-${n(i + 1)}`,
    title: i === 17 ? text("AN-027 \u51B7\u5E73\u53F0\u7535\u6D41\u5C16\u5CF0", "AN-027 cold plateau current spike") : i === 15 ? text("\u51B7\u5FAA\u73AF\u8FDE\u7EED\u6027\u95F4\u6B47", "Intermittent continuity during cold cycling") : i === 16 ? text("\u51B7\u5E73\u53F0\u91CD\u590D\u7535\u6D41\u8D8A\u9650", "Repeated cold-plateau overcurrent") : text(
      ["\u6765\u6599\u6807\u8BC6\u504F\u5DEE", "\u710A\u70B9\u95F4\u6B47\u9AD8\u963B", "\u5C3A\u5BF8\u68C0\u9A8C\u504F\u5DEE"][i % 3],
      [
        "Incoming marking discrepancy",
        "Intermittent high-resistance solder joint",
        "Dimensional inspection deviation"
      ][i % 3]
    ),
    severity: i > 14 ? "major" : i % 4 === 0 ? "critical" : "minor",
    status: i > 14 ? "open" : i % 4 === 0 ? "review" : "closed",
    opened: `2026-10-${n(1 + i).slice(-2)}T04:00:00Z`,
    lot: i > 14 ? "L2609-B" : "L2607-A",
    unit: `PVD-${n(i > 14 ? 11 : i + 1)}`,
    signature: i === 15 ? text(
      "\u51B7\u5FAA\u73AF\u540E\u8FDE\u7EED\u6027\u6D4B\u91CF\u51FA\u73B0\u95F4\u6B47\u7535\u963B\u5347\u9AD8\uFF1B\u5C1A\u672A\u5B8C\u6210\u5207\u7247\u5206\u6790",
      "Intermittent measured resistance after cold cycling; cross-section analysis pending"
    ) : i > 15 ? text(
      "\u51B7\u5E73\u53F0\u9A71\u52A8\u7535\u6D41\u8D8A\u8FC7 1.80 A \u9650\u503C\uFF1B\u5931\u6548\u673A\u7406\u5C1A\u672A\u8BC1\u5B9E",
      "Cold-plateau drive current exceeded the 1.80 A limit; failure mechanism unconfirmed"
    ) : text("\u68C0\u9A8C\u8BB0\u5F55\u4E0E\u53D7\u63A7\u56FE\u6837\u5B58\u5728\u5DEE\u5F02", "Inspection record differs from controlled drawing"),
    disposition: i > 14 ? null : "use-as-is",
    rationale: "",
    approvals: i > 14 ? [] : ["MRB-DEMO-ARCHIVE"],
    evidence: i > 14 ? [`EV-NCR-${n(i + 1)}-waveform`] : [`EV-NCR-${n(i + 1)}-inspection`]
  }));
  const ecrs = Array.from({ length: 12 }, (_, i) => ({
    id: `ECR-${n(i + 14)}`,
    title: i === 0 ? text(
      "\u9A71\u52A8\u5668\u5143\u5668\u4EF6\u6279\u6B21\u66FF\u6362\uFF1AL2607-A \u2192 L2609-B",
      "Driver component lot substitution: L2607-A \u2192 L2609-B"
    ) : text(`\u9A71\u52A8\u7EC4\u4EF6\u53D8\u66F4 ${i + 1}`, `Driver assembly change ${i + 1}`),
    status: i === 0 ? "approved" : i < 5 ? "review" : "draft",
    from: i === 0 ? "BL-B" : "BL-C",
    to: i === 0 ? "BL-C" : "BL-D-draft",
    part: "P-001",
    lotChange: i % 2 === 0,
    thermallyCycled: true,
    requirements: ["CMP-001", "SUB-001", "SUB-002"],
    interfaces: ["IF-PWR-28V", "IF-VALVE-J3"],
    tests: ["VT-001", "VT-004", "VT-008"],
    rationale: i === 0 ? "2026-09-18: approved alternate lot; additional TVAC screening was not specified / \u5DF2\u6279\u51C6\u66FF\u4EE3\u6279\u6B21\uFF0C\u672A\u89C4\u5B9A\u8FFD\u52A0\u70ED\u771F\u7A7A\u7B5B\u9009" : "",
    approvals: i === 0 ? ["CCB-DEMO-20260918"] : []
  }));
  const titles = [
    ["\u5B9A\u4F4D\u51C6\u786E", "Accurate localization"],
    ["\u673A\u7406\u6E05\u695A", "Mechanism understood"],
    ["\u95EE\u9898\u590D\u73B0", "Reproduction"],
    ["\u63AA\u65BD\u6709\u6548", "Effective corrective action"],
    ["\u4E3E\u4E00\u53CD\u4E09", "Extent of condition"],
    ["\u8FC7\u7A0B\u6E05\u695A", "Clear process"],
    ["\u8D23\u4EFB\u660E\u786E", "Accountability"],
    ["\u63AA\u65BD\u843D\u5B9E", "Actions implemented"],
    ["\u4E25\u8083\u5904\u7406", "Serious review"],
    ["\u5B8C\u5584\u89C4\u7AE0", "Improved procedures"]
  ];
  const criteria = titles.map(([zh, en], i) => ({
    id: `${i < 5 ? "T" : "M"}${i % 5 + 1}`,
    title: text(zh, en),
    evidence: [0, 5, 6].includes(i) ? [`EV-ZR-001-${i + 1}`] : [],
    accepted: [0, 5, 6].includes(i)
  }));
  return {
    schema: 1,
    revision: 1,
    requirements,
    tests,
    campaigns,
    ncrs,
    ecrs,
    zeroing: [{ id: "ZR-001", anomaly: "AN-027", status: "open", criteria }],
    parts: Array.from({ length: 24 }, (_, i) => ({
      id: `P-${n(i + 1)}`,
      title: text(
        i === 0 ? "\u9600\u9A71\u52A8\u539A\u819C\u6DF7\u5408\u7535\u8DEF" : `\u53D7\u63A7\u5668\u4EF6 ${i + 1}`,
        i === 0 ? "Valve-driver thick-film hybrid" : `Controlled part ${i + 1}`
      ),
      supplier: text(`\u865A\u6784\u4F9B\u5E94\u5355\u5143 ${i % 4 + 1}`, `Fictional supply cell ${i % 4 + 1}`),
      grade: i % 3 === 0 ? "programme-qualified / \u9879\u76EE\u9274\u5B9A\u7EA7" : "screened industrial / \u7B5B\u9009\u5DE5\u4E1A\u7EA7",
      lot: i === 0 ? "L2609-B" : "L2607-A",
      preferred: i < 18,
      obsolete: i > 21,
      counterfeitRisk: i === 19,
      status: i === 0 || i === 19 ? "quarantine" : "available"
    })),
    baselines: ["BL-A", "BL-B", "BL-C", "BL-D-draft"].map((id2, i) => ({
      id: id2,
      status: i === 3 ? "draft" : i === 2 ? "hold" : "superseded",
      units: ["PVD-011", "PVD-012", "PVD-013"],
      source: i === 2 ? "ECR-014" : "CCB-ARCHIVE"
    })),
    milestones: [
      { date: "2026-10-22", title: text("\u5F02\u5E38\u590D\u73B0\u8BC4\u5BA1", "Reproduction review"), status: "at-risk" },
      {
        date: "2026-10-28",
        title: text("MRB \u4E0E\u66F4\u6539\u63A7\u5236\u59D4\u5458\u4F1A", "MRB and change control board"),
        status: "pending"
      },
      { date: "2026-11-06", title: text("\u9274\u5B9A\u8BC4\u5BA1", "Qualification review"), status: "pending" }
    ],
    rule: { status: "absent", version: 0, body: RULE, evidence: [], approval: null },
    audit: []
  };
}

// src/domain.ts
var collections = [
  "requirements",
  "tests",
  "ncrs",
  "ecrs",
  "zeroing",
  "parts",
  "baselines",
  "milestones"
];
function read(store) {
  if (!store) throw new Error("\u6863\u6848\u5B58\u50A8\u4E0D\u53EF\u7528 / Profile store unavailable");
  return store.transaction(() => load(store));
}
function load(store) {
  const head = store.get("programme");
  if (!head) return seed();
  if (head.schema !== 1 || !Number.isSafeInteger(head.auditCount) || head.auditCount < 0 || head.auditCount > 2e3 || !Array.isArray(head.campaigns))
    throw new Error("\u672A\u77E5\u6216\u635F\u574F\u6570\u636E\u7248\u672C / Unknown or corrupt state schema");
  const required = (key) => {
    const value = store.get(key);
    if (!Array.isArray(value)) throw new Error("\u9879\u76EE\u8BB0\u5F55\u7F3A\u5931 / Programme record missing");
    return value;
  };
  const rows = Object.fromEntries(collections.map((key) => [key, required(`programme/${key}`)]));
  const campaigns = head.campaigns.map((id2) => {
    const value = store.get(`programme/campaign/${id2}`);
    if (!value || typeof value !== "object") throw new Error("\u8BD5\u9A8C\u8BB0\u5F55\u7F3A\u5931 / Campaign record missing");
    return value;
  });
  const audit = Array.from(
    { length: Math.ceil(head.auditCount / 100) },
    (_, i) => required(`programme/audit/${i}`)
  ).flat();
  return { ...rows, schema: head.schema, revision: head.revision, rule: head.rule, campaigns, audit };
}
function persist(store, state) {
  const set = (key, value) => {
    const data = JSON.parse(JSON.stringify(value));
    if (JSON.stringify(store.get(key)) !== JSON.stringify(data)) store.set(key, data);
  };
  for (const key of collections) set(`programme/${key}`, state[key]);
  for (const campaign of state.campaigns) set(`programme/campaign/${campaign.id}`, campaign);
  for (let i = 0; i < state.audit.length; i += 100)
    set(`programme/audit/${i / 100}`, state.audit.slice(i, i + 100));
  set("programme", {
    schema: state.schema,
    revision: state.revision,
    rule: state.rule,
    campaigns: state.campaigns.map((c) => c.id),
    auditCount: state.audit.length
  });
}
function coverage(s) {
  return s.requirements.map((r) => ({
    ...r,
    orphan: r.id !== "SYS-001" && (!r.parent || !s.requirements.some((p) => p.id === r.parent)),
    gap: !r.design.length ? "missing-design" : !r.tests.length ? "untested" : r.tests.some((id2) => s.tests.find((t) => t.id === id2)?.status !== "passed") ? "verification-open" : r.verified ? "covered" : "verification-open"
  }));
}
function impact(s, id2) {
  const ecr = s.ecrs.find((r) => r.id === id2);
  if (!ecr) throw new Error("\u66F4\u6539\u5355\u4E0D\u5B58\u5728 / ECR not found");
  const selected = new Set(ecr.requirements);
  let changed = true;
  while (changed) {
    changed = false;
    for (const r of s.requirements)
      if (r.parent && selected.has(r.parent) && !selected.has(r.id)) {
        selected.add(r.id);
        changed = true;
      }
  }
  changed = true;
  while (changed) {
    changed = false;
    for (const r of s.requirements)
      if (selected.has(r.id) && r.parent && !selected.has(r.parent)) {
        selected.add(r.parent);
        changed = true;
      }
  }
  const affected = s.requirements.filter((r) => selected.has(r.id));
  const tests = [.../* @__PURE__ */ new Set([...ecr.tests, ...affected.flatMap((r) => r.tests)])];
  return {
    ecr,
    requirements: affected.map((r) => r.id),
    interfaces: ecr.interfaces,
    tests,
    screeningRequired: s.rule.status === "active" && ecr.lotChange && ecr.thermallyCycled,
    ruleVersion: s.rule.status === "active" ? s.rule.version : null,
    ruleEvidence: s.rule.evidence
  };
}
function investigate(s) {
  const campaign = s.campaigns[0];
  const exceedances = campaign.samples.filter((p) => p.current > p.limit);
  return {
    anomalyId: "AN-027",
    campaign: campaign.id,
    configuration: campaign.configuration,
    lot: campaign.lot,
    unit: campaign.unit,
    peakA: Math.max(...campaign.samples.map((p) => p.current)),
    limitA: 1.8,
    windowMinutes: [66, 70],
    units: { current: "A", temperature: "\xB0C", pressure: "Pa", time: "min" },
    assessmentScope: "Only the current upper limit is assessed here. Temperature and pressure have no supplied acceptance limits; do not declare their tests passed. / \u672C\u7ED3\u679C\u53EA\u8BC4\u4F30\u7535\u6D41\u4E0A\u9650\uFF1B\u672A\u63D0\u4F9B\u6E29\u5EA6\u548C\u771F\u7A7A\u5EA6\u9A8C\u6536\u9650\u503C\uFF0C\u4E0D\u80FD\u5224\u5B9A\u5176\u8BD5\u9A8C\u901A\u8FC7\u3002",
    changeMeaning: "thermallyCycled is a design environmental exposure flag, not proof that a test was performed or passed. / thermallyCycled \u662F\u8BBE\u8BA1\u73AF\u5883\u5C5E\u6027\uFF0C\u4E0D\u662F\u8BD5\u9A8C\u5DF2\u5B8C\u6210\u6216\u901A\u8FC7\u7684\u8BC1\u636E\u3002",
    zeroingSummary: s.zeroing.map((item) => ({
      id: item.id,
      status: item.status,
      accepted: item.criteria.filter((criterion) => criterion.accepted).map((criterion) => criterion.id),
      missing: item.criteria.filter((criterion) => !criterion.accepted).map((criterion) => criterion.id)
    })),
    exceedances,
    relatedNcrs: s.ncrs.filter((r) => r.lot === campaign.lot).map((r) => ({ id: r.id, signature: r.signature, evidence: r.evidence })),
    change: s.ecrs[0],
    hypothesis: {
      "zh-CN": "\u65B0\u6279\u6B21\u710A\u70B9\u70ED\u75B2\u52B3\u5BFC\u81F4\u95F4\u6B47\u9AD8\u963B\uFF0C\u9A71\u52A8\u95ED\u73AF\u8865\u507F\u5F15\u53D1\u7535\u6D41\u5C16\u5CF0\u3002\u4EC5\u4E3A\u5019\u9009\u673A\u7406\uFF1B\u5C1A\u672A\u5B8C\u6210\u5931\u6548\u5206\u6790\u3002",
      en: "Thermal fatigue of new-lot solder joints may cause intermittent resistance and driver-loop compensation spikes. Hypothesis only; failure analysis is incomplete."
    },
    alternatives: [
      "current-probe artefact / \u7535\u6D41\u63A2\u5934\u4F2A\u5DEE",
      "control-loop instability / \u63A7\u5236\u73AF\u8DEF\u4E0D\u7A33\u5B9A",
      "connector fretting / \u8FDE\u63A5\u5668\u5FAE\u52A8\u78E8\u635F"
    ],
    reproduction: [
      "A/B old/new lot thermal cycling at \u221240/+85 \xB0C / \u65B0\u65E7\u6279\u6B21\u51B7\u70ED\u5FAA\u73AF\u5BF9\u7167",
      "Four-wire continuity plus calibrated current probe / \u56DB\u7EBF\u8FDE\u7EED\u6027\u4E0E\u6821\u51C6\u7535\u6D41\u63A2\u5934\u540C\u6B65\u6D4B\u91CF",
      "X-ray, cross-section and independent review / X \u5C04\u7EBF\u3001\u5207\u7247\u4E0E\u72EC\u7ACB\u8BC4\u5BA1"
    ],
    evidence: [
      "TC-026/run-log/03:06Z",
      "TC-026/current/66-70min",
      "ECR-014/CCB-DEMO-20260918",
      "NCR-016",
      "NCR-017",
      "NCR-018"
    ]
  };
}
function health(s) {
  const rows = coverage(s);
  return {
    revision: s.revision,
    total: rows.length,
    verified: rows.filter((r) => r.gap === "covered").length,
    gaps: rows.filter((r) => r.gap !== "covered" || r.orphan).length,
    ncrs: s.ncrs.filter((r) => r.status !== "closed").length,
    ecrs: s.ecrs.filter((r) => r.status === "review").length,
    zeroing: s.zeroing.filter((r) => r.status !== "closed").length,
    openAnomalies: new Set(s.zeroing.filter((item) => item.status !== "closed").map((item) => item.anomaly)).size,
    bySeverity: Object.fromEntries(
      ["critical", "major", "minor"].map((v) => [
        v,
        s.ncrs.filter((r) => r.severity === v && r.status !== "closed").length
      ])
    )
  };
}
function update(store, expected, action, subject, approval, mutate) {
  if (!store) throw new Error("\u6863\u6848\u5B58\u50A8\u4E0D\u53EF\u7528 / Profile store unavailable");
  return store.transaction(() => {
    const s = read(store);
    if (s.revision !== expected) throw new Error("\u6570\u636E\u5DF2\u53D8\u5316\uFF0C\u8BF7\u91CD\u65B0\u5BA1\u9605 / Revision changed; review again");
    if (s.audit.length >= 2e3) throw new Error("\u5BA1\u8BA1\u5BB9\u91CF\u5DF2\u6EE1 / Audit capacity reached");
    mutate(s);
    s.revision++;
    const audit = {
      id: crypto.randomUUID(),
      at: (/* @__PURE__ */ new Date()).toISOString(),
      action,
      subject,
      approval: approval?.requestId ?? null,
      ...approval ? { signer: approval.answeredBy.id } : {},
      ...approval ? { confirmationMode: approval.confirmationMode ?? "manual" } : {},
      ...approval?.signedMeaning ? { signatureMeaning: approval.signedMeaning } : {},
      revision: s.revision
    };
    s.audit.push(audit);
    persist(store, s);
    return { revision: s.revision, audit };
  }, approval?.admission);
}
function draft(store, input) {
  return update(store, input.expectedRevision, "mrb-draft", input.ncrId, void 0, (s) => {
    const ncr = s.ncrs.find((r) => r.id === input.ncrId);
    if (!ncr || !["open", "review"].includes(ncr.status))
      throw new Error("NCR \u4E0D\u53EF\u7F16\u8F91 / NCR is not editable");
    if (input.rationale.trim().length < 20)
      throw new Error("\u8BF7\u63D0\u4F9B\u8BC1\u636E\u4E0E\u5904\u7F6E\u4F9D\u636E / Evidence and rationale required");
    ncr.disposition = input.disposition;
    ncr.rationale = input.rationale.trim();
    ncr.status = "review";
  });
}
function propose(store, expected) {
  return update(store, expected, "rule-propose", "TVAC-LOT-001", void 0, (s) => {
    if (s.rule.status !== "absent") throw new Error("\u5019\u9009\u5DF2\u5B58\u5728 / Candidate already exists");
    s.rule.status = "review";
    s.rule.evidence = ["AN-027", "ECR-014", "NCR-016", "NCR-017"];
  });
}
function decide(store, input, approval) {
  if (!approval?.requestId || ["agent", "system"].includes(approval.answeredBy.role) || approval.confirmationMode === "auto-confirmed under full access" && !approval.admission)
    throw new Error("\u5FC5\u987B\u901A\u8FC7\u5BBF\u4E3B\u4EBA\u5DE5\u5BA1\u6279 / Host human approval required");
  return update(store, input.expectedRevision, `${input.kind}-approve`, input.id, approval, (s) => {
    if (input.kind === "mrb") {
      const r = s.ncrs.find((r2) => r2.id === input.id);
      if (!r || r.status !== "review" || !r.disposition || !r.rationale)
        throw new Error("\u5148\u5B8C\u6210 MRB \u8349\u6848 / Prepare MRB draft first");
      r.status = "dispositioned";
      r.approvals.push(approval.requestId);
      for (const p of s.parts.filter((p2) => p2.lot === r.lot))
        p.status = r.disposition === "use-as-is" ? "concession-hold" : r.disposition === "scrap" ? "scrap-authorized" : r.disposition === "return-to-supplier" ? "return-authorized" : r.disposition === "repair" ? "repair-hold" : "rework-hold";
      for (const b of s.baselines.filter((b2) => b2.units.includes(r.unit)))
        if (b.status !== "superseded") b.status = "hold";
      for (const req of s.requirements.filter((r2) => impact(s, "ECR-014").requirements.includes(r2.id)))
        req.verified = false;
    } else if (input.kind === "configuration") {
      const r = s.ecrs.find((r2) => r2.id === input.id);
      if (!r || r.status !== "review") throw new Error("\u66F4\u6539\u4E0D\u5728\u8BC4\u5BA1\u72B6\u6001 / ECR is not under review");
      const analysis = impact(s, r.id);
      if (analysis.screeningRequired && !r.tests.includes("VT-033")) r.tests.push("VT-033");
      if (analysis.screeningRequired && !s.tests.some((t) => t.id === "VT-033"))
        s.tests.push({
          id: "VT-033",
          title: { en: "Additional lot TVAC screening", "zh-CN": "\u6279\u6B21\u8FFD\u52A0\u70ED\u771F\u7A7A\u7B5B\u9009" },
          status: "pending",
          configuration: r.to,
          evidence: ""
        });
      r.status = "approved";
      r.approvals.push(approval.requestId);
      for (const req of s.requirements.filter((r2) => analysis.requirements.includes(r2.id)))
        req.verified = false;
      const b = s.baselines.find((b2) => b2.id === r.to);
      if (b) {
        b.status = "verification-hold";
        b.source = r.id;
      }
    } else if (input.kind === "rule") {
      if (input.id !== "TVAC-LOT-001" || s.rule.status !== "review")
        throw new Error("\u6CA1\u6709\u5F85\u5BA1\u5019\u9009 / No candidate under review");
      s.rule.status = "active";
      s.rule.version = 1;
      s.rule.approval = approval.requestId;
    } else {
      const z = s.zeroing.find((z2) => z2.id === input.id);
      if (!z || z.status === "closed" || z.criteria.some((c) => !c.accepted || !c.evidence.length))
        throw new Error("\u53CC\u4E94\u6761\u8BC1\u636E\u4E0D\u5B8C\u6574\uFF0C\u4E0D\u80FD\u5F52\u96F6 / Double-five evidence incomplete; closure refused");
      z.status = "closed";
      z.closure = {
        decisionId: approval.requestId,
        signer: approval.answeredBy.id,
        confirmationMode: approval.confirmationMode ?? "manual",
        ...approval.signedMeaning ? { meaning: approval.signedMeaning } : {},
        reviewedRevision: input.expectedRevision,
        subjectRevision: approval.subjectRevision
      };
    }
  });
}

// src/briefing.ts
function briefing(state, locale) {
  const zh = locale === "zh-CN", a = investigate(state);
  return {
    id: `aero-evidence-${crypto.randomUUID()}`,
    revision: 1,
    title: zh ? "AN-027 \u8BC1\u636E\u7B80\u62A5" : "AN-027 evidence briefing",
    summary: zh ? "\u51B7\u5E73\u53F0\u7535\u6D41\u8D8A\u9650\uFF1B\u6279\u6B21\u4E0E NCR \u652F\u6301\u5019\u9009\u673A\u7406\uFF0C\u590D\u73B0\u53CA\u6709\u6548\u6027\u8BC1\u636E\u4ECD\u7F3A\u3002" : "Cold-plateau overcurrent; lot/NCR correlation supports a hypothesis. Reproduction and effectiveness evidence remain open.",
    placement: { inline: true, workbench: true, preferred: "workbench" },
    components: [
      {
        id: "telemetry",
        kind: "chart",
        title: zh ? "\u51B7\u5E73\u53F0\u7535\u6D41\u4E0E\u9650\u503C / A" : "Cold-plateau current and limit / A",
        dataKey: "telemetry",
        chartType: "line",
        categoryKey: "minute",
        series: [
          { key: "current", label: zh ? "\u7535\u6D41" : "Current" },
          { key: "limit", label: zh ? "\u4E0A\u9650" : "Upper limit" }
        ]
      },
      {
        id: "evidence",
        kind: "table",
        title: zh ? "\u53D7\u63A7\u8BC1\u636E\u94FE" : "Controlled evidence chain",
        dataKey: "evidence",
        rowKey: "id",
        selection: "none",
        columns: [
          { key: "id", label: "ID" },
          { key: "meaning", label: zh ? "\u542B\u4E49" : "Meaning" }
        ]
      },
      { id: "hypothesis", kind: "text", dataKey: "hypothesis" }
    ],
    data: {
      telemetry: state.campaigns[0].samples.filter((p) => p.minute >= 60 && p.minute <= 76).map((p) => ({
        minute: String(p.minute),
        current: p.current,
        limit: p.limit
      })),
      evidence: a.evidence.map((id2) => ({
        id: id2,
        meaning: id2.startsWith("TC-") ? zh ? "\u8BD5\u9A8C\u89C2\u6D4B" : "Test observation" : id2.startsWith("ECR-") ? zh ? "\u53D7\u63A7\u66F4\u6539" : "Controlled change" : zh ? "\u5173\u8054\u4E0D\u5408\u683C\u8BB0\u5F55" : "Related NCR"
      })),
      hypothesis: a.hypothesis[locale]
    },
    actions: []
  };
}

// src/signature.ts
import { createHash } from "node:crypto";
async function sign(ctx, input, meanings, target) {
  ctx.signal.throwIfAborted();
  const subjectRevision = createHash("sha256").update(JSON.stringify({ input, meanings })).digest("hex");
  const presentation = Object.fromEntries(
    ["en", "zh-CN"].map((locale) => {
      const zh = locale === "zh-CN";
      return [
        locale,
        {
          title: zh ? "\u4EBA\u5DE5\u8D28\u91CF\u7B7E\u7F72" : "Human quality signature",
          fields: [
            { label: zh ? "\u4E1A\u52A1\u5BF9\u8C61" : "Object", value: target },
            { label: zh ? "\u5BA1\u9605\u7248\u672C" : "Reviewed revision", value: String(input.expectedRevision) },
            { label: zh ? "\u7B7E\u540D\u542B\u4E49" : "Signature meaning", value: meanings[locale] },
            {
              label: zh ? "\u5173\u8054\u8BC1\u636E" : "Evidence",
              value: zh ? "\u67E5\u770B\u672C\u6B21\u8C03\u67E5\u4E0E\u8D28\u91CF\u6863\u6848" : "Review the investigation and quality dossier",
              href: `/?session=${encodeURIComponent(ctx.session.key)}`
            }
          ],
          responseValue: meanings[locale]
        }
      ];
    })
  );
  const handle = await ctx.decisions.request({
    key: `signature:${ctx.session.toolUseId}`,
    purpose: "business.confirm",
    subject: { action: ctx.session.toolUseId, input: JSON.stringify(input), meanings, subjectRevision },
    prompt: `Human quality signature: ${target}, revision ${input.expectedRevision}. ${meanings.en}`,
    presentation,
    options: ["allowed-once", "rejected"],
    responseSchema: { type: "string", enum: Object.values(meanings) }
  });
  const answer = await ctx.decisions.wait(handle, { signal: ctx.signal });
  ctx.signal.throwIfAborted();
  if (answer.status !== "resolved" || answer.snapshot.invalidation)
    throw new Error("Signature unavailable / \u7B7E\u540D\u4E0D\u53EF\u7528");
  const result = answer.snapshot.result;
  if (result?.reason !== "answered" || result.response.option !== "allowed-once" || ["system", "agent"].includes(result.answeredBy.role) || typeof result.response.value !== "string" || !Object.values(meanings).includes(result.response.value) || result.code === "full-access" && result.answeredBy.attrs.confirmationMode !== "auto-confirmed under full access")
    throw new Error("Human quality signature required / \u9700\u8981\u4EBA\u5DE5\u8D28\u91CF\u7B7E\u540D");
  if (result.code === "full-access" && !ctx.decisions.admit)
    throw new Error("Host signature admission unavailable");
  const admission = await ctx.decisions.admit?.(handle);
  if (result.code === "full-access" && !admission) throw new Error("Host signature admission unavailable");
  await admission?.verify();
  return {
    ...admission ? { admission } : {},
    confirmationMode: result.code === "full-access" ? "auto-confirmed under full access" : "manual",
    signedMeaning: result.response.value,
    requestId: handle.id,
    subjectRevision,
    answeredBy: result.answeredBy,
    signedAt: result.at
  };
}

// src/policy.ts
import {
  defaultToolPolicy,
  toolPolicyKind
} from "@agnes/extension-api";
var humanReviewPolicy = {
  id: "aero-human-review",
  version: "1.0.0",
  decide(input, signal, ports) {
    signal.throwIfAborted();
    if (input.call.name === "aero_report")
      return {
        effect: "allow",
        reason: "Bounded evidence export under aero-output; no hardware or configuration mutation / \u6709\u754C\u8BC1\u636E\u5BFC\u51FA\uFF0C\u4E0D\u6539\u53D8\u786C\u4EF6\u6216\u6280\u672F\u72B6\u6001"
      };
    if (input.call.name !== "aero_decide") return defaultToolPolicy.decide(input, signal, ports);
    const value = input.call.args;
    if (!value || typeof value !== "object" || Array.isArray(value) || !["mrb", "configuration", "rule", "zeroing"].includes(String(value.kind)) || typeof value.id !== "string" || !Number.isSafeInteger(value.expectedRevision) || Number(value.expectedRevision) < 1)
      return { effect: "deny", reason: "Invalid quality decision / \u65E0\u6548\u8D28\u91CF\u51B3\u7B56" };
    return defaultToolPolicy.decide(input, signal, ports);
  }
};
var reviewPolicyPlugin = {
  inject: ["providers"],
  apply(ctx) {
    ctx.providers.register(toolPolicyKind, humanReviewPolicy);
  }
};

// src/reports.ts
function report(s, kind, locale) {
  const zh = locale === "zh-CN", h = health(s), a = investigate(s);
  const approvalRecords = (ids) => ids.map((id2) => {
    const proof = s.audit.find((entry) => entry.approval === id2);
    return `- ${confirmationLabel(proof?.confirmationMode, proof?.signer ?? "\u2014", locale)} \xB7 ${id2}`;
  });
  const title = kind === "zeroing" ? zh ? "AN-027 \u53CC\u4E94\u6761\u5F52\u96F6\u62A5\u544A \xB7 \u8349\u6848" : "AN-027 double-five zeroing report \xB7 DRAFT" : zh ? "\u6BCF\u5468\u4E0D\u5408\u683C\u54C1\u5BA1\u7406\u6458\u8981" : "Weekly nonconformance digest";
  const lines = [
    `# ${title}`,
    "",
    `${zh ? "\u865A\u6784\u9879\u76EE / \u5408\u6210\u6570\u636E" : "Fictional programme / synthetic data"} \xB7 QV-X27 \xB7 ${zh ? "\u6570\u636E\u4FEE\u8BA2" : "Data revision"} ${s.revision}`,
    "",
    `## ${zh ? "\u7ED3\u8BBA\u4E0E\u8FB9\u754C" : "Findings and boundaries"}`,
    zh ? "\u51B7\u5E73\u53F0\u5CF0\u503C\u7535\u6D41\u8D8A\u9650\uFF1B\u6279\u6B21\u5173\u8054\u652F\u6301\u710A\u70B9\u70ED\u75B2\u52B3\u5047\u8BBE\uFF0C\u4F46\u4E0D\u80FD\u8BC1\u660E\u56E0\u679C\u3002\u590D\u73B0\u4E0E\u63AA\u65BD\u6709\u6548\u6027\u8BC1\u636E\u5C1A\u7F3A\u3002\u5BA1\u6279\u4E0D\u7B49\u4E8E\u786C\u4EF6\u8FD4\u4FEE\u5B8C\u6210\u3001\u9274\u5B9A\u901A\u8FC7\u6216\u98DE\u884C\u653E\u884C\u3002" : "Cold-plateau current exceeded limits. Lot correlation supports a solder-fatigue hypothesis, not causality. Reproduction and effectiveness evidence remain open. Approval is not physical rework completion, qualification or flight release.",
    "",
    `- ${zh ? "\u5CF0\u503C / \u9650\u503C" : "Peak / limit"}: ${a.peakA.toFixed(3)} / 1.800 A; \u221240 \xB0C; 66\u201370 min`,
    `- ${zh ? "\u53D7\u5F71\u54CD\u72B6\u6001" : "Affected configuration"}: BL-C \xB7 L2609-B \xB7 PVD-011/012/013`,
    `- NCR: ${h.ncrs}; ECR: ${h.ecrs}; ${zh ? "\u9A8C\u8BC1\u8986\u76D6" : "Verification coverage"}: ${h.verified}/${h.total}`,
    "",
    `## ${zh ? "\u8BC1\u636E\u94FE" : "Evidence chain"}`,
    ...a.evidence.map((id2) => `- ${id2}`),
    "",
    `## ${zh ? "\u5904\u7F6E\u4E0E\u590D\u9A8C" : "Disposition and re-verification"}`,
    ...s.ncrs.filter((r) => r.lot === "L2609-B").flatMap((r) => [
      `- ${r.id}: ${r.status} / ${r.disposition ?? (zh ? "\u672A\u5B9A" : "undecided")} \xB7 ${r.rationale || (zh ? "\u5F85 MRB \u5BA1\u7406" : "MRB review pending")}`,
      ...approvalRecords(r.approvals)
    ]),
    ...s.ecrs.filter((r) => r.approvals.length).flatMap((r) => [`- ${r.id}: ${r.from} \u2192 ${r.to}`, ...approvalRecords(r.approvals)]),
    `- VT-001, VT-004, VT-008; ${zh ? "\u65B0\u65E7\u6279\u6B21\u5BF9\u7167\u3001\u56DB\u7EBF\u8FDE\u7EED\u6027\u3001\u6821\u51C6\u63A2\u5934\u4E0E\u5207\u7247\u5206\u6790" : "A/B lots, four-wire continuity, calibrated probe and cross-section analysis"}`,
    "",
    `## ${zh ? "\u53CC\u4E94\u6761\u8BC1\u636E" : "Double-five evidence"}`,
    "| ID | Criterion / \u6761\u76EE | Evidence / \u8BC1\u636E | Status / \u72B6\u6001 |",
    "| --- | --- | --- | --- |",
    ...s.zeroing[0].criteria.map(
      (c) => `| ${c.id} | ${c.title[locale]} | ${c.evidence.join(", ") || "\u2014"} | ${c.accepted ? zh ? "\u5DF2\u5BA1\u9605" : "Reviewed" : zh ? "\u5F85\u8865\u8BC1" : "Open"} |`
    ),
    "",
    ...s.zeroing.filter((z) => z.closure).map(
      (z) => `- ${z.id}: ${confirmationLabel(z.closure.confirmationMode, z.closure.signer, locale)} \xB7 ${z.closure.decisionId}`
    ),
    `## ${zh ? "\u53D7\u5BA1\u89C4\u5219\u5019\u9009" : "Reviewed rule candidate"}`,
    `${s.rule.status} \xB7 v${s.rule.version} \xB7 ${s.rule.body}`,
    ...approvalRecords(s.rule.approval ? [s.rule.approval] : []),
    "",
    `## ${zh ? "\u5BA1\u8BA1\u4E0E\u8D23\u4EFB" : "Audit and accountability"}`,
    ...s.audit.slice(-12).map(
      (e) => `- r${e.revision} ${e.at} ${e.action} ${e.subject}; Host approval: ${e.approval ?? "\u2014"}; ${e.approval ? confirmationLabel(e.confirmationMode, e.signer ?? "\u2014", locale) : "\u2014"}`
    ),
    "",
    "ECSS-Q-ST-10/20 series; ECSS-Q-ST-10-09C; AS9100D \xA78.3.6 / \xA78.5.2 / \xA78.7 / \xA710.2; NASA-STD-8739 workmanship concepts; NPR 7120.5 lifecycle reviews; GJB 9001C; \u53CC\u4E94\u6761\u5F52\u96F6. Conceptual demonstration, no certification claim."
  ];
  const markdown = lines.join("\n");
  const escapeHtml = (v) => v.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;");
  const blocks = [];
  let list = false, table = false;
  const close = () => {
    if (list) {
      blocks.push("</ul>");
      list = false;
    }
    if (table) {
      blocks.push("</tbody></table>");
      table = false;
    }
  };
  for (const line of lines.slice(1)) {
    if (!line) {
      close();
      continue;
    }
    if (line.startsWith("| ---")) continue;
    if (line.startsWith("| ")) {
      const cells = line.split("|").slice(1, -1).map((cell) => escapeHtml(cell.trim()));
      if (!table) {
        close();
        blocks.push(
          `<table><caption>${zh ? "\u53CC\u4E94\u6761\u8BC1\u636E\u77E9\u9635" : "Double-five evidence matrix"}</caption><thead><tr>${cells.map((c) => `<th scope="col">${c}</th>`).join("")}</tr></thead><tbody>`
        );
        table = true;
      } else blocks.push(`<tr>${cells.map((c) => `<td>${c}</td>`).join("")}</tr>`);
    } else if (line.startsWith("- ")) {
      if (!list) {
        close();
        blocks.push("<ul>");
        list = true;
      }
      blocks.push(`<li>${escapeHtml(line.slice(2))}</li>`);
    } else {
      close();
      blocks.push(
        line.startsWith("## ") ? `<h2>${escapeHtml(line.slice(3))}</h2>` : `<p>${escapeHtml(line)}</p>`
      );
    }
  }
  close();
  const html = `<!doctype html><html lang="${locale}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>${escapeHtml(title)}</title><style>body{font:15px/1.7 system-ui;max-width:960px;margin:48px auto;padding:24px;color:#15283c;overflow-wrap:anywhere}h1{font-size:28px;border-bottom:3px solid #247b90;padding-bottom:16px}h2{font-size:19px;margin-top:28px}table{border-collapse:collapse;width:100%;font-size:13px}caption{text-align:left;font-weight:600;margin:8px 0}th,td{border:1px solid #cad6df;padding:9px;text-align:left}th{background:#eef5f8}tr{break-inside:avoid}@media print{body{margin:0;padding:0;font-size:11px}h1{font-size:24px}h2{break-after:avoid}table{font-size:10px}}</style></head><body><h1>${escapeHtml(title)}</h1>${blocks.join("")}</body></html>`;
  return { title, markdown, html, revision: s.revision };
}

// src/index.ts
var strict = { additionalProperties: false };
var id = Type.String({ minLength: 1, maxLength: 64 });
var revision = Type.Integer({ minimum: 1 });
var empty = Type.Object({}, strict);
var draftSchema = Type.Object(
  {
    ncrId: id,
    disposition: Type.Union([
      Type.Literal("use-as-is"),
      Type.Literal("rework"),
      Type.Literal("repair"),
      Type.Literal("scrap"),
      Type.Literal("return-to-supplier")
    ]),
    rationale: Type.String({ minLength: 20, maxLength: 2e3 }),
    expectedRevision: revision
  },
  strict
);
var decisionSchema = Type.Object(
  {
    kind: Type.Union([
      Type.Literal("mrb"),
      Type.Literal("configuration"),
      Type.Literal("rule"),
      Type.Literal("zeroing")
    ]),
    id,
    expectedRevision: revision
  },
  strict
);
var candidateSchema = Type.Object({ expectedRevision: revision }, strict);
var outputSchema = Type.Object({ revision, data: Type.Unknown() }, strict);
var playbook = readFileSync(new URL("../skills/quality-playbook/SKILL.md", import.meta.url), "utf8");
var json = (v) => JSON.parse(JSON.stringify(v));
function tool(name, description, parameters, run, mode = "read") {
  return defineTool({
    name,
    description,
    parameters,
    result: outputSchema,
    meta: {
      isReadOnly: mode === "read",
      isDestructive: mode === "decision",
      isConcurrencySafe: mode === "read",
      isOpenWorld: false,
      replay: mode === "read" ? "safe" : "never",
      requiresApproval: mode === "decision" ? "always" : "never",
      ...mode === "report" ? { attestsHistory: true } : {}
    },
    async execute(input, ctx) {
      ctx.signal.throwIfAborted();
      try {
        const data = await run(input, ctx);
        const output = { revision: read(ctx.store).revision, data: json(data) };
        return { content: [{ type: "text", text: JSON.stringify(output) }], structured: output };
      } catch (error) {
        const code = error?.message;
        return toolError(
          error instanceof Error ? error.message : typeof code === "string" && /^SKILL_[A-Z_]+$/.test(code) ? code : String(error)
        );
      }
    }
  });
}
var tools = [
  tool(
    "aero_playbook",
    "Read the aerospace quality playbook before work / \u5DE5\u4F5C\u524D\u8BFB\u53D6\u7814\u5236\u8D28\u91CF\u6280\u80FD\u3002",
    empty,
    () => ({ name: "aerospace-quality-playbook", body: playbook })
  ),
  tool(
    "aero_trace",
    "Requirement/design/test coverage, orphan and untested gaps / \u9700\u6C42\u2014\u8BBE\u8BA1\u2014\u8BD5\u9A8C\u8FFD\u6EAF\u53CA\u7F3A\u53E3\u3002",
    empty,
    (_i, c) => ({ health: health(read(c.store)), matrix: coverage(read(c.store)) })
  ),
  tool(
    "aero_investigate",
    "Investigate AN-027 using measured limits, lot change and NCR evidence. Hypotheses are not confirmed causes / \u4F9D\u636E\u5B9E\u6D4B\u9650\u503C\u3001\u6279\u6B21\u66F4\u6539\u548C NCR \u8BCA\u65AD\u5F02\u5E38\uFF0C\u5047\u8BBE\u4E0D\u7B49\u4E8E\u539F\u56E0\u3002",
    Type.Object({ anomalyId: Type.Literal("AN-027") }, strict),
    (_i, c) => investigate(read(c.store))
  ),
  tool(
    "aero_briefing",
    "Publish a data-only Intelligent UI evidence chart and table in the conversation/workbench / \u5728\u4F1A\u8BDD\u4E0E\u5DE5\u4F5C\u53F0\u53D1\u5E03\u7ED3\u6784\u5316\u8BC1\u636E\u56FE\u8868\u3002",
    Type.Object({ locale: Type.Union([Type.Literal("zh-CN"), Type.Literal("en")]) }, strict),
    async (i, c) => {
      const surface = briefing(read(c.store), i.locale);
      const result = await c.tools.invoke("ui_render", { surface: json(surface) }, { signal: c.signal });
      if (result.isError) throw new Error("\u8BC1\u636E\u7B80\u62A5\u53D1\u5E03\u5931\u8D25 / Evidence briefing publication failed");
      return {
        surfaceId: surface.id,
        revision: surface.revision,
        evidence: investigate(read(c.store)).evidence
      };
    },
    "draft"
  ),
  tool(
    "aero_change_review",
    "Analyze ECR requirement/interface/test impact and the currently approved screening rule / \u5206\u6790\u66F4\u6539\u5F71\u54CD\u53CA\u5DF2\u6279\u51C6\u7684\u7B5B\u9009\u89C4\u5219\u3002",
    Type.Object({ ecrId: id }, strict),
    (i, c) => impact(read(c.store), i.ecrId)
  ),
  tool(
    "aero_quality",
    "Read programme dashboard, double-five evidence, supply chain or audit / \u67E5\u770B\u8D28\u91CF\u603B\u89C8\u3001\u53CC\u4E94\u6761\u3001\u4F9B\u5E94\u94FE\u6216\u5BA1\u8BA1\u3002",
    Type.Object(
      {
        view: Type.Union([
          Type.Literal("dashboard"),
          Type.Literal("zeroing"),
          Type.Literal("parts"),
          Type.Literal("audit")
        ])
      },
      strict
    ),
    (i, c) => {
      const s = read(c.store);
      return i.view === "dashboard" ? health(s) : i.view === "zeroing" ? s.zeroing : i.view === "parts" ? s.parts : s.audit;
    }
  ),
  tool(
    "aero_mrb_draft",
    "Draft an NCR disposition with evidence; no hardware released. Then request aero_decide and wait for human MRB / \u8D77\u8349\u5904\u7F6E\uFF0C\u4E0D\u653E\u884C\u786C\u4EF6\uFF0C\u968F\u540E\u8BF7\u6C42\u4EBA\u5DE5 MRB\u3002",
    draftSchema,
    (i, c) => draft(c.store, i),
    "draft"
  ),
  tool(
    "aero_rule_propose",
    "Propose TVAC-LOT-001 as an inactive reviewed skill candidate. Human approval is mandatory before use / \u63D0\u8BAE\u672A\u542F\u7528\u7684\u70ED\u771F\u7A7A\u7B5B\u9009\u6280\u80FD\u5019\u9009\uFF0C\u4F7F\u7528\u524D\u987B\u4EBA\u5DE5\u6279\u51C6\u3002",
    candidateSchema,
    (i, c) => propose(c.store, i.expectedRevision),
    "draft"
  ),
  tool(
    "aero_skill_candidate",
    "Prepare, commit or inspect the actual Host-reviewed TVAC screening Skill candidate. Installation requires native human approval and takes effect next turn / \u63D0\u4EA4\u771F\u5B9E\u5BBF\u4E3B\u6280\u80FD\u5019\u9009\uFF0C\u5B89\u88C5\u987B\u539F\u751F\u4EBA\u5DE5\u5BA1\u6279\uFF0C\u4E0B\u4E00\u8F6E\u751F\u6548\u3002",
    Type.Object(
      {
        action: Type.Union([
          Type.Literal("prepare"),
          Type.Literal("commit"),
          Type.Literal("status"),
          Type.Literal("cancel")
        ]),
        proposalId: Type.Optional(id)
      },
      strict
    ),
    async (i, c) => {
      if (!c.skillInstall)
        throw new Error("\u5BBF\u4E3B\u6280\u80FD\u5B89\u88C5\u7AEF\u53E3\u4E0D\u53EF\u7528 / Host Skill installation port unavailable");
      if (i.action === "prepare") {
        const s = read(c.store);
        if (s.rule.status === "absent") throw new Error("\u8BF7\u5148\u63D0\u8BAE\u89C4\u5219\u5019\u9009 / Propose the rule candidate first");
        return c.skillInstall.request({
          action: "prepare-content",
          name: "aerospace-tvac-lot-screening",
          files: [
            {
              path: "SKILL.md",
              content: `---
name: aerospace-tvac-lot-screening
description: Reviewed TVAC screening for thermally cycled lot substitutions / \u70ED\u5FAA\u73AF\u6279\u6B21\u66FF\u6362\u7684\u53D7\u5BA1\u70ED\u771F\u7A7A\u7B5B\u9009\u3002
---

${s.rule.body}
Evidence / \u4F9D\u636E: ${s.rule.evidence.join(", ")}
Use aero_change_review, cite ruleVersion, request human aero_decide for configuration changes. Never claim a passing test without reviewed evidence. / \u4F7F\u7528\u66F4\u6539\u8BC4\u5BA1\u5DE5\u5177\uFF0C\u5F15\u7528\u89C4\u5219\u7248\u672C\uFF1B\u66F4\u6539\u987B\u4EBA\u5DE5\u6279\u51C6\uFF0C\u4E0D\u80FD\u865A\u6784\u8BD5\u9A8C\u901A\u8FC7\u3002
`
            }
          ],
          scope: "workspace",
          enable: true
        });
      }
      if (!i.proposalId) throw new Error("\u9700\u8981 proposalId / proposalId required");
      return c.skillInstall.request({ action: i.action, proposalId: i.proposalId });
    },
    "draft"
  ),
  tool(
    "aero_decide",
    "Consequential human decision: MRB disposition, configuration change, reviewed rule activation or evidence-complete zeroing closure. Requires Host business consent and current revision; full access auto-confirms for the human principal with an explicit record / MRB\u3001\u6280\u672F\u72B6\u6001\u3001\u89C4\u5219\u542F\u7528\u4E0E\u5F52\u96F6\u8981\u6C42\u5BBF\u4E3B\u4E1A\u52A1\u7B7E\u7F72\u548C\u5F53\u524D\u4FEE\u8BA2\uFF1B\u5B8C\u5168\u8BBF\u95EE\u4E0B\u4EE3\u8868\u4F1A\u8BDD\u771F\u4EBA\u81EA\u52A8\u786E\u8BA4\u5E76\u660E\u786E\u8BB0\u5F55\u3002",
    decisionSchema,
    async (i, c) => {
      const state = read(c.store);
      if (state.revision !== i.expectedRevision)
        throw new Error("Revision changed; review again / \u6570\u636E\u5DF2\u53D8\u5316\uFF0C\u8BF7\u91CD\u65B0\u5BA1\u9605");
      const record = i.kind === "mrb" ? state.ncrs.find((row) => row.id === i.id) : i.kind === "configuration" ? state.ecrs.find((row) => row.id === i.id) : i.kind === "zeroing" ? state.zeroing.find((row) => row.id === i.id) : state.rule;
      const meaning = {
        mrb: {
          en: "I approve this MRB disposition for implementation; hardware remains on hold pending verification.",
          "zh-CN": "\u6211\u6279\u51C6\u5B9E\u65BD\u672C MRB \u5904\u7F6E\uFF1B\u786C\u4EF6\u4FDD\u6301\u9694\u79BB\uFF0C\u7B49\u5F85\u590D\u9A8C\u3002"
        },
        configuration: {
          en: "I approve this configuration change and its required verification, without claiming tests have passed.",
          "zh-CN": "\u6211\u6279\u51C6\u672C\u6280\u672F\u72B6\u6001\u66F4\u6539\u53CA\u6240\u9700\u9A8C\u8BC1\uFF0C\u4E0D\u5BA3\u79F0\u8BD5\u9A8C\u901A\u8FC7\u3002"
        },
        rule: {
          en: "I approve activation of this reviewed screening rule.",
          "zh-CN": "\u6211\u6279\u51C6\u542F\u7528\u672C\u6B21\u5DF2\u5BA1\u9605\u7684\u7B5B\u9009\u89C4\u5219\u3002"
        },
        zeroing: {
          en: "I confirm the complete reviewed evidence and approve quality closure.",
          "zh-CN": "\u6211\u786E\u8BA4\u5B8C\u6574\u7684\u5DF2\u5BA1\u9605\u8BC1\u636E\u5E76\u6279\u51C6\u8D28\u91CF\u5F52\u96F6\u5173\u95ED\u3002"
        }
      }[i.kind];
      const approval = await sign(c, { ...i, record }, meaning, i.id);
      return {
        ...decide(c.store, i, approval),
        signature: {
          decisionId: approval.requestId,
          meaning: approval.signedMeaning,
          signer: approval.answeredBy.id,
          confirmationMode: approval.confirmationMode,
          signedAt: approval.signedAt,
          reviewedRevision: i.expectedRevision,
          purpose: "business.confirm"
        }
      };
    },
    "decision"
  ),
  tool(
    "aero_report",
    "Generate Markdown and printable HTML evidence reports and internally present them as deliverables; do not guess paths or present before this tool returns / \u751F\u6210\u5E76\u5C55\u793A Markdown \u4E0E\u53EF\u6253\u5370 HTML \u8BC1\u636E\u62A5\u544A\u3002",
    Type.Object(
      {
        kind: Type.Union([Type.Literal("zeroing"), Type.Literal("digest")]),
        locale: Type.Union([Type.Literal("zh-CN"), Type.Literal("en")])
      },
      strict
    ),
    async (i, c) => {
      const result = report(read(c.store), i.kind, i.locale);
      const paths = [];
      const reportId = crypto.randomUUID();
      for (const [extension, _mime, body] of [
        ["md", "text/markdown", result.markdown],
        ["html", "text/html", result.html]
      ]) {
        c.signal.throwIfAborted();
        const path = `aero-output/QVX-${i.kind}-r${result.revision}-${reportId}.${extension}`;
        await c.fs.write(path, body);
        paths.push(path);
      }
      const presented = await c.tools.invoke(
        "present",
        {
          files: paths.map((path) => ({
            path,
            name: `${result.title}.${path.endsWith(".html") ? "html" : "md"}`
          }))
        },
        { signal: c.signal }
      );
      if (presented.isError)
        throw new Error("\u62A5\u544A\u5DF2\u751F\u6210\uFF0C\u4F46\u4EA4\u4ED8\u7269\u5C55\u793A\u5931\u8D25 / Report generated but presentation failed");
      return {
        title: result.title,
        paths,
        status: i.kind === "zeroing" ? "draft-evidence-incomplete" : "generated",
        revision: result.revision
      };
    },
    "report"
  )
];
var plain = (schema) => json(schema);
var serviceCommon = {
  scope: "profile",
  timeoutMs: 5e3,
  maxResultBytes: 524288,
  outputSchema: { type: "object" }
};
var policy = (approval) => ({
  isDestructive: approval,
  isOpenWorld: false,
  replay: "never",
  requiresApproval: approval ? "always" : "never",
  approvalScopes: []
});
var main = defineAgnesPlugin({
  apply(ctx) {
    for (const t of tools) ctx.tools.register(t);
    const skills = ctx.skills;
    skills.register({
      name: "aerospace-quality-playbook",
      description: "Evidence-first traceability, MRB, configuration control and double-five zeroing / \u8BC1\u636E\u4F18\u5148\u7684\u8FFD\u6EAF\u3001MRB\u3001\u6280\u672F\u72B6\u6001\u4E0E\u53CC\u4E94\u6761\u5F52\u96F6",
      body: playbook
    });
    ctx.services.register({
      ...serviceCommon,
      name: "aero.snapshot",
      kind: "query",
      inputSchema: plain(empty),
      async handler(_i, c) {
        const s = read(c.store);
        return json({ ...s, health: health(s), matrix: coverage(s), anomaly: investigate(s) });
      }
    });
    ctx.services.register({
      ...serviceCommon,
      name: "aero.impact",
      kind: "query",
      inputSchema: plain(Type.Object({ ecrId: id }, strict)),
      async handler(i, c) {
        return json(impact(read(c.store), i.ecrId));
      }
    });
    function effect(name, schema, approval, handler) {
      ctx.services.register({
        ...serviceCommon,
        name,
        kind: "effect",
        inputSchema: plain(schema),
        effectPolicy: policy(approval),
        async prepare(input, c) {
          return {
            input,
            resourceRevision: String(read(c.store).revision),
            presentation: json({
              input,
              warning: "Synthetic programme. Human review required / \u5408\u6210\u9879\u76EE\uFF0C\u987B\u4EBA\u5DE5\u5BA1\u9605",
              revision: read(c.store).revision
            })
          };
        },
        async handler(input, c) {
          c.signal.throwIfAborted();
          return json(handler(input, c.store, c));
        }
      });
    }
    effect("aero.draft", draftSchema, false, (i, s) => draft(s, i));
    effect("aero.propose", candidateSchema, false, (i, s) => propose(s, i.expectedRevision));
    effect("aero.decide", decisionSchema, true, (i, s, c) => decide(s, i, c.admission?.approval));
  }
});
var cards = defineAgnesPlugin({ apply() {
} });
export {
  cards,
  decisionSchema,
  draftSchema,
  empty,
  main,
  reviewPolicyPlugin,
  tools
};
