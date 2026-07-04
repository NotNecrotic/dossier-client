namespace Dossier.Engine.Enums;

public enum VideoState
{
    Discovered,
    Fingerprinted,
    PendingPreprocess,
    Preprocessing,
    ReadyForUpload,
    Uploading,
    Uploaded,
    Synced,
    Error
}