export type PaymentMethodId = 'va' | 'qris' | 'card' | 'manual' | 'retail' | 'cash';
export type VirtualAccountBank = 'BCA' | 'Mandiri' | 'BRI' | 'BNI';

export interface PaymentMethod {
	id: PaymentMethodId;
	title: string;
	description: string;
	badge?: {
		label: string;
		tone?: 'primary' | 'secondary' | 'tertiary';
	};
	hint?: string;
}

export interface PricingPaymentSummary {
	subtotal: number;
	serviceFee: number;
	total: number;
}
