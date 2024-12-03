export interface UserData {
  Name: string;
  ImageURL: string;
  Email: string;
}
export interface ApiResponse<T> {
  status: number;
  message: string;
  data: T;
}
