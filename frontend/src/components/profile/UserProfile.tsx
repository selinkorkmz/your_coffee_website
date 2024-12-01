import { useAuth } from "../AuthContext";


export default function UserProfile(){
    const {user} = useAuth()

    return(

        <div> {user.name} </div>
    )
}