export class RoomType {
  id: number;
  name: string;
  description?: string;
  basePrice: number;
  maxOccupancy: number;
  bedType?: string;
  size?: number;
  amenities?: string[];
  images?: string[];
  companyId: number;
  createdAt: Date;
  updatedAt: Date;
  createdBy: number;
  updatedBy: number;
  deletedAt?: Date;
  deletedBy?: number;
}
