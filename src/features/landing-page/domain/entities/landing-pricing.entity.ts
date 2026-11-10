export interface PricingPlan {
	id: string;
	code: string;
	name: string;
	tag?: string | null;
	description?: string | null;
	price: number;
	points: string[];
	order_index: number;
}

export interface PricingLesson {
	id: string;
	slug: string;
	title: string;
	order_index: number;
}

export interface PricingModule {
	id: string;
	slug: string;
	title: string;
	description?: string | null;
	estimated_minutes: number;
	lesson_count: number;
	order_index: number;
	lessons: PricingLesson[];
}

export interface PricingDetail extends PricingPlan {
	total_modules: number;
	total_lessons: number;
	modules: PricingModule[];
}

export interface PricingListResponse {
	success: boolean;
	data: PricingPlan[];
}

export interface PricingDetailResponse {
	success: boolean;
	data: PricingDetail;
}

export class PricingNotFoundError extends Error {
	constructor(code: string) {
		super(`Paket belajar level ${code} tidak ditemukan.`);
		this.name = 'PricingNotFoundError';
	}
}
