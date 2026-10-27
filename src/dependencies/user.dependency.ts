import { ChangeUserAdminRoleUseCase } from '$features/user/domain/usecases/user-admin-role.usecase';
import { GetUserAdminListUseCase } from '$features/user/domain/usecases/user-admin-list.usecase';
import { requestFetch } from '#request-fetch';
import { UserSource } from '$features/user/data/sources/user.source';
import { UserRepositoryImpl } from '$features/user/data/repositories/user.repository.impl';
const userRepository = new UserRepositoryImpl(new UserSource(requestFetch));

export const getUserAdminListUseCase = new GetUserAdminListUseCase(userRepository);

export const changeUserAdminRoleUseCase = new ChangeUserAdminRoleUseCase(userRepository);
