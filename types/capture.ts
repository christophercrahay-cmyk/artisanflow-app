/**
 * Types pour le système de captures en attente
 */

export type CaptureType = 'photo' | 'audio' | 'note';

export interface PendingCaptureBase {
  id: string; // UUID local
  type: CaptureType;
  createdAt: Date;
}

export interface PendingPhotoCapture extends PendingCaptureBase {
  type: 'photo';
  fileUri: string; // URI locale de la photo
}

export interface PendingAudioCapture extends PendingCaptureBase {
  type: 'audio';
  fileUri: string; // URI locale du fichier audio
  durationMs: number;
}

export interface PendingNoteCapture extends PendingCaptureBase {
  type: 'note';
  content: string;
}

export type PendingCapture =
  | PendingPhotoCapture
  | PendingAudioCapture
  | PendingNoteCapture;

