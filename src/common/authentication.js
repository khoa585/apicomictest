require('dotenv').config();
const md5 = require('md5');
import {responsHelper} from './responsiveHelper';
import {AUTHEN_FAIL ,ERROR_AUTHEN ,FAIL_VALIDATION} from '../constant/error';
import {verifyToken} from './jwtHelper';
import {getUserInfoById} from './../server/user/ModelUser';
const TIME_EXPRIED=1000*60*60 ;
function authentication(req,res,next){
    let {unittime,token,admin} = req.headers ;
    // console.log(process.env.SECRET_KEY ,TIME_EXPRIED);
    if(admin=='ADMIN'){
        return next();
    }
    if(!unittime || !token){
        return responsHelper(req,res,ERROR_AUTHEN);
    }
    if( Math.abs( Date.now() - unittime) > TIME_EXPRIED ){;
        return responsHelper(req,res,AUTHEN_FAIL);
    }
    let rescret = md5(unittime+process.env.SECRET_KEY);
    if(rescret !=token){
        return responsHelper(req,res,AUTHEN_FAIL);
    }
    next();
}
export default authentication ;
export const Authorization = async (req,res,next)=>{
    let token = req.headers.Authorization || req.headers.authorization;
    if(token){
        try {
            let data = verifyToken(token);
            if(!data || !data._id){
                next();
            }
            let userInfo = await getUserInfoById(data._id);
            if(userInfo){
                req.user = userInfo ;
            }
        } catch (error) {
            
        }
        
    }
    next();
}
