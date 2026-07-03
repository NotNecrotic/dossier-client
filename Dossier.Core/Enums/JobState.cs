namespace Dossier.Core.Enums;

public enum JobState
{
    Created,
    Fingerprinting,
    Fingerprinted,
    Preprocessing,
    Preprocessed,
    AwaitingUpload,
    Uploading,
    Completed,
    Failed
}