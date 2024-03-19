/* ********************************************************************************************
	|                    PURPOSE OF API :: GET Waba survey Entry Report                        |
	| *****************************************************************************************
*/

    import { NextResponse } from "next/server";
    import { VerifyToken } from "../../../utils/tokenHandler";
    import ReportsService from "../../../utils/services/ReportsService";
    import { getRedisData } from "../../../utils/services/RedisService";
    import * as yup from 'yup';

/* ********************************************************************************************
	|                    Handler Function                      |
	| *****************************************************************************************
*/

    export async function POST(request){
        try {
            const schema = yup.object().shape({
                page:yup.number().positive("page be positve"),
                pageSize:yup.number().positive("pageSize must be positive"),
            });
            const params = await ( request.headers.get("content-type") &&  request.headers.get("content-type").includes("application/json") ? request.json() : {});
            let {page=1, pageSize = 10} = params;
            await schema.validate(params);
            const fromIndex = page ? (page - 1) * pageSize : 0;
            params.page = fromIndex;
            params['pageSize'] = pageSize;
            const user_data = await VerifyToken(request);

            const redis_data = JSON.parse(await getRedisData(`users_${user_data.userId}`))
            
            params['main_user'] = redis_data['main_user']
            params['type'] = redis_data['type'] 
            //params['user_id'] = redis_data['id']
            //params['user_id'] = "255";
            const reportsService = new ReportsService()
            const response = await reportsService.getWabaSurveyEntryReport(params)
            
            return NextResponse.json({status:"200",message:"success",data:response.finalData, Page:page, PageSize:pageSize, TotalRecord:response.totalData});
        }catch(error){
            return NextResponse.json({status:"500",message:error.message,data:[]})
        }
    }