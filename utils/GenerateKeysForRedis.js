export default function GenerateKeysForRedis(req) {
    const params = req.params
    var originalUrl=req.originalUrl
    var updatedPath = originalUrl.split("?")[0].replace(/^\/+|\/+$/g,'').replace(/\//g,':')
    const query = req.query                 
    if (Object.keys(params).length>0) {
        const updatedParams = Object.keys(params).sort().map((key) => `${key}=${params[key]}`).join(":")
        updatedPath = updatedPath + ":" + updatedParams
    }
    if (Object.keys(query).length>0) {
        const updatedQuery = Object.keys(query).sort().map((key) => `${key}=${query[key]}`).join(':')
        updatedPath = updatedPath + ":" + updatedQuery
    }
    return updatedPath
};


// const req={path:"/api/products/list/q323",params:{userId:123,productId:101},query:{searchTerm:"Laptop",price:20000,color:"Black"}}
// console.log(GenerateKeysForRedis(req))
