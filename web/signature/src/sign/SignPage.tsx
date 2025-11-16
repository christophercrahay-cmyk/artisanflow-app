import React from 'react';
import { SignatureBox, SignatureCanvasHandle } from '../components/SignatureCanvas';

type InfoOk = {
	ok: true;
	devis?: {
		numero?: string;
		montant_ttc?: number;
		acompte?: number | null;
		description_courte?: string | null;
		client_name?: string | null;
	};
	artisan?: {
		company_name?: string | null;
		full_name?: string | null;
		city?: string | null;
		address?: string | null;
	};
};

type InfoErr = {
	ok: false;
	reason: 'expired' | 'used' | 'not_found' | string;
};

type SignOk = { ok: true };
type SignErr = { ok: false; reason?: 'expired' | 'used' | 'not_found' | string };

type PageState = 'loading' | 'error' | 'ready' | 'submitting' | 'success';

function getQueryParam(name: string): string | null {
	const url = new URL(window.location.href);
	return url.searchParams.get(name);
}

function getSignFnBase(): string | undefined {
	// Priorité aux variables d'environnement Vite
	// Fallback possible via window.SIGN_FN_BASE défini dans index.html
	return import.meta.env.VITE_SIGN_FUNCTION_URL || (window as any).SIGN_FN_BASE;
}

async function postJson<T>(endpointBase: string, path: string, body: unknown): Promise<T> {
	const res = await fetch(`${endpointBase.replace(/\/$/, '')}/${path.replace(/^\//, '')}`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(body),
	});
	const json = (await res.json().catch(() => ({}))) as T;
	return json;
}

export const SignPage: React.FC = () => {
	const [state, setState] = React.useState<PageState>('loading');
	const [errMsg, setErrMsg] = React.useState<string>('');
	const [info, setInfo] = React.useState<InfoOk | null>(null);
	const [fullName, setFullName] = React.useState<string>('');
	const sigRef = React.useRef<SignatureCanvasHandle | null>(null);

	const token = React.useMemo(() => getQueryParam('token'), []);
	const signFnBase = React.useMemo(() => getSignFnBase(), []);

	React.useEffect(() => {
		(async () => {
			if (!token) {
				setErrMsg('Le lien de signature est incomplet ou invalide.');
				setState('error');
				return;
			}
			if (!signFnBase) {
				setErrMsg("Configuration manquante: l'URL de la fonction de signature n'est pas définie.");
				setState('error');
				return;
			}
			setState('loading');
			const data = await postJson<InfoOk | InfoErr>(signFnBase, 'sign-devis', { action: 'info', token });
			if ((data as InfoErr).ok === false) {
				const reason = (data as InfoErr).reason;
				const map: Record<string, string> = {
					expired: 'Lien expiré',
					used: 'Devis déjà signé',
					not_found: 'Lien invalide ou devis introuvable',
				};
				setErrMsg(map[reason] || 'Lien invalide ou devis introuvable');
				setState('error');
				return;
			}
			setInfo(data as InfoOk);
			setState('ready');
		})().catch(() => {
			setErrMsg('Erreur réseau. Merci de réessayer plus tard.');
			setState('error');
		});
	}, [token, signFnBase]);

	const onClear = React.useCallback(() => {
		sigRef.current?.clear();
	}, []);

	const onSubmit = React.useCallback(async () => {
		if (!token) return;
		if (!signFnBase) return;
		setErrMsg('');

		if (!fullName.trim()) {
			setErrMsg('Veuillez saisir votre nom complet.');
			setState('ready');
			return;
		}
		if (sigRef.current?.isEmpty()) {
			setErrMsg('Veuillez signer dans la zone prévue.');
			setState('ready');
			return;
		}
		setState('submitting');
		try {
			const signatureDataUrl = sigRef.current!.getDataUrl();
			const res = await postJson<SignOk | SignErr>(signFnBase, 'sign-devis', {
				action: 'sign',
				token,
				name: fullName.trim(),
				signatureDataUrl,
			});
			if ((res as SignErr).ok === false) {
				const reason = (res as SignErr).reason;
				const map: Record<string, string> = {
					expired: 'Lien expiré',
					used: 'Devis déjà signé',
					not_found: 'Lien invalide ou devis introuvable',
				};
				setErrMsg(map[reason ?? ''] || 'Une erreur est survenue, merci de réessayer plus tard.');
				setState('error');
				return;
			}
			setState('success');
		} catch (_e) {
			setErrMsg('Une erreur est survenue, merci de réessayer plus tard.');
			setState('error');
		}
	}, [fullName, signFnBase, token]);

	const artisanName =
		info?.artisan?.company_name || info?.artisan?.full_name || 'Artisan';
	const artisanAddress =
		info?.artisan?.address || info?.artisan?.city || '';

	return (
		<div className="container">
			<div className="card">
				<h1>Signature du devis</h1>

				{state === 'loading' && (
					<p className="muted">Chargement du devis…</p>
				)}

				{state !== 'loading' && info && (
					<>
						<p className="muted">
							Artisan : <strong>{artisanName}</strong>
						</p>
						{artisanAddress ? (
							<p className="muted">{artisanAddress}</p>
						) : null}
						<p className="muted">
							Client : {info.devis?.client_name || '-'}
						</p>
						<p className="muted">
							Devis n° <strong>{info.devis?.numero || '-'}</strong>
							{' • '}
							{info.devis?.montant_ttc != null ? `${info.devis.montant_ttc} € TTC` : '-'}
							{info.devis?.acompte != null ? ` • Acompte: ${info.devis.acompte} €` : ''}
						</p>
						{info.devis?.description_courte ? (
							<p className="muted">{info.devis.description_courte}</p>
						) : null}
					</>
				)}

				{state === 'error' && errMsg && (
					<div className="error" role="alert">{errMsg}</div>
				)}

				{(state === 'ready' || state === 'submitting') && (
					<>
						<div className="row">
							<div className="col">
								<label htmlFor="fullName">Votre nom complet</label>
								<input
									id="fullName"
									type="text"
									placeholder="Ex: Marie Dupont"
									value={fullName}
									onChange={(e) => setFullName(e.target.value)}
									disabled={state === 'submitting'}
								/>
							</div>
						</div>

						<div className="sig-block">
							<label>Signature</label>
							<SignatureBox ref={sigRef} />
							<p className="muted small">Signez ici</p>
							<div className="actions">
								<button
									className="secondary"
									onClick={onClear}
									type="button"
									disabled={state === 'submitting'}
								>
									Effacer
								</button>
								<button
									onClick={onSubmit}
									type="button"
									disabled={state === 'submitting' || !fullName.trim()}
								>
									{state === 'submitting' ? 'Envoi en cours…' : 'Signer le devis'}
								</button>
							</div>
						</div>

						<p className="muted legal">
							En signant ce devis, vous acceptez les travaux décrits ainsi que les conditions générales de vente.
						</p>
					</>
				)}

				{state === 'success' && (
					<div className="success">
						<p><strong>Devis signé</strong></p>
						<p>Merci, votre devis a bien été signé. Une copie sera conservée par l’artisan.</p>
					</div>
				)}
			</div>
			<p className="center muted help">
				Une question ? Contactez l’artisan qui vous a envoyé ce lien.
			</p>
		</div>
	);
};


