// ============================================================================
// Copyright (c) 2026 Joy_Ful
//
// Project: Vapor3D Engine Pipeline
// Module: LightmapMetadataExporter.cs
// Author: Joy_Ful
// Acknowledgments: Developed with the assistance of Gemini AI. 借助 Google Gemini Ai 辅助开发
// Date: 2026-05-24
//
// Description:
// Exports static lightmap metadata (index and scale/offset) from Unity's 
// internal LightmapSettings and MeshRenderer components to a JSON format 
// compatible with the Vapor3D engine pipeline.
//
// License: MIT License
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in all
// copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
// SOFTWARE.
// ============================================================================

using UnityEngine;
using UnityEditor;
using System.IO;
using System.Collections.Generic;

public class LightmapMetadataExporter : Editor
{
    [MenuItem("Vapor3D/Export Lightmap Metadata")]
    static void ExportMetadata()
    {
        var items = new List<LightmapDataEntry>();
        
        Renderer[] renderers = Object.FindObjectsByType<Renderer>(
            FindObjectsInactive.Include, 
            FindObjectsSortMode.None
        );

        var nameCounters = new Dictionary<string, int>();

        foreach (var renderer in renderers)
        {
            if (renderer is MeshRenderer || renderer is SkinnedMeshRenderer)
            {
                if (renderer.lightmapIndex >= 0 && renderer.lightmapIndex != 65534)
                {
                    string rawName = renderer.gameObject.name;
                    string blenderSimulatedName = rawName;

                    // 模拟 Blender 的全局重名递增后缀逻辑
                    if (!nameCounters.ContainsKey(rawName))
                    {
                        nameCounters[rawName] = 1;
                    }
                    else
                    {
                        int currentCount = nameCounters[rawName];
                        blenderSimulatedName = $"{rawName}.{currentCount:D3}";
                        nameCounters[rawName]++;
                    }

                    Vector4 so = renderer.lightmapScaleOffset;

                    // V 翻转
                    float webGLOffsetY = 1.0f - so.y - so.w;
                    float[] correctedSO = new float[] { so.x, so.y, so.z, webGLOffsetY };

                    Material[] sharedMaterials = renderer.sharedMaterials;
                    if (sharedMaterials != null && sharedMaterials.Length > 1)
                    {
                        for (int i = 0; i < sharedMaterials.Length; i++)
                        {
                            items.Add(new LightmapDataEntry {
                                name = $"{blenderSimulatedName}_p{i}",
                                lightmapIndex = renderer.lightmapIndex,
                                scaleOffset = correctedSO
                            });
                        }
                    }
                    else
                    {
                        items.Add(new LightmapDataEntry {
                            name = $"{blenderSimulatedName}_p0",
                            lightmapIndex = renderer.lightmapIndex,
                            scaleOffset = correctedSO
                        });
                    }
                }
            }
        }
        LightmapWrapper myWrapper = new LightmapWrapper { items = items };
        string json = JsonUtility.ToJson(myWrapper, true);
        
        File.WriteAllText(Application.dataPath + "/lightmap_metadata.json", json);
        
        Debug.Log($"文件已保存至 /lightmap_metadata.json");
    }
}

[System.Serializable]
public class LightmapDataEntry 
{
    public string name;
    public int lightmapIndex;
    public float[] scaleOffset;
}

[System.Serializable]
public class LightmapWrapper 
{ 
    public List<LightmapDataEntry> items; 
}