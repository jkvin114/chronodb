const COLORS_LIGHT = [
	"#fff",
	"#f8bbd0",
	"#e1bee7",
	"#d1c4e9",
	"#c5cae9",
	"#bbdefb",
	"#b2ebf2",
	"#b2dfdb",
	"#c8e6c9",
	"#dcedc8",
	"#fff9c4",
	"#ffe082",
	"#ffe0b2",
	"#ffccbc",
	"#d7ccc8",
	"#e0e0e0",
	"#cfd8dc",
]

const COLORS_MID = [
	"#eee",
	"#f48fb1",
	"#ce93d8",
	"#b39ddb",
	"#9fa8da",
	"#64b5f6",
	"#80deea",
	"#80cbc4",
	"#81c784",
	"#aed581",
	"#fff59d",
	"#ffca28",
	"#ffcc80",
	"#ff8a65",
	"#bcaaa4",
	"#bdbdbd",
	"#b0bec5",
]

const COLORS_DARK = [
	"#aaa",
	"#ec407a",
	"#ab47bc",
	"#9575cd",
	"#7986cb",
	"#1e88e5",
	"#0097a7",
	"#26a69a",
	"#43a047",
	"#7cb342",
	"#ffee58",
	"#ffb300",
	"#ff9800",
	"#f4511e",
	"#a1887f",
	"#757575",
	"#78909c",
]
const VIEW = {
	Timeline: "timeline",
	Table: "Table",
}

class Database {
	constructor() {
		this.data = []
		this.datamap=new Map()  // id=>data
		this.isRecent = false //caching
		this.visualize_importance = true
		this.id = 1
		this.tags = []
		this.view = VIEW.Timeline
	}
	setData(data){
		this.data=data
		for(const d of data){
			this.datamap.set(d.counter,d)
		}
	}

	reload() {
		$("#nameinput").val(null)
		quill.setContents([])

		if (this.view === VIEW.Timeline) Timeline()
		else if (this.view === VIEW.Table) Table()
	}
}

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
async function dbList() {
	try {
		const data = await (await fetch("/db/all")).json()
		let str = ""
		for (let i = 0; i < data.items.length; ++i) {
			str += `
        <a href="?db=${data.items[i].counter}" class="list-group-item list-group-item-action flex-column align-items-start">
            <div class="d-flex w-100 justify-content-between">
              <h5 class="mb-1">${data.items[i].title}</h5>
              <small>${data.counts[i]} Events</small>
            </div>
            <small>${data.items[i].desc}</small>
          </a>`
		}
		$("#databases-container").html(str)
	} catch (e) {
		alert("Error!")
		console.error(e)
		return
	}
}

function closeEdit(){
    $("#emojiwindow").addClass("hidden")
	$("#editwindow").addClass("hidden")
	$("#shadow").addClass("hidden")
	$("body").css("overflow", "auto")
	$("#thumbnail").html("")
	$("#input-image").val(null)
}

function openEdit(id){
    console.log("edit"+id)

    if(id!==undefined){
        $("#editwindow h2").html("Edit Event")
		$("#submit-event-edit").show()
		$("#submit-event-edit").data("id",id)
		$("#submit-event").hide()
		const data=DB.datamap.get(id)
		if(!data) return
		$("#nameinput").val(data.eventname)
		$("#startinput").val(data.eventstart.slice(0,10))
		if(data.eventend) $("#endinput").val(data.eventend.slice(0,10))
		if(data.emoji){
			$("#pickemoji").data("emoji",data.emoji)
			$("#pickemoji").html(data.emoji)
			$("#preview-emoji").html(data.emoji)
		}
		$("#importance-range").val(data.importance)
		$("#importance-label").html("Importance:" + data.importance)

		if(data.color!==undefined){
			$("#color-selection").data("color",data.color)
			$(".ql-toolbar").css("background", COLORS_LIGHT[Number(data.color)])
			$("#color-selection-current").css("background", COLORS_LIGHT[Number(data.color)])
		}
		console.log(data.eventdesc)
		if(data.eventdesc){
			quill.setContents(data.eventdesc)
		}
		if(data.thumbnail){
			$("#thumbnail").html("<img src='./uploads/"+data.thumbnail+"'>")
		}
		$("#useemoji").prop("checked",data.emojiThumbnail===1)
		if(data.isPeriod){
			$("#type-period").prop("selected",true)
			$("#type-event").prop("selected",false)
		}
		else{
			$("#type-period").prop("selected",false)
			$("#type-event").prop("selected",true)
		}
    }
    else{
		$("#submit-event-edit").hide()
		$("#submit-event").show()
        $("#editwindow h2").html("Add New Event")
    }
    $("#editwindow").removeClass("hidden")
    $("#shadow").removeClass("hidden")
    $("body").css("overflow", "hidden")
}
const DB = new Database()
var quill

