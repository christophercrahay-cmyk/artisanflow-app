declare module 'react-signature-canvas' {
  import * as React from 'react';

  export default class SignatureCanvas extends React.Component<{
    penColor?: string;
    backgroundColor?: string;
    minWidth?: number;
    maxWidth?: number;
    canvasProps?: React.CanvasHTMLAttributes<HTMLCanvasElement>;
  }> {
    clear(): void;
    isEmpty(): boolean;
    getTrimmedCanvas(): HTMLCanvasElement;
  }
}


