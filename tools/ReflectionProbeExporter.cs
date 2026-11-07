// License: MIT
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
            importer.maxTextureSize = 4096;
            importer.npotScale = TextureImporterNPOTScale.None;
            importer.textureCompression = TextureImporterCompression.Uncompressed;
            importer.SaveAndReimport();
            
            Texture2D tex = AssetDatabase.LoadAssetAtPath<Texture2D>(assetPath);
            if (tex != null)
            {
                string outPath = Path.Combine(exportDir, Path.GetFileNameWithoutExtension(assetPath) + ".ktx");
                if (SaveTextureAsKTX(tex, outPath))
                    Debug.Log($"[DEBUG] Export success: {Path.GetFileName(outPath)}");
            }

            Debug.Log($"EXR: {assetPath}\nTexture2D: {tex.width}x{tex.height}\nImporter MaxSize: {importer.maxTextureSize}\nCompression: {importer.textureCompression}\nFormat: {tex.format}\nShape: {importer.textureShape}");

            importer.textureType = originalType;
            importer.textureShape = originalShape;
            importer.isReadable = originalRead;
            importer.sRGBTexture = originalSRGB;
            importer.SaveAndReimport();

            Resources.UnloadUnusedAssets();
        }

        AssetDatabase.Refresh();
        Debug.Log("<color=green>[Vapor3D] All handled successfully. Path: Assets/OutdoorsScene/ExportReflectionProbe/ </color>");
    }

    static bool SaveTextureAsKTX(Texture2D srcTex, string outputPath)
    {
        int width = srcTex.width;
        int height = srcTex.height;
        int faceSize = height;

        if (width != faceSize * 6)
        {
            Debug.LogError($"Invalid cubemap layout: {width}x{height}, expected 6:1.");
            return false;
        }

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
                    int srcX = i * faceSize;
                    Color[] facePixels = srcTex.GetPixels(srcX, 0, faceSize, faceSize);
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

                            faceData[dataIndex++] = (byte)(hR & 0xFF);
                            faceData[dataIndex++] = (byte)(hR >> 8);
                            faceData[dataIndex++] = (byte)(hG & 0xFF);
                            faceData[dataIndex++] = (byte)(hG >> 8);
                            faceData[dataIndex++] = (byte)(hB & 0xFF);
                            faceData[dataIndex++] = (byte)(hB >> 8);
                            faceData[dataIndex++] = (byte)(hA & 0xFF);
                            faceData[dataIndex++] = (byte)(hA >> 8);
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

        return true;
    }
}
