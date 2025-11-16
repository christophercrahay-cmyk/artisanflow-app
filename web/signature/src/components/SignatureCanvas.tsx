import React, { useEffect, useRef } from 'react';
import SignatureCanvas from 'react-signature-canvas';

export type SignatureCanvasHandle = {
	getDataUrl: () => string;
	clear: () => void;
	isEmpty: () => boolean;
};

type Props = {
	onReady?: () => void;
};

export const SignatureBox = React.forwardRef<SignatureCanvasHandle, Props>(function SignatureBox(_props, ref) {
	const sigRef = useRef<SignatureCanvas | null>(null);

	useEffect(() => {
		// nothing
	}, []);

	React.useImperativeHandle(ref, () => ({
		getDataUrl: () => {
			return sigRef.current?.getTrimmedCanvas().toDataURL('image/png') ?? '';
		},
		clear: () => {
			sigRef.current?.clear();
		},
		isEmpty: () => {
			return !!sigRef.current?.isEmpty();
		}
	}));

	return (
		<div className="sig-wrapper">
			<SignatureCanvas
				ref={(r) => (sigRef.current = r)}
				penColor="#111827"
				backgroundColor="#ffffff"
				minWidth={0.8}
				maxWidth={2.0}
				canvasProps={{ className: 'sig-canvas', 'aria-label': 'Zone de signature' }}
			/>
		</div>
	);
});


