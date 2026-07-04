using System.Collections.Generic;
using System.IO;

namespace Dossier.Engine.Runtime.StartupRecovery
{
    public class FileScanner
    {
        public List<string> Scan(string[] folders)
        {
            var results = new List<string>();

            foreach (var folder in folders)
            {
                if (!Directory.Exists(folder))
                    continue;

                var files = Directory.GetFiles(folder, "*.*", SearchOption.AllDirectories);

                foreach (var file in files)
                {
                    if (IsVideo(file))
                        results.Add(file);
                }
            }

            return results;
        }

        private bool IsVideo(string path)
        {
            var ext = Path.GetExtension(path).ToLower();

            return ext is ".mp4" or ".mkv" or ".avi" or ".mov";
        }
    }
}