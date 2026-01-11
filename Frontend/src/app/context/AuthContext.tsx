import { createContext } from 'react';

interface AuthContextType {
  user: any;
  login: (user: any) => void;
  logout: () => void;
  updateUser: (userData: any) => void;
}

export const AuthContext = createContext<AuthContextType>({
  user: null,
  login: () => {},
  logout: () => {},
  updateUser: () => {},
});
