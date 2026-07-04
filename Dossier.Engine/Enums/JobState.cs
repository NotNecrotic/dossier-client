namespace Dossier.Engine.Enums;

public enum JobState
{
    Created,
    Fingerprinting,
    Fingerprinted,
    Preprocessing,
    Preprocessed,
    AwaitingUpload,
    Uploading,
    Uploaded,
    Completed,
    Failed
}