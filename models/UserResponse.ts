import Role from "./Role";

interface UserResponse {
  id: number;
  username: string;
  fullName: string;
  email: string;
  phone: string;
  cccd: string;
  role: Role;
  gender?: string;
  birthDate?: string; // dạng 'YYYY-MM-DD'
  address?: string;
}
export default UserResponse;