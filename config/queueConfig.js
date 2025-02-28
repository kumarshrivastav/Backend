export const redisConnection={
    host:"localhost",
    port:6379,
    password:"Shrivastavankit@123"
}

export const defaultQueueConfig={
    delay:5000,
    removeOnComplete:{count:100,age:60*60*24},
    attempts:3,
    backoff:{
        type:"exponential",
        delay:1000
    },
}