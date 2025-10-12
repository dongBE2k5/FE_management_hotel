import Role from "./Role";

interface UserResponse {
    id: number;
    username: string;
    fullName: string;
    email: string;
    phone: string;
    cccd: string;
    role: Role;
}
export default UserResponse;