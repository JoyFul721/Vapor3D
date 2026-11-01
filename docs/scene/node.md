# Node

## 设置 TRS

![设置节点 TRS](/blocks/vapor3D_Scene_NodeSetTRS.svg)

设置指定节点的平移、旋转和缩放。

| 参数 | 说明 |
|---|---|
| Index | Scene 的 Registry Index |
| NODE_IDX | 节点的 Registry Index |
| TRS | 平移、旋转和缩放 |

## 设置父节点

![设置父节点](/blocks/vapor3D_Scene_NodeSetParent.svg)

设置节点的父子关系。

| 参数 | 说明 |
|---|---|
| Index | Scene 的 Registry Index |
| CHILD_NODE_IDX | 子节点的 Registry Index |
| PARENT_NODE_IDX | 父节点的 Registry Index，`-1` 表示挂到 Scene Root |

## 获取世界矩阵

![获取世界矩阵](/blocks/vapor3D_Scene_GetNodeMatrix.svg)

获取指定节点的全局矩阵。

| 参数 | 说明 |
|---|---|
| Index | Scene 的 Registry Index |
| NODE_IDX | 节点的 Registry Index |

## 获取 TRS

![获取节点 TRS](/blocks/vapor3D_Scene_GetNodeTRS.svg)

获取指定节点的平移、旋转和缩放数据。

| 参数 | 说明 |
|---|---|
| Index | Scene 的 Registry Index |
| NODE_IDX | 节点的 Registry Index |