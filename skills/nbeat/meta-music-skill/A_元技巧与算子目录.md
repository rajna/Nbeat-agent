# 目录A：元技巧与算子目录

来源：part10 + part12 + part13 + part14，按分析原则2.1转化。
归并来源：part10(453) + part12(570) + part13(235) + part14(95) = 1353条技巧

## 元技巧维度 (MT)

| MT维度 | 领域 | 算子数 | 实例数 | 归并动作 |
|---|---|---|---|---|
| `MT_chord` | 和声进行/调性布局/终止式 | 14 | 780 | 参数扩展 |
| `MT_timbre` | 音色选择/采样调制/风格嫁接 | 15 | 220 | 新增 |
| `MT_groove` | 节奏型/微时值/鼓组/侧链 | 11 | 530 | 参数扩展 |
| `MT_melody` | 旋律创作/装饰音/音级偏置 | 10 | 560 | 参数扩展 |
| `MT_space` | 声场控制/频率隔离/混响深度 | 8 | 180 | 新增 |
| `MT_motif` | 动机发展/采样循环/主题变体 | 6 | 480 | 参数扩展 |
| `MT_time` | 曲式结构/速度变化/段落设计 | 6 | 260 | 参数扩展 |
| `MT_ton` | 调性锚定/调性中心 | 1 | 197 | 复用 |
| `MT_rhythm` | 节奏网格/起拍偏置 | 5 | 290 | 参数扩展 |
| `MT_dynamic` | 力度/能量变化/情感曲线 | 5 | 280 | 参数扩展 |
| `MT_texture` | 织体密度/层次/极简 | 4 | 190 | 复用 |
| `MT_orch` | 配器思维/乐器编排/对话 | 2 | 80 | 新增 |
| `MT_emotion` | 情绪逻辑/意象绑定 | 1 | 50 | 新增 |
| `MT_voice` | 人声处理/声部对位/假声装饰 | 3 | 120 | 新增 |
| `MT_frequency_expansion` | 频段扩展/频谱塑造 | 2 | 60 | 新增 |

共 15 个 MT 维度

## 算子目录 (OP)

### `MT_chord`

| OP算子 | 描述 | 实例数 | 归并 |
|---|---|---|---|
| `OP_harmonic_cycle` | 和弦循环/级数骨架/罗马数字循环 | 480 | 复用+扩展 |
| `OP_bass_motion` | 低音线运动/半音下行/反向推动 | 140 | 参数扩展 |
| `OP_cadence_motion` | 终止式设计/无V-I/悬挂延宕 | 180 | 参数扩展 |
| `OP_extension_stack` | 延伸音堆叠/maj7/min9/九和弦色彩 | 120 | 参数扩展 |
| `OP_secondary_substitution` | 副属/借用/转位微染色 | 280 | 参数扩展 |
| `OP_aug_dim_drift` | 增减和弦漂移/减七张力/虚假希望 | 40 | 新增 |
| `OP_bass_melody` | 低音旋律线/行走贝斯/Tuba驱动 | 30 | 新增 |
| `OP_harmonic_interaction` | 和声交互/声部对位色彩互补 | 30 | 新增 |
| `OP_harmonic_interpolation` | 和声引用/暗合/跨曲转调嫁接 | 20 | 新增 |
| `OP_modal_alternate` | 调式交替/大小调暧昧/蓝调大调交替 | 60 | 新增 |
| `OP_parallel_drift` | 平行和弦漂移/同结构平移/避免V-I | 40 | 新增 |
| `OP_reharmonize_sample` | 采样重新和声化/降调降速变色 | 50 | 新增 |
| `OP_root_avoid` | 根音回避/低音错位悬浮 | 57 | — |
| `OP_cadence_delay` | 终止延宕/尾部收束钩子 | 57 | — |

### `MT_timbre`

| OP算子 | 描述 | 实例数 | 归并 |
|---|---|---|---|
| `OP_style_graft` | 风格嫁接/70年代放克+数控/乡村+Trap | 60 | 新增 |
| `OP_analog_color` | 模拟色彩/Rhodes电钢/复古暖色 | 30 | 新增 |
| `OP_cultural_collage` | 文化拼贴/三味线+808/东西融合 | 20 | 新增 |
| `OP_frequency_expansion` | 频段提升/高频6kHz/低频60Hz增强 | 40 | 新增 |
| `OP_frequency_strip` | 频段切除/200Hz以下切除/中频挖空 | 30 | 新增 |
| `OP_hard_clip_wall` | 硬削波/失真/Fuzz/Bitcrusher | 35 | 新增 |
| `OP_lpf_cloud` | 低通模糊/切除高频/暗色笼罩 | 25 | 新增 |
| `OP_pitchdown_coloring` | 降调染色/降速/采样幽灵化 | 25 | 新增 |
| `OP_regional_style_graft` | 地域风格嫁接/90s House/New Jack Swing | 20 | 新增 |
| `OP_sample_body_variation` | 采样体变形/切片/反向/加速 | 20 | 新增 |
| `OP_sample_stack` | 采样叠层/保留riff换鼓组 | 15 | 新增 |
| `OP_section_by_timbre` | 段落音色切换/Juno-60/Bridge方波 | 20 | 新增 |
| `OP_spectral_collapse` | 频谱坍缩/Phaser+Flanger/游移感 | 15 | 新增 |
| `OP_tape_saturation` | 磁带饱和/Lo-fi/Wow&Flutter/降速 | 25 | 新增 |
| `OP_timbre_collision` | 音色碰撞/复古vs超现代/天-地反差 | 20 | 新增 |

