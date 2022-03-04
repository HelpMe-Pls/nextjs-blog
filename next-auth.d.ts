// augmenting default Session type

import { UserSession } from './types';
import { DefaultSession } from "next-auth";
declare module "next-auth" {
    interface Session {
        user: UserSession;
    }
    interface User {
        id: string;
    }
}