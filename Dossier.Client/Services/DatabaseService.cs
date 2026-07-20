using Microsoft.Data.Sqlite;
using System;
using System.Collections.Generic;
using System.IO;

namespace Dossier.Client.Services
{
    public class DatabaseService
    {
        private readonly string _connectionString;

        public DatabaseService()
        {
            var dbDir =
                Path.Combine(
                    Environment.GetFolderPath(
                        Environment.SpecialFolder.LocalApplicationData
                    ),
                    "Dossier"
                );

            Directory.CreateDirectory(dbDir);

            var dbPath =
                Path.Combine(
                    dbDir,
                    "dossier.db"
                );

            _connectionString =
                $"Data Source={dbPath}";

            InitializeDatabase();
        }

        private void InitializeDatabase()
        {
            using var connection =
                new SqliteConnection(_connectionString);

            connection.Open();

            var command =
                connection.CreateCommand();

            command.CommandText = @"
                CREATE TABLE IF NOT EXISTS Videos
                (
                    Id INTEGER PRIMARY KEY AUTOINCREMENT,

                    FilePath TEXT NOT NULL UNIQUE,

                    Fingerprint TEXT NOT NULL
                );

                CREATE INDEX IF NOT EXISTS IX_Videos_Fingerprint
                ON Videos(Fingerprint);
            ";

            command.ExecuteNonQuery();
        }

        public void RegisterFingerprint(
            string filePath,
            string fingerprint)
        {
            using var connection =
                new SqliteConnection(_connectionString);

            connection.Open();

            using var command =
                connection.CreateCommand();

            command.CommandText = @"
                INSERT INTO Videos
                (
                    FilePath,
                    Fingerprint
                )

                VALUES
                (
                    $path,
                    $fingerprint
                )

                ON CONFLICT(FilePath)
                DO UPDATE SET
                    Fingerprint = excluded.Fingerprint;
            ";

            command.Parameters.AddWithValue(
                "$path",
                filePath
            );

            command.Parameters.AddWithValue(
                "$fingerprint",
                fingerprint
            );

            command.ExecuteNonQuery();
        }

        public void RemoveFingerprint(
            string filePath)
        {
            using var connection =
                new SqliteConnection(_connectionString);

            connection.Open();

            using var command =
                connection.CreateCommand();

            command.CommandText =
                @"
                DELETE FROM Videos
                WHERE FilePath = $path;
                ";

            command.Parameters.AddWithValue(
                "$path",
                filePath
            );

            command.ExecuteNonQuery();
        }

        public List<string> GetAllVideoPaths()
        {
            var paths =
                new List<string>();

            using var connection =
                new SqliteConnection(_connectionString);

            connection.Open();

            using var command =
                connection.CreateCommand();

            command.CommandText =
                "SELECT FilePath FROM Videos;";

            using var reader =
                command.ExecuteReader();

            while (reader.Read())
            {
                paths.Add(
                    reader.GetString(0)
                );
            }

            return paths;
        }

        public string? GetFingerprint(
            string filePath)
        {
            using var connection =
                new SqliteConnection(_connectionString);

            connection.Open();

            using var command =
                connection.CreateCommand();

            command.CommandText =
                @"
                SELECT Fingerprint
                FROM Videos
                WHERE FilePath = $path;
                ";

            command.Parameters.AddWithValue(
                "$path",
                filePath
            );

            var result =
                command.ExecuteScalar();

            return result?.ToString();
        }

        public Dictionary<string, string?> GetFingerprints(
            List<string> filePaths)
        {
            var result = new Dictionary<string, string?>();

            if (filePaths.Count == 0)
                return result;


            using var connection =
                new SqliteConnection(_connectionString);

            connection.Open();


            using var command =
                connection.CreateCommand();


            var parameters = new List<string>();


            for (int i = 0; i < filePaths.Count; i++)
            {
                var parameter = $"$path{i}";

                parameters.Add(parameter);

                command.Parameters.AddWithValue(
                    parameter,
                    filePaths[i]
                );
            }


            command.CommandText = $@"
                SELECT FilePath, Fingerprint
                FROM Videos
                WHERE FilePath IN ({string.Join(",", parameters)});
            ";


            using var reader =
                command.ExecuteReader();


            while (reader.Read())
            {
                result[
                    reader.GetString(0)
                ] =
                    reader.GetString(1);
            }

            return result;
        }

        public bool ContainsFingerprint(
            string fingerprint)
        {
            using var connection =
                new SqliteConnection(_connectionString);

            connection.Open();

            using var command =
                connection.CreateCommand();

            command.CommandText =
                @"
                SELECT EXISTS
                (
                    SELECT 1
                    FROM Videos
                    WHERE Fingerprint = $fingerprint
                );
                ";

            command.Parameters.AddWithValue(
                "$fingerprint",
                fingerprint
            );

            return Convert.ToInt32(
                command.ExecuteScalar()
            ) == 1;
        }

        public bool Exists(string filePath)
        {
            using var connection = new SqliteConnection(_connectionString);
            connection.Open();

            using var command = connection.CreateCommand();

            command.CommandText = @"
                SELECT EXISTS(
                    SELECT 1 
                    FROM Videos 
                    WHERE FilePath = $filePath
                );";

            command.Parameters.AddWithValue(
                "$filePath",
                filePath
            );

            var result = command.ExecuteScalar();

            return Convert.ToInt32(result) == 1;
        }
    }
}