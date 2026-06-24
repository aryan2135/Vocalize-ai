"use client";
import { useMutation } from "convex/react";
import { api } from "../convex/_generated/api";
import { useUser } from "@stackframe/stack";
import React, { useEffect } from "react";
import { UserContext } from "./_context/UserContext";
import { useState } from "react";

function AuthProvider({ children }) {

    const user = useUser(); // Custom hook to get the authenticated user
    const CreateUser = useMutation(api.user.CreateUser);
    const [userData, setUserData] = useState();
    useEffect(() => {
        console.log(user)
        user && CreateNewUser();
    }, [user]);
    
    const CreateNewUser = async () => {
        const result = await CreateUser({
            name: user?.displayName,
            email: user?.primaryEmail
        });
        console.log("User data:", result);
        setUserData(result);
    }

    return(
        <UserContext.Provider value={{ userData, setUserData }}>
        <div>{children}</div>
        </UserContext.Provider>
    )
}
export default AuthProvider;