using System;
using System.IO;
using System.Security.Cryptography;

namespace Dossier.Engine.Services
{
    public class FingerprintService
    {
        private const int SampleSize = 65536; // 64KB

        public string Generate(string filePath)
        {
            var info = new FileInfo(filePath);

            if (!info.Exists)
                throw new FileNotFoundException(
                    "File not found",
                    filePath
                );

            using var stream = info.OpenRead();

            byte[] start = ReadBytes(
                stream,
                0,
                SampleSize
            );

            byte[] middle = ReadBytes(
                stream,
                Math.Max(
                    0,
                    stream.Length / 2 - SampleSize / 2
                ),
                SampleSize
            );

            byte[] end = ReadBytes(
                stream,
                Math.Max(
                    0,
                    stream.Length - SampleSize
                ),
                SampleSize
            );

            using var sha = SHA256.Create();

            sha.TransformBlock(
                BitConverter.GetBytes(info.Length),
                0,
                sizeof(long),
                null,
                0
            );

            sha.TransformBlock(
                start,
                0,
                start.Length,
                null,
                0
            );

            sha.TransformBlock(
                middle,
                0,
                middle.Length,
                null,
                0
            );

            sha.TransformFinalBlock(
                end,
                0,
                end.Length
            );

            return Convert.ToHexString(sha.Hash!);
        }

        private byte[] ReadBytes(
            FileStream stream,
            long position,
            int count)
        {
            stream.Seek(position, SeekOrigin.Begin);

            byte[] buffer = new byte[count];

            int read =
                stream.Read(
                    buffer,
                    0,
                    count
                );

            if(read == count)
                return buffer;

            Array.Resize(
                ref buffer,
                read
            );

            return buffer;
        }
    }
}