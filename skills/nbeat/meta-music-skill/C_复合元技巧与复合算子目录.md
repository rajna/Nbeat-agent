# 目录C：复合元技巧与复合算子目录

来源：part10_增量归并转化.md + part12_增量归并转化.md，按分析原则2.1复合层规则转化。
复合技巧判断基于数据中的显式 `is_composite:true` 标记。

## 复合元技巧目录 (MCT)

| MCT | 驱动 | MT维度 | 组合关系 | 子结构 | 实例数 | 判断依据 |
|---|---|---|---|---|---|---|
| MCT_1 | 循环和弦骨架 | MT_ton, MT_chord, MT_motif |  | — | 57 | 有主结构 harmonic_cycle
 两个以上 MT/OP 组成同一个制作机制
 技巧可迁移到其他歌曲或风格
 原技 |
| MCT_2 | 主属下属轴 | MT_ton, MT_chord |  | — | 57 | 有主结构 harmonic_cycle
 两个以上 MT/OP 组成同一个制作机制
 技巧可迁移到其他歌曲或风格
 原技 |
| MCT_3 | 低音错位悬浮 | MT_chord, MT_ton |  | — | 57 | 有主结构 bass_motion
 两个以上 MT/OP 组成同一个制作机制
 技巧可迁移到其他歌曲或风格
 原技巧存在 |
| MCT_4 | 高频音级锚 | MT_motif, MT_melody |  | — | 57 | 有主结构 vocal_motif
 两个以上 MT/OP 组成同一个制作机制
 技巧可迁移到其他歌曲或风格
 原技巧存在 |
| MCT_5 | 级跳比例控制 | MT_melody |  | — | 57 | 有主结构 recitative_line
 两个以上 MT/OP 组成同一个制作机制
 技巧可迁移到其他歌曲或风格
 原 |
| MCT_6 | 短值推动语气 | MT_groove, MT_dynamic |  | — | 57 | 有主结构 polyrhythm_grouping
 两个以上 MT/OP 组成同一个制作机制
 技巧可迁移到其他歌曲或风 |
| MCT_7 | 非正拍进入 | MT_groove |  | — | 57 | 有主结构 syncopation_layout
 两个以上 MT/OP 组成同一个制作机制
 技巧可迁移到其他歌曲或风格 |
| MCT_8 | 休止断句设计 | MT_texture |  | — | 57 | 有主结构 sparse_density
 两个以上 MT/OP 组成同一个制作机制
 技巧可迁移到其他歌曲或风格
 原技 |
| MCT_9 | 尾部收束钩子 | MT_time, MT_chord |  | — | 57 | 有主结构 form_loop_extension
 两个以上 MT/OP 组成同一个制作机制
 技巧可迁移到其他歌曲或风 |
| MCT_10 | 声部功能分层 | MT_texture, MT_space, MT_timbre |  | — | 57 | 有主结构 layer_breath
 两个以上 MT/OP 组成同一个制作机制
 技巧可迁移到其他歌曲或风格
 原技巧存 |
