namespace Dossier.Core.Enums;

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