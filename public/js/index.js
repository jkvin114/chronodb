
const VIEW = {
	Timeline: "timeline",
	Table: "table",
	Album:"album",
	Board:"board",
	Blog:"blog",
	Gallery:"gallery",
	List:"list"
}

class Database {
	constructor() {
		this.data = []
		this.datamap = new Map() // id=>data
		this.isRecent = false //caching
		this.visualize_importance = true
		this.id = 1
		this.tags = new Map() // id=>tag
		this.view = VIEW.Table
	}
	setData(data) {
		this.data = data.sort((a,b)=>{
			return new Date(b.eventstart).valueOf() - new Date(a.eventstart).valueOf()
		})
		for (const d of data) {
			this.datamap.set(d.counter, d)
		}
	}
	setTags(tags){
		for (const d of tags) {
			this.tags.set(d.id, d)
		}
	}

	reload() {
		$("#nameinput").val(null)
		quill.setContents([])
		changeView(this.view)
	}
}
const DB = new Database()
var quill

function item_moment(content, id, colorId, imp, icon) {
	if (!icon) icon = ""
	imp = Math.max(1, Math.min(10, imp))
	if (!DB.visualize_importance) imp = 5

	return (
		`<div data-id=${id} id="event-${id}" class='event event-moment imp-${imp}' data-color=${colorId} data-type=item data-clicked=0` +
		` style="background-color:${COLORS_LIGHT[colorId]};"/>${icon}${parsecontent(content)}</div>`
	)
}

function item_range(content, id, colorId, imp, icon) {
	if (!icon) icon = ""
	imp = Math.max(1, Math.min(10, imp))
	if (!DB.visualize_importance) imp = 5

	return (
		`<div data-id=${id} id="event-${id}" class='event event-range imp-${imp}' data-color=${colorId} data-type=item data-clicked=0` +
		` style="background:linear-gradient(to left,${COLORS_LIGHT[colorId]},${
			COLORS_MID[colorId]
		});"/>${icon}${parsecontent(content)}</div>`
	)
}

function item_period(content, id, colorId, imp, icon) {
	if (!icon) icon = ""
	imp = Math.max(1, Math.min(10, imp))
	if (!DB.visualize_importance) imp = 5

	return (
		`<div data-id=${id} id="event-${id}" class='event event-period imp-${imp}' data-color=${colorId} data-type=item data-clicked=0` +
		` style="background:linear-gradient(to top,${COLORS_LIGHT[colorId]},${
			COLORS_MID[colorId]
		});"/>${icon}${parsecontent(content)}</div>`
	)
}
function addimg(img) {
	return `<img class=eventimg src="./uploads/${img}">`
}
function addemoji(emoji) {
	//129424
	return `<b class=eventemoji>${emoji}</b>`
}
function parsecontent(content) {
	let sliced = ""
	if (content.length > 40) {
		sliced = content.slice(0, 40) + ".."
	} else sliced = content
	return `<a title=${content}>${sliced}</a>`
}

function tooltipContent(name, content, start, end) {
	let text = content
	if (text.length > 200) text = content.slice(0, 200) + ".."

	return `<div class=tooltip-content>${name}<hr>
    ${text !== "" ? "<a class=tooltip-desc>" + text + "</a><hr>" : ""}
        <div class=tooltip-date>
            ${start.split("T")[0]}${end ? "~" + end.split("T")[0] : ""}
        </div>
    </div>`
}

function closeEdit() {
	$("#emojiwindow").addClass("hidden")
	$("#editwindow").addClass("hidden")
	$("#shadow").addClass("hidden")
	$("body").css("overflow", "auto")
	$("#thumbnail").html("")
	$("#input-image").val(null)
	closePost()
}

function openPost(id){
	$("#postwindow").removeClass("hidden")
	$("#shadow-post").removeClass("hidden")
	$("body").css("overflow", "hidden")
	let html=getBlogPost(DB.datamap.get(id),"post")
	$("#postwindow").html(html)
	populatePostContent(DB.datamap.get(id),"post")
	addPostBtnEvent()
}
function closePost(){
	$("#postwindow").addClass("hidden")
	$("#shadow-post").addClass("hidden")
	$("body").css("overflow", "auto")
}


function openEdit(id) {
	
	// console.log("edit" + id)

	if (id !== undefined) {
		$("#editwindow h2").html("Edit Event")
		$("#submit-event-edit").show()
		$("#submit-event-edit").data("id", id)
		$("#submit-event").hide()
		$("#endinput").val(null)

		const data = DB.datamap.get(id)
		if (!data) return
		$("#nameinput").val(data.eventname)
		$("#startinput").val(data.eventstart.slice(0, 10))
		if (data.eventend) $("#endinput").val(data.eventend.slice(0, 10))
		if (data.emoji) {
			$("#pickemoji").data("emoji", data.emoji)
			$("#pickemoji").html(data.emoji)
			$("#preview-emoji").html(data.emoji)
		}
		$("#importance-range").val(data.importance)
		$("#importance-label").html("Importance:" + data.importance)

		if (data.color !== undefined) {
			$("#color-selection").data("color", data.color)
			$(".ql-toolbar").css("background", COLORS_LIGHT[Number(data.color)])
			$("#color-selection-current").css("background", COLORS_LIGHT[Number(data.color)])
		}
		console.log(data.eventdesc)
		if (data.eventdesc) {
			quill.setContents(data.eventdesc)
		}
		if (data.thumbnail) {
			$("#thumbnail").html("<img src='./uploads/" + data.thumbnail + "'>")
		}
		$("#useemoji").prop("checked", data.emojiThumbnail === 1)
		if (data.isPeriod) {
			$("#type-period").prop("selected", true)
			$("#type-event").prop("selected", false)
		} else {
			$("#type-period").prop("selected", false)
			$("#type-event").prop("selected", true)
		}
	} else {
		$("#submit-event-edit").hide()
		$("#submit-event").show()
		$("#editwindow h2").html("Add New Event")
	}
	$("#editwindow").removeClass("hidden")
	$("#shadow").removeClass("hidden")
	$("body").css("overflow", "hidden")
	document.getElementById("editwindow").scrollTo(0, 0)
}
function changeView(view){
	$(".section").addClass("hidden")
	$("#section-"+view).removeClass("hidden")
	DB.view=view
	switch(view){
		case "db":
			window.location.href="/"
			break
		case "timeline":
			Timeline()
			break
		case "table":
			Table()
			break
		case "album":
			Album()
			break
		case "gallery":
			 Gallery()
			break
		case "board":
		case "blog":
			Blog()
			break
		case "list":
			ListView()
			break

	}
}



