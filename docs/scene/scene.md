# Scene

## 创建场景

![创建场景](/blocks/vapor3D_Scene_Create.svg)

创建一个 Scene 对象。

| 参数 | 说明 |
|---|---|
| NAME | 场景名称，用于 Inspector 查找 |

## 销毁场景

![销毁场景](/blocks/vapor3D_Scene_Destroy.svg)

销毁指定 Scene 及其资源。

| 参数 | 说明 |
|---|---|
| Index | Scene 的 Registry Index |

## 清空场景

![清空场景](/blocks/vapor3D_Scene_Clear.svg)

清空指定 Scene 中的内容。

| 参数 | 说明 |
|---|---|
| Index | Scene 的 Registry Index |

## 更新矩阵

![更新矩阵](/blocks/vapor3D_Scene_UpdateWorldMatrix.svg)

更新指定 Scene 中所有节点的矩阵。

| 参数 | 说明 |
|---|---|
| Index | Scene 的 Registry Index |

::: tip 提示
每个 Scene 实例持有的矩阵仓库互相独立，但 Node 的 Registry Index 仍然是全局性的。
:::