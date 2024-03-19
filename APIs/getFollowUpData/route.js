/*===================================================================================
==============  FILE DESCRIPTION:- API TO GET FollowUpData=========================
===================================================================================*/

import { NextResponse } from "next/server";
import {VerifyToken} from '../../../utils/tokenHandler'
import AgentDashboardService from "../../../utils/services/AgentDashboardService";


/*===================================================================================
==============  POST REQUEST HANDLER FUNCTION========================================
===================================================================================*/


export const POST = async (request)=>{
    try {
        const token_data = await VerifyToken(request);
        let id = token_data.userId;
        /****************************************************************************
         *                       HANDLE FORMDATA                                |
         * ***************************************************************************/
        const contentType = request.headers.get("content-type");
        let body = await (contentType && contentType.includes("application/json")? request.json(): {});
        const agentDashboardService = new AgentDashboardService();
        const resultData = await agentDashboardService.getFollowUpData(id,body);
        
        return NextResponse.json(resultData,{status:200});
    } catch (error) {
        console.error("Error", error);
        return NextResponse.json({status:500, error:error.message},{status:500});
    }
}