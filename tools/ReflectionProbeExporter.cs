// ============================================================================
// Copyright (c) 2026 Joy_Ful
//
// Project: Vapor3D Engine Pipeline
// Module: ReflectionProbeExporter.cs
// Author: Joy_Ful
// Acknowledgments: Developed with the assistance of Gemini AI. 借助 Google Gemini Ai 辅助开发
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

public class ReflectionProbeExporter : Editor
{
    [MenuItem("Vapor3D/Export All Reflection Probes to KTX")]
    static void ExportProbes()
    {
        // GUID 全局查找所有 ReflectionProbe EXR
        string[] guids = AssetDatabase.FindAssets("ReflectionProbe t:Texture");
        string exportDir = Path.Combine(Application.dataPath, "Exported_ReflectionProbe");
        if (!Directory.Exists(exportDir)) Directory.CreateDirectory(exportDir);

        foreach (string guid in guids)
        {
            string assetPath = AssetDatabase.GUIDToAssetPath(guid);
            if (Path.GetExtension(assetPath).ToLower() != ".exr") continue;

            TextureImporter importer = AssetImporter.GetAtPath(assetPath) as TextureImporter;
            if (importer == null) continue;

            // 备份
            var originalShape = importer.textureShape;
            var originalRead = importer.isReadable;
            var originalType = importer.textureType;
            var originalSRGB = importer.sRGBTexture;

            // 设置为可读 2D
            importer.textureType = TextureImporterType.Default;
            importer.textureShape = TextureImporterShape.Texture2D;
            importer.isReadable = true;
            importer.sRGBTexture = false;
            importer.SaveAndReimport();

            AssetDatabase.Refresh();

            Texture2D tex = AssetDatabase.LoadAssetAtPath<Texture2D>(assetPath);
            if (tex != null)
            {
                string outPath = Path.Combine(exportDir, Path.GetFileNameWithoutExtension(assetPath) + ".ktx");

                if (SaveTextureAsKTX(tex, outPath))
                    Debug.Log($"[DEBUG] Export success: {Path.GetFileName(outPath)}");
            }

            // 恢复并清理内存
            importer.textureType = originalType;
            importer.textureShape = originalShape;
            importer.isReadable = originalRead;
            importer.sRGBTexture = originalSRGB;
            importer.SaveAndReimport();
            
            Resources.UnloadUnusedAssets();
        }

        AssetDatabase.Refresh();
        Debug.Log("<color=green>[Vapor3D] All handled successfully. Path: Assets/Exported_ReflectionProbe/ </color>");
    }

    static bool SaveTextureAsKTX(Texture2D srcTex, string outputPath)
    {
        int width = srcTex.width;
        int height = srcTex.height;
        int faceSize = width < height ? width : height;
        bool isVertical = width < height;

        RenderTexture rt = RenderTexture.GetTemporary(width, height, 0, RenderTextureFormat.ARGBHalf, RenderTextureReadWrite.Linear);
        Graphics.Blit(srcTex, rt);
        RenderTexture previous = RenderTexture.active;
        RenderTexture.active = rt;
        
        Texture2D readableTex = new Texture2D(width, height, TextureFormat.RGBAHalf, false, true);
        readableTex.ReadPixels(new Rect(0, 0, width, height), 0, 0);
        readableTex.Apply();
        
        RenderTexture.active = previous;
        RenderTexture.ReleaseTemporary(rt);

        try
        {
            using (BinaryWriter writer = new BinaryWriter(File.Open(outputPath, FileMode.Create)))
            {
                byte[] identifier = { 0xAB, 0x4B, 0x54, 0x58, 0x20, 0x31, 0x31, 0xBB, 0x0D, 0x0A, 0x1A, 0x0A };
                writer.Write(identifier);
                writer.Write((uint)0x04030201);
                writer.Write((uint)0x140B);
                writer.Write((uint)2);
                writer.Write((uint)0x1908);
                writer.Write((uint)0x881A);
                writer.Write((uint)0x1908);
                writer.Write((uint)faceSize);
                writer.Write((uint)faceSize);
                writer.Write((uint)0);
                writer.Write((uint)0);
                writer.Write((uint)6);
                writer.Write((uint)1);
                writer.Write((uint)0);

                uint bytesPerFace = (uint)(faceSize * faceSize * 8);
                writer.Write(bytesPerFace);

                for (int i = 0; i < 6; i++)
                {
                    int srcX = isVertical ? 0 : i * faceSize;
                    int srcY = isVertical ? (5 - i) * faceSize : 0;

                    if (srcX + faceSize > width)  srcX = width - faceSize;
                    if (srcY + faceSize > height) srcY = height - height;

                    Color[] facePixels = readableTex.GetPixels(srcX, srcY, faceSize, faceSize);
                    byte[] faceData = new byte[bytesPerFace];
                    int dataIndex = 0;

                    for (int row = faceSize - 1; row >= 0; row--)
                    {
                        for (int col = 0; col < faceSize; col++)
                        {
                            Color c = facePixels[row * faceSize + col];
                            ushort hR = Mathf.FloatToHalf(c.r);
                            ushort hG = Mathf.FloatToHalf(c.g);
                            ushort hB = Mathf.FloatToHalf(c.b);
                            ushort hA = Mathf.FloatToHalf(Mathf.Clamp01(c.a));

                            faceData[dataIndex++] = (byte)(hR & 0xFF); faceData[dataIndex++] = (byte)((hR >> 8) & 0xFF);
                            faceData[dataIndex++] = (byte)(hG & 0xFF); faceData[dataIndex++] = (byte)((hG >> 8) & 0xFF);
                            faceData[dataIndex++] = (byte)(hB & 0xFF); faceData[dataIndex++] = (byte)((hB >> 8) & 0xFF);
                            faceData[dataIndex++] = (byte)(hA & 0xFF); faceData[dataIndex++] = (byte)((hA >> 8) & 0xFF);
                        }
                    }
                    writer.Write(faceData);
                }
            }
        }
        catch (System.Exception e)
        {
            Debug.LogError($"KTX write error: {e.Message}");
            return false;
        }
        finally
        {
            Object.DestroyImmediate(readableTex);
        }
        return true;
    }
}