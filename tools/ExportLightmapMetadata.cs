/*
 * Vapor3D - Lightmap Metadata Exporter
 * 
 * Description: 
 * Exports static lightmap metadata (index and scale/offset) from Unity's 
 * internal LightmapSettings and MeshRenderer components to a JSON format 
 * compatible with the Vapor3D engine pipeline.
 * 
 * Author: Joy_Ful
 * Date: 2026-05-24
 * 
 * Copyright (c) 2026 Joy_Ful. All rights reserved.
 * 
 * License: MIT License
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 * 
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 * 
 * Disclaimer:
 * This script utilizes Unity's Editor API. Use of this script is subject to 
 * Unity Technologies' Terms of Service and EULA. The software is provided "as is",
 * without warranty of any kind, express or implied, including but not limited to
 * the warranties of merchantability, fitness for a particular purpose.
 */

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
        Debug.Log("export successfully: lightmap_metadata.json");
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