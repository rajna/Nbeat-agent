# 目录C：复合元技巧与复合算子目录

来源：part10 + part12 + part13 + part14 增量归并。1353条技巧 → 复合层提取。
复合技巧 = 多个MT通过组合关系形成可迁移制作机制。

## 复合技巧公式

### COP_density_form（密度形态）
`MT_texture(OP_sparse_density) ⊕ MT_dynamic(OP_crescendo_track)`
- 描述：从稀疏到密集的织体变化曲线。Verse极简→Chorus满编，或Intro薄→Bridge厚→Drop炸
- 参数键：density_level, dynamic_delta, transition_type, section_map
- 来源实例：频段阶梯堆叠术、窒息桥段爆破术、从卧室到剧场爆破术

### COP_style_graft（风格嫁接）
`MT_timbre(OP_style_graft) ⊕ MT_groove(OP_drum_rekit)`
- 描述：将风格A的音色/律动嫁接到风格B的骨架。70s放克+数控量化、乡村+Trap鼓组
- 参数键：source_style, target_style, graft_point, blend_ratio
- 来源实例：复古放克数控术、陷阱乡村频段隔离术、千禧年Hip-Hop乡村化术

### COP_depth_contrast（纵深反差）
`MT_space(OP_depth_layer) ⊕ MT_space(OP_close_dry_recording) ⊕ MT_space(OP_reverb_field)`
- 描述：极近场+极远场的声音纵深对比。1cm人声+10m弦乐=窒息感
- 参数键：near_depth, far_depth, near_reverb, far_reverb, contrast_ratio
- 来源实例：ASMR窒息纵深术、近场耳语+远场Jersey术、宽广混响人声悬浮术

### COP_frequency_isolation（频段隔离）
`MT_space(OP_frequency_separation) ⊕ MT_timbre(OP_frequency_strip) ⊕ MT_groove(OP_synth_pulse)`
- 描述：各乐器独占非重叠频段。808=40-80Hz, 吉他=1-3kHz, 中频留空
- 参数键：band_map, isolation_strength, empty_bands
- 来源实例：陷阱乡村频段隔离术、卧室Indie频段隔离术、极低频压迫声场术

### COP_sidechain_breathing（侧链呼吸）
`MT_groove(OP_sidechain_pump) ⊕ MT_timbre(OP_synthesis)`
- 描述：底鼓触发侧链压缩，每拍抽空中高频，制造吸气-呼气律动
- 参数键：pump_source, pump_target, pump_ratio, pump_rhythm
- 来源实例：4/4底鼓+侧链呼吸术、超清合成器侧链呼吸术

### COP_timbre_collision（音色碰撞）
`MT_timbre(OP_timbre_collision) ⊕ MT_timbre(OP_sample_body_variation)`
- 描述：两个对立音色在同一空间碰撞。复古采样幽灵 vs 超现代Autotune
- 参数键：source_a, source_b, collision_type, contrast_level
- 来源实例：灵魂采样失真幽灵术、经典Rick James降维术、千禧年流行切片循环术

### COP_emotional_crescendo（情绪渐强）
`MT_dynamic(OP_crescendo_track) ⊕ MT_orch(OP_dialogue_orchestration) ⊕ MT_emotion(OP_imagery_bind)`
- 描述：力度+配器+意象同步渐强。pp钢琴→ff全员+合唱，物理感受=从卧室到剧场
- 参数键：start_dynamic, end_dynamic, orchestration_layers, imagery_target
- 来源实例：歌剧院级渐强爆破术、祈祷到嘶吼的抛物线术

### COP_cultural_suture（文化缝合）
`MT_timbre(OP_cultural_collage) ⊕ MT_groove(OP_synth_pulse) ⊕ MT_groove(OP_drum_rekit)`
- 描述：跨文化音色+节奏缝合。三味线+808、管风琴失真+减七和弦
- 参数键：cultural_source, target_genre, fusion_method
- 来源实例：三味线808东西融合术、失真管风琴异教术

