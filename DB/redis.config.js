import {createClient} from "redis"

async function ConnectRedis(){
    try {
        const client=createClient({url:"redis://:Shrivastavankit@123@localhost:6379"})
        client.on('error',(err)=>console.log(`Error while connecting to Redis:${err}`))
        client.on('ready',()=>console.log('Redis connected successfully'))
        await client.connect()
        await client.ping()
        return client
    } catch (error) {
        console.log(error)
    }
}

const RedisClient=await ConnectRedis()
export default RedisClient 