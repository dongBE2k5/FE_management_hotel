interface Hotel {
  id: number;
  name: string;
  address: string;
  phone: string;
  email: string;
  status: string;
  image: string
  location: Location;
  minPrice: number | null;
  maxPrice: number | null;
   locationId?: number; // ✅ thêm dòng này
}
interface Location {
  id: number;
  name: string;
}
export { Hotel };
