import { Request } from "express";

export const destroySession = (req: Request): Promise<void> => {
    return new Promise((resolve, reject) => {
        req.session.destroy((err) => {
            if (err) reject(err)

            resolve()
        })
    })
}