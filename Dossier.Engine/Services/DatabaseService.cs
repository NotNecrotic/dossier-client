using Microsoft.Data.Sqlite;
using System.IO;

namespace Dossier.Engine.Services
{
    public class DatabaseService
    {
        private readonly string _connectionString;

        public DatabaseService()
        {
            var dbDir = Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData), "Dossier");
            Directory.CreateDirectory(dbDir);
            _connectionString = $"Data Source={Path.Combine(dbDir, "dossier.db")}";

            InitializeDatabase();
        }

        private void InitializeDatabase()
        {
            using var connection = new SqliteConnection(_connectionString);
            connection.Open();

            using (var pragmaCmd = connection.CreateCommand())
            {
                pragmaCmd.CommandText = "PRAGMA journal_mode=WAL;";
                pragmaCmd.ExecuteNonQuery();
            }
            
            var script = @"
                CREATE TABLE IF NOT EXISTS Fingerprints (
                    FilePath TEXT PRIMARY KEY,
                    Fingerprint TEXT
                );

                CREATE TABLE IF NOT EXISTS Jobs (
                    JobId TEXT PRIMARY KEY,
                    Fingerprint TEXT,
                    FilePath TEXT,
                    JobState INTEGER,
                    JobType INTEGER
                );";

            using var command = connection.CreateCommand();
            command.CommandText = script;
            command.ExecuteNonQuery();
        }

        public void RegisterFingerprint(string filePath, string fingerprint)
        {
            using var connection = new SqliteConnection(_connectionString);
            connection.Open();

            using var command = connection.CreateCommand();
            command.CommandText = @"
                INSERT OR REPLACE INTO Fingerprints (FilePath, Fingerprint)
                VALUES ($filePath, $fingerprint);";
            command.Parameters.AddWithValue("$filePath", filePath);
            command.Parameters.AddWithValue("$fingerprint", fingerprint);

            command.ExecuteNonQuery();
        }

        public void RemoveFingerprint(string filePath)
        {
            using var connection = new SqliteConnection(_connectionString);
            connection.Open();
            var cmd = connection.CreateCommand();
            cmd.CommandText = "DELETE FROM Fingerprints WHERE FilePath = $path";
            cmd.Parameters.AddWithValue("$path", filePath);
            cmd.ExecuteNonQuery();
        }

       public void GetAllFingerprintPaths(List<string> paths)
        {
            using var connection = new SqliteConnection(_connectionString);
            connection.Open();

            var command = connection.CreateCommand();
            command.CommandText = "SELECT FilePath FROM Fingerprints";

            using var reader = command.ExecuteReader();
            while (reader.Read())
            {
                paths.Add(reader.GetString(0));
            }
        }
    }
}