$("document").ready(function () {
	let query = new URLSearchParams(window.location.search)
	let id = query.get("db")
	console.log(id)
	if (!id) {
		dbList()
		return
	}

	$("#section-databases").hide()
	$("#section-input").show()
	//DB.id=sessionStorage.dbid
	DB.id = id
	if (!DB.id) DB.id = 1
	Timeline()
	quill = new Quill(document.getElementById("editor"), {
		theme: "snow",
		bounds: "#editor",
		placeholder: "Write content..",
		modules: {
			toolbar: true,
		},
	})

	document.querySelector("emoji-picker").addEventListener("emoji-click", (event) => {
		$("#pickemoji").html(event.detail.unicode)
		$("#pickemoji").data("emoji", event.detail.unicode)
		$("#preview-emoji").html(event.detail.unicode)
		console.log(event.detail)
		// $("#emojiwindow").addClass("hidden")
		//$("#shadow").toggleClass("hidden")
		//$("body").css("overflow", "auto")
	})
	$("#shuffle-emoji").click(function () {
		let emoji = getRandomEmoji()
		$("#pickemoji").html(emoji)
		$("#pickemoji").data("emoji", emoji)
		$("#preview-emoji").html(emoji)
	})
	$("#remove-emoji").click(function () {
		$("#pickemoji").html('<img src="smile.svg">')
		$("#pickemoji").data("emoji", null)
	})
	
	$("#close-emoji").click(function () {
		$("#emojiwindow").addClass("hidden")
	})

	$("#pickemoji").click(function (e) {
		e.stopPropagation()
		e.preventDefault()
		$("#emojiwindow").removeClass("hidden")
	})
	$("#shadow").click(function (e) {
		closeEdit()
	})

	let str = "<div data-color='rand' class='dropdown-item color-item'><img src='shuffle.svg'></div>"
	let tags = ""
	for (let i = 0; i < COLORS_LIGHT.length; ++i) {
		str += `<div data-color=${i} class="dropdown-item color-item"><span class="color-selection-span" style="background:${COLORS_LIGHT[i]};"></span></div>`
		// tags+=`<div class="tag-selection selected" data-id=1 data-color=${i} style="background:${COLORS_LIGHT[i]};"><img src="check.png">tag-${i}</div>`
	}
	$("#color-selection").html(str)
	$(".dropdown-item").click(function () {
		let col = $(this).data("color")
		if (col === "rand") {
			col = Math.floor(Math.random() * COLORS_LIGHT.length)
		}
		$("#color-selection").data("color", col)
		$(".ql-toolbar").css("background", COLORS_LIGHT[Number(col)])
		$("#color-selection-current").css("background", COLORS_LIGHT[Number(col)])
	})
	//  $("#tagarea").html(tags)

	$("#importance-range").on("input change", function () {
		$("#importance-label").html("Importance:" + $(this).val())
	})
	$("#submit-event").click(()=>createEvent())
	$("#submit-event-edit").click(function(){
		createEvent($(this).data("id"))
	})
	$("#cancel-event").click(closeEdit)

	$(function () {
		$('input[name="date"]').daterangepicker(
			{
				opens: "left",
				showDropdowns: true,
				minDate: "0000-01-01",
				maxDate: "2999-12-31",
				autoUpdateInput: false,
				locale: {
					cancelLabel: "Clear",
				},
				singleDatePicker: true,
			},
			function (ev, start, end) {}
		)
	})

	$('input[name="date"]').on("apply.daterangepicker", function (ev, picker) {
		$(this).val(picker.startDate.format("YYYY-MM-DD"))
	})

	$('input[name="date"]').on("cancel.daterangepicker", function (ev, picker) {
		$(this).val("")
	})


	const inputImage = document.getElementById("input-image")
	inputImage.addEventListener("change", e => {
	  let input=e.target
	  if(input.files && input.files[0]) {
		  // 이미지 파일인지 검사 (생략)
		  // FileReader 인스턴스 생성
		  const reader = new FileReader()
		  // 이미지가 로드가 된 경우
		  reader.onload = e => {
			$("#thumbnail").html("<img src='"+e.target.result+"'>")
		  }
		  // reader가 이미지 읽도록 하기
		  reader.readAsDataURL(input.files[0])
	  }
	})
})

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
	let emojithumb=$("#useemoji").prop("checked")
	console.log(emojithumb)
	// console.log(start.split("/"))
	// start = start.split("/")[2]+"-"+start.split("/")[0]+"-"+start.split("/")[1]
	// console.log(start)
	// if(end)
	//     end = end.split("/")[2]+"-"+end.split("/")[0]+"-"+end.split("/")[1]
	if(end && new Date(start) >= new Date(end)){
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
		isPeriod: (end && type === "2") ? 1 : 0,
		emojiThumbnail:(emojithumb ? 1 : 0),
		tags: ""
	}

	if (event.eventname === "" ) {
		alert("missing eventname!")
		return
	}
	if(event.eventstart === ""){
		alert("mimssing start date!")
		return
	}
	if (type === "2" && event.eventend === "") {
		alert("period requires end date!")
		return
	} else if (event.eventend === "") {
		event.eventend = undefined
	}
	const formdata = new FormData();
	formdata.append("eventname",event.eventname)
	formdata.append("eventdesc",event.eventdesc)
	formdata.append("desctext",event.desctext)
	formdata.append("eventstart",event.eventstart)
	if(event.eventend)
		formdata.append("eventend",event.eventend)
	if(event.emoji)
		formdata.append("emoji",event.emoji)

	formdata.append("importance",event.importance)
	formdata.append("type",event.type)
	formdata.append("color",event.color)
	formdata.append("isPeriod",event.isPeriod)
	formdata.append("emojiThumbnail",event.emojiThumbnail)
	formdata.append("tags",event.tags)

	const image = $("#input-image")[0].files[0];

	if(image)
		formdata.append('img', image);
	else if(id!==undefined && DB.datamap.get(id).thumbnail){
		formdata.append("thumbnail",DB.datamap.get(id).thumbnail)
	}

	//create event
	if(!id){
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
				alert("Successfully created event "+event.eventname)
			} else {
				alert("Failed to create event!")
			}
		} catch (e) {
			alert(e)
		}
	}else{//edit event
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
				alert("Successfully edited event "+event.eventname)
			} else {
				alert("Failed to edit event!")
			}
		} catch (e) {
			alert(e)
		}
	}
}
async function deleteItem(id){
    try {
		let result = await fetch("/db/event/" + id + "/delete", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			}
		})
		console.log(result)
		if (result.ok) {
			DB.isRecent = false
			// DB.reload()
		} else {
			alert("Failed to delete event!")
		}
	} catch (e) {
		alert(e)
	}
}

