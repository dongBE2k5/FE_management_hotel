import Role from "./Role";

interface RegisterResponse {
  data?: {
    id: number;
    fullName: string;
    username: string;
    email: string;
    phone: string;
    cccd: string;
    role: Role;
    gender?: string;
    birthDate?: string; // dạng 'YYYY-MM-DD'
    address?: string;
  }
  message?: string;

}
export default RegisterResponse;