import express from 'express';
import  validator from 'express-validation';
import {responseHelper} from './../../common/responsiveHelper';
import {createCategory,getListCategory} from './ModelCategory';
import {VALIDATION_CREATE_CATEGORY} from './ValidationCategory';
import {getData,putData} from './../../common/cache';
const router = express.Router();
router.get("/",async(req,res)=>{
    res.send("phong");
})
router.post("/create",
    validator(VALIDATION_CREATE_CATEGORY),
    async(req,res)=>{
        try {
            let resultCreate = await createCategory(req.body);
            return responseHelper(req,res,null,resultCreate);
        } catch (error) {
            console.log(error);
            return responseHelper(req,res,error);
        }
    })
router.get("/getlist",
    async(req,res)=>{
        try {
            let listCategory = getData("LIST-CATEGORY");
            if(!listCategory){
                listCategory = await getListCategory();
                putData("LIST-CATEGORY",listCategory);
            }
            return responseHelper(req,res,null,listCategory);
        } catch (error) {
            console.log(error);
            return responseHelper(req,res,error);
        }
    })
export default router ;