| MCT_11 | tonal_center | MT_ton | lock | melody, chord, phrase | 26 | 调性布局 由 MT_ton.OP_anchor 承担主机制，并与原技巧中的旋律/和声/节奏/句法参数共同构成可迁移制作机 |
| MCT_12 | data_emotion_curve | MT_texture | infer | emotion, form | 26 | 情绪逻辑 由 MT_texture.OP_emotion_curve 承担主机制，并与原技巧中的旋律/和声/节奏/句法参 |
| MCT_13 | harmonic_cycle | MT_chord | organize | tonality, melody, memory | 25 | 和声进行 由 MT_chord.OP_harmonic_cycle 承担主机制，并与原技巧中的旋律/和声/节奏/句法参数 |
| MCT_14 | harmonic_rhythm | MT_chord | pace | melody_density, form_breath | 25 | 和声节奏 由 MT_chord.OP_harmonic_cycle 承担主机制，并与原技巧中的旋律/和声/节奏/句法参数 |
| MCT_15 | bass_outline | MT_chord | ground | harmony, groove, body | 25 | 低音线推导 由 MT_chord.OP_bass_motion 承担主机制，并与原技巧中的旋律/和声/节奏/句法参数共同 |
| MCT_16 | voicing_detail | MT_chord | preserve | bass_motion, cadence_color | 25 | 和弦编排 由 MT_chord.OP_extension_stack 承担主机制，并与原技巧中的旋律/和声/节奏/句法参 |
| MCT_17 | cadence_loop | MT_chord | return | harmonic_cycle, replay | 25 | 终止回环 由 MT_chord.OP_cadence_motion 承担主机制，并与原技巧中的旋律/和声/节奏/句法参数 |
| MCT_18 | harmonic_sectioning | MT_time | segment | chord_cycle, arrangement | 25 | 曲式结构 由 MT_time.OP_form_loop_extension 承担主机制，并与原技巧中的旋律/和声/节奏/ |
| MCT_19 | degree_profile | MT_melody | profile | motif, memory | 25 | 旋律音级 由 MT_melody.OP_recitative_line 承担主机制，并与原技巧中的旋律/和声/节奏/句法 |
| MCT_20 | register_range | MT_melody | range | melody_identity | 25 | 音域布局 由 MT_melody.OP_low_register_narration 承担主机制，并与原技巧中的旋律/和 |
| MCT_21 | interval_profile | MT_melody | shape | vocality, memory | 25 | 音符形态 由 MT_melody.OP_recitative_line 承担主机制，并与原技巧中的旋律/和声/节奏/句法 |
| MCT_22 | duration_profile | MT_groove | speechrate | melody, groove | 25 | 节奏型 由 MT_groove.OP_polyrhythm_grouping 承担主机制，并与原技巧中的旋律/和声/节奏 |
| MCT_23 | syncopation_layout | MT_groove | syncopate | melody, groove | 25 | 起音切分 由 MT_groove.OP_syncopation_layout 承担主机制，并与原技巧中的旋律/和声/节奏 |
| MCT_24 | motif_variation | MT_motif | vary | melody, memory | 25 | 动机发展 由 MT_motif.OP_micro_variation 承担主机制，并与原技巧中的旋律/和声/节奏/句法参 |
| MCT_25 | melody_harmony_counterpoint | MT_voice | balance | melody, chord, emotion | 24 | 旋律和声关系 由 MT_voice.OP_linear_counterpoint 承担主机制，并与原技巧中的旋律/和声/ |
| MCT_26 | nonchord_tone_placement | MT_voice | place | tension, phrasing | 24 | 张力音落点 由 MT_voice.OP_linear_counterpoint 承担主机制，并与原技巧中的旋律/和声/节 |
| MCT_27 | slow_harmony_fast_melody | MT_texture | layer | harmony, melody, texture | 24 | 和声旋律分工 由 MT_texture.OP_static_sustain_field 承担主机制，并与原技巧中的旋律/ |
| MCT_28 | phrase_density | MT_texture | space | texture, phrase | 14 | 句法密度 由 MT_texture.OP_sparse_density 承担主机制，并与原技巧中的旋律/和声/节奏/句法 |
| MCT_29 | rest_punctuation | MT_groove | breathe | phrase, groove | 11 | 休止句法 由 MT_groove.OP_syncopation_layout 承担主机制，并与原技巧中的旋律/和声/节奏 |
| MCT_30 | parameter_preserve_rewrite | MT_motif | transfer | creation, replay | 2 | 创作迁移 由 MT_motif.OP_micro_variation 承担主机制，并与原技巧中的旋律/和声/节奏/句法参 |
| MCT_31 | missing_melody_guard | MT_melody | guard | analysis_scope | 1 | 旋律缺席 由 MT_melody.OP_melody_rewrite 承担主机制，并与原技巧中的旋律/和声/节奏/句法参 |
| MCT_32 | missing_harmony_guard | MT_chord | guard | analysis_scope | 1 | 和声缺席 由 MT_chord.OP_synthesis 承担主机制，并与原技巧中的旋律/和声/节奏/句法参数共同构成可 |

共 32 个复合技巧

## 复合技巧详情

### 循环和弦骨架

- **驱动结构**: 循环和弦骨架
- **MT维度**: MT_ton, MT_chord, MT_motif
- **组合关系**: 
- **子结构**: —
- **实例数**: 57
- **判断依据**: 有主结构 harmonic_cycle
 两个以上 MT/OP 组成同一个制作机制
 技巧可迁移到其他歌曲或风格
 原技巧存在驱动、锁定、分层、推动、释放或回环关系
- **涉及OP**: OP_anchor, OP_harmonic_cycle, OP_micro_variation

### 主属下属轴

- **驱动结构**: 主属下属轴
- **MT维度**: MT_ton, MT_chord
- **组合关系**: 
- **子结构**: —
- **实例数**: 57
- **判断依据**: 有主结构 harmonic_cycle
 两个以上 MT/OP 组成同一个制作机制
 技巧可迁移到其他歌曲或风格
 原技巧存在驱动、锁定、分层、推动、释放或回环关系
