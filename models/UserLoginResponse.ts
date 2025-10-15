import Role from "./Role";

interface UserLoginResponse {
    id: number,
    username: string
    role: Role;
    accessToken: string;
}

export default UserLoginResponse;