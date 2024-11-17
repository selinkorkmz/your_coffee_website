import { Navigate, Outlet } from 'react-router-dom';

const AuthGuard = ({ allowedRoles = [], children}: any) => {
    const savedUser = localStorage.getItem("user");
    const parsedUser = savedUser ? JSON.parse(savedUser) : undefined


    
    return parsedUser && allowedRoles.includes(parsedUser.role) ? children : <Navigate to="/login" />;
}

export default AuthGuard