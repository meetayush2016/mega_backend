import { asyncHandler } from "../utils/asyncHandler.js";
import {ApiError} from "../utils/ApiErrors.js"
import {User} from "../modles/user.model.js"
import {uploadOnCloudinary} from "../utils/cloudinary.js"
import { ApiResponse } from "../utils/ApiResponse.js";



const registerUser = asyncHandler(async (req,res)=>{
   //get the details from thw user 
   //validation - ntot empty
   //check if user already exist :username , email 
   //chek for images  , chek for avatar 
   //upload images to cooudinary 
   //chek avatar 
   //creat user object - create entry in db 
   //remove password and refersh token filed form the response 
   //chek fro user creation 
   //return result 

   const {fullname , email , username , password} = req.body
   console.log("email:" ,  email);
   
   if(
    [fullname , email , password , username].some((field)=>
        field?.trim()===""
    )
   ){
        throw new ApiError(400 , "All  fields are required")
   }
   const existedUser =  User.findOne({
    $or:[{username} , {email}]
   })
   if(existedUser){
    throw new ApiError(409 , "User with email or username is already exist")
   }

   const avatarLocalPath =  req.files?.avatar[0]?.path; 
   const coverImageLocalPath =  req.files?.coverImage[0]?.path; 

   if(!avatarLocalPath){
    throw new ApiError(400 , "Avatar files is required")
   }

   const avatar =  await uploadOnCloudinary(avatarLocalPath)
   const cover = await uploadOnCloudinary(coverImageLocalPath)

   if(!avatar){
    throw new ApiError(400 , "Avatar file is required")
   }

   const user = await User.create({
    fullname, 
    avatar:avatar.url, 
    coverImage:coverImage?.url || "", 
    email, 
    password, 
    username: username.toLowerCase()

   })

   const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
   )

   if(!createdUser){
    throw new ApiError(500 , "Something went wring while registerin the user")
   }

   return res.status(201).json(
    new ApiResponse(200 , createdUser , "User registered successfully")
   )






} )

export {registerUser}
