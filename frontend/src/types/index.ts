export interface User {
  id: number;
  email: string;
  username: string;
  first_name?: string;
  last_name?: string;
  is_superuser: boolean;
  is_active: boolean;
  created_at: string;
  updated_at?: string;
}
