import { getReading, addReading, getKeys } from "../database"
import { Request, Response, NextFunction } from "express"
import Reading from "../interfaces/reading"

type Record = {
    key: string,
    reading: Reading
}

export class DataController {

    addData(req: Request, res: Response, next: NextFunction) {

        const parseData = (rawData: string) => {
            let parsed: Record[] = []

            let data = rawData.split("\r\n");
            for (let i = 0; i < data.length; i++) {
                const item = data[i]

                const [time, metricName, metricValue] = item.trim().split(" ")
                const key: string = parseInt(time).toString()
                if (typeof key === "undefined" || isNaN(parseInt(key)) || parseInt(key) < 0) throw new Error("Key not a valid date")

                const name: string = metricName
                if (typeof name === "undefined" || name.trim() === "") throw new Error("Metric name shouldn't be empty")

                const value: number = parseFloat(metricValue)
                if (typeof value === "undefined" || isNaN(value)) throw new Error("Value should be a number")

                const obj: Record = { key, reading: { name, value } }
                parsed.push(obj)
            }

            return parsed
        }

        const body: string = req.body
        try {
            const parsed: Record[] = parseData(body)
            parsed.forEach(item => { addReading(item.key, item.reading) })
            res.json({ parsed })
        }
        catch (e) {
            const result = (e as Error).message;

            res.status(422).json({ error: result })

        }
    }

    getData(req: Request, res: Response, next: NextFunction) {
        const from = req.query.from as string
        const to = req.query.to as string

        const start = new Date(from)
        const end = new Date(to)

        const startTime = start.getTime() / 1000
        const endTime = end.getTime() / 1000

        if (startTime > endTime) {
            return res.status(422).json({ message: "From must be lower than to" })
        }

        const keys = getKeys()
        const results: Record[] = []
        keys.forEach(key => {

            const myKey = parseInt(key)
            if (myKey <= endTime && myKey >= startTime) {
                const reading = getReading(key)
                if (typeof reading !== "undefined")
                    results.push({ key, reading })
            }

        })

        res.json(results)
    }
}
