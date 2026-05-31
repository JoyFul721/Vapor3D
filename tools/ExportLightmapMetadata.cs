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
        MeshRenderer[] renderers = Object.FindObjectsByType<MeshRenderer>(FindObjectsSortMode.None);

        foreach (var renderer in renderers)
        {
            if (renderer.lightmapIndex >= 0)
            {
                Vector4 so = renderer.lightmapScaleOffset;
                items.Add(new LightmapDataEntry {
                    name = renderer.gameObject.name,
                    lightmapIndex = renderer.lightmapIndex,
                    scaleOffset = new float[] { so.x, so.y, so.z, so.w }
                });
            }
        }

        string json = JsonUtility.ToJson(new Wrapper { items = items }, true);
        File.WriteAllText(Application.dataPath + "/lightmap_metadata.json", json);
        Debug.Log("Export successful: lightmap_metadata.json");
    }

    [System.Serializable]
    private class LightmapDataEntry {
        public string name;
        public int lightmapIndex;
        public float[] scaleOffset;
    }

    [System.Serializable]
    private class Wrapper { public List<LightmapDataEntry> items; }
} 