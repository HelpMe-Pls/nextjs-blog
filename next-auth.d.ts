// augmenting default Session type

import { UserSession } from './types';
import "next-auth";

declare module "next-auth" {
    interface Session {
        user: UserSession;
    }
}