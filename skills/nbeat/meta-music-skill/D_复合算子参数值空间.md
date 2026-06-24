# 目录D：复合算子参数值空间

来源：part10 + part12 + part13 + part14 增量归并。从1353条复合技巧提取。

---

### `COP_density_form`

| 参数键 | 不同值数 | 样本值 |
|---|---|---|
| `density_level` | 5 | `minimal`, `low`, `medium`, `high`, `full` |
| `dynamic_delta` | 5 | `10dB`, `15dB`, `20dB`, `25dB`, `30dB` |
| `transition_type` | 4 | `gradual`, `staircase`, `sectional_jump`, `parabolic` |
| `section_map` | 6 | `[intro:bass,verse:+hihat,pre:+strings,chorus:full+brass]`, `[verse:thin,chorus:thick]` |

### `COP_style_graft`

| 参数键 | 不同值数 | 样本值 |
|---|---|---|
| `source_style` | 12 | `70s_funk`, `70s_disco`, `90s_house`, `country_rock`, `trap`, `new_jack_swing`, `synth_pop`, `UK_drill`, `eurodance`, `soul`, `corridos`, `blues` |
| `target_style` | 8 | `digital_quantized`, `contemporary_RnB`, `trap_808`, `acoustic_country`, `house_4_4`, `modern_pop`, `neo_soul`, `drill` |
| `blend_ratio` | 3 | `source_dominant`, `balanced`, `target_dominant` |
| `graft_point` | 4 | `drums`, `harmony`, `timbre`, `rhythm` |

### `COP_depth_contrast`

| 参数键 | 不同值数 | 样本值 |
|---|---|---|
| `near_depth` | 4 | `C0_dry_0ms`, `1cm`, `close_ear`, `car_cabin` |
| `far_depth` | 4 | `10m_hall`, `stadium`, `L80_R80_wide`, `cathedral` |
| `near_reverb` | 4 | `0ms`, `<0.3s`, `<0.5s`, `<1s` |
| `far_reverb` | 4 | `2s`, `2.5s`, `3.5s_plate`, `4s_hall` |
| `contrast_ratio` | 3 | `extreme`, `moderate`, `subtle` |

### `COP_frequency_isolation`

| 参数键 | 不同值数 | 样本值 |
|---|---|---|
| `band_map` | 6 | `{808:40-80Hz, guitar:1-3kHz, vocal:2-4kHz, mid:empty}`, `{sub:60Hz, synth:1-2kHz, hihat:8kHz+}` |
| `empty_bands` | 4 | `[200-800Hz]`, `[mid]`, `[200-800Hz, 4-6kHz]`, `none` |
| `isolation_strength` | 3 | `surgical`, `gentle`, `complete` |

### `COP_sidechain_breathing`

| 参数键 | 不同值数 | 样本值 |
|---|---|---|
| `pump_source` | 2 | `kick_4_4`, `kick_offbeat` |
| `pump_target` | 3 | `[pad,bass]`, `[synth,mid_high]`, `[all_instruments]` |
| `pump_ratio` | 3 | `light`, `medium`, `heavy` |
| `pump_rhythm` | 2 | `per_beat`, `per_2beat` |

### `COP_timbre_collision`

| 参数键 | 不同值数 | 样本值 |
|---|---|---|
| `source_a` | 5 | `vintage_sample`, `degraded_tape`, `raw_original`, `60s_soul`, `pipe_organ` |
| `source_b` | 5 | `hyper_autotune`, `digital_quantized`, `clean_modern`, `trap_808`, `fuzz_distortion` |
| `collision_type` | 3 | `heaven_earth`, `past_present`, `analog_digital` |
| `contrast_level` | 3 | `extreme`, `balanced`, `subtle` |

### `COP_emotional_crescendo`

| 参数键 | 不同值数 | 样本值 |
|---|---|---|
| `start_dynamic` | 3 | `pp`, `p`, `mp` |
| `end_dynamic` | 3 | `f`, `ff`, `fff` |
| `orchestration_layers` | 5 | `[piano]→[+drums]→[+strings]→[+choir]→[+full_band]` |
| `imagery_target` | 5 | `faith_collapse`, `bedroom_to_stadium`, `prayer_to_scream`, `vampire_attack`, `liberation` |

### `COP_cultural_suture`

