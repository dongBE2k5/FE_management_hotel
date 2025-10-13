interface Hotel {
  id: number;
  name: string;
  address: string;
  phone: string;
  email: string;
  status: string;
  image: string
  locationName: string;
  minPrice: number | null;
  maxPrice: number | null;
   locationId?: number; // ✅ thêm dòng này
}
export { Hotel };
