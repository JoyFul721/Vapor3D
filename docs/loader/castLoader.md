# CAST Loader

## 加载

```text
Loader.loadCAST [U] to Scene [SCENE_INDEX] as [NAME]
```

| 参数 | 说明 |
|---|---|
| U | CAST 文件 URL |
| SCENE_INDEX | 目标 Scene 的 Registry Index |
| NAME | Container 名称（纯动画文件时作为动画名前缀） |

加载时自动判断：

| 文件内容 | 行为 | 返回值 |
|---|---|---|
| 含 `modl` | 构建 Container 并挂到指定 Scene | Container 的 Registry Index |
| 仅 `anim`） | 动画直接注册到 Scene | 第一个动画的 Registry Index |


读取的内容：

| CAST 节点 | Vapor 对象 |
|---|---|
| `modl` | Container 根节点 |
| `skel` / `bone` | `Skeleton`（`lp`/`lr`/`s` 作为静止姿态，逆绑定矩阵由静止世界矩阵求逆得到） |
| `mesh` | `MeshNode` + `Mesh` + `Primitive`/`VAO`（`vp` 位置、`vn` 法线、`u0` UV、`f` 索引、`wb`/`wv`/`mi` 蒙皮） |
| `matl` | `Material`（占位贴图 + 各槽位源 URL） |
| `anim` | `Animation` |


## 动画曲线

| CAST 通道 | 转换 |
|---|---|
| `rq` | 四元数关键帧 → `rotation` |
| `tx` / `ty` / `tz` | 相对静止姿态的偏移（`curv.m = "relative"`） → `translation` |
| `sx` / `sy` / `sz` | `scale` |

- 帧号按 `anim.fr`（缺省 30）换算成秒；
- 三轴分别成通道时，关键帧取并集，缺帧沿用上一帧的值；
- 无关键帧的 `curv` 会被跳过。



## Marker

`anim` 节点下同时带 `kb`（帧）与 `n`（名称）的子节点会被当成 marker，时间 = `帧 / fr`。
它们写入 `Animation.markers`，可用 `Clip.markerTime` / `Clip.markerAt` 等积木查询。

## 材质贴图

CAST 的贴图是外部文件，材质只保存各槽位的源 URL：

```text
Material [INDEX] .textureURL [SLOT]
```

| SLOT | 来源属性 |
|---|---|
| `albedoTex` | `albedo` / `cs` |
| `normalTex` | `normal` / `ng` |
| `ormTex` | `specular` / `sm` |
| `emissiveTex` | `emissive` / `em` |

返回基于 cast 文件目录拼好的完整 URL，找不到时返回空串。GLB 的内嵌贴图没有源 URL，同样返回空串。

## 坐标转换

CAST 使用 Z-up / X-forward，Vapor 跟随 glTF（Y-up / -Z-forward）。
转换方式是纯旋转（行列式 +1）：

```text
position/normal : (x, y, z) → (-y, z, -x)
quaternion      : (x, y, z, w) → (-y, z, -x, w)
scale           : (x, y, z) → (y, z, x)
```