### `MT_groove`

| OP算子 | 描述 | 实例数 | 归并 |
|---|---|---|---|
| `OP_syncopation_layout` | 切分布局/反拍起音/错位对位 | 370 | 复用+扩展 |
| `OP_microtiming_swing` | 微时值摇摆/Swing/量化vs人性化 | 300 | 参数扩展 |
| `OP_drum_rekit` | 鼓组重装/Afrobeats/UK Garage/Jersey Club/Linndrum | 80 | 新增 |
| `OP_live_unquantized_groove` | 非量化律动/实录vs死钉网格 | 40 | 新增 |
| `OP_sidechain_pump` | 侧链抽吸/4/4底鼓抽空中高频 | 35 | 新增 |
| `OP_slap_bass` | 拍弦贝斯/Disco放克/70年代 | 15 | 新增 |
| `OP_synth_pulse` | 合成脉冲/808滑音/恒定低音/ECG心跳 | 50 | 新增 |
| `OP_vocal_drum_interlock` | 人声-鼓组互锁/Flow即律动/稀疏鼓+密集人声 | 25 | 新增 |
| `OP_polyrhythm_grouping` | 时值语速控制 | 82 | 参数扩展 |
| `OP_lock` | 锁定同步/采样/鼓组锁定到和声循环 | 57 | — |

### `MT_melody`

| OP算子 | 描述 | 实例数 | 归并 |
|---|---|---|---|
| `OP_scale_degree_weight` | 音级权重偏置/少数音级锚定 | 235 | 参数扩展 |
| `OP_recitative_line` | 口语化旋律/音级偏置/说唱式 | 440 | 参数扩展 |
| `OP_descending_melody` | 下行旋律/级进/半音下行/叹息 | 380 | 参数扩展 |
| `OP_micro_offset` | 微偏移/人声±10-25ms/抢拍拖拍 | 60 | 新增 |
| `OP_ornament_fill` | 装饰填充/假声尾音下滑/气声前置 | 50 | 新增 |
| `OP_blues_scale_graft` | 蓝调音阶嫁接/b3-b7/喉音撕裂 | 30 | 新增 |
| `OP_chant_longtone` | 诵唱长音/重复宣言/气声前置 | 25 | 新增 |
| `OP_micro_noise_ornament` | 微噪装饰/辅音喷麦/咬牙切齿 | 20 | 新增 |
| `OP_low_register_narration` | 窄域身份稳定/音域范围 | 260 | 参数扩展 |
| `OP_register_range` | 音域范围/八度分布 | 235 | 参数扩展 |
| `OP_melody_rewrite` | 旋律重写/verse→chorus形态切换 | 40 | 参数扩展 |
| `OP_stepwise_wrap` | 连续级进铺排句式 | 100 | 参数扩展 |

### `MT_space`

| OP算子 | 描述 | 实例数 | 归并 |
|---|---|---|---|
| `OP_frequency_separation` | 频率分离/频段隔离/各乐器独占频段 | 120 | 参数扩展 |
| `OP_depth_layer` | 纵深分层/近场耳语+远场合唱/1cm+10m | 45 | 新增 |
| `OP_close_dry_recording` | 近场干声/0ms预延迟/贴耳 | 35 | 新增 |
| `OP_reverb_field` | 混响场/Plate/Convolution/Hall/持续时间 | 40 | 新增 |
| `OP_extreme_pan_split` | 极端声像/超宽L80-R80 | 15 | 新增 |
| `OP_minimal_depth` | 极浅纵深/单声道/车厢/幽闭 | 15 | 新增 |
| `OP_pan_reverb_depth` | 声像+混响深度联合控制 | 15 | 新增 |
| `OP_stereo_call_response` | 立体声问答/窄→宽/左-右对话 | 25 | 新增 |
| `OP_spatial_counterpoint` | 空间对位/近场vs远场/体育馆vs耳语 | 20 | 新增 |

### `MT_motif`

| OP算子 | 描述 | 实例数 | 归并 |
|---|---|---|---|
| `OP_micro_variation` | 动机微变/尾音改/窄域反复 | 420 | 复用+扩展 |
| `OP_closure` | 收束回锚/窄域回归/催眠循环 | 280 | 参数扩展 |
| `OP_ambient_motif` | 环境动机/语音前奏/婚礼录像带 | 25 | 新增 |
| `OP_dual_sample_counterpoint` | 双采样对位/双Rapper交替/对峙动机 | 15 | 新增 |
| `OP_spot_motif` | 点式动机/纯节奏Hook/指令式 | 10 | 新增 |
| `OP_vocal_motif` | 人声动机/高频锚音 | 57 | — |

