interface HotelRequest {
  name: string;
  address: string;
  phone: string;
  email: string;
  image: string;
  locationId: number;
  userId: number;
  status: string | null;
}
export { HotelRequest };
