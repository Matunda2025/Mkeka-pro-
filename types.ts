export type UserRole = 'developer' | 'admin' | 'tipster' | 'user';

export interface Tipster {
  id: string;
  name: string;
  accuracy: number;
  imageUrl: string;
  gradientFrom: string;
  gradientVia: string;
  userId?: string;
}

export interface Betslip {
  id: string;
  provider: {
    name: string;
    avatarUrl: string;
    subscribers: number;
  };
  odds: number;
  status: 'active';
  expiresAt: number;
  price: string;
  sponsors: {
    name: string;
    logoUrl: string;
  }[];
  code?: string;
  betslipImageUrl?: string;
}

export interface Banner {
  id: string;
  imageUrl: string;
}

export interface Purchase {
  id: string;
  userId: string;
  betslipId: string;
  purchasedAt: {
    seconds: number;
    nanoseconds: number;
  };
}

export interface UserProfile {
  uid: string;
  email: string;
  displayName?: string;
  createdAt: {
    seconds: number;
    nanoseconds: number;
  };
  phoneNumber?: string;
  role?: UserRole;
}