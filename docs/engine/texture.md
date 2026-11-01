# Texture

## 创建空 2D 纹理

![创建 2D 纹理](/blocks/vapor3D_Texture_CreateEmpty.svg)

创建一个指定尺寸和格式的空白 2D 纹理。

| 参数 | 说明 |
|---|---|
| NAME | 纹理名称，用于 Inspector 查找 |
| W | 纹理宽度 |
| H | 纹理高度 |
| FORMAT | 纹理内部格式 |

## 创建空 Cubemap

![创建 Cubemap](/blocks/vapor3D_Texture_CreateEmptyCubemap.svg)

创建一个指定尺寸和格式的空白 Cubemap。

| 参数 | 说明 |
|---|---|
| NAME | 纹理名称，用于 Inspector 查找 |
| SIZE | 每个面的宽度和高度 |
| FORMAT | 纹理内部格式 |

::: tip 提示
以上创建积木均返回纹理实例在 Registry 中的索引。
:::

## 更新纹理数据

![更新纹理数据](/blocks/vapor3D_Texture_UpdateFromList.svg)

使用 Scratch 列表中的数据更新纹理内容。

| 参数 | 说明 |
|---|---|
| Index | 纹理在 Registry 中的索引 |
| LIST | 数据来源列表 |
| TYPE | 纹理数据格式 |

## 绑定纹理

### 绑定 2D 纹理

![绑定 2D 纹理](/blocks/vapor3D_Texture_Bind.svg)

将指定 2D 纹理绑定到指定的纹理单元，并激活对应单元。

| 参数 | 说明 |
|---|---|
| Index | 纹理在 Registry 中的索引 |
| UNIT | 纹理单元 |

### 绑定 Cubemap

![绑定 Cubemap](/blocks/vapor3D_Texture_BindCube.svg)

将指定 Cubemap 绑定到指定的纹理单元，并激活对应单元。

| 参数 | 说明 |
|---|---|
| Index | Cubemap 在 Registry 中的索引 |
| UNIT | 纹理单元 |

## 纹理采样设置

### 设置过滤模式

![设置过滤模式](/blocks/vapor3D_Texture_SetFilter.svg)

设置纹理缩小和放大时使用的过滤方式。

| 参数 | 说明 |
|---|---|
| Index | 纹理在 Registry 中的索引 |
| MIN_MODE | 缩小时的过滤模式 |
| MAG_MODE | 放大时的过滤模式 |

### 设置环绕模式

![设置环绕模式](/blocks/vapor3D_Texture_SetWrap.svg)

设置纹理坐标超出 0～1 范围时的寻址方式。

| 参数 | 说明 |
|---|---|
| Index | 纹理在 Registry 中的索引 |
| MODE | 纹理环绕模式 |

### 生成 Mipmap

![生成 Mipmap](/blocks/vapor3D_Texture_GenerateMipmap.svg)

生成 Mipmap 多级纹理。