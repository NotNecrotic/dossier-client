using System.Collections.Generic;
using Microsoft.Data.Sqlite;

namespace Dossier.Client.Storage
{
    public class LocalCache
    {
        private readonly string _dbPath;
        private readonly string _connectionString;

        public LocalCache(string dbPath)
        {
            _dbPath = dbPath;
            _connectionString = $"Data Source={dbPath}";
            Initialise();
        }

        private void Initialise()
        {
            using var connection = new SqliteConnection(_connectionString);
            connection.Open();

            var command = connection.CreateCommand();

            command.CommandText =
            @"
            CREATE TABLE IF NOT EXISTS Videos (
                Fingerprint TEXT PRIMARY KEY,
                FilePath TEXT,
                State INTEGER
            );

            CREATE TABLE IF NOT EXISTS ServerMapping (
                Fingerprint TEXT PRIMARY KEY,
                ServerUUID TEXT
            );

            CREATE TABLE IF NOT EXISTS Jobs (
                JobId TEXT PRIMARY KEY,
                Fingerprint TEXT,
                JobState INTEGER,
                JobType INTEGER
            );
            ";

            command.ExecuteNonQuery();
        }
    }
}