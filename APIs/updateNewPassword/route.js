/*
    Purpose Of This API : Updating the password of user
*/ 
import prisma from "../../../utils/services/prismadb";
import { NextResponse } from "next/server";
import bcrypt from 'bcrypt';
import * as yup from 'yup';
/*
    Schema to validate the parameters that are required
*/
const schema = yup.object().shape({
    confirm_password: yup.string().required('Confirm Password is required').min(6, 'Confirm Password must be at least 6 characters').test('not-only-spaces', 'Confirm Password cannot consist of only spaces', value => value.trim() !== ''),
    new_password: yup.string().required('New Password is required').min(6, 'New Password must be at least 6 characters').test('not-only-spaces', 'New Password cannot consist of only spaces', value => value.trim() !== ''),
    token: yup.string().required("Please provide randomly generated token"),
    username: yup.string().required("Please provide username"),
    
  });

export async function POST(request) {
    try {

        const contentType = request.headers.get("content-type");
        const body = await (contentType && contentType.includes("application/json") ? request.json() : {});
        
        if(Object.keys(body).length == 0){
           return NextResponse.json({status: 200, message: "New Password is required Field"})
        }


        await schema.validate(body);
        let new_password = body.new_password;
        let confirm_password = body.confirm_password;
        let newToken = body.token;
        let username = body.username;

        if (new_password !== confirm_password) {
            return NextResponse.json({ status: 400, error: ' Password and confirm password do not match' });
        }

        const userData = await prisma.users.findUnique({
            where:{
                username : username
            }
        });

        const passwordReset = await prisma.password_resets.findUnique({
            where: {
                id: parseInt(userData.id)//userid
            }
        });

        if (!passwordReset.token || newToken !== passwordReset.token) {
            return NextResponse.json({ status: 400, error: 'Invalid token' },{status:400});
        }

        

// Creating hased password
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(new_password, saltRounds);
        console.log({hashedPassword: hashedPassword});

// Updating the password 
        const updatedPassword = await prisma.users.update({
            where: { 
                id: parseInt(userData.id) 
            },
            data: { password: hashedPassword }, 
        });
        if (updatedPassword) {
            await prisma.password_resets.update({
                where: {
                    id: parseInt(userData.id)
                },
                data: {
                    token: ""
                }
            });
        }

        return NextResponse.json({ status: 200, message:"Password updated successfully"},{status: 200});
    } catch (error) {
        return NextResponse.json({ status: 500, error: error.message}, {status: 500});
    } finally{
        prisma.$disconnect()
    }
}
