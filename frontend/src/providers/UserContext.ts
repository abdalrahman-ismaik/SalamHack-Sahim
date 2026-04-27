'use client';

import { createContext } from 'react';
import { GUEST_SESSION } from '../lib/types';
import type { UserSession } from '../lib/types';

export const UserContext = createContext<UserSession>(GUEST_SESSION);
