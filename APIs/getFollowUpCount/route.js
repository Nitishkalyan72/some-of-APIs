/*===================================================================================
==============  FILE DESCRIPTION:- API TO GET Followcount=========================
===================================================================================*/
import { NextResponse } from "next/server";
import { VerifyToken } from '../../../utils/tokenHandler'
import UserService from "../../../utils/services/UserService";
import prisma from "../../../utils/services/prismadb";
import { getRedisData } from "../../../utils/services/RedisService";


/*===================================================================================
==============  POST REQUEST HANDLER FUNCTION========================================
===================================================================================*/


export const POST = async (request) => {
    try {
        const tokenData = await VerifyToken(request);
        const user_id = tokenData.userId;
        const params = await (request.headers.get("content-type") && request.headers.get("content-type").includes("application/json") ? request.json() : {});
        const currentDate = new Date(); // Create a new Date object with the current date and time
        const currentMonth = currentDate.getMonth() + 1; // Get the month (0-indexed, so add 1 to make it 1-indexed)
        const currentYear = currentDate.getFullYear();
        let month = currentMonth;
        let year = currentYear;
        if(params.month && params.month != 0){
            month = params.month
        }
        if(params.year && params.year != 0){
            year = params.year
        }
        const user_data = JSON.parse(await getRedisData(`users_${tokenData.userId}`))

        const args = {
            userType: user_data.type,
            uid: user_id,
            main_user: user_data.main_user,
            month :  month,
            year : year

        };
        
        const userService = new UserService();
        const resultData = await userService.getFollowupCount(args);
        return NextResponse.json({ status: 200, message: "Success", data: resultData });
    } catch (error) {
        console.error("Error:", error);
        return NextResponse.json({ status: 500, error: error.message });
    }
};







// export const POST = async (request) => {
//     try {
//         const tokenData = await VerifyToken(request);
//         const user_id = tokenData.userId;
//         const params = await (request.headers.get("content-type") && request.headers.get("content-type").includes("application/json") ? request.json() : {});
//         const timestamp = params.schedule_at;
//         const date = new Date(timestamp);
//         const user_data = JSON.parse(await getRedisData(`users_${tokenData.userId}`))
//         // Extract the month (0-indexed, where 0 is January)
//         const month = date.getMonth() + 1; // Adding 1 to make it 1-indexed

//         console.log("Month:", month);
//         console.log("User ID:", user_id);
        

//         const args = {
//             userType: user_data.type,
//             uid: user_id,
//             main_user: user_data.main_user,
//             month :  month

//         };
        
//         const userService = new UserService();
//         const resultData = await userService.getFollowupCount(args);
        
//         console.log(resultData)
//         return NextResponse.json({ status: 200, message: "Success", data: resultData });
//     } catch (error) {
//         console.error("Error:", error);
//         return NextResponse.json({ status: 500, error: error.message }, { status: 500 });
//     }
// };