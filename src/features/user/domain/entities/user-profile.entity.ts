export interface ProfileSessionSummary {
	id: string;
	client_ip: string;
	user_agent: string;
	created_at: string;
	expires_at: string;
	is_current: boolean;
}

export interface UserProfileData {
	id: string;
	email: string;
	display_name: string;
	avatar_url?: string | null;
	role: 'User' | 'Admin';
	has_password: boolean;
	google_linked: boolean;
	google_email?: string | null;
	sessions: ProfileSessionSummary[];
}

export interface UpdateProfilePayload {
	display_name: string;
	avatar_url?: string | null;
}

export interface ChangePasswordPayload {
	current_password?: string;
	new_password: string;
	confirm_password: string;
}

export interface LinkGooglePayload {
	id_token: string;
	verification_token: string;
}

export interface UnlinkGooglePayload {
	current_password: string;
}

export interface VerifyLinkGoogleCodePayload {
	code: string;
}

export interface VerifyLinkGoogleCodeResult {
	verification_token: string;
}