- **涉及OP**: OP_anchor, OP_harmonic_cycle, OP_cadence_motion

### 低音错位悬浮

- **驱动结构**: 低音错位悬浮
- **MT维度**: MT_chord, MT_ton
- **组合关系**: 
- **子结构**: —
- **实例数**: 57
- **判断依据**: 有主结构 bass_motion
 两个以上 MT/OP 组成同一个制作机制
 技巧可迁移到其他歌曲或风格
 原技巧存在驱动、锁定、分层、推动、释放或回环关系
- **涉及OP**: OP_bass_motion, OP_root_avoid, OP_anchor

### 高频音级锚

- **驱动结构**: 高频音级锚
- **MT维度**: MT_motif, MT_melody
- **组合关系**: 
- **子结构**: —
- **实例数**: 57
- **判断依据**: 有主结构 vocal_motif
 两个以上 MT/OP 组成同一个制作机制
 技巧可迁移到其他歌曲或风格
 原技巧存在驱动、锁定、分层、推动、释放或回环关系
- **涉及OP**: OP_vocal_motif, OP_micro_variation, OP_recitative_line

### 级跳比例控制

- **驱动结构**: 级跳比例控制
- **MT维度**: MT_melody
- **组合关系**: 
- **子结构**: —
- **实例数**: 57
- **判断依据**: 有主结构 recitative_line
 两个以上 MT/OP 组成同一个制作机制
 技巧可迁移到其他歌曲或风格
 原技巧存在驱动、锁定、分层、推动、释放或回环关系
- **涉及OP**: OP_recitative_line, OP_descending_melody

### 短值推动语气

- **驱动结构**: 短值推动语气
- **MT维度**: MT_groove, MT_dynamic
- **组合关系**: 
- **子结构**: —
- **实例数**: 57
- **判断依据**: 有主结构 polyrhythm_grouping
 两个以上 MT/OP 组成同一个制作机制
 技巧可迁移到其他歌曲或风格
 原技巧存在驱动、锁定、分层、推动、释放或回环关系
- **涉及OP**: OP_polyrhythm_grouping, OP_density_dynamic

### 非正拍进入

- **驱动结构**: 非正拍进入
- **MT维度**: MT_groove
- **组合关系**: 
- **子结构**: —
- **实例数**: 57
- **判断依据**: 有主结构 syncopation_layout
 两个以上 MT/OP 组成同一个制作机制
 技巧可迁移到其他歌曲或风格
 原技巧存在驱动、锁定、分层、推动、释放或回环关系
- **涉及OP**: OP_syncopation_layout, OP_lock

### 休止断句设计

- **驱动结构**: 休止断句设计
- **MT维度**: MT_texture
- **组合关系**: 
- **子结构**: —
- **实例数**: 57
- **判断依据**: 有主结构 sparse_density
 两个以上 MT/OP 组成同一个制作机制
 技巧可迁移到其他歌曲或风格
 原技巧存在驱动、锁定、分层、推动、释放或回环关系
- **涉及OP**: OP_sparse_density, OP_layer_breath

### 尾部收束钩子

- **驱动结构**: 尾部收束钩子
- **MT维度**: MT_time, MT_chord
- **组合关系**: 
- **子结构**: —
- **实例数**: 57
- **判断依据**: 有主结构 form_loop_extension
 两个以上 MT/OP 组成同一个制作机制
 技巧可迁移到其他歌曲或风格
 原技巧存在驱动、锁定、分层、推动、释放或回环关系
- **涉及OP**: OP_form_loop_extension, OP_cadence_delay

### 声部功能分层

- **驱动结构**: 声部功能分层
- **MT维度**: MT_texture, MT_space, MT_timbre
- **组合关系**: 
- **子结构**: —
- **实例数**: 57
- **判断依据**: 有主结构 layer_breath
 两个以上 MT/OP 组成同一个制作机制
 技巧可迁移到其他歌曲或风格
 原技巧存在驱动、锁定、分层、推动、释放或回环关系
- **涉及OP**: OP_layer_breath, OP_frequency_separation, OP_glue

### 单调中心压缩

- **驱动结构**: tonal_center
- **MT维度**: MT_ton
- **组合关系**: lock
- **子结构**: melody, chord, phrase
- **实例数**: 26
- **判断依据**: 调性布局 由 MT_ton.OP_anchor 承担主机制，并与原技巧中的旋律/和声/节奏/句法参数共同构成可迁移制作机制。
- **涉及OP**: OP_anchor

### 数据情绪推导

