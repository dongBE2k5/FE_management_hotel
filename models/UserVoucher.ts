import Voucher from "./Voucher";

interface UserVoucher extends Voucher {
  id?: number;
  userId: number;
  voucherId: number;
}
export default UserVoucher;
