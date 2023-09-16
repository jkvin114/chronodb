import { createServer } from "http"
import fs = require("fs")
import { Event, addTag, createDB, deleteTag, eventTagOff, eventTagOn, getAllEventTags } from "./repository" 
import express = require("express")
import { addEvent, countEvent, deleteEvent, editEvent, getAllDB, getAllEvents, getAllTags } from "./repository"
import { ImageUploader } from "./mutler"
import { OkPacket } from "mysql2"
const clientPath = `${__dirname}/../public`
// const firstpage = fs.readFileSync(clientPath+"/index.html", "utf8")

const PORT = 80
const app = express()
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(express.static(clientPath))


const httpserver = createServer(app)
httpserver.listen(PORT)
app.on("error", (err: any) => {
	console.error("Server error:", err)
})

app.get("/db/all", async function (req: any, res: any) {
	// createDB("격변의 시작","")
	const db:any = await getAllDB()
    if (!db) res.status(500).end()
	let counts:number[]=[]
	// console.log(db)
	for(const d of db){
		const count = await countEvent(d.counter) as number
		counts.push(count)
	}  
	// console.log(counts)
	res.status(200).json({ items: db,counts:counts.map((c:any)=>c[0]["COUNT(counter)"]) })
})
 
app.get("/db/:id/events", async function (req: any, res: any) {
	let id = req.params.id
	const row = await getAllEvents(id)
    if (!row) res.status(500).end()
	res.status(200).json({ items: row })
})
app.get("/db/:id/tags", async function (req: any, res: any) {
	let id = req.params.id
	const row = await getAllTags(id)
	const eventtags = await getAllEventTags(id)
    if (!row) res.status(500).end()
	res.status(200).json({ items: row ,eventtags:eventtags})
})

app.post("/db/:id/event", ImageUploader.upload.single("img"),ImageUploader.resizeImg,async function (req: any, res: any) {
	const imgfile = req.file
	console.log(req.body)
	let id = req.params.id
	if(imgfile)
		req.body.thumbnail=imgfile.filename

    const result =await addEvent(id,req.body as Event)
    if (!result) return res.status(500).end()
	return res.status(200).end()
})
app.post("/db/event/:id/delete", async function (req: any, res: any) {
	let id = req.params.id
	
    const result =await deleteEvent(id)
    if (!result) res.status(500).end()
	res.status(200).end()
})
app.post("/db/:id/tag/delete", async function (req: any, res: any) {
	let dbid = req.params.id
	console.log(req.body)
    const result =await deleteTag(dbid,req.body.id)
    if (!result) res.status(500).end()
	res.status(200).end()
})
app.post("/db/:id/tag/add", async function (req: any, res: any) {
	let dbid = req.params.id
	console.log(req.body)
    const result=await addTag(dbid,req.body.name,req.body.color)
	console.log(result)
    if (!result || result.affectedRows===0) res.status(500).end()
	else res.status(200).json({id:result.insertId}).end()
})
app.post("/db/:id/tag/event/on", async function (req: any, res: any) {
	let dbid = req.params.id
	console.log(req.body)
    const result =await eventTagOn(dbid,req.body.event,req.body.tag)
    if (!result) res.status(500).end()
	res.status(200).end()
})
app.post("/db/:id/tag/event/off", async function (req: any, res: any) {
	let dbid = req.params.id
	console.log(req.body)
    const result =await eventTagOff(dbid,req.body.event,req.body.tag)
    if (!result) res.status(500).end()
	res.status(200).end()
})


app.post("/db/event/:id/edit", ImageUploader.upload.single("img"),ImageUploader.resizeImg, async function (req: any, res: any) {
	let id = req.params.id
	const imgfile = req.file
	
	if(imgfile){
		req.body.thumbnail=imgfile.filename
	}
    const result =await editEvent(id,req.body as Event)
    if (!result) res.status(500).end()
	res.status(200).end()
})