- **驱动结构**: data_emotion_curve
- **MT维度**: MT_texture
- **组合关系**: infer
- **子结构**: emotion, form
- **实例数**: 26
- **判断依据**: 情绪逻辑 由 MT_texture.OP_emotion_curve 承担主机制，并与原技巧中的旋律/和声/节奏/句法参数共同构成可迁移制作机制。
- **涉及OP**: OP_emotion_curve

### 级数骨架迁移

- **驱动结构**: harmonic_cycle
- **MT维度**: MT_chord
- **组合关系**: organize
- **子结构**: tonality, melody, memory
- **实例数**: 25
- **判断依据**: 和声进行 由 MT_chord.OP_harmonic_cycle 承担主机制，并与原技巧中的旋律/和声/节奏/句法参数共同构成可迁移制作机制。
- **涉及OP**: OP_harmonic_cycle

### 换和弦呼吸

- **驱动结构**: harmonic_rhythm
- **MT维度**: MT_chord
- **组合关系**: pace
- **子结构**: melody_density, form_breath
- **实例数**: 25
- **判断依据**: 和声节奏 由 MT_chord.OP_harmonic_cycle 承担主机制，并与原技巧中的旋律/和声/节奏/句法参数共同构成可迁移制作机制。
- **涉及OP**: OP_harmonic_cycle

### 根转位低音影线

- **驱动结构**: bass_outline
- **MT维度**: MT_chord
- **组合关系**: ground
- **子结构**: harmony, groove, body
- **实例数**: 25
- **判断依据**: 低音线推导 由 MT_chord.OP_bass_motion 承担主机制，并与原技巧中的旋律/和声/节奏/句法参数共同构成可迁移制作机制。
- **涉及OP**: OP_bass_motion

### 转位借用保留

- **驱动结构**: voicing_detail
- **MT维度**: MT_chord
- **组合关系**: preserve
- **子结构**: bass_motion, cadence_color
- **实例数**: 25
- **判断依据**: 和弦编排 由 MT_chord.OP_extension_stack 承担主机制，并与原技巧中的旋律/和声/节奏/句法参数共同构成可迁移制作机制。
- **涉及OP**: OP_extension_stack

### 尾部张力再入口

- **驱动结构**: cadence_loop
- **MT维度**: MT_chord
- **组合关系**: return
- **子结构**: harmonic_cycle, replay
- **实例数**: 25
- **判断依据**: 终止回环 由 MT_chord.OP_cadence_motion 承担主机制，并与原技巧中的旋律/和声/节奏/句法参数共同构成可迁移制作机制。
- **涉及OP**: OP_cadence_motion

### 和声周期分段

- **驱动结构**: harmonic_sectioning
- **MT维度**: MT_time
- **组合关系**: segment
- **子结构**: chord_cycle, arrangement
- **实例数**: 25
- **判断依据**: 曲式结构 由 MT_time.OP_form_loop_extension 承担主机制，并与原技巧中的旋律/和声/节奏/句法参数共同构成可迁移制作机制。
- **涉及OP**: OP_form_loop_extension

### 高频音级画像

- **驱动结构**: degree_profile
- **MT维度**: MT_melody
- **组合关系**: profile
- **子结构**: motif, memory
- **实例数**: 25
- **判断依据**: 旋律音级 由 MT_melody.OP_recitative_line 承担主机制，并与原技巧中的旋律/和声/节奏/句法参数共同构成可迁移制作机制。
- **涉及OP**: OP_recitative_line

### 窄域身份稳定

- **驱动结构**: register_range
- **MT维度**: MT_melody
- **组合关系**: range
- **子结构**: melody_identity
- **实例数**: 25
- **判断依据**: 音域布局 由 MT_melody.OP_low_register_narration 承担主机制，并与原技巧中的旋律/和声/节奏/句法参数共同构成可迁移制作机制。
- **涉及OP**: OP_low_register_narration

### 步进跳进配比

- **驱动结构**: interval_profile
- **MT维度**: MT_melody
- **组合关系**: shape
- **子结构**: vocality, memory
- **实例数**: 25
- **判断依据**: 音符形态 由 MT_melody.OP_recitative_line 承担主机制，并与原技巧中的旋律/和声/节奏/句法参数共同构成可迁移制作机制。
- **涉及OP**: OP_recitative_line

### 时值语速控制

- **驱动结构**: duration_profile
- **MT维度**: MT_groove
- **组合关系**: speechrate
- **子结构**: melody, groove
- **实例数**: 25
- **判断依据**: 节奏型 由 MT_groove.OP_polyrhythm_grouping 承担主机制，并与原技巧中的旋律/和声/节奏/句法参数共同构成可迁移制作机制。
- **涉及OP**: OP_polyrhythm_grouping

