# Skeleton

Joint 的集合，同时负责计算蒙皮动画所需的骨骼矩阵。

## 获取骨骼数量

![获取骨骼数量](/blocks/vapor3D_Scene_SkeletonGetJointCount.svg)

获取 Skeleton 中的骨骼数量。

| 参数 | 说明 |
|---|---|
| Index | Skeleton 的 Registry Index |

## 设置骨骼 TRS

![设置关节 TRS](/blocks/vapor3D_Scene_SkeletonSetJointTRS.svg)

根据骨骼名称设置其平移、旋转和缩放。

| 参数 | 说明 |
|---|---|
| Index | Skeleton 的 Registry Index |
| NAME | 骨骼名称 |
| TRS | TRS 数据 |

## 绑定骨骼纹理

![绑定骨骼纹理](/blocks/vapor3D_Scene_SkeletonBindTexture.svg)

将 Skeleton 使用的骨骼纹理绑定到指定纹理单元。

| 参数 | 说明 |
|---|---|
| Index | Skeleton 的 Registry Index |
| UNIT | 纹理单元 |

::: tip 在 Shader 中读取骨骼矩阵
骨骼纹理（`uJointTexture`）的每一行存储一个骨骼矩阵，每个矩阵占用连续的 4 个纹理像素，分别对应矩阵的 4 列，即纹理规格为 4 * n 向下延伸。

读取矩阵示例：

```glsl
mat4 getJointMatrix(int jointIdx) {
    return mat4(
        texelFetch(uJointTexture, ivec2(0, jointIdx), 0),
        texelFetch(uJointTexture, ivec2(1, jointIdx), 0),
        texelFetch(uJointTexture, ivec2(2, jointIdx), 0),
        texelFetch(uJointTexture, ivec2(3, jointIdx), 0)
    );
}
```

:::