import {Queue,Worker} from "bullmq"
import { defaultQueueConfig, redisConnection } from "../config/queueConfig.js"
import { sendEmali } from "../utils/mailer.js"

export const emailQueueName="email-queue"

export const emailQueue=new Queue(emailQueueName,{
    connection:redisConnection,
    defaultJobOptions:defaultQueueConfig
})

// workers

export const handler=new Worker(emailQueueName,async(jobs)=>{
console.log("The Email worker data is ",jobs.data)
const data=jobs.data
data?.map(async(job)=>{
    await sendEmali(job.toMail,job.subject,job.body)
})

},{connection:redisConnection})

// worker listerners

handler.on("completed",(job)=>{
    console.log(`The job ${job.id} is completed`)
})

handler.on("failed",(job)=>{
    console.log(`The job ${job.id} is failed`)
})