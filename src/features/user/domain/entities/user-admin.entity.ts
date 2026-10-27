export type UserAdminRole = 'User' | 'Admin';
export type UserAdminRecord = {
	id: string;
	email: string;
	display_name: string;
	role: UserAdminRole;
};