### 网格落点偏好

- **驱动结构**: syncopation_layout
- **MT维度**: MT_groove
- **组合关系**: syncopate
- **子结构**: melody, groove
- **实例数**: 25
- **判断依据**: 起音切分 由 MT_groove.OP_syncopation_layout 承担主机制，并与原技巧中的旋律/和声/节奏/句法参数共同构成可迁移制作机制。
- **涉及OP**: OP_syncopation_layout

### 三音组低变体

- **驱动结构**: motif_variation
- **MT维度**: MT_motif
- **组合关系**: vary
- **子结构**: melody, memory
- **实例数**: 25
- **判断依据**: 动机发展 由 MT_motif.OP_micro_variation 承担主机制，并与原技巧中的旋律/和声/节奏/句法参数共同构成可迁移制作机制。
- **涉及OP**: OP_micro_variation

### 和弦音摩擦率

- **驱动结构**: melody_harmony_counterpoint
- **MT维度**: MT_voice
- **组合关系**: balance
- **子结构**: melody, chord, emotion
- **实例数**: 24
- **判断依据**: 旋律和声关系 由 MT_voice.OP_linear_counterpoint 承担主机制，并与原技巧中的旋律/和声/节奏/句法参数共同构成可迁移制作机制。
- **涉及OP**: OP_linear_counterpoint

### 非和弦音句法

- **驱动结构**: nonchord_tone_placement
- **MT维度**: MT_voice
- **组合关系**: place
- **子结构**: tension, phrasing
- **实例数**: 24
- **判断依据**: 张力音落点 由 MT_voice.OP_linear_counterpoint 承担主机制，并与原技巧中的旋律/和声/节奏/句法参数共同构成可迁移制作机制。
- **涉及OP**: OP_linear_counterpoint

### 慢底快线叠层

- **驱动结构**: slow_harmony_fast_melody
- **MT维度**: MT_texture
- **组合关系**: layer
- **子结构**: harmony, melody, texture
- **实例数**: 24
- **判断依据**: 和声旋律分工 由 MT_texture.OP_static_sustain_field 承担主机制，并与原技巧中的旋律/和声/节奏/句法参数共同构成可迁移制作机制。
- **涉及OP**: OP_static_sustain_field

### 无休止连续线

- **驱动结构**: phrase_density
- **MT维度**: MT_texture
- **组合关系**: space
- **子结构**: texture, phrase
- **实例数**: 14
- **判断依据**: 句法密度 由 MT_texture.OP_sparse_density 承担主机制，并与原技巧中的旋律/和声/节奏/句法参数共同构成可迁移制作机制。
- **涉及OP**: OP_sparse_density

### 空拍标点切句

- **驱动结构**: rest_punctuation
- **MT维度**: MT_groove
- **组合关系**: breathe
- **子结构**: phrase, groove
- **实例数**: 11
- **判断依据**: 休止句法 由 MT_groove.OP_syncopation_layout 承担主机制，并与原技巧中的旋律/和声/节奏/句法参数共同构成可迁移制作机制。
- **涉及OP**: OP_syncopation_layout

### 参数保真换皮

- **驱动结构**: parameter_preserve_rewrite
- **MT维度**: MT_motif
- **组合关系**: transfer
- **子结构**: creation, replay
- **实例数**: 2
- **判断依据**: 创作迁移 由 MT_motif.OP_micro_variation 承担主机制，并与原技巧中的旋律/和声/节奏/句法参数共同构成可迁移制作机制。
- **涉及OP**: OP_micro_variation

### 和声骨架独立

- **驱动结构**: missing_melody_guard
- **MT维度**: MT_melody
- **组合关系**: guard
- **子结构**: analysis_scope
- **实例数**: 1
- **判断依据**: 旋律缺席 由 MT_melody.OP_melody_rewrite 承担主机制，并与原技巧中的旋律/和声/节奏/句法参数共同构成可迁移制作机制。
- **涉及OP**: OP_melody_rewrite

### 旋律孤立分析

- **驱动结构**: missing_harmony_guard
- **MT维度**: MT_chord
- **组合关系**: guard
- **子结构**: analysis_scope
- **实例数**: 1
- **判断依据**: 和声缺席 由 MT_chord.OP_synthesis 承担主机制，并与原技巧中的旋律/和声/节奏/句法参数共同构成可迁移制作机制。
- **涉及OP**: OP_synthesis

