import type { InputHTMLAttributes } from "react";

interface AuthFieldProps extends InputHTMLAttributes<HTMLInputElement> {
	label: string;
	id: string;
}

export default function AuthField({ label, id, ...inputProps }: AuthFieldProps) {
	return (
		<div>
			<label htmlFor={id} className="mb-1.5 block text-sm font-medium text-gray-800">
				{label}
			</label>
			<input
				id={id}
				required
				className="block w-full rounded-lg border border-gray-300 bg-white px-3.5 py-2.5 text-base text-gray-900 placeholder:text-gray-400 focus:border-indigo-600 focus:outline-2 focus:outline-offset-0 focus:outline-indigo-600/30 disabled:bg-gray-50"
				{...inputProps}
			/>
		</div>
	);
}
