import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { cubicOut } from 'svelte/easing';
import type { TransitionConfig } from 'svelte/transition';
import { userToken } from '$lib/store/LocalStorage.svelte';
import { get } from 'svelte/store';

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

type FlyAndScaleParams = {
	y?: number;
	x?: number;
	start?: number;
	duration?: number;
};

export const flyAndScale = (
	node: Element,
	params: FlyAndScaleParams = { y: -8, x: 0, start: 0.95, duration: 150 }
): TransitionConfig => {
	const style = getComputedStyle(node);
	const transform = style.transform === 'none' ? '' : style.transform;

	const scaleConversion = (
		valueA: number,
		scaleA: [number, number],
		scaleB: [number, number]
	) => {
		const [minA, maxA] = scaleA;
		const [minB, maxB] = scaleB;

		const percentage = (valueA - minA) / (maxA - minA);
		const valueB = percentage * (maxB - minB) + minB;

		return valueB;
	};

	const styleToString = (
		style: Record<string, number | string | undefined>
	): string => {
		return Object.keys(style).reduce((str, key) => {
			if (style[key] === undefined) return str;
			return str + `${key}:${style[key]};`;
		}, '');
	};

	return {
		duration: params.duration ?? 200,
		delay: 0,
		css: (t) => {
			const y = scaleConversion(t, [0, 1], [params.y ?? 5, 0]);
			const x = scaleConversion(t, [0, 1], [params.x ?? 0, 0]);
			const scale = scaleConversion(t, [0, 1], [params.start ?? 0.95, 1]);

			return styleToString({
				transform: `${transform} translate3d(${x}px, ${y}px, 0) scale(${scale})`,
				opacity: t,
			});
		},
		easing: cubicOut,
	};
};

export interface ExtendedOptions extends RequestInit {
  params?: Record<string, unknown>;
  auth?: boolean;
}

export type ParsedRes<T> = {
  statusCode: number;
} & T

/**
 * Generic format for all backend API responses.
 */
export type GenericResponse<T> = {
  data: T[];
  duration: number;
  statusCode: number;
  pagination?: { cursor: string; hasNextPage: boolean; };
  errors?: { message: string; }[]
}

async function parseResponse<T>(res: Response): Promise<ParsedRes<T>> {
	const blob = await res.blob();

	try {
		return {
			statusCode:
			res.status,
			...JSON.parse(await blob.text()),
		} as ParsedRes<T>;
	} catch {
		// @ts-expect-error i dont care
		return (await blob.text()) as unknown as T;
	}
}

export const makeRequest = async <T = unknown>(
	url: string,
	options?: ExtendedOptions
): Promise< ParsedRes<T>> => {
	if (options?.params) {
		const filteredParams = Object.fromEntries(
			Object
				.entries(options.params)
				.filter(([, value]) => value !== undefined && value !== null)
		);
		url += `?${new URLSearchParams(filteredParams as Record<string, string>)}`;
	}

	if (options?.auth) {
		options.headers = {
			...options.headers,
			authorization: `Bearer ${get(userToken)}`,
		};
	}

	const response = await fetch(url, options);
	return parseResponse<T>(response);
};

export const fetchBackend = async <T = unknown>(
	url: string,
	options?: ExtendedOptions
): Promise<ParsedRes<GenericResponse<T>>> => {
	const result = await makeRequest<GenericResponse<T>>(
		`https://api.potat.app/${url}`,
		options
	);

	if (result.errors?.length) {
		console.error(result.errors);
	}

	return result;
};