import { createAuthModule, IAuthModule } from '@libs/modules/auth';

import { LOCAL_AUTH_OPTIONS } from './local.constants';
import { LocalAuthStrategy } from './local.strategy';
import { LocalAuthModuleOptions } from './local.types';

export const LocalAuthModule: IAuthModule<LocalAuthModuleOptions> = createAuthModule<LocalAuthModuleOptions>({
    providerToken: LOCAL_AUTH_OPTIONS,
    strategy: LocalAuthStrategy,
});
