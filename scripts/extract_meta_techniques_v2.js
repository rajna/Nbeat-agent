#!/usr/bin/env node
/**
 * NBeat Meta-Technique Extractor v2
 * 
 * Parses part10_增量归并转化.md + part12_增量归并转化.md
 * (rich format with explicit MT/OP/params, composite detection, merge tracking)
 * Applies 分析原则2.1.md rules.
 * Outputs A/B/C/D catalogs to skills/nbeat/new/
 */

const fs = require("fs");
const path = require("path");

const INPUT_DIR = path.resolve(__dirname, "..", "skills", "nbeat", "new", "origin");
const OUTPUT_DIR = path.resolve(__dirname, "..", "skills", "nbeat", "new");
const FILES = ["part10_增量归并转化.md", "part12_增量归并转化.md"];

// ── Parse techniques from rich format ──────────────────

function parseTechniques(filePath) {
  const content = fs.readFileSync(filePath, "utf-8");
  const techniques = [];

  // Split by <维度> blocks
  const blocks = content.split(/<维度>/);
  
  for (let i = 1; i < blocks.length; i++) {
    const block = blocks[i];
    
    const dimMatch = block.match(/^([^<]+)/);
    const nameMatch = block.match(/<音乐技巧名>([^<]+)/);
    const descMatch = block.match(/<音乐技巧>([\s\S]*?)<\/音乐技巧>/);
    
    // Parse base layer expression
    const baseMatch = block.match(/<基础层表达>([\s\S]*?)<\/基础层表达>/);
    
    // Parse params block
    const paramsMatch = block.match(/<技巧参数>([\s\S]*?)<\/技巧参数>/);
    
    // Parse composite detection
    const compositeMatch = block.match(/<复合技巧判断>([\s\S]*?)<\/复合技巧判断>/);
    
    // Parse merge tracking
    const mergeMatch = block.match(/<增量归并判断>([\s\S]*?)<\/增量归并判断>/);
    
    const infoMatch = block.match(/<技巧高熵信息>([\s\S]*?)<\/技巧高熵信息>/);
    const targetMatch = block.match(/<技巧目标>([\s\S]*?)(?:<\/技巧目标>|<\/|$)/);

    const dimension = dimMatch ? dimMatch[1].trim() : "";
    const name = nameMatch ? nameMatch[1].trim() : "";
    const description = descMatch ? descMatch[1].trim() : "";
    const highEntropy = infoMatch ? infoMatch[1].trim() : "";
    const target = targetMatch ? targetMatch[1].trim() : "";

    // Parse parameters from structured block
    const params = {};
    if (paramsMatch) {
      const paramLines = paramsMatch[1].split("\n");
      for (const line of paramLines) {
        // Format 1: OP_xxx.key:value (part12 style)
        const opKeyMatch = line.match(/^(OP_\w+)\.(\w[\w_]*)\s*:\s*(.+)/);
        if (opKeyMatch) {
          let value = opKeyMatch[3].trim();
          try { value = JSON.parse(value); } catch {}
          params[`${opKeyMatch[1]}.${opKeyMatch[2]}`] = value;
          continue;
        }
        // Format 2: key:value (part10 style)
        const kvMatch = line.match(/^(\w[\w_]*)\s*:\s*(.+)/);
        if (kvMatch && !kvMatch[1].startsWith("OP_")) {
          let value = kvMatch[2].trim();
          try { value = JSON.parse(value); } catch {}
          params[kvMatch[1]] = value;
        }
      }
    }

    // Parse base layer: extract MT + OP + nested params
    const baseLayer = parseBaseLayer(baseMatch ? baseMatch[1] : "", params);
    
    // Parse composite info
    const composite = parseComposite(compositeMatch ? compositeMatch[1] : "");
    
    // Parse merge info
    const merge = parseMerge(mergeMatch ? mergeMatch[1] : "");

    techniques.push({
      source: path.basename(filePath),
      dimension,
      name,
      description: description.slice(0, 200),
      baseLayer,
      params,
      composite,
      merge,
      highEntropy,
      target,
    });
  }

  return techniques;
}

