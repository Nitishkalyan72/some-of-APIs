import { NextResponse } from "next/server";
import prisma from "../../../utils/services/prismadb"; 
import SendMailService from "../../../utils/services/sendmailService";
import { headers } from 'next/headers'; 
import { randomBytes } from 'crypto'; 
import * as yup from 'yup';

const schema = yup.object().shape({
    username: yup.string().required("username is required")
});

// Define the POST handler function for the forgetPassword API endpoint
export const POST = async (request) => {
    try {
       
        let email; 
        const BaseUrl = headers().get('x-forwarded-host');
        const params = await (request.headers.get("content-type") && request.headers.get("content-type").includes("application/json") ? request.json() : {});
        await schema.validate(params);
        const user_name  = params.username;
        
        // Find user by username in the database using Prisma
        const userData = await prisma.users.findUnique({
            where:{
                username : params.username
            }
        });

        if (!userData) {
            console.log('Username not found');
            throw new Error("Username doesn't exist"); 
        }
        if(userData){
            email = userData.email; 
            console.log('Email corresponding to the username:', email);
        } else {
            console.log('Username not found');
        }

        
        const token = randomBytes(30).toString('hex');
        
        
        
        //if their is not any entry then first create it or  update it otherwise
        await prisma.password_resets.upsert({
            where: {
                id: userData.id
            },
            create: {
                id: userData.id,
                email:userData.email,
                username:userData.username,
                token: token,
                created_at: new Date(),
                old_id:userData.old_id,
                db_move:userData.db_move,
                updated_at:userData.updated_at
            },
            update: {
                token: token,
                created_at: new Date()
            }
        });
        

        // Define email parameters
        let args = {
            email : email,
            subject : 'Password Reset Request for Cloudshope Account',
            text : 'You have requested to reset your password for your Cloudshope account. Please click the following link to reset your password:',
            html : '<b>You have requested to reset your password for your Cloudshope account. Please click the following link to reset your password: </b>'
        };

        // Create an instance of the email sending service
        const send_mail = new SendMailService();
        const response = await send_mail.sendMail(args, BaseUrl, token, user_name);
        
        return NextResponse.json({ status: 200, message: "success" });
    } catch (error) {
        console.error("Error", error);
        return NextResponse.json({ status: 500, error: error.message }, {
            status: 500
        });
    }
};
