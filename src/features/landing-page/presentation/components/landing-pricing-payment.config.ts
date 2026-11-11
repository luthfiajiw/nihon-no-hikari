import type {
	PaymentMethod,
	VirtualAccountBank
} from '../../domain/entities/landing-pricing-payment.entity';

export const PAYMENT_METHODS: PaymentMethod[] = [
	{
		id: 'va',
		title: 'Virtual Account (VA)',
		description: 'BCA, Mandiri, BRI, BNI, Permata Bank'
	},
	{
		id: 'qris',
		title: 'QRIS & Dompet Digital (E-Wallet)',
		description: 'GoPay, OVO, Dana, ShopeePay, LinkAja, & Semua Aplikasi Bank'
	},
	{
		id: 'card',
		title: 'Kartu Kredit / Debit Online',
		description: 'Visa, Mastercard, JCB, American Express (3D Secure)'
	},
	{
		id: 'retail',
		title: 'Gerai Retail / Minimarket',
		description: 'Indomaret, Alfamart, Alfamidi, & Kantor Pos Indonesia'
	}
];

export interface VABankOption {
	code: VirtualAccountBank;
	name: string;
}

export const VA_BANKS: VABankOption[] = [
	{ code: 'BCA', name: 'BCA Virtual Account' },
	{ code: 'Mandiri', name: "Mandiri Livin' VA" },
	{ code: 'BRI', name: 'BRI BRIVA' },
	{ code: 'BNI', name: 'BNI Virtual Account' }
];

export interface ManualTransferAccount {
	bank: string;
	holder: string;
	accountNumber: string;
	rawNumber: string;
}

export const MANUAL_ACCOUNTS: ManualTransferAccount[] = [
	{
		bank: 'Bank BCA',
		holder: 'a.n PT Gakkobit Edukasi Nusantara',
		accountNumber: '8831 0920 4410',
		rawNumber: '883109204410'
	},
	{
		bank: 'Bank Mandiri',
		holder: 'a.n PT Gakkobit Edukasi Nusantara',
		accountNumber: '1370 0182 9901 2',
		rawNumber: '1370018299012'
	}
];

export const RETAIL_PARTNERS = ['Indomaret', 'Alfamart', 'Alfamidi', 'Pos Indonesia'];

export interface TrustBadge {
	title: string;
	description: string;
	icon: 'verified' | 'lifetime' | 'bot';
}

export const TRUST_BADGES: TrustBadge[] = [
	{
		title: 'Garansi 7 Hari',
		description: 'Uang kembali 100% jika kurikulum tidak sesuai.',
		icon: 'verified'
	},
	{
		title: 'Akses Seumur Hidup',
		description: 'Sekali bayar tanpa biaya langganan bulanan.',
		icon: 'lifetime'
	},
	{
		title: 'AI Sensei 24/7',
		description: 'Latihan percakapan & koreksi tata bahasa kapan saja.',
		icon: 'bot'
	}
];

export const SUPPORT_WHATSAPP_URL =
	'https://wa.me/6281234567890?text=Halo%20Sensei%20Gakkobit,%20saya%20butuh%20bantuan%20terkait%20pembayaran.';
