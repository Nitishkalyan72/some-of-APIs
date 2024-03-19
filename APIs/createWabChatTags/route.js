import { NextResponse } from "next/server";
import prisma from "../../../utils/services/prismadb";
import { VerifyToken } from "../../../utils/tokenHandler";
import * as yup from 'yup';

const schema = yup.object().shape({
    tag_name: yup.string().required('tag_name is required'),
    wab_number_id: yup.number().required('wab_number_id is required'),
    chat_session_id: yup.number().required('chat_session_id is required')
});

export const POST = async (request) => {
    try {
        const tokenData = await VerifyToken(request);
        const userId = tokenData.userId;

        const contentType = request.headers.get("content-type");
        const body = await (contentType && contentType.includes("application/json") ? request.json() : {});
        await schema.validate(body);
        // Logging request body
        const { tag_name, wab_number_id, chat_session_id } = body;

        // Logging tag
        console.log("Tag:", tag_name);

        const existingData = await prisma.wab_chat_tags.findFirst({
            where: {
                tag_name: tag_name,
                chat_session_id: chat_session_id
            }
        });

        if (existingData) {
            return NextResponse.json({ status: 400, error: 'Data already exists for the same tag name and chat session id' }, { status: 400 });
        }


        const data = await prisma.wab_chat_tags.create({
            data: {
                user_id: userId,
                tag_name,
                wab_number_id,
                chat_session_id,
            }
        });

        const extractedData = {
            id: data.id,
            user_id: data.user_id,
            wab_number_id: data.wab_number_id,
            chat_session_id: data.chat_session_id,
            tag_name: data.tag_name,
        };

        // Logging inserted data

        return NextResponse.json({ status: 200, message: 'Data inserted successfully', data: extractedData });
    } catch (error) {
        console.error("Error:", error);
        return NextResponse.json({ status: 500, error: 'Failed to insert data', message: error.message }, { status: 500 });
    }
};
