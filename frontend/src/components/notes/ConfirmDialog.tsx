"use client";

import { useEffect, useRef } from "react";

interface ConfirmDialogProps {
	title: string;
	message: string;
	confirmLabel?: string;
	busy?: boolean;
	onConfirm: () => void;
	onCancel: () => void;
}

/** Accessible confirmation dialog for destructive actions. */
export default function ConfirmDialog({
	title,
	message,
	confirmLabel = "Delete",
	busy = false,
	onConfirm,
	onCancel,
}: ConfirmDialogProps) {
	const confirmRef = useRef<HTMLButtonElement>(null);

	useEffect(() => {
		confirmRef.current?.focus();
		const onKeyDown = (e: KeyboardEvent) => {
			if (e.key === "Escape") onCancel();
		};
		window.addEventListener("keydown", onKeyDown);
		return () => window.removeEventListener("keydown", onKeyDown);
	}, [onCancel]);

	return (
		<div className="fixed inset-0 z-50 flex items-end justify-center p-4 sm:items-center">
			<div
				aria-hidden="true"
				className="absolute inset-0 bg-black/40"
				onClick={onCancel}
			/>
			<div
				role="alertdialog"
				aria-modal="true"
				aria-labelledby="confirm-dialog-title"
				aria-describedby="confirm-dialog-message"
				className="relative w-full max-w-sm rounded-xl bg-white p-6 shadow-xl"
			>
				<h2 id="confirm-dialog-title" className="text-lg font-semibold text-gray-900">
					{title}
				</h2>
				<p id="confirm-dialog-message" className="mt-2 text-sm text-gray-600">
					{message}
				</p>
				<div className="mt-6 flex justify-end gap-3">
					<button
						type="button"
						onClick={onCancel}
						disabled={busy}
						className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus-visible:outline-2 focus-visible:outline-indigo-600 disabled:opacity-50"
					>
						Cancel
					</button>
					<button
						type="button"
						ref={confirmRef}
						onClick={onConfirm}
						disabled={busy}
						className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600 disabled:opacity-50"
					>
						{busy ? "Deleting…" : confirmLabel}
					</button>
				</div>
			</div>
		</div>
	);
}
