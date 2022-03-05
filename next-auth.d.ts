// augmenting default Session type

import { UserSession } from './types';
declare module "next-auth" {
    interface Session {
        user: UserSession;
    }
}