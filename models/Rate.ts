import { Hotel } from "./Hotel";
import UserAccount from "./UserAccount";


interface Rate {
  id?: number;
  rateNumber: number;
  likedPoints: string[];
  comment: string;
  user: { id: number };
  room: { id: number };   // ✅ chỉ cần id
}
export default Rate;