function parseBaseLayer(text, fallbackParams) {
  const result = { mts: [], ops: [], allParams: {} };
  if (!text.trim()) return result;

  // Find all MT blocks: MT_xxx( ... )
  // Use regex to match balanced parentheses for MT blocks
  const mtRegex = /(MT_\w+)\s*\(/g;
  let mtMatch;
  const mtBlocks = [];
  let lastIndex = 0;
  
  // Find MT positions and extract blocks with balanced parens
  while ((mtMatch = mtRegex.exec(text)) !== null) {
    const mtName = mtMatch[1];
    const startIdx = mtMatch.index + mtMatch[0].length;
    let depth = 1;
    let endIdx = startIdx;
    while (depth > 0 && endIdx < text.length) {
      if (text[endIdx] === '(') depth++;
      else if (text[endIdx] === ')') depth--;
      endIdx++;
    }
    mtBlocks.push({ name: mtName, content: text.slice(startIdx, endIdx - 1) });
    lastIndex = endIdx;
  }

  for (const mtBlock of mtBlocks) {
    result.mts.push(mtBlock.name);
    
    // Find all OP blocks with balanced parens
    const opRegex = /(OP_\w+)\s*\(/g;
    let opMatch;
    while ((opMatch = opRegex.exec(mtBlock.content)) !== null) {
      const opName = opMatch[1];
      const startIdx = opMatch.index + opMatch[0].length;
      let depth = 1;
      let endIdx = startIdx;
      while (depth > 0 && endIdx < mtBlock.content.length) {
        if (mtBlock.content[endIdx] === '(') depth++;
        else if (mtBlock.content[endIdx] === ')') depth--;
        endIdx++;
      }
      const paramsStr = mtBlock.content.slice(startIdx, endIdx - 1);
      result.ops.push({ mt: mtBlock.name, op: opName });
      
      // Parse key=value pairs
      // Handle multi-line: key=value, key=value
      const kvRegex = /(\w+)\s*=\s*([^,\n]+?)(?:,|\n|$)/g;
      let kvMatch;
      while ((kvMatch = kvRegex.exec(paramsStr)) !== null) {
        let value = kvMatch[2].trim();
        // Try parse JSON arrays/objects
        if ((value.startsWith('[') || value.startsWith('{')) && !value.startsWith('[[')) {
          try { value = JSON.parse(value); } catch {}
        }
        const key = `${opName}.${kvMatch[1]}`;
        result.allParams[key] = value;
      }
    }
  }

  // Merge with fallback params (from <技巧参数> block)
  for (const [k, v] of Object.entries(fallbackParams)) {
    // Only add if not already extracted from base layer
    const normalizedKey = k.startsWith('OP_') ? k : k;
    if (!result.allParams[normalizedKey]) {
      result.allParams[normalizedKey] = v;
    }
  }

  return result;
}

function parseComposite(text) {
  const result = { is_composite: false, driver: "", children: [], relation: "", reason: "" };
  if (!text.trim()) return result;

  const isMatch = text.match(/is_composite\s*:\s*(\w+)/);
  const driverMatch = text.match(/driver\s*:\s*(\S+)/);
  const childrenMatch = text.match(/children\s*:\s*\[([^\]]*)\]/);
  const relationMatch = text.match(/relation\s*:\s*(\S+)/);
  const reasonMatch = text.match(/reason\s*:\s*([\s\S]+?)(?:\n\s*\n|\n\s*$|$)/);

  result.is_composite = isMatch ? isMatch[1] === "true" : false;
  result.driver = driverMatch ? driverMatch[1] : "";
  result.children = childrenMatch ? childrenMatch[1].split(",").map(s => s.trim()) : [];
  result.relation = relationMatch ? relationMatch[1] : "";
  result.reason = reasonMatch ? reasonMatch[1].trim() : "";

  return result;
}

function parseMerge(text) {
  const result = { action: "", existing_mt: "", existing_op: "", param_extension: false, new_mt: false };
  if (!text.trim()) return result;

  const actionMatch = text.match(/action\s*:\s*(\S+)/);
  const mtMatch = text.match(/existing_mt\s*:\s*(\S+)/);
  const opMatch = text.match(/existing_or_target_op\s*:\s*(\S+)/);
  const paramMatch = text.match(/param_extension\s*:\s*(\w+)/);
  const newMtMatch = text.match(/new_mt\s*:\s*(\w+)/);

  result.action = actionMatch ? actionMatch[1] : "";
  result.existing_mt = mtMatch ? mtMatch[1] : "";
  result.existing_op = opMatch ? opMatch[1] : "";
  result.param_extension = paramMatch ? paramMatch[1] === "true" : false;
  result.new_mt = newMtMatch ? newMtMatch[1] === "true" : false;

  return result;
}

// ── Build Catalog A: MT dimensions + OP catalog ──────

function buildCatalogA(techniques) {
  const mtMap = new Map();
  const opMap = new Map();

  for (const t of techniques) {
    const { baseLayer, merge } = t;
    
    for (const mt of baseLayer.mts) {
      if (!mtMap.has(mt)) {
        mtMap.set(mt, {
          name: mt,
          domain: t.dimension,
          op_count: 0,
          technique_count: 0,
          merge_action: merge.action || "",
        });
      }
      mtMap.get(mt).technique_count++;
    }

    for (const { mt, op } of baseLayer.ops) {
      if (!opMap.has(op)) {
        opMap.set(op, {
          name: op,
          parent_mt: mt,
          description: t.name,
          technique_count: 0,
          merge_action: merge.action || "",
          param_keys: new Set(),
        });
      }
      const opEntry = opMap.get(op);
      opEntry.technique_count++;
      
      for (const key of Object.keys(baseLayer.allParams)) {
        const shortKey = key.replace(op + ".", "");
        opEntry.param_keys.add(shortKey);
      }
    }
  }

  // Update MT op counts
  for (const [opName, opEntry] of opMap) {
    if (mtMap.has(opEntry.parent_mt)) {
      mtMap.get(opEntry.parent_mt).op_count++;
    }
  }

  return { mtMap, opMap };
}

// ── Build Catalog B: Parameter value spaces ───────────

function buildCatalogB(techniques) {
  const paramSpace = new Map();

  for (const t of techniques) {
    const { baseLayer } = t;
    for (const [key, value] of Object.entries(baseLayer.allParams)) {
      if (!paramSpace.has(key)) {
        paramSpace.set(key, { values: new Map(), total: 0, ops: new Set() });
      }
      
      const entry = paramSpace.get(key);
      entry.total++;
      
      // Also track which OP this key belongs to
      const opName = key.split(".").slice(0, 2).join(".");
      entry.ops.add(opName);
      
      const valStr = typeof value === "object" ? JSON.stringify(value) : String(value);
      if (valStr.length < 300) {
        entry.values.set(valStr, (entry.values.get(valStr) || 0) + 1);
      }
    }
  }

  return paramSpace;
}

// ── Build Catalog C: Compound techniques ──────────────

function buildCatalogC(techniques) {
  const compoundOps = new Map();

  for (const t of techniques) {
    if (!t.composite.is_composite) continue;

    const key = t.composite.driver || t.name;
    if (!compoundOps.has(key)) {
      compoundOps.set(key, {
        name: t.name,
        driver: t.composite.driver,
        children: t.composite.children,
        relation: t.composite.relation,
        reason: t.composite.reason,
        mts: [...new Set(t.baseLayer.mts)],
        ops: t.baseLayer.ops,
        technique_count: 0,
      });
    }
    compoundOps.get(key).technique_count++;
  }

  return compoundOps;
}

// ── Build Catalog D: Compound parameter spaces ────────

function buildCatalogD(techniques) {
  // Extract COMPOUND-LEVEL structural parameters only:
  // driver MT, children MT/OP, relation type, dynamic axis, mechanism
  // NOT base-layer OP parameters (those belong in B)
  const compoundParams = new Map();

  for (const t of techniques) {
    if (!t.composite.is_composite) continue;

    const compoundName = t.composite.driver || t.name;
    
    // Compound structural parameters
    const structuralParams = {
      "driver_MT": t.baseLayer.mts[0] || "",
      "driver_OP": t.baseLayer.ops[0]?.op || "",
      "involved_MTs": t.baseLayer.mts.join(", "),
      "involved_OPs": t.baseLayer.ops.map(o => o.op).join(", "),
      "MT_count": t.baseLayer.mts.length,
      "OP_count": t.baseLayer.ops.length,
      "relation": t.composite.relation || t.params.relation || "",
      "mechanism": t.params.mechanism || "",
      "dynamic_axis": t.params.dynamic_axis || "",
    };

    for (const [key, value] of Object.entries(structuralParams)) {
      if (!value && value !== 0) continue;
      const fullKey = `${compoundName}.${key}`;
      if (!compoundParams.has(fullKey)) {
        compoundParams.set(fullKey, { values: new Map(), total: 0 });
      }
      const entry = compoundParams.get(fullKey);
      entry.total++;
      const valStr = String(value);
      entry.values.set(valStr, (entry.values.get(valStr) || 0) + 1);
    }
  }

  return compoundParams;
}

// ── Write output files ────────────────────────────────

function writeCatalogA(mtMap, opMap) {
  let out = "# 目录A：元技巧与算子目录\n\n";
  out += "来源：part10_增量归并转化.md + part12_增量归并转化.md，按分析原则2.1转化。\n";
  out += "包含增量归并追踪：复用/扩展/新增。\n\n";

  // MT dimensions
  out += "## 元技巧维度 (MT)\n\n";
  out += "| MT维度 | 领域 | 算子数 | 实例数 | 归并动作 |\n";
  out += "|---|---|---|---|---|\n";
  const sortedMT = [...mtMap.entries()].sort((a, b) => b[1].technique_count - a[1].technique_count);
  for (const [name, mt] of sortedMT) {
    const action = mt.merge_action || "—";
    out += `| \`${name}\` | ${mt.domain} | ${mt.op_count} | ${mt.technique_count} | ${action} |\n`;
  }
  out += `\n共 ${mtMap.size} 个 MT 维度\n\n`;

  // OP catalog grouped by MT
  out += "## 算子目录 (OP)\n\n";
  const opsByMT = new Map();
  for (const [opName, opEntry] of opMap) {
    const mt = opEntry.parent_mt;
    if (!opsByMT.has(mt)) opsByMT.set(mt, []);
    opsByMT.get(mt).push(opEntry);
  }

  for (const [mt, ops] of [...opsByMT.entries()].sort()) {
    out += `### \`${mt}\`\n\n`;
    out += "| OP算子 | 描述 | 参数键 | 实例数 | 归并 |\n";
    out += "|---|---|---|---|---|\n";
    for (const op of ops.sort((a, b) => b.technique_count - a.technique_count)) {
      const paramKeys = [...op.param_keys].slice(0, 10).join(", ");
      out += `| \`${op.name}\` | ${op.description.slice(0, 50)} | ${paramKeys}${op.param_keys.size > 10 ? "..." : ""} | ${op.technique_count} | ${op.merge_action || "—"} |\n`;
    }
    out += "\n";
  }
  out += `\n共 ${opMap.size} 个 OP 算子\n`;

  fs.writeFileSync(path.join(OUTPUT_DIR, "A_元技巧与算子目录.md"), out, "utf-8");
}

function writeCatalogB(paramSpace) {
  let out = "# 目录B：参数值空间\n\n";
  out += "来源：part10_增量归并转化.md + part12_增量归并转化.md，按分析原则2.1转化。\n\n";
  out += "## 参数空间读取规则\n";
  out += "- 参数键来自 `OP_xxx(key=value, ...)`\n";
  out += "- 值空间从基础层表达直接提取\n";
  out += "- 每个参数最多列出前 20 个高频值\n\n";

  out += "## 元技巧参数索引\n\n";

  // Group by OP
  const byOp = new Map();
  for (const [fullKey, entry] of paramSpace) {
    // fullKey format: OP_xxx.param_key or OP_xxx.sub_param.key
    // OP name is everything up to the first dot after OP_
    const firstDot = fullKey.indexOf(".");
    const op = fullKey.slice(0, firstDot);
    const paramKey = fullKey.slice(firstDot + 1);
    if (!byOp.has(op)) byOp.set(op, []);
    byOp.get(op).push({ fullKey, paramKey, entry });
  }

  for (const [op, params] of [...byOp.entries()].sort()) {
    out += `### \`${op}\`\n\n`;
    out += "| 参数键 | 不同值数 | 高频/样本值 |\n";
    out += "|---|---|---|\n";
    for (const { paramKey, entry } of params.sort((a, b) => b.entry.total - a.entry.total)) {
      const sortedVals = [...entry.values.entries()]
        .sort((a, b) => b[1] - a[1])
        .slice(0, 20);
      const valStr = sortedVals
        .map(([v, c]) => `\`${v.slice(0, 60)}${v.length > 60 ? "…" : ""}\`(${c})`)
        .join(", ");
      out += `| \`${paramKey}\` | ${entry.values.size} | ${valStr} |\n`;
    }
    out += "\n";
  }
  out += `\n共 ${paramSpace.size} 个参数键\n`;

  fs.writeFileSync(path.join(OUTPUT_DIR, "B_参数值空间.md"), out, "utf-8");
}

function writeCatalogC(compoundOps) {
  let out = "# 目录C：复合元技巧与复合算子目录\n\n";
  out += "来源：part10_增量归并转化.md + part12_增量归并转化.md，按分析原则2.1复合层规则转化。\n";
  out += "复合技巧判断基于数据中的显式 `is_composite:true` 标记。\n\n";

  out += "## 复合元技巧目录 (MCT)\n\n";
  out += "| MCT | 驱动 | MT维度 | 组合关系 | 子结构 | 实例数 | 判断依据 |\n";
  out += "|---|---|---|---|---|---|---|\n";
  
  let idx = 1;
  for (const [driver, entry] of [...compoundOps.entries()].sort((a, b) => b[1].technique_count - a[1].technique_count)) {
    const mts = entry.mts.join(", ");
    const children = entry.children.slice(0, 4).join(", ");
    const reason = entry.reason.slice(0, 60);
    out += `| MCT_${idx} | ${driver} | ${mts} | ${entry.relation} | ${children || "—"} | ${entry.technique_count} | ${reason} |\n`;
    idx++;
  }
  out += `\n共 ${compoundOps.size} 个复合技巧\n\n`;

  // Detailed entries
  out += "## 复合技巧详情\n\n";
  for (const [driver, entry] of [...compoundOps.entries()].sort((a, b) => b[1].technique_count - a[1].technique_count)) {
    out += `### ${entry.name}\n\n`;
    out += `- **驱动结构**: ${driver}\n`;
    out += `- **MT维度**: ${entry.mts.join(", ")}\n`;
    out += `- **组合关系**: ${entry.relation}\n`;
    out += `- **子结构**: ${entry.children.join(", ") || "—"}\n`;
    out += `- **实例数**: ${entry.technique_count}\n`;
    out += `- **判断依据**: ${entry.reason}\n`;
    out += `- **涉及OP**: ${entry.ops.map(o => o.op).join(", ")}\n\n`;
  }

  fs.writeFileSync(path.join(OUTPUT_DIR, "C_复合元技巧与复合算子目录.md"), out, "utf-8");
}

function writeCatalogD(compoundParams) {
  let out = "# 目录D：复合算子参数值空间\n\n";
  out += "来源：part10_增量归并转化.md + part12_增量归并转化.md，按分析原则2.1复合层参数规则转化。\n";
  out += "值空间从检测为复合的技巧的基础层表达中提取。\n\n";

  out += "## 复合算子参数索引\n\n";
  for (const [fullKey, entry] of [...compoundParams.entries()].sort()) {
    out += `### \`${fullKey}\`\n\n`;
    out += "| 值 | 出现次数 |\n";
    out += "|---|---|\n";
    const sortedVals = [...entry.values.entries()].sort((a, b) => b[1] - a[1]);
    for (const [v, c] of sortedVals.slice(0, 20)) {
      out += `| \`${v.slice(0, 100)}${v.length > 100 ? "…" : ""}\` | ${c} |\n`;
    }
    out += "\n";
  }
  out += `\n共 ${compoundParams.size} 个复合参数键\n`;

  fs.writeFileSync(path.join(OUTPUT_DIR, "D_复合算子参数值空间.md"), out, "utf-8");
}

// ── Main ───────────────────────────────────────────────

console.log("🔬 NBeat Meta-Technique Extractor v2 (增量归并格式)");
console.log("====================================================");

let allTechniques = [];
for (const file of FILES) {
  const filePath = path.join(INPUT_DIR, file);
  if (!fs.existsSync(filePath)) {
    console.log(`⚠️  File not found: ${filePath}`);
    continue;
  }
  const techs = parseTechniques(filePath);
  console.log(`📄 ${file}: ${techs.length} techniques`);
  
  // Show merge stats
  const actions = {};
  for (const t of techs) {
    const a = t.merge.action || "unknown";
    actions[a] = (actions[a] || 0) + 1;
  }
  console.log(`   归并: ${JSON.stringify(actions)}`);
  
  allTechniques = allTechniques.concat(techs);
}

console.log(`\n📊 Total: ${allTechniques.length} techniques`);

// Build catalogs
const { mtMap, opMap } = buildCatalogA(allTechniques);
const paramSpace = buildCatalogB(allTechniques);
const compoundOps = buildCatalogC(allTechniques);
const compoundParams = buildCatalogD(allTechniques);

console.log(`\n📋 Catalog stats:`);
console.log(`   A: ${mtMap.size} MT dimensions, ${opMap.size} OP operators`);
console.log(`   B: ${paramSpace.size} parameter keys`);
console.log(`   C: ${compoundOps.size} compound techniques`);
console.log(`   D: ${compoundParams.size} compound parameter keys`);

// Write files
writeCatalogA(mtMap, opMap);
writeCatalogB(paramSpace);
writeCatalogC(compoundOps);
writeCatalogD(compoundParams);

console.log(`\n✅ Output: ${OUTPUT_DIR}/`);
console.log(`   A_元技巧与算子目录.md`);
console.log(`   B_参数值空间.md`);
console.log(`   C_复合元技巧与复合算子目录.md`);
console.log(`   D_复合算子参数值空间.md`);
