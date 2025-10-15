import React, { createContext, useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";

export const AppContent = createContext();

export const AppContextProvider = (props) => {
    axios.defaults.withCredentials = true;
  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  const [isLoggedin, setIsLoggedin] = useState(false);
  const [userData, setUserData] = useState(false);
  const getAuthState=async()=>{
    try{
        const {data}=await axios.get(backendUrl+'/api/auth/is-auth')
        if(data.success){
            setIsLoggedin(true)
            getUserData()
        }
    }catch(error){
        toast.error(error.message)
    }
  }
  const getUserData = async () => {
    try {
      //       axios.defaults.withCredentials = true; // send cookies
      const { data } = await axios.get(`${backendUrl}/api/user/data`);
      data.success ? setUserData(data.userData) : toast.error(data.message);
      //       }
    } catch (error) {
      toast.error(error.message);
    }    
  };
  useEffect(()=>{
    getAuthState();
},[])
  const value = {
      backendUrl,
      isLoggedin,
      setIsLoggedin,
      userData,
      setUserData,
      getUserData,
    }; 
  return (
      <AppContent.Provider value={value}>{props.children}</AppContent.Provider>
    );
}

//     axios.defaults.withCredentials = true; // send cookies
//   const backendUrl = import.meta.env.VITE_BACKEND_URL;
//   const [isLoggedin, setIsLoggedin] = useState(false);
//   const [userData, setUserData] = useState(null);

//   // ✅ Fetch user data from backend if token/session exists
//   const getAuthState=async()=>{
//     try{
//         const {data}=await axios.get(backendUrl+'/api/auth/is-auth')
//         if(data.success){
//             setIsLoggedin(true)
//             getUserData()
//         }
//     }catch(error){
//         toast.error(error.message)
//     }
//   }
//   const getUserData = async () => {
//     try {
//       axios.defaults.withCredentials = true; // send cookies
//       const { data } = await axios.get(`${backendUrl}/api/user/data`);
//       if (data.success) {
//         setUserData(data.userData || data.user); // flexible naming
//         setIsLoggedin(true);
//       } else {
//         setIsLoggedin(false);
//         toast.error(data.message);
//       }
//     } catch (error) {
//       setIsLoggedin(false);
//       toast.error(error.response?.data?.message || "Failed to fetch user data");
//     }
//     useEffect(()=>{
//         getAuthState();
//     },[])
//   };

//   // ✅ Persist login on refresh — auto fetch user data when app loads
//   useEffect(() => {
//     getUserData();
//   }, []);

//   // ✅ Context value shared across all components
//   const value = {
//     backendUrl,
//     isLoggedin,
//     setIsLoggedin,
//     userData,
//     setUserData,
//     getUserData,
//   };

//   return (
//     <AppContent.Provider value={value}>
//       {props.children}
//     </AppContent.Provider>
//   );
// };
// import React, { createContext, useState, useEffect } from "react";
// import axios from "axios";
// import { toast } from "react-toastify";

// export const AppContent = createContext();

// export const AppContextProvider = ({ children }) => {
//   const backendUrl = import.meta.env.VITE_BACKEND_URL;

//   const [isLoggedin, setIsLoggedin] = useState(false);
//   const [userData, setUserData] = useState(null);
//   const [loading, setLoading] = useState(true); // optional: show loading spinner

//   axios.defaults.withCredentials = true; // send cookies automatically

//   // ✅ Fetch auth state and user data
//   const fetchAuth = async () => {
//     try {
//       const authRes = await axios.post(`${backendUrl}/api/auth/is-auth`);

//       if (authRes.data.success) {
//         // ✅ Logged in
//         setIsLoggedin(true);

//         const userRes = await axios.get(`${backendUrl}/api/user/data`);
//         if (userRes.data.success) {
//           setUserData(userRes.data.userData || userRes.data.user);
//           localStorage.setItem(
//             "userData",
//             JSON.stringify(userRes.data.userData || userRes.data.user)
//           );
//         } else {
//           setUserData(null);
//           setIsLoggedin(false);
//           localStorage.removeItem("userData");
//         }
//       } else {
//         setUserData(null);
//         setIsLoggedin(false);
//         localStorage.removeItem("userData");
//       }
//     } catch (error) {
//       setUserData(null);
//       setIsLoggedin(false);
//       localStorage.removeItem("userData");
//       toast.error(error.response?.data?.message || "Auth check failed");
//     } finally {
//       setLoading(false);
//     }
//   };

//   // ✅ Initialize auth state on app load
//   useEffect(() => {
//     const storedUser = localStorage.getItem("userData");
//     if (storedUser) {
//       setUserData(JSON.parse(storedUser));
//       setIsLoggedin(true);
//       setLoading(false);
//     } else {
//       fetchAuth();
//     }
//   }, []);

//   // ✅ Login helper
//   const loginUser = async (email, password) => {
//     try {
//       const { data } = await axios.post(`${backendUrl}/api/auth/login`, { email, password });

//       if (data.success) {
//         setIsLoggedin(true);

//         // Fetch userData after login
//         const userRes = await axios.get(`${backendUrl}/api/user/data`);
//         if (userRes.data.success) {
//           setUserData(userRes.data.userData || userRes.data.user);
//           localStorage.setItem(
//             "userData",
//             JSON.stringify(userRes.data.userData || userRes.data.user)
//           );
//         }

//         return { success: true };
//       } else {
//         return { success: false, message: data.message };
//       }
//     } catch (error) {
//       return { success: false, message: error.response?.data?.message || "Login failed" };
//     }
//   };

//   // ✅ Logout helper
//   const logoutUser = async () => {
//     try {
//       const { data } = await axios.post(`${backendUrl}/api/auth/logout`);
//       if (data.success) {
//         setIsLoggedin(false);
//         setUserData(null);
//         localStorage.removeItem("userData");
//         return { success: true };
//       }
//       return { success: false, message: "Logout failed" };
//     } catch (error) {
//       return { success: false, message: error.response?.data?.message || "Logout failed" };
//     }
//   };

//   const value = {
//     backendUrl,
//     isLoggedin,
//     setIsLoggedin,
//     userData,
//     setUserData,
//     loading,
//     loginUser,
//     logoutUser,
//   };

//   return <AppContent.Provider value={value}>{children}</AppContent.Provider>;
// };
