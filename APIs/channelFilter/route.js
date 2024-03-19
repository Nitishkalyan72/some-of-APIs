/*===================================================
==============  API of channelfilter.======
===================================================*/

import { NextResponse } from "next/server";
import prisma from "../../../utils/services/prismadb";
import { VerifyToken } from "../../../utils/tokenHandler";
import * as yup from 'yup';

const Schema = yup.object().shape({
    serviceid: yup
        .mixed()
        .test('is-serviceid-valid', 'Service ID must be a string or an array of strings', value => {
            // Check if the value is either a string or an array of strings
            return typeof value === 'string' || (Array.isArray(value) && value.every(item => typeof item === 'string'));
        })
        .required("serviceid is a required field . It can be string or an array of strings")
});


// POST method handler
export const POST = async (request) => {
    try {
        const token_data = await VerifyToken(request);
        let user_id = token_data.userId;

        const params = await (request.headers.get("content-type") && request.headers.get("content-type").includes("application/json") ? request.json() : {});
        await Schema.validate(params);
        // Convert params.serviceid to an array of integers if it's not already an array
const serviceIds = Array.isArray(params.serviceid) ? params.serviceid.map(id => parseInt(id)) : [parseInt(params.serviceid)];


        // Now use the converted serviceIds array in your Prisma query
        const channels = await prisma.mca_numbers.findMany({
            where: {
                user_id: user_id,
                serviceid: {
                    in: serviceIds
                }
            },
            select: {
                id: true,
                number: true
            }
        });

        return NextResponse.json({ status: 200, message: "success", data: channels });
    } catch (error) {
        return NextResponse.json({ status: 500, error: error.message });
    }
}