| 参数键 | 不同值数 | 样本值 |
|---|---|---|
| `cultural_source` | 5 | `shamisen+Noh`, `pipe_organ`, `wedding_brass`, `Aqua_Barbie`, `Fergie_Glamorous` |
| `target_genre` | 4 | `trap`, `pop`, `drill`, `reggaeton` |
| `fusion_method` | 3 | `parallel`, `counterpoint`, `embed` |

### `COP_sample_deconstruction`

| 参数键 | 不同值数 | 样本值 |
|---|---|---|
| `speed_change` | 4 | `-20%`, `-15%`, `+10%`, `variable` |
| `pitch_change` | 3 | `minor_third_down`, `octave_down`, `preserve` |
| `filter_cutoff` | 4 | `1.5kHz`, `3kHz`, `6kHz`, `none` |
| `distortion_level` | 4 | `5%`, `10%`, `15%`, `30%` |
| `additional_effects` | 4 | `bitcrusher`, `wow_flutter`, `phaser`, `reverse` |

### `COP_vocal_spatial_counterpoint`

| 参数键 | 不同值数 | 样本值 |
|---|---|---|
| `voice_count` | 3 | `2`, `3`, `4+` |
| `depth_assignments` | 4 | `[near,mid,far]`, `[near,far]`, `[center,L,R]`, `[C0,L,R,far]` |
| `frequency_split` | 3 | `register`, `gender`, `era` |
| `rhythm_relation` | 3 | `complementary`, `alternating`, `overlapping` |

### `COP_beat_globalization`

| 参数键 | 不同值数 | 样本值 |
|---|---|---|
| `drum_style` | 8 | `Afrobeats`, `Jersey_club`, `UK_garage`, `Corridos`, `trap`, `boom_bap`, `Linndrum_80s`, `disco_funk` |
| `kick_pattern` | 5 | `downbeat_4_4`, `offbeat_double`, `weak_beat`, `none`, `short_decay` |
| `swing_amount` | 6 | `0`, `10`, `15`, `20`, `50`, `60` |
| `hi_hat_type` | 3 | `16th_continuous`, `32nd_rapid`, `8th_minimal` |

### `COP_micro_offset_feel`

| 参数键 | 不同值数 | 样本值 |
|---|---|---|
| `offset_ms` | 5 | `-15`, `-10`, `0`, `+10`, `+20`, `+25` |
| `feel_character` | 4 | `rushed_confident`, `behind_relaxed`, `ahead_attack`, `hesitant_cold` |
| `swing_percent` | 5 | `0`, `10`, `15`, `20`, `55` |

### `COP_frequency_emergence`

| 参数键 | 不同值数 | 样本值 |
|---|---|---|
| `start_band` | 3 | `narrow_low`, `narrow_mid`, `single_instrument` |
| `end_band` | 3 | `full_spectrum`, `wide_stereo`, `full_orchestra` |
| `emergence_speed` | 3 | `slow_bloom`, `staircase`, `rapid_expand` |

### `COP_form_disruption`

| 参数键 | 不同值数 | 样本值 |
|---|---|---|
| `disruption_type` | 4 | `section_reset`, `instant_drop`, `tempo_shift`, `dual_bridge` |
| `new_context` | 4 | `jazz_piano`, `distortion_guitar`, `string_quartet`, `mambo→reggaeton` |
| `drop_timing` | 3 | `bridge_tail`, `pre_chorus_end`, `1_beat_before_drop` |

### `COP_imagery_physicalization`

| 参数键 | 不同值数 | 样本值 |
|---|---|---|
| `emotion_target` | 6 | `anxiety`, `liberation`, `despair`, `devotion`, `empowerment`, `grief` |
| `physical_metaphor` | 5 | `climbing_spiral`, `downward_sigh`, `unstoppable_momentum`, `suspended_hover`, `explosive_release` |
| `motion_direction` | 3 | `ascending`, `descending`, `static_to_explosive` |
| `dynamic_arc` | 3 | `pp→fff`, `mf→fff`, `pp→mp` |

### `COP_vocal_architecture`

| 参数键 | 不同值数 | 样本值 |
|---|---|---|
| `layer_count` | 4 | `2`, `4`, `7`, `8` |
| `layer_entry_order` | 3 | `sequential`, `staggered`, `all_at_once` |
| `layer_depth` | 3 | `uniform_near`, `near_to_far`, `scattered` |

---
共 16 个 COP 的复合参数值空间
来源：每个COP的参数值从1353条复合技巧的实际参数中提取
