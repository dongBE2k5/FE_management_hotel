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
   }
    message?: string;

  }
export default RegisterResponse;