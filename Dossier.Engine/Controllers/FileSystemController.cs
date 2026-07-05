using Microsoft.AspNetCore.Mvc;
using System.IO;
using System.Linq;

namespace Dossier.Controllers
{
    [ApiController]
    [Route("api/files")]
    public class FileSystemController : ControllerBase
    {
        // Define your root working directory here
        private readonly string _rootDir = @"X:\ai\input";

        [HttpGet]
        public IActionResult GetDirectoryContents([FromQuery] string path = "")
        {
            try
            {
                // 1. Determine the target directory
                string targetDir = string.IsNullOrEmpty(path) 
                    ? _rootDir 
                    : Path.Combine(_rootDir, path);

                // 2. SECURITY: Prevent Path Traversal Attacks (e.g., path = "../../Windows")
                string fullRootPath = Path.GetFullPath(_rootDir);
                string fullTargetPath = Path.GetFullPath(targetDir);

                if (!fullTargetPath.StartsWith(fullRootPath, System.StringComparison.OrdinalIgnoreCase))
                {
                    return BadRequest(new { error = "Access denied. Invalid path." });
                }

                var directoryInfo = new DirectoryInfo(fullTargetPath);
                if (!directoryInfo.Exists)
                {
                    return NotFound(new { error = "Directory not found." });
                }

                // 3. Get all folders and files
                var fileSystemEntries = directoryInfo.GetFileSystemInfos();

                var items = fileSystemEntries.Select(entry => {
                    bool isDirectory = entry is DirectoryInfo;
                    
                    // Calculate the relative path to send back to the client
                    string relativePath = Path.GetRelativePath(_rootDir, entry.FullName);
                    // Ensure forward slashes for URLs
                    relativePath = relativePath.Replace("\\", "/"); 

                    return new
                    {
                        name = entry.Name,
                        type = isDirectory ? "directory" : "video",
                        path = relativePath,
                        size_mb = isDirectory ? 0 : Math.Round(((FileInfo)entry).Length / (1024.0 * 1024.0), 2),
                        metadata = new
                        {
                            has_subtitles = !isDirectory && CheckForSubtitles(entry.FullName),
                            has_metadata = true
                        }
                    };
                }).OrderByDescending(i => i.type == "directory") // Folders first
                  .ThenBy(i => i.name);

                // 4. Return the response matching your JS expectations
                return Ok(new
                {
                    currentPath = string.IsNullOrEmpty(path) ? "" : path.Replace("\\", "/"),
                    items = items
                });
            }
            catch (System.Exception ex)
            {
                return StatusCode(500, new { error = "An error occurred while reading the file system.", details = ex.Message });
            }
        }

        private bool CheckForSubtitles(string videoFilePath)
        {
            string srtPath = Path.ChangeExtension(videoFilePath, ".srt");
            string vttPath = Path.ChangeExtension(videoFilePath, ".vtt");
            return System.IO.File.Exists(srtPath) || System.IO.File.Exists(vttPath);
        }
    }
}