# Vapor 3D Engine

高性能、可编程的 **多阶段渲染管线 (Multi-Stage Pipeline)** 框架。

![Version](https://img.shields.io/badge/version-3.3.0-007a1f?style=flat&logo=github&labelColor=24292e)

---

> **TODO**: 扩展处于测试阶段，遇到问题欢迎向我反馈。文档目前仅为大纲，将来有时间会来完善。

---

## 核心特性

* **完全可编程管线**：引擎不内置任何渲染算法。开发者可完全接管并自定义 Shader 逻辑。
* **自定义渲染阶段**：引擎框架设计支持高效的中间数据交换，支持延迟渲染、G-Buffer 架构及代理几何体等高级技术的二次开发。

## 渲染效果

![Cover](screenshots/Cover.png)
![ExtLoad_Stencil](screenshots/ExtLoad_Stencil.png)
![BOXIBL1](screenshots/BOXIBL1.png)
![IBL1](screenshots/IBL2.png)
![IBL1](screenshots/IBL1.png)
![rain](screenshots/4f608e9e7445583d0d3df88c7549e611.png)

* 可前往 example/ 查看我最近在写的一些二次开发作品，均采用MIT开源

---
> <small>
> <b>资源致谢 (Credits):</b>
> <br>本文档及示例项目（example/pbr.sb3）中使用的资源包括：PBR 贴图 (FreePBR.com)、IBL 预卷积贴图 (cmftStudio)、Water Bottle 模型 (Khronos Group, CC-BY 4.0)、BRDF 查找表 (LearnOpenGL, CC BY-NC 4.0)、Vanguard 角色模型 (T. Choonyung, Mixamo.com)。本扩展引用了第三方库 <b>gltf-loader-ts</b>，在此一并鸣谢。
> 
> <b>⚠️ Unity 资源声明:</b>
> <br>项目场景中使用了由 <b>Unity</b> 提供的 <b>HDRP Sample Scene</b> 示例资源。
> <br><b>特别强调：此类资源版权完全归 Unity 所有，仅限用于本项目引擎开发的学习参考与渲染兼容性测试，严禁用于任何形式的商业用途或二次分发。</b>
> 
> <b>Disclaimer:</b>
> <br>本项目（Vapor3D）是一个遵循 <b>MPL 2.0</b> 协议的开源技术研究与学习项目。上述所有第三方资源版权均归原作者所有，本项目仅将其用于非营利性的技术演示。
> </small>


**By: Joy_Ful** | License: MPL-2.0
