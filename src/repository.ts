import mysql, { OkPacket, RowDataPacket } from "mysql2"

export const db = mysql.createConnection({
	host: "localhost",
	port: 3306,
	user: "root",
	password: "4321",
	database: "chronodb",
})

db.on("connection", () => console.log("connected to mysql"))

export function createDB(name:string,desc:string) {
	const queryString = "INSERT INTO `eventdb` (`title`, `desc`,createdAt,updatedAt) VALUES (?,?,?,?);"

	return new Promise((resolve) => {
		db.query(queryString, [name,desc,timestamp(),timestamp()], (err, result) => {
			if (err) {
				console.error(err)
				resolve(null)
			}
			const row = <OkPacket>result
			resolve(row)
		})
	})
}

export function getAllDB() {
	const queryString = "SELECT * FROM chronodb.eventdb"

	return new Promise((resolve) => {
		db.query(queryString, [], (err, result) => {
			if (err) {
				console.error(err)
				resolve(null)
			}
			const row = <RowDataPacket>result
			resolve(row)
		})
	})
}
export function getAllTags(dbid: string) {
	const queryString = "SELECT * FROM tag WHERE dbid = ?"

	return new Promise((resolve) => {
		db.query(queryString, [dbid], (err, result) => {
			if (err) {
				console.error(err)
				resolve(null)
			}
			const row = <RowDataPacket>result

			resolve(row)
		})
	})
}
export function countEvent(id: string) {
	const queryString = "SELECT COUNT(counter) FROM event WHERE dbid = ?"

	return new Promise((resolve) => {
		db.query(queryString, [id], (err, result) => {
			if (err) {
				console.error(err)
				resolve(null)
			}
			const row = <RowDataPacket>result
			resolve(row)
		})
	})
}

export function getAllEvents(id: string) {
	const queryString = "SELECT * FROM event WHERE dbid = ?"

	return new Promise((resolve) => {
		db.query(queryString, [id], (err, result) => {
			if (err) {
				console.error(err)
				resolve(null)
			}
			const row = <RowDataPacket>result
			resolve(row)
		})
	})
}
function timestamp() {
	return new Date().toISOString().slice(0, 19).replace("T", " ")
}
export function addEvent(dbid: number, event: Event) {
	const queryString =
		"INSERT INTO event (eventname,eventdesc,eventstart,eventend,emoji,thumbnail,color,isPeriod,tags,importance,dbid,createdAt,updatedAt,desctext,emojiThumbnail) " +
		"VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?);"

	return new Promise((resolve) => {
		db.query(
			queryString,
			[
				event.eventname,
				event.eventdesc,
				event.eventstart,
				event.eventend,
				event.emoji,
				event.thumbnail,
				event.color,
				event.isPeriod,
				event.tags,
				event.importance,
				dbid,
				timestamp(),
				timestamp(),
				event.desctext,
				event.emojiThumbnail
			],
			(err, result) => {
				if (err) {
					console.error(err)
					resolve(null)
				}
				const row = <OkPacket>result
				resolve(row)
			}
		)
	})
}
export function editEvent(id: number, event: Event) {
	const queryString =
		"UPDATE event SET emojiThumbnail = ?, eventname = ?,eventdesc = ?,eventstart = ?,eventend = ?,emoji = ?,thumbnail = ?,color = ?,isPeriod = ?,tags = ?,importance = ?,updatedAt = ?,desctext = ? " +
		"WHERE (counter = ?);"

	return new Promise((resolve) => {
		db.query(
			queryString,
			[
				event.emojiThumbnail,
				event.eventname,
				event.eventdesc,
				event.eventstart,
				event.eventend,
				event.emoji,
				event.thumbnail,
				event.color,
				event.isPeriod,
				event.tags,
				event.importance,
				timestamp(),
				event.desctext,
				id,
			],
			(err, result) => {
				if (err) {
					console.error(err)
					resolve(null)
				}
				const row = <OkPacket>result
				resolve(row)
			}
		)
	})
}
export function deleteEvent(id: number) {
	const queryString = "DELETE FROM event WHERE (counter = ?)"
	return new Promise((resolve) => {
		db.query(queryString, [id], (err, result) => {
			if (err) {
				console.error(err)
				resolve(null)
			}
			const row = <OkPacket>result
			resolve(row)
		})
	})
}
export interface Event {
	eventname: string
	eventdesc?: string
	eventstart: string
	eventend?: string
	emoji?: string
	thumbnail?: string
	color: string
	isPeriod: number
	tags: string
	importance?: number
	desctext: string
	emojiThumbnail:number
}
