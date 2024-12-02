import { useAuth } from "../AuthContext";


export default function UserProfile(){
    const {user} = useAuth()

    return (
        <div className="flex flex-col items-center justify-center h-[80vh]">
          <p className="text-lg font-bold text-gray-600 mt-4">
            Hi {user.name}!
          </p>
          <p className="text-lg font-medium text-gray-600 mt-4">
            This is your profile page.
          </p>

        </div>
    );
}