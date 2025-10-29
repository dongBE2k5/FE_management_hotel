interface UserRegister {
    fullName: string;
    username: string;
    email: string;
    phone: string;
    password: string;
    cccd?: string;
    gender?: string;
    birthDate?: string; // dạng 'YYYY-MM-DD'
    address?: string;
}
export default UserRegister;