async function createEvent(id) {
	const name = $("#nameinput").val()
	const desc = quill.getContents()
	const text = quill.getText()
	let start = $("#startinput").val()
	let end = $("#endinput").val()
	const emoji = $("#pickemoji").data("emoji")
	const importance = $("#importance-range").val()
	const type = $("#typeinput").find(":selected").val()
	const color = $("#color-selection").data("color")
	let emojithumb = $("#useemoji").prop("checked")
	// console.log(start.split("/"))
	// start = start.split("/")[2]+"-"+start.split("/")[0]+"-"+start.split("/")[1]
	// console.log(start)
	// if(end)
	//     end = end.split("/")[2]+"-"+end.split("/")[0]+"-"+end.split("/")[1]
	if (end && new Date(start) >= new Date(end)) {
		alert("End date should be later than start date!")
		return
	}
	const event = {
		eventname: name,
		eventdesc: JSON.stringify(desc),
		desctext: text,
		eventstart: start,
		eventend: end,
		emoji: emoji,
		importance: importance,
		type: type,
		color: color,
		isPeriod: end && type === "2" ? 1 : 0,
		emojiThumbnail: emojithumb ? 1 : 0,
		tags: "",
	}

	if (event.eventname === "") {
		alert("missing eventname!")
		return
	}
	if (event.eventstart === "") {
		alert("mimssing start date!")
		return
	}
	if (type === "2" && event.eventend === "") {
		alert("period requires end date!")
		return
	} else if (event.eventend === "") {
		event.eventend = undefined
	}
	const formdata = new FormData()
	formdata.append("eventname", event.eventname)
	formdata.append("eventdesc", event.eventdesc)
	formdata.append("desctext", event.desctext)
	formdata.append("eventstart", event.eventstart)
	if (event.eventend) formdata.append("eventend", event.eventend)
	if (event.emoji) formdata.append("emoji", event.emoji)

	formdata.append("importance", event.importance)
	formdata.append("type", event.type)
	formdata.append("color", event.color)
	formdata.append("isPeriod", event.isPeriod)
	formdata.append("emojiThumbnail", event.emojiThumbnail)
	formdata.append("tags", event.tags)

	const image = $("#input-image")[0].files[0]
	// console.log(image)
	if (image) formdata.append("img", image)
	else if (id !== undefined && DB.datamap.get(id).thumbnail) {
		formdata.append("thumbnail", DB.datamap.get(id).thumbnail)
	}

	//create event
	if (!id) {
		try {
			let result = await fetch("/db/" + DB.id + "/event", {
				method: "POST",
				headers: {
					// "Content-Type": "application/json",
				},
				body: formdata,
			})
			console.log(result)
			if (result.ok) {
				DB.isRecent = false
				DB.reload()
				closeEdit()
				alert("Successfully created event " + event.eventname)
			} else {
				alert("Failed to create event!")
			}
		} catch (e) {
			alert(e)
		}
	} else {
		//edit event
		console.log("edit")
		try {
			let result = await fetch("/db/event/" + id + "/edit", {
				method: "POST",
				body: formdata,
			})
			console.log(result)
			if (result.ok) {
				DB.isRecent = false
				DB.reload()
				closeEdit()
				alert("Successfully edited event " + event.eventname)
			} else {
				alert("Failed to edit event!")
			}
		} catch (e) {
			alert(e)
		}
	}
}
function drawTags() {
	let html = ""
	for (const tag of DB.tags.values()) {
		html += `<div class="tag-selection" data-id=${tag.id} data-color=${tag.color} style="background-color:${
			COLORS_LIGHT[tag.color]
		};">
        <img src="check.png">${tag.name}</div>`
	}
	$("#tagarea").html(html)
	$(".tag-selection").click(function () {
		if(!$(this).data("id") || !$(this).data("color")) return

		if ($(this).hasClass("selected")) {
			$(this).css("background", COLORS_LIGHT[Number($(this).data("color"))])
			$(this).removeClass("selected")
		} else {
			$(this).addClass("selected")
			$(this).css("background", COLORS_MID[Number($(this).data("color"))])
		}
	})
}
function convertDate(date) {
	date = date.split("T")[0]
	return date.split("-")[2] + "/" + date.split("-")[1] + "/" + date.split("-")[0]
}