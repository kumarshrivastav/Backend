export default function imageValidation(req, res, next) {
    const profile = req.file
    if (profile) {
        const validUserImageExt = new Set(["jpeg", "jpg", "png", "gif"])
        const userImgEx = profile.originalname.split(".").pop().toLowerCase()
        if (!validUserImageExt.has(userImgEx)) {
            return next(ErrorHandler(400, "Please upload the image file"))
        } else {
            next()
        }
    } else {
        next()
    }

}