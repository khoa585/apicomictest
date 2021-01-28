import cache from 'memory-cache';
const TIME = 30*60*1000 ;
export const putData = (key,value,time=TIME)=>{
    cache.put(key,value,time);
}
export const getData = (key)=>{
    return cache.get(key);
}
