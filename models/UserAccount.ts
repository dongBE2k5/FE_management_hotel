interface UserAccount {
    fullName: string,
    username: string, 
    email: string,
    phone: string,
    cccd: string,
    gender?: string;
    birthDate?: string; // dạng 'YYYY-MM-DD'
    address?: string;
}
export default UserAccount;