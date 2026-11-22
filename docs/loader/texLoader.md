# Texture Loader

## 从 URL 加载

![从 URL 加载纹理](/blocks/vapor3D_Loader_load_texture_url.svg)

从 URL 加载普通纹理。

| 参数 | 说明 |
|---|---|
| U | 纹理 URL，支持 httpURL、dataURL 和 blobURL |
| NAME | 纹理名称 |


## 从 Scratch 造型加载

![从造型加载纹理](/blocks/vapor3D_Loader_load_texture_costume.svg)

从指定 Scratch 角色的造型加载纹理。

| 参数 | 说明 |
|---|---|
| C | 造型来源 |
| NAME | 纹理名称 |


## 加载 KTX 1.0

![加载 KTX](/blocks/vapor3D_Loader_load_ktx_url.svg)

从 URL 加载 KTX 1.0 纹理，默认 RGBA16F

| 参数 | 说明 |
|---|---|
| U | KTX URL，支持 httpURL、dataURL 和 blobURL |
| NAME | 纹理名称 |


## 加载 HDR

![加载 HDR](/blocks/vapor3D_Loader_load_hdr_url.svg)

从 URL 加载 HDR 纹理，默认 RGBA16F

| 参数 | 说明 |
|---|---|
| U | HDR URL，支持 httpURL、dataURL 和 blobURL |
| NAME | 纹理名称 |


## 加载 DDS

![加载 DDS](/blocks/vapor3D_Loader_load_dds_url.svg)

从 URL 加载 DDS 压缩纹理，支持 BC1 / BC2 / BC3 / BC4 / BC5 / BC6H / BC7 / Mipmap

| 参数 | 说明 |
|---|---|
| U | DDS URL，支持 httpURL、dataURL 和 blobURL |
| NAME | 纹理名称 |

::: tip 提示
DDS 使用 GPU 压缩格式，需要浏览器支持对应的 WebGL 扩展（如 `WEBGL_compressed_texture_s3tc`、`EXT_texture_compression_bptc`）。
:::