async function loadData() {
	loadTags()
	if (DB.isRecent) return
	try {
		DB.setData((await (await fetch("/db/" + DB.id + "/events")).json()).items)

		DB.isRecent = true
	} catch (e) {
		alert("Error!")
		console.error(e)
		return
	}
}

async function loadTags() {
	try {
		DB.tags = (await (await fetch("/db/" + DB.id + "/tags")).json()).items
		drawTags()
	} catch (e) {
		alert("Error!")
		console.error(e)
		return
	}
}
function drawTags() {
	let html = ""
	for (const tag of DB.tags) {
		html += `<div class="tag-selection" data-id=${tag.id} data-color=${tag.color} style="background-color:${
			COLORS_LIGHT[tag.color]
		};">
        <img src="check.png">${tag.name}</div>`
	}
	$("#tagarea").html(html)
	$(".tag-selection").click(function () {
		if ($(this).hasClass("selected")) {
			$(this).css("background", COLORS_LIGHT[Number($(this).data("color"))])
			$(this).removeClass("selected")
		} else {
			$(this).addClass("selected")
			$(this).css("background", COLORS_MID[Number($(this).data("color"))])
		}
	})
}
async function Timeline() {
	DB.view = VIEW.Timeline
	$("#section-timeline").removeClass("hidden")
	$("#section-table").addClass("hidden")
	$(".nav-link").toggleClass("active")
	$("#timeline-container").html("")
	await loadData()
	window.scrollTo(0, 0)
	const container = document.getElementById("timeline-container")
	var options = {
		// height: "400px",
		// width: "100%",
		minHeight: 300,
		margin: {
			item: 4,
			axis: 10,
		},
		order: (i1, i2) => {
			// console.log(i1.data.order)
			return i2.order - i1.order
			//return i1.type === "range" ? 1 : -1
		},
        editable:{
            remove:true
        },
        selectable:true,
        format:{
            minorLabels: {
              millisecond:'SSS',
              second:     's',
              minute:     'HH:mm',
              hour:       'HH:mm',
              weekday:    'ddd D',
              day:        'D',
              week:       'w',
              month:      'MM',
              year:       'YYYY'
            },
            majorLabels: {
              millisecond:'HH:mm:ss',
              second:     'D MM HH:mm',
              minute:     'ddd D MM',
              hour:       'ddd D MM',
              weekday:    'MM YYYY',
              day:        'MM YYYY',
              week:       'MM YYYY',
              month:      'YYYY',
              year:       ''
            }
          },
		showCurrentTime: false,
        onRemove:function(item, callback){
            if(confirm("Delete \""+item.name+"\"?"))
            {
                deleteItem(item.id)
                callback(item)
            }
            else callback(null)
        }
	}
	const items = [
		//  {id: 116, content: item_period("item7",16,7,2),  className:"period",start: '2013-04-27', end: '2023-05-02',order:22,type:"range"},
		//  {id: 126, content: item_period("item9",26,10,7), className:"period", start: '2012-04-27', end: '2025-05-02',order:27,type:"range"}
		//   ,{id:124, content: item_range('item 4',24,4,5), start: '2010-03-16', end: '2013-04-19',className:"color-range",order:20,type:"range"},
	]

	for (const item of DB.data) {
		if (item.eventend && item.isPeriod) {
			let content = item_period(item.eventname, item.counter, item.color, item.importance)
			if(item.thumbnail && item.emojiThumbnail===0){
				content = item_period(item.eventname, item.counter, item.color, item.importance, addimg(item.thumbnail))
			}
			else if (item.emoji&& item.emoji!=="undefined") {
				content = item_period(item.eventname, item.counter, item.color, item.importance, addemoji(item.emoji))
			}

			items.push({
				id: item.counter,
				content: content,
				className: "period eventitem-"+item.counter,
				start: item.eventstart.split("T")[0],
				end: item.eventend.split("T")[0],
				order: item.importance + 20,
                name:item.eventname
			})
		} else if (item.eventend) {
			let content = item_range(item.eventname, item.counter, item.color, item.importance)
			if(item.thumbnail && item.emojiThumbnail===0){
				content = item_range(item.eventname, item.counter, item.color, item.importance, addimg(item.thumbnail))
			}
			else if (item.emoji&& item.emoji!=="undefined") {
				content = item_range(item.eventname, item.counter, item.color, item.importance, addemoji(item.emoji))
			}
			items.push({
				id: item.counter,
				content: content,
				className: "color-range eventitem-"+item.counter,
				start: item.eventstart.split("T")[0],
				end: item.eventend.split("T")[0],
				order: item.importance + 10,
                name:item.eventname
			})
		} else {
			let content = item_moment(item.eventname, item.counter, item.color, item.importance)
			if(item.thumbnail && item.emojiThumbnail===0){
				content = item_moment(item.eventname, item.counter, item.color, item.importance, addimg(item.thumbnail))
			}
			else if (item.emoji&& item.emoji!=="undefined") {
				content = item_moment(item.eventname, item.counter, item.color, item.importance, addemoji(item.emoji))
			}
			let type = "box"
			if (item.importance < 4) type = "point"
			items.push({
				id: item.counter,
				content: content,
                className: "eventitem-"+item.counter,
				start: item.eventstart.split("T")[0],
				order: item.importance,
				type: type,
                name:item.eventname
			})
		}
	}

	const timeline = new vis.Timeline(container, new vis.DataSet(items), options)

    timeline.on('select', function (properties) {
        // console.log(properties.event);
        $(".edit-item").remove()
        if(properties.event.firstTarget.className==="edit-item"){
            openEdit(properties.items[0])
            
            properties.event.stopPropagation()
            properties.event.preventDefault()
        }
        else{
            $(".edit-item").remove()
            $(".eventitem-"+properties.items[0]).not(".vis-dot").not(".vis-line")
            .append(`<img data-id=${properties.items[0]} class='edit-item' src='edit.svg'>`)
        }
    });


      
	for (const item of DB.data) {
		let text = item.desctext ? item.desctext : ""

		tippy("#event-" + item.counter, {
			content: tooltipContent(item.eventname, text, item.eventstart, item.eventend),
			allowHTML: true,
		})
	}
	// $(".event").off()
	// $(".event-moment").hover(function(){
	//     console.log("Sd")
	//     console.log($(this).data("eventid"))
	//     console.log($(this).data("color"))
	//     if($(this).data("clicked")==0){
	//         $(this).css("background-color",COLORS_DARK[Number($(this).data("color"))])
	//         $(this).data("clicked",1)
	//     }
	//     else{
	//         $(this).data("clicked",0)
	//         $(this).css("background-color",COLORS_LIGHT[Number($(this).data("color"))])
	//     }
	// })
}
function convertDate(date) {
	date = date.split("T")[0]
	return date.split("-")[2] + "/" + date.split("-")[1] + "/" + date.split("-")[0]
}
async function Table() {
	DB.view = VIEW.Table
	$("#table-container").html("")
	$("#section-timeline").addClass("hidden")
	$("#section-table").removeClass("hidden")
	$(".nav-link").toggleClass("active")
	await loadData()
	window.scrollTo(0, 0)
	let tabledata = []
	for (const item of DB.data) {
		tabledata.push({
			id: item.counter,
			name: item.eventname,
			importance: item.importance,
			start: convertDate(item.eventstart),
		})
	}

	let table = new Tabulator("#table-container", {
		data: tabledata, //load row data from array
		layout: "fitColumns", //fit columns to width of table
		responsiveLayout: "hide", //hide columns that don't fit on the table
		addRowPos: "top", //when adding a new row, add it to the top of the table
		history: true, //allow undo and redo actions on the table
		pagination: "local", //paginate the data
		paginationSize: 50, //allow 7 rows per page of data
		paginationCounter: "rows", //display count of paginated rows in footer
		movableColumns: false, //allow column order to be changed
		initialSort: [
			//set the initial sort order of the data
			{ column: "name", dir: "asc" },
		],
		columnDefaults: {
			tooltip: true, //show tool tips on cells
		},
		columns: [
			//define the table columns
			{ title: "Name", field: "name", editor: false },
			{
				title: "Importance",
				field: "importance",
				hozAlign: "left",
				formatter: "progress",
				editor: false,
				formatterParams: {
					min: 0,
					max: 10,
					color: ["green", "orange", "red"],
				},
			},
			{ title: "Date", field: "start", width: 130, sorter: "date", hozAlign: "center" },
		],
	})
}
