// ============================================================================
// Copyright (c) 2026 Joy_Ful
//
// Project: Vapor3D Engine Pipeline
// Module: ReflectionProbeExporter.cs
// Author: Joy_Ful
// Acknowledgments: Developed with the assistance of Gemini AI. 借助 Google Gemini Ai 辅助开发
// Date: 2026-05-31
//
// NOTE: For this pipeline to function correctly, users must first convert 
// Unity's custom .exr lightmap assets into standard 2D textures and ensure 
// that 'Read/Write' is explicitly enabled in their import settings.
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
    [MenuItem("Vapor3D/Export Direct to KTX 1.0 Cubemap")]
    static void ExportDirectToKTX1()
    {
        UnityEngine.Object activeObj = Selection.activeObject;
        string assetPath = AssetDatabase.GetAssetPath(activeObj);
        Texture srcTex = activeObj as Texture;

        if (srcTex == null || string.IsNullOrEmpty(assetPath))
        {
            Debug.LogError("Please select the lightmap first!");
            return;
        }

        TextureImporter importer = AssetImporter.GetAtPath(assetPath) as TextureImporter;
        TextureImporterShape originalShape = importer.textureShape;
        TextureImporterType originalType = importer.textureType;
        bool originalReadWrite = importer.isReadable;
        bool originalSRGB = importer.sRGBTexture;

        if (originalType != TextureImporterType.Default || originalShape != TextureImporterShape.Texture2D || !originalReadWrite)
        {
            importer.textureType = TextureImporterType.Default;
            importer.textureShape = TextureImporterShape.Texture2D;
            importer.isReadable = true;
            importer.sRGBTexture = false; 
            importer.SaveAndReimport();
        }

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

        string scriptPath = AssetDatabase.GetAssetPath(MonoScript.FromScriptableObject(ScriptableObject.CreateInstance<ReflectionProbeExporter>()));
        string scriptDir = Path.GetDirectoryName(Path.GetFullPath(scriptPath));
        string outputPath = Path.Combine(scriptDir, "probe_cubemap.ktx");

        using (BinaryWriter writer = new BinaryWriter(File.Open(outputPath, FileMode.Create)))
        {
            // KTX 1.0 12字节标识符
            byte[] identifier = { 0xAB, 0x4B, 0x54, 0x58, 0x20, 0x31, 0x31, 0xBB, 0x0D, 0x0A, 0x1A, 0x0A };
            writer.Write(identifier);

            // KTX 头信息 
            writer.Write((uint)0x04030201);       // endianness
            writer.Write((uint)0x140B);           // glType: GL_HALF_FLOAT
            writer.Write((uint)2);                // glTypeSize: 2 字节 (Float16)
            writer.Write((uint)0x1908);           // glFormat: GL_RGBA
            writer.Write((uint)0x881A);           // glInternalFormat: GL_RGBA16F
            writer.Write((uint)0x1908);           // glBaseInternalFormat: GL_RGBA
            writer.Write((uint)faceSize);         // pixelWidth
            writer.Write((uint)faceSize);         // pixelHeight
            writer.Write((uint)0);                // pixelDepth
            writer.Write((uint)0);                // numberOfArrayElements
            writer.Write((uint)6);                // numberOfFaces
            writer.Write((uint)1);                // numberOfMiplevels
            writer.Write((uint)0);                // bytesOfKeyValueData

            // 声明单面大小 (长 * 宽 * 4通道 * 2字节)
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

                // 转换至 OpenGL 坐标系。不知道 x 轴要不要一起转换
                for (int row = faceSize - 1; row >= 0; row--)
                {
                    for (int col = 0; col < faceSize; col++)
                    {
                        Color c = facePixels[row * faceSize + col];

                        float r = c.r;
                        float g = c.g;
                        float b = c.b;
                        float a = Mathf.Clamp01(c.a);

                        ushort hR = Mathf.FloatToHalf(r);
                        ushort hG = Mathf.FloatToHalf(g);
                        ushort hB = Mathf.FloatToHalf(b);
                        ushort hA = Mathf.FloatToHalf(a);

                        faceData[dataIndex++] = (byte)(hR & 0xFF); faceData[dataIndex++] = (byte)((hR >> 8) & 0xFF);
                        faceData[dataIndex++] = (byte)(hG & 0xFF); faceData[dataIndex++] = (byte)((hG >> 8) & 0xFF);
                        faceData[dataIndex++] = (byte)(hB & 0xFF); faceData[dataIndex++] = (byte)((hB >> 8) & 0xFF);
                        faceData[dataIndex++] = (byte)(hA & 0xFF); faceData[dataIndex++] = (byte)((hA >> 8) & 0xFF);
                    }
                }
                
                writer.Write(faceData);
            }
        }

        RenderTexture.active = previous;
        RenderTexture.ReleaseTemporary(rt);
        DestroyImmediate(readableTex);

        importer.textureType = originalType;
        importer.textureShape = originalShape;
        importer.isReadable = originalReadWrite;
        importer.sRGBTexture = originalSRGB;
        importer.SaveAndReimport();

        Debug.Log($"KTX 1.0 Cubemap export successful! \nPath:{outputPath}");
    }
}