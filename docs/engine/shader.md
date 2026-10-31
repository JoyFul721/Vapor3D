# Shader

## 创建着色器

![创建着色器](/blocks/vapor3D_Shader_Create.svg)

创建并编译链接一个着色器程序。

**参数**

| 参数 | 说明 |
|---|---|
| 名称（NAME） | 着色器的名称，用于 Inspector 查找 |
| 顶点着色器源码 | GLSL Vertex Shader 源码 |
| 片段着色器源码 | GLSL Fragment Shader 源码 |

**返回值**

返回该着色器实例在 Registry（注册表）中的索引，可用于后续通过索引访问该资源。

::: warning 注意
目前暂不支持过滤着色器源码中的注释。传入源码前，请先自行删除注释。
:::

## 激活着色器

![激活着色器](/blocks/vapor3D_Shader_Use.svg)

激活指定的着色器程序。

**参数**

| 参数 | 说明 |
|---|---|
| 注册表索引（Index） | 目标着色器实例在 Registry 中的索引 |

::: tip 提示
可以使用「创建着色器」积木的返回值直接连接到此积木，也可把返回值赋给变量，再通过变量传入此积木。
:::

## 设置 Uniform

Vapor3D 提供以下积木，用于设置 Shader 的 Uniform 变量：

![设置 Bool](/blocks/vapor3D_Shader_SetBool.svg)
![设置 Float](/blocks/vapor3D_Shader_SetFloat.svg)
![设置 Int](/blocks/vapor3D_Shader_SetInt.svg)
![设置 Vec2](/blocks/vapor3D_Shader_SetVec2.svg)
![设置 Vec3](/blocks/vapor3D_Shader_SetVec3.svg)
![设置 Vec4](/blocks/vapor3D_Shader_SetVec4.svg)
![设置 Mat4](/blocks/vapor3D_Shader_SetMat4.svg)

::: warning 注意
设置 Uniform 前，请确保目标 Shader 已激活。
:::