export interface AuthAdminRepository {
	checkAdminAccess(): Promise<void>;
}
