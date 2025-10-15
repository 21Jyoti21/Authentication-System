// import jwt from "jsonwebtoken";

// const userAuth = async (req, res, next)=>{
//     const {token} = req.cookies;
//     if(!token) {
//         return res.json({success: false, message: 'Not Authorized.Login Again'})
//     }
//     try {
//         const tokenDecode = jwt.verify(token, process.env.JWT_SECRET);
//         if (tokenDecode.id) {
//             req.body.userId = tokenDecode.id
//         }else{
//             return res.json({ success: false, message: 'Not Authorized.Login Again' });
//         }
//         next();
//     } catch (error) {
//         res.json({ success: false, message: error.message });
//     }
// }
// export default userAuth;
// // userAuth.js
// import jwt from "jsonwebtoken";

// const userAuth = async (req, res, next) => {
//     const { token } = req.cookies;
//     if (!token) {
//         return res.json({ success: false, message: 'Not Authorized. Login Again' });
//     }
//     try {
//         const tokenDecode = jwt.verify(token, process.env.JWT_SECRET);
//         if (tokenDecode.id) {
//             req.user = { id: tokenDecode.id }; // store user info here
//         } else {
//             return res.json({ success: false, message: 'Not Authorized. Login Again' });
//         }
//         next();
//     } catch (error) {
//         res.json({ success: false, message: error.message });
//     }
// };

// export default userAuth;

import jwt from "jsonwebtoken";
import userModel from "../models/userModel.js"; // make sure path is correct

const userAuth = async (req, res, next) => {
  const { token } = req.cookies;
  if (!token) {
    return res.json({ success: false, message: "Not Authorized. Login Again" });
  }

  try {
    const tokenDecode = jwt.verify(token, process.env.JWT_SECRET);

    // fetch full Mongoose user document
    const user = await userModel.findById(tokenDecode.id);
    if (!user) {
      return res.json({ success: false, message: "User not found" });
    }

    req.user = user; // ✅ now you have full doc, including .save()
    next();
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

export default userAuth;
