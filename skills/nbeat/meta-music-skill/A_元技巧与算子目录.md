# 目录A：元技巧与算子目录

来源：part10_增量归并转化.md + part12_增量归并转化.md，按分析原则2.1转化。
包含增量归并追踪：复用/扩展/新增。

## 元技巧维度 (MT)

| MT维度 | 领域 | 算子数 | 实例数 | 归并动作 |
|---|---|---|---|---|
| `MT_chord` | 和声进行 | 7 | 354 | 复用 |
| `MT_ton` | 调性布局 | 1 | 197 | 复用 |
| `MT_melody` | 旋律音级 | 4 | 190 | 参数扩展 |
| `MT_texture` | 句法密度 | 4 | 178 | 复用 |
| `MT_groove` | 节奏型 | 3 | 175 | 参数扩展 |
| `MT_motif` | 动机发展 | 2 | 141 | 复用 |
| `MT_time` | 曲式结构 | 1 | 82 | 复用 |
| `MT_dynamic` | 节奏密度 | 1 | 57 | — |
| `MT_space` | 编曲暗示 | 1 | 57 | — |
| `MT_timbre` | 编曲暗示 | 1 | 57 | — |
| `MT_voice` | 旋律和声关系 | 1 | 48 | 参数扩展 |

共 11 个 MT 维度

## 算子目录 (OP)

### `MT_chord`

| OP算子 | 描述 | 参数键 | 实例数 | 归并 |
|---|---|---|---|---|
| `OP_harmonic_cycle` | 级数骨架迁移 | roman, chords, target, intensity, evidence, mt, op, merge_action, mechanism, relation... | 164 | 复用 |
| `OP_bass_motion` | 根转位低音影线 | bass_outline, inversions, target, intensity, evidence, mt, op, merge_action, mechanism, relation... | 82 | 复用 |
| `OP_cadence_motion` | 尾部张力再入口 | tail_roman, tail_chords, tail_bass, target, intensity, evidence, mt, op, merge_action, mechanism... | 82 | 复用 |
| `OP_root_avoid` | 低音错位悬浮 | OP_bass_motion.pattern, OP_bass_motion.style, OP_bass_motion.upper_extensions, method, degree, OP_anchor.center, OP_anchor.stability, OP_harmonic_cycle.chords, OP_harmonic_cycle.center, OP_context.source_file... | 57 | — |
| `OP_cadence_delay` | 尾部收束钩子 | OP_form_loop_extension.section_end, OP_form_loop_extension.loop_return, OP_form_loop_extension.span, type, delay, resolution, OP_anchor.center, OP_harmonic_cycle.chords, OP_harmonic_cycle.center, OP_context.source_file... | 57 | — |
| `OP_extension_stack` | 转位借用保留 | inversions, borrowed, target, intensity, evidence, mt, op, merge_action, mechanism, relation... | 25 | 参数扩展 |
| `OP_synthesis` | 旋律孤立分析 | chords, note_count, center, target, intensity, evidence, mt, op, merge_action, mechanism... | 1 | 参数扩展 |

### `MT_dynamic`

| OP算子 | 描述 | 参数键 | 实例数 | 归并 |
|---|---|---|---|---|
| `OP_density_dynamic` | 短值推动语气 | OP_polyrhythm_grouping.meter, OP_polyrhythm_grouping.grouping, OP_polyrhythm_grouping.accent, OP_polyrhythm_grouping.offset, front, middle, end, control, OP_anchor.center, OP_harmonic_cycle.chords... | 57 | — |

### `MT_groove`

| OP算子 | 描述 | 参数键 | 实例数 | 归并 |
|---|---|---|---|---|
| `OP_syncopation_layout` | 网格落点偏好 | onset_mod1_distribution, grid, tempo_field, target, intensity, evidence, mt, op, merge_action, mechanism... | 93 | 复用 |
| `OP_polyrhythm_grouping` | 时值语速控制 | duration_distribution, note_count, rest_count, target, intensity, evidence, mt, op, merge_action, mechanism... | 82 | 参数扩展 |
| `OP_lock` | 非正拍进入 | OP_syncopation_layout.drum, OP_syncopation_layout.rap, OP_syncopation_layout.other_space, target, sync_source, OP_anchor.center, OP_harmonic_cycle.chords, OP_harmonic_cycle.center, OP_context.source_file, OP_context.json_index... | 57 | — |

### `MT_melody`

