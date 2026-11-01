# Other Loader

## 应用 Lightmap Metadata

![应用 Lightmap 数据](/blocks/vapor3D_Loader_apply_lightmap_metadata.svg)

将 JSON 格式的 Lightmap 参数应用到指定 Container 中的网格。

| 参数 | 说明 |
|---|---|
| CONTAINER_INDEX | Container 的 Registry Index |
| JSON | Lightmap Metadata |

::: tip 提示
Lightmap Metadata JSON 文件需要使用 Vapor3D 配套的 Unity 插件导出。

[ExportLightmapMetadata.cs](https://github.com/JoyFul721/Vapor3D/blob/main/tools/ExportLightmapMetadata.cs)
:::