### COP_sample_deconstruction（采样解构）
`MT_timbre(OP_reharmonize_sample) ⊕ MT_timbre(OP_pitchdown_coloring) ⊕ MT_timbre(OP_lpf_cloud)`
- 描述：采样→降调/降速/滤波/失真→变成新声音。致敬变绑架
- 参数键：sample_source, speed_change, pitch_change, filter_cutoff, distortion_level
- 来源实例：西海岸采样降维术、怀旧失真婚礼采样术

### COP_vocal_spatial_counterpoint（人声空间对位）
`MT_voice(OP_collab_counterpoint) ⊕ MT_space(OP_depth_layer) ⊕ MT_space(OP_frequency_separation)`
- 描述：多人声在不同纵深+频段对位。近场恳求+中距威胁+远场回声
- 参数键：voice_positions, depth_assignments, frequency_assignments
- 来源实例：三层人声纵深对位术、双频段性别对位术、跨时空双声部术

### COP_beat_globalization（鼓组全球化）
`MT_groove(OP_drum_rekit) ⊕ MT_rhythm(OP_syncopation_layout) ⊕ MT_groove(OP_microtiming_swing)`
- 描述：将特定地域鼓组风格+切分+Swing组合。Afrobeats/Jersey/UKG/Corridos
- 参数键：drum_style, syncopation_type, swing_amount, kick_pattern
- 来源实例：Afrobeats滑步碎拍术、Jersey Club碎拍心跳术、Corridos Tumbados低音驱动术

### COP_micro_offset_feel（微偏移感觉）
`MT_melody(OP_micro_offset) ⊕ MT_groove(OP_microtiming_swing) ⊕ MT_melody(OP_recitative_line)`
- 描述：人声微偏移+Swing+口语化=犹豫/抢拍/冷感。±10-25ms改变整个性格
- 参数键：offset_ms, swing_percent, recitative_density
- 来源实例：呢喃式切分口语术、千禧年半拍悬浮术、口语化断奏上抛术

### COP_frequency_emergence（频段浮现）
`MT_frequency_expansion(OP_frequency_breath) ⊕ MT_texture(OP_sparse_density)`
- 描述：从窄频逐渐扩展到全频。回忆从模糊到清晰、能量从低到高
- 参数键：start_band, end_band, emergence_speed, section_target
- 来源实例：频段渐显回忆术、频段阶梯式堆叠术

### COP_form_disruption（曲式破坏）
`MT_time(OP_form_reset) ⊕ MT_time(OP_instant_drop) ⊕ MT_time(OP_tempo_disguise)`
- 描述：曲式突变/速度伪装/瞬时坠落。打破期待制造冲击
- 参数键：reset_section, new_context, drop_timing, tempo_shift_delta
- 来源实例：突变速率情绪术、窒息桥段爆破术、双桥段合成器流行术

### COP_imagery_physicalization（意象物理化）
`MT_emotion(OP_imagery_bind) ⊕ MT_dynamic(OP_crescendo_track) ⊕ MT_melody(OP_descending_melody)`
- 描述：将抽象情绪绑定到物理感受。"焦虑=向上螺旋" "释然=向下叹息"
- 参数键：emotion_target, physical_metaphor, motion_direction, dynamic_arc
- 来源实例：自我对话上行动机术（焦虑=上爬）、下行疑问叹息术（无力=下滑）

### COP_vocal_architecture（人声建筑）
`MT_orch(OP_vocal_pyramid) ⊕ MT_dynamic(OP_crescendo_track) ⊕ MT_voice(OP_collab_counterpoint)`
- 描述：人声叠层从1轨到8轨渐厚，或多声部在不同纵深构建空间
- 参数键：layer_count, layer_entry_order, layer_depth, layer_frequency
- 来源实例：歌剧院级渐强爆破术（4-8轨叠录）、双Rapper频段隔离术

---
共 16 个 COP 复合算子
来源：1353条技巧中检测到is_composite=true → 归并提取组合公式
