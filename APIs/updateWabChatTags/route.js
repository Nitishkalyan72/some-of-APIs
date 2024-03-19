/*
api to update agent list in campaign
*/


import { NextResponse } from "next/server";
import * as yup from 'yup'
import prisma from "../../../db";
import { VerifyToken } from "../../../utils/tokenHandler";


//creating validation schema for params
const schema = yup.object().shape({
    tag_name: yup.string().required('tag_name is required'),
    id: yup.number().required('id is required'),
    chat_session_id: yup.number().required('chat_session_id is required')

});

export const POST = async (request) => {
    try {

        const tokenData = await VerifyToken(request);
        const userId = tokenData.userId;

        const contentType = request.headers.get("content-type");
        const body = await (contentType && contentType.includes("application/json") ? request.json() : {});
        await schema.validate(body);
        const { tag_name, id,chat_session_id} = body;

        const existingData = await prisma.wab_chat_tags.findFirst({
            where: {
                tag_name: tag_name,
                chat_session_id: chat_session_id
            }
        });

        if (existingData) {
            return NextResponse.json({ status: 400, error: 'Data already exists for the same tag name and chat session id' }, { status: 400 });
        }


        const updatedTag = await prisma.wab_chat_tags.updateMany({
            where: {
                id: id,
                user_id: userId,
            },
            data: {
                tag_name: tag_name,
            }
        });

        const updatedData = await prisma.wab_chat_tags.findMany({
            where: {
                id: id,
                user_id: userId,
            },
            // Include only the desired fields
            select: {
                id: true,
                tag_name: true,
                // Add other fields if needed
            }
        });

        return NextResponse.json({ status: 200, message: "success", data: updatedData });


    } catch (error) {
        return NextResponse.json({ status: 500, message: error.message}, { status: 500 })
    }


}