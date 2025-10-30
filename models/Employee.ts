export interface Employee {
  hotelId: number;
  position: string;
  user: {
    id: number;
    fullName: string;
    username: string;
    email: string;
    phone: string;
    cccd: string;
    role: {
      id: number;
      name: string;
    };
  };
}
