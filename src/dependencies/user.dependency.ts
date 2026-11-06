import { ChangeUserAdminRoleUseCase } from '$features/user/domain/usecases/user-admin-role.usecase';
import { GetUserAdminListUseCase } from '$features/user/domain/usecases/user-admin-list.usecase';
import { GetUserProfileUseCase } from '$features/user/domain/usecases/get-user-profile.usecase';
import { UpdateUserProfileUseCase } from '$features/user/domain/usecases/update-user-profile.usecase';
import { ChangeUserPasswordUseCase } from '$features/user/domain/usecases/change-user-password.usecase';
import { LinkUserGoogleUseCase } from '$features/user/domain/usecases/link-user-google.usecase';
import { RevokeOtherSessionsUseCase } from '$features/user/domain/usecases/revoke-other-sessions.usecase';
import { requestFetch } from '#request-fetch';
import { UserSource } from '$features/user/data/sources/user.source';
import { UserRepositoryImpl } from '$features/user/data/repositories/user.repository.impl';

const userRepository = new UserRepositoryImpl(new UserSource(requestFetch));

export const getUserAdminListUseCase = new GetUserAdminListUseCase(userRepository);
export const changeUserAdminRoleUseCase = new ChangeUserAdminRoleUseCase(userRepository);

export const getUserProfileUseCase = new GetUserProfileUseCase(userRepository);
export const updateUserProfileUseCase = new UpdateUserProfileUseCase(userRepository);
export const changeUserPasswordUseCase = new ChangeUserPasswordUseCase(userRepository);
export const linkUserGoogleUseCase = new LinkUserGoogleUseCase(userRepository);
export const revokeOtherSessionsUseCase = new RevokeOtherSessionsUseCase(userRepository);
