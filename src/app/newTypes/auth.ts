import { UserData } from './user-data';

export interface AuthResponse {
  status: number;
  message: string;
  data: UserData;
}