| OP算子 | 描述 | 参数键 | 实例数 | 归并 |
|---|---|---|---|---|
| `OP_recitative_line` | 高频音级画像 | scale_degree_distribution, unique_scale_degrees, scale_degree_sequence, target, intensity, evidence, mt, op, merge_action, mechanism... | 164 | 参数扩展 |
| `OP_descending_melody` | 级跳比例控制 | OP_recitative_line.contour, OP_recitative_line.rhythm, OP_recitative_line.degree_profile, OP_recitative_line.6, OP_recitative_line.1, OP_recitative_line.5, OP_recitative_line.4, contour, restraint, role... | 57 | — |
| `OP_low_register_narration` | 窄域身份稳定 | octave_distribution, min_pitch, max_pitch, target, intensity, evidence, mt, op, merge_action, mechanism... | 25 | 复用 |
| `OP_melody_rewrite` | 和声骨架独立 | chords, center, target, intensity, evidence, mt, op, merge_action, mechanism, relation... | 1 | 参数扩展 |

### `MT_motif`

| OP算子 | 描述 | 参数键 | 实例数 | 归并 |
|---|---|---|---|---|
| `OP_micro_variation` | 三音组低变体 | motifs, trigram_top, target, intensity, evidence, mt, op, merge_action, mechanism, relation... | 141 | 复用 |
| `OP_vocal_motif` | 高频音级锚 | role, source, degree_profile, 6, 1, 5, 4, OP_micro_variation.target, OP_micro_variation.scope, OP_micro_variation.intensity... | 57 | — |

### `MT_space`

| OP算子 | 描述 | 参数键 | 实例数 | 归并 |
|---|---|---|---|---|
| `OP_frequency_separation` | 声部功能分层 | OP_layer_breath.layer_curve, OP_layer_breath.dynamic_control, OP_layer_breath.target, target, role, source, OP_glue.sources, OP_glue.texture, OP_anchor.center, OP_harmonic_cycle.chords... | 57 | — |

### `MT_texture`

| OP算子 | 描述 | 参数键 | 实例数 | 归并 |
|---|---|---|---|---|
| `OP_layer_breath` | 休止断句设计 | OP_sparse_density.front, OP_sparse_density.middle, OP_sparse_density.end, layer_curve, breath, target, OP_anchor.center, OP_harmonic_cycle.chords, OP_harmonic_cycle.center, OP_context.source_file... | 114 | — |
| `OP_sparse_density` | 无休止连续线 | rest_count, duration_distribution, target, intensity, evidence, mt, op, merge_action, mechanism, relation... | 71 | 复用 |
| `OP_emotion_curve` | 数据情绪推导 | scale, scale_degree_top, tail_roman, target, intensity, evidence, mt, op, merge_action, mechanism... | 26 | 复用 |
| `OP_static_sustain_field` | 慢底快线叠层 | chord_duration_distribution, melody_duration_distribution, target, intensity, evidence, mt, op, merge_action, mechanism, relation... | 24 | 参数扩展 |

### `MT_timbre`

| OP算子 | 描述 | 参数键 | 实例数 | 归并 |
|---|---|---|---|---|
| `OP_glue` | 声部功能分层 | OP_layer_breath.layer_curve, OP_layer_breath.dynamic_control, OP_layer_breath.target, OP_frequency_separation.target, OP_frequency_separation.role, OP_frequency_separation.source, sources, texture, OP_anchor.center, OP_harmonic_cycle.chords... | 57 | — |

### `MT_time`

| OP算子 | 描述 | 参数键 | 实例数 | 归并 |
|---|---|---|---|---|
| `OP_form_loop_extension` | 和声周期分段 | starts, durations, target, intensity, evidence, mt, op, merge_action, mechanism, relation... | 82 | 复用 |

### `MT_ton`

| OP算子 | 描述 | 参数键 | 实例数 | 归并 |
|---|---|---|---|---|
| `OP_anchor` | 单调中心压缩 | center, key_events, note_count, rest_count, chords, end_beat, target, intensity, evidence, mt... | 197 | 复用 |

### `MT_voice`

| OP算子 | 描述 | 参数键 | 实例数 | 归并 |
|---|---|---|---|---|
| `OP_linear_counterpoint` | 和弦音摩擦率 | all_chord_tone_ratio, strong_chord_tone_ratio, target, intensity, evidence, mt, op, merge_action, mechanism, relation... | 48 | 参数扩展 |


共 26 个 OP 算子