### `MT_time`

| OP算子 | 描述 | 实例数 | 归并 |
|---|---|---|---|
| `OP_tempo` | 速度设定/BPM锚定 | 120 | 新增 |
| `OP_form_sectioning` | 曲式分段/段落能量标记 | 100 | 参数扩展 |
| `OP_form_loop_extension` | 和声周期分段/循环延伸 | 82 | 复用 |
| `OP_form_reset` | 曲式重置/段落风格突变/桥段爵士 | 30 | 新增 |
| `OP_instant_drop` | 瞬时坠落/桥段尾抽空/静音后爆发 | 25 | 新增 |
| `OP_tempo_disguise` | 速度伪装/Mambo→Reggaeton/速率突变 | 10 | 新增 |

### `MT_dynamic`

| OP算子 | 描述 | 实例数 | 归并 |
|---|---|---|---|
| `OP_crescendo_track` | 渐强轨迹/ppp→fff/抛物线/卧室→剧场 | 80 | 参数扩展 |
| `OP_accent_emphasis` | 重音强调/呼吸脉冲/力度标记 | 160 | 参数扩展 |
| `OP_density_dynamic` | 密度动态/薄→厚/频段阶梯堆叠 | 90 | 参数扩展 |
| `OP_emotion_curve` | 情绪曲线/数据情绪推导 | 26 | 复用 |

### `MT_rhythm`

| OP算子 | 描述 | 实例数 | 归并 |
|---|---|---|---|
| `OP_grid_resistance` | 网格抵抗/起拍偏置/后位咬字 | 280 | 参数扩展 |
| `OP_rest_breath_design` | 休止呼吸/句读设计/留白 | 140 | 参数扩展 |
| `OP_onomatopoeia_rhythm` | 拟声节奏/呼吸型断句 | 80 | 参数扩展 |
| `OP_rhythm_replace` | 节奏替换/心跳→鼓编程/自然→机械 | 10 | 新增 |

### `MT_texture`

| OP算子 | 描述 | 实例数 | 归并 |
|---|---|---|---|
| `OP_sparse_density` | 稀疏密度/极简骨架/元素减法 | 170 | 参数扩展 |
| `OP_layer_breath` | 层呼吸/休止断句设计 | 114 | — |
| `OP_static_sustain_field` | 静态持续场/慢底快线叠层 | 24 | 参数扩展 |

### `MT_emotion`（新增）

| OP算子 | 描述 | 实例数 | 归并 |
|---|---|---|---|
| `OP_imagery_bind` | 意象绑定/语义→物理感受/焦虑螺旋+怪物攀爬 | 50 | 新增 |

### `MT_orch`（新增）

| OP算子 | 描述 | 实例数 | 归并 |
|---|---|---|---|
| `OP_dialogue_orchestration` | 对话配器/乐器间问答/各段不同编制 | 60 | 新增 |
| `OP_vocal_pyramid` | 人声金字塔/4-8轨叠录/合唱渐厚 | 25 | 新增 |

### `MT_voice`（新增）

| OP算子 | 描述 | 实例数 | 归并 |
|---|---|---|---|
| `OP_collab_counterpoint` | 合作对位/双人声部/跨时空对唱 | 40 | 新增 |
| `OP_jittered_vocal` | 抖动人声/Formant Shifting/Auto-Tune极快速 | 15 | 新增 |
| `OP_linear_counterpoint` | 线性和声对位/和弦音摩擦率 | 48 | 参数扩展 |

### `MT_frequency_expansion`（新增）

| OP算子 | 描述 | 实例数 | 归并 |
|---|---|---|---|
| `OP_frequency_breath` | 频段呼吸/从窄频逐渐扩展到全频 | 30 | 新增 |
| `OP_frequency_void` | 频段空洞/中频挖空/200-800Hz留白 | 30 | 新增 |

### `MT_ton`

| OP算子 | 描述 | 实例数 | 归并 |
|---|---|---|---|
| `OP_anchor` | 调性锚定/单调中心压缩 | 197 | 复用 |

### `MT_timbre`（补充：既有合成器）

| OP算子 | 描述 | 实例数 | 归并 |
|---|---|---|---|
| `OP_synthesis` | 波形合成/Juno-60/DX7/方波/锯齿/正弦 | 50 | 参数扩展 |
| `OP_glue` | 声部粘合/声部功能分层 | 57 | — |

| `OP_context` | 上下文元数据/文件来源标记 | 550 | — |

共 93 个 OP 算子（原34 + part14新增56）

---
*来源: part10(453) + part12(570) + part13(235) + part14(95) = 1353条技巧*
*part14贡献: 3新MT(emotion/orch/voice/frequency_expansion) + 56新OP，覆盖现代制作全维度*
