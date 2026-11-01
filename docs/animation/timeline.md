# Timeline
Timeline 是一个绑定到指定 Target 的动画轨道容器与播放器实例，用于添加、管理和混合 Animation Clip，并将动画结果应用到 Target

## 创建 Timeline

![创建 Timeline](/blocks/vapor3D_Timeline_Create.svg)

创建一个 Timeline，并指定目标类型及索引

| 参数 | 说明 |
|---|---|
| NAME | Timeline 名称 |
| TYPE | 目标类型 |
| TARGET_INDEX | 目标对象的 Registry Index |

::: tip 提示
如果 TYPE 选择 Container ，则可同时应用节点动画。
:::

## 销毁 Timeline

![销毁 Timeline](/blocks/vapor3D_Timeline_Destroy.svg)

销毁指定 Timeline。

| 参数 | 说明 |
|---|---|
| INDEX | Timeline 的 Registry Index |

## 添加 Clip

![添加 Clip](/blocks/vapor3D_Timeline_AddClip.svg)

向 Timeline 添加动画片段。

| 参数 | 说明 |
|---|---|
| INDEX | Timeline 的 Registry Index |
| CLIP_NAME | Clip 名称 |
| ANIMATION_INDEX | Animation 的 Registry Index |
| MODE | 混合模式 |

## 设置 Clip 属性

![设置 Clip 属性](/blocks/vapor3D_Timeline_SetClipProperty.svg)

设置指定 Clip 的属性。

| 参数 | 说明 |
|---|---|
| INDEX | Timeline 的 Registry Index |
| CLIP_NAME | Clip 名称 |
| PROP | 属性名称 |
| VALUE | 属性值 |

## 设置关节权重

![设置关节权重](/blocks/vapor3D_Timeline_SetClipJointWeight.svg)

设置指定 Clip 中某个关节的动画权重。

| 参数 | 说明 |
|---|---|
| INDEX | Timeline 的 Registry Index |
| CLIP_NAME | Clip 名称 |
| JOINT_NAME | 关节名称 |
| WEIGHT | 权重 |
| RECURSIVE | 是否递归应用到子关节 |

## 检查 Clip 是否激活

![检查 Clip 是否激活](/blocks/vapor3D_Timeline_IsActive.svg)

检查指定时间点 Timeline 是否处于激活状态。

| 参数 | 说明 |
|---|---|
| INDEX | Timeline 的 Registry Index |
| TIME | 时间 |

## 应用动画

![应用动画](/blocks/vapor3D_Timeline_ApplyAt.svg)

将 Timeline 中的动画应用到指定时刻。

| 参数 | 说明 |
|---|---|
| INDEX | Timeline 的 Registry Index |
| TIME | 时刻 |