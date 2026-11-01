# Container

Loader 加载模型后生成的资产容器

## 添加 Container

![添加 Container](/blocks/vapor3D_Scene_AddContainer.svg)

将指定 Container 添加到场景中。

| 参数 | 说明 |
|---|---|
| Index | Scene 的 Registry Index |
| CONTAINER_IDX | Container 的 Registry Index |

::: tip 提示
仅用于跨 Scene 复用 Container，Container 实例由 Loader 创建。
:::

## 移除 Container

![移除 Container](/blocks/vapor3D_Scene_RemoveContainer.svg)

将指定 Container 从场景中移除。

| 参数 | 说明 |
|---|---|
| Index | Scene 的 Registry Index |
| CONTAINER_IDX | Container 的 Registry Index |

## 获取根节点索引

![获取根节点索引](/blocks/vapor3D_Scene_GetContainerRootIndex.svg)

获取 Container 的根节点的索引。

| 参数 | 说明 |
|---|---|
| Index | Container 的 Registry Index |

::: tip 提示
Container 属于资产而非继承自 Node，此处的根节点是为了方便用户对该 Container 下所有继承自 Node 的子对象应用整体变换、设置父级等。详见 Inspector 对 Rgistry 的解释。
:::

## 获取网格数量

![获取网格数量](/blocks/vapor3D_Scene_GetContainerMeshCount.svg)

获取 Container 中包含的网格数量。

| 参数 | 说明 |
|---|---|
| Index | Container 的 Registry Index |