import prisma from "../utils/prismaClient"
import bcrypt from "bcryptjs"
import Joi from "joi"

export const getAllUsers = async(req: any, res: any) => {
    const {limit, page}=req.query
    const currentPage = parseInt(page as string) || 1
    const currentLimit  = parseInt(limit as string) || 10
    const users = await prisma.user.findMany({take: currentLimit, skip:(currentPage-1)*currentLimit})
    return res.status(200).json({msg: "User fetched successfully", users})
}

export const getSingleUser = async(req:any, res:any) =>{
    const {id}=req.params
    const user = await prisma.user.findUnique({where:{id}})
    if(!user) return res.status(400).json({msg:"User not found"})
    return res.status(200).json({msg:"User fetched successfully",user})
}

export const createNewUser = async(req: any, res: any) => {
    const {name, email, phone, phone_code, address, password, role } = req.body

    const {error} = userDataValidation(req.body)
    if(error) return res.status(400).json({msg:error.details[0].message});

    const emailExist = await prisma.user.findFirst({where: {email}})
    if(emailExist) return res.status(400).json({msg: "Email already exist"});

    const phoneExist = await prisma.user.findFirst({where: {phone}})
    if(phoneExist) return res.status(400).json({msg:"Phone number already exist"});

    const user = await prisma.user.create({
        data: {
            name,
            email,
            emailverified: true,
            phone_code,
            phone,
            account_password: await bcrypt.hash(password, 10),
            address,
            numverified: true,
            role,
            status: "approved"
        }
    })
    return res.status(200).json({msg: "User created successfully", user})
}

export const deleteUser = async(req:any, res:any) =>{
    const {id}=req.params
    const user = await prisma.user.findUnique({where:{id}})
    if(!user) return res.status(400).json({msg:"User not found"})
    await prisma.user.delete({where: {id}})
    return res.status(200).json({msg:"User deleted successfully",user})
}

const userDataValidation = (data:any)=>{
    const schema=Joi.object({
        name:Joi.string(),
        address:Joi.string().required(),
        phone_code:Joi.string(),
        phone_num:Joi.string(),
        email:Joi.string(),
        role:Joi.string(),
        numVerified:Joi.number(),
        account_password:Joi.string(),
        emailVerified:Joi.number()
    }).options({allowUnknown: true})
    return schema.validate(data)
}