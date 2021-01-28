import dotenv from "dotenv";
dotenv.config();
import redis from "redis";
import {promisify} from 'util';
const client = redis.createClient({
    host:process.env.REDIS_HOST,
    port:process.env.REDIS_PORT,
    password:process.env.REDIS_PASSWORD
})
const getAsync = promisify(client.get).bind(client);
const setAsync = promisify(client.set).bind(client);
export const getDataRedis = async (key,data)=>{
    return getAsync(key);
}
export const setDataRedis = async (key,data)=>{
    return setAsync(key,data);
}