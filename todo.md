# NBeat Agent TODO

## 集成 LMMS 合成引擎

将 Python 自研 Serum Synth 替换为 LMMS 专业合成器引擎，提升 WAV 音质。

### 三步方案

#### 第一步：编译 LMMS 为无头渲染库（1-2天）

```bash
git clone --depth 1 https://github.com/LMMS/lmms
cd lmms
brew install cmake qt@5 fftw libsndfile fltk fluid-synth  # macOS
# Linux: apt install cmake qtbase5-dev libsndfile1-dev libfftw3-dev

mkdir build && cd build
cmake .. -DWANT_GUI=OFF -DWANT_ALSA=OFF -DWANT_JACK=OFF
make -j$(nproc)
```

产物：`liblmms_core.a` + 插件 `.so` (tripleoscillator, zynaddsubfx, kicker, sf2player...)

#### 第二步：写 nbeat-render CLI（1-2天）

Python 包装器，track→plugin 映射 + preset 配置，调 C++ 渲染二进制。

#### 第三步：C++ 渲染核心（2-3天）

`nbeat-lmms-render` 二进制：读取 MIDI + 配置 → LMMS Plugin Chain → Mixer → WAV。

### 备用方案：FluidSynth + SoundFont

如果 LMMS 无头模式不可用，退到 FluidSynth（Python `midi2audio` 已安装），1天集成。

### 对比

| | 当前 Python Synth | LMMS 集成 |
|------|------|------|
| 合成器 | ~5种自研 | 15+ 专业 |
| 音质 | 基础 | 专业级 |
| 依赖 | numpy/scipy | C++ 编译链 |
| 预计工期 | — | 4-7天 |

---

## 复合元技巧 D 文件

- [ ] D_复合算子参数值空间.md 现为复合结构参数，评估是否需补充 OP 参数交叉索引
