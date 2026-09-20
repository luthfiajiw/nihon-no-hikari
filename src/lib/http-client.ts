export type RequestConfig = Omit<RequestInit, 'headers'> & {
	url?: string;
	headers?: Record<string, string>;
	params?: Record<string, string | number | boolean>;
};


export type OnRequestInterceptor = (
	config: RequestConfig
) => RequestConfig | Promise<RequestConfig>;

export type OnResponseInterceptor = (
	response: Response,
	config: RequestConfig
) => Response | Promise<Response>;

export type OnErrorInterceptor = (
	error: unknown,
	config: RequestConfig
) => unknown | Promise<unknown>;

export interface HttpClientOptions {
	fetch?: typeof fetch;
	headers?: Record<string, string>;
}

export interface HttpResponse<T = unknown> {
	status: number;
	ok: boolean;
	data: T;
	headers: Headers;
	response: Response;
}

function getBaseUrl(): string {
	const envUrl =
		(typeof import.meta !== 'undefined' && import.meta.env?.API_BASE_URL) ||
		(typeof process !== 'undefined' && process.env?.API_BASE_URL)
	return envUrl.replace(/\/$/, '');
}

export class HttpClient {
	private customFetch: typeof fetch;
	private defaultHeaders: Record<string, string>;
	private requestInterceptors: OnRequestInterceptor[] = [];
	private responseInterceptors: OnResponseInterceptor[] = [];
	private errorInterceptors: OnErrorInterceptor[] = [];

	constructor(options: HttpClientOptions = {}) {
		this.customFetch = options.fetch ?? ((...args) => fetch(...args));
		this.defaultHeaders = options.headers ?? {};
	}

	/**
	 * Register an onRequest interceptor.
	 * Returns an unregister function.
	 */
	onRequest(interceptor: OnRequestInterceptor): () => void {
		this.requestInterceptors.push(interceptor);
		return () => {
			this.requestInterceptors = this.requestInterceptors.filter((i) => i !== interceptor);
		};
	}

	/**
	 * Register an onResponse interceptor.
	 * Returns an unregister function.
	 */
	onResponse(interceptor: OnResponseInterceptor): () => void {
		this.responseInterceptors.push(interceptor);
		return () => {
			this.responseInterceptors = this.responseInterceptors.filter((i) => i !== interceptor);
		};
	}

	/**
	 * Register an onError interceptor.
	 * Returns an unregister function.
	 */
	onError(interceptor: OnErrorInterceptor): () => void {
		this.errorInterceptors.push(interceptor);
		return () => {
			this.errorInterceptors = this.errorInterceptors.filter((i) => i !== interceptor);
		};
	}

	async request<T = unknown>(
		endpoint: string,
		options: RequestConfig = {}
	): Promise<HttpResponse<T>> {
		const baseUrl = getBaseUrl();
		const path = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
		let url =
			endpoint.startsWith('http://') || endpoint.startsWith('https://')
				? endpoint
				: `${baseUrl}${path}`;

		if (options.params) {
			const queryParams = new URLSearchParams();
			Object.entries(options.params).forEach(([key, value]) => {
				if (value !== undefined && value !== null) {
					queryParams.append(key, String(value));
				}
			});
			const queryString = queryParams.toString();
			if (queryString) {
				url += (url.includes('?') ? '&' : '?') + queryString;
			}
		}

		let config: RequestConfig = {
			...options,
			url,
			headers: {
				...this.defaultHeaders,
				...(options.headers || {})
			}
		};

		// Execute onRequest interceptors sequentially
		for (const interceptor of this.requestInterceptors) {
			config = await interceptor(config);
		}

		const finalUrl = config.url || url;
		const fetchInit: RequestInit = { ...config };
		delete (fetchInit as RequestConfig).url;
		delete (fetchInit as RequestConfig).params;

		try {
			let response = await this.customFetch(finalUrl, fetchInit);

			// Execute onResponse interceptors sequentially
			for (const interceptor of this.responseInterceptors) {
				response = await interceptor(response, config);
			}

			let data: T;
			const contentType = response.headers.get('content-type');
			if (contentType && contentType.includes('application/json')) {
				data = (await response.json().catch(() => ({}))) as T;
			} else {
				const text = await response.text().catch(() => '');
				data = text as unknown as T;
			}

			return {
				status: response.status,
				ok: response.ok,
				data,
				headers: response.headers,
				response
			};
		} catch (error) {
			let handledError = error;
			for (const interceptor of this.errorInterceptors) {
				handledError = await interceptor(handledError, config);
			}
			throw handledError;
		}
	}

	async get<T = unknown>(
		endpoint: string,
		options?: Omit<RequestConfig, 'method'>
	): Promise<HttpResponse<T>> {
		return this.request<T>(endpoint, { ...options, method: 'GET' });
	}

	async post<T = unknown>(
		endpoint: string,
		body?: unknown,
		options?: Omit<RequestConfig, 'method' | 'body'>
	): Promise<HttpResponse<T>> {
		const isJson =
			body !== undefined &&
			body !== null &&
			typeof body === 'object' &&
			!(body instanceof FormData);
		const headers: Record<string, string> = { ...options?.headers };
		if (isJson && !headers['Content-Type'] && !headers['content-type']) {
			headers['Content-Type'] = 'application/json';
		}
		return this.request<T>(endpoint, {
			...options,
			method: 'POST',
			headers,
			body: (isJson ? JSON.stringify(body) : body) as BodyInit | null | undefined
		});
	}

	async put<T = unknown>(
		endpoint: string,
		body?: unknown,
		options?: Omit<RequestConfig, 'method' | 'body'>
	): Promise<HttpResponse<T>> {
		const isJson =
			body !== undefined &&
			body !== null &&
			typeof body === 'object' &&
			!(body instanceof FormData);
		const headers: Record<string, string> = { ...options?.headers };
		if (isJson && !headers['Content-Type'] && !headers['content-type']) {
			headers['Content-Type'] = 'application/json';
		}
		return this.request<T>(endpoint, {
			...options,
			method: 'PUT',
			headers,
			body: (isJson ? JSON.stringify(body) : body) as BodyInit | null | undefined
		});
	}

	async patch<T = unknown>(
		endpoint: string,
		body?: unknown,
		options?: Omit<RequestConfig, 'method' | 'body'>
	): Promise<HttpResponse<T>> {
		const isJson =
			body !== undefined &&
			body !== null &&
			typeof body === 'object' &&
			!(body instanceof FormData);
		const headers: Record<string, string> = { ...options?.headers };
		if (isJson && !headers['Content-Type'] && !headers['content-type']) {
			headers['Content-Type'] = 'application/json';
		}
		return this.request<T>(endpoint, {
			...options,
			method: 'PATCH',
			headers,
			body: (isJson ? JSON.stringify(body) : body) as BodyInit | null | undefined
		});
	}

	async delete<T = unknown>(
		endpoint: string,
		options?: Omit<RequestConfig, 'method'>
	): Promise<HttpResponse<T>> {
		return this.request<T>(endpoint, { ...options, method: 'DELETE' });
	}
}

export const defaultHttpClient = new HttpClient();
