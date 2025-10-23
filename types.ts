export interface Tipster {
  id: string;
  name: string;
  accuracy: number;
  imageUrl: string;
  gradientFrom: string;
  gradientVia: string;
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