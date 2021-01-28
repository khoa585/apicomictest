import  category from './../../model/category';
export const createCategory = async (data)=>{
    return category.create({...data});
}
export const getListCategory = async()=>{
    return category.find().sort({name:1}).select("-createdAt -updatedAt");
}