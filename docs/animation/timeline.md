# Timeline 与 Clip

- **Clip** 是一条动画片段的独立对象，拥有自己的播放区间、播放头和混合参数，注册在 Registry 中，可以被多个 Timeline 引用。
- **Timeline** 绑定一个 Target，按名称持有一组 Clip，负责求值并把混合结果写回节点。

所有时间参数的单位均为秒。

## Clip

### 创建 Clip



返回 Clip 的 Registry Index。

| 参数 | 说明 |
|---|---|
| NAME | Clip 名称 |
| ANIMATION_INDEX | Animation 的 Registry Index |
| MODE | `normal` 或 `additive` |

### 销毁 Clip

`Clip [INDEX] .destroy`：释放 Clip，并自动从所有引用它的 Timeline 中移除。

### 双端裁剪

`Clip [INDEX] .trim start [START] end [END]`

| 参数 | 说明 |
|---|---|
| START | 源动画起点（秒） |
| END | 源动画终点（秒）；`END <= START` 表示播放到动画结尾 |

裁剪后 `duration = END - START`。播放头为 0 时采样源动画的 `START`，因此被裁掉的头部不占时间，新的头会直接对齐 Clip 的起点。

### 淡入淡出

`Clip [INDEX] .fade in [FADE_IN] out [FADE_OUT]`

| 参数 | 说明 |
|---|---|
| FADE_IN | 淡入时长（秒） |
| FADE_OUT | 淡出时长（秒） |

权重系数：

```text
min(1, 播放头 / FADE_IN, (duration - 播放头) / FADE_OUT)
```

- `normal` Clip 权重不足 1 的部分会向静止姿态插值，因此单个 Clip 也能淡入淡出；
- `additive` Clip 直接缩放增量。

### 启用 / 禁用

`Clip [INDEX] .setEnabled [ENABLED]`：`ENABLED` 为 `true` / `false`。禁用后该 Clip 不参与混合，播放头与属性保持不变。

### 切换混合模式

`Clip [INDEX] .setMode [MODE]`：`normal` 或 `additive`。

### 独立播放头

| 积木 | 说明 |
|---|---|
| `Clip [INDEX] .setTime [TIME]` | 设置本地播放头（秒） |
| `Clip [INDEX] .advanceTime [DELTA]` | 推进本地播放头 |

### 属性与查询

`Clip [INDEX] .set [PROP] [VALUE]` 设置可写属性，`Clip [INDEX] .get [PROP]` 读取任意属性。

| 属性 | 可写 | 说明 |
|---|---|---|
| `name` | | Clip 名称 |
| `time` | ✓ | 本地播放头（秒） |
| `isActive` | | 播放头是否在 `[0, duration)` 内，返回 `1` / `0` |
| `duration` | ✓ | 播放区间长度（秒），内部等价于 `trimEnd = trimStart + duration` |
| `weight` | ✓ | Clip 权重 |
| `trimStart` / `trimEnd` | ✓ | 源动画裁剪区间 |
| `fadeIn` / `fadeOut` | ✓ | 淡入淡出时长（秒） |

### Marker

Marker 来自 glb 中 `animations[i].extras.markers`，由 Loader 读取并存入 `Animation.markers`。所有时间与采样器使用同一基准（秒），单位与 Clip 播放头一致。

支持的 extras 写法（可混用）：

```jsonc
"extras": {
  "fps": 30,
  "markers": [
    { "name": "footstep_L", "time": 0.4 },
    { "name": "jump_atk",   "frame": 30 },
    [1.2, "footstep_R"],
    { "name": "land" }
  ]
}
```

| 写法 | 说明 |
|---|---|
| `{name, time}` | 秒，推荐 |
| `{name, frame}` | 帧，按 `extras.fps` 换算（缺省 24） |
| `[time, name]` / `[name, time]` | 二元组，自动识别 |
| `{name: time}` | 对象映射 |
| `extras.marker` / `extras.vapor3d.markers` | 别名 |

查询积木（时间以 Clip 本地播放头为准，已减去 `trimStart`；被裁剪掉的区间内的 marker 查不到）：

| 积木 | 返回 |
|---|---|
| `Clip [INDEX] .markerTime [NAME]` | marker 的 Clip 本地时间（秒），找不到返回 `-1` |
| `Clip [INDEX] .markerAt [TIME]` | 该时刻的 marker 名称，多个用 `,` 连接，没有返回空串 |
| `Clip [INDEX] .markerNames` | 裁剪窗口内全部 marker 名称，用 `,` 连接 |
| `Clip [INDEX] .markerCount` | 裁剪窗口内的 marker 数量 |

### 关节权重

`Clip [INDEX] .Joint [JOINT_NAME] setWeight [WEIGHT] recursive [RECURSIVE]`

| 参数 | 说明 |
|---|---|
| JOINT_NAME | 关节名称 |
| WEIGHT | 权重 |
| RECURSIVE | 是否递归应用到子关节 |

## Timeline

### 创建 Timeline

![创建 Timeline](/blocks/vapor3D_Timeline_Create.svg)

| 参数 | 说明 |
|---|---|
| NAME | Timeline 名称 |
| TYPE | 目标类型：`skeleton` / `container` |
| TARGET_INDEX | 目标对象的 Registry Index |

::: tip 提示
如果 TYPE 选择 Container ，则可同时应用节点动画。
:::

### 销毁 Timeline

![销毁 Timeline](/blocks/vapor3D_Timeline_Destroy.svg)

`Timeline [INDEX] .destroy`：只销毁 Timeline 本身，不会销毁它引用的 Clip。

### 添加 / 移除 Clip

| 积木 | 说明 |
|---|---|
| `Timeline [INDEX] .addClip [CLIP_INDEX]` | 按 Clip 名称添加引用，同名会覆盖 |
| `Timeline [INDEX] .removeClip [CLIP_INDEX]` | 移除 Clip 引用，不销毁 Clip |
| `Timeline [INDEX] .clipCount` | 已添加的 Clip 数量 |
| `Timeline [INDEX] .clipAt [POSITION]` | 按 1 起始的位置取 Clip 的 Registry Index |
| `Timeline [INDEX] .getClip [NAME]` | 按名称取 Clip 的 Registry Index，找不到返回 `-1` |

::: tip 提示
`getClip` 属于 Timeline 内部查找，不会出现在 Inspector 中。
:::

### 批量播放

| 积木 | 说明 |
|---|---|
| `Timeline [INDEX] .setAllClipTimes [TIME]` | 把所有 Clip 的本地播放头设为同一个值 |
| `Timeline [INDEX] .advanceAllClipTimes [DELTA]` | 同时推进所有 Clip 的播放头 |
| `Timeline [INDEX] .apply` | 使用各 Clip 当前播放头求值并应用 |
| `Timeline [INDEX] .duration` | 所有 Clip 的最大时长 |

::: tip 提示
`Clip.setTime` / `Timeline.setAllClipTimes` 只更新播放头；必须调用 `Timeline.apply` 才会重新采样并写回节点。
:::

