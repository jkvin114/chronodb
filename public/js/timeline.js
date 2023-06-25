
async function Timeline() {
	DB.view = VIEW.Timeline
	//$("#section-timeline").removeClass("hidden")
//	$("#section-table").addClass("hidden")
	//$(".nav-link").toggleClass("active")
	$("#timeline-container").html("")
    $("#timeline-loading").show()
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
		editable: {
			remove: true,
		},
		selectable: true,
		format: {
			minorLabels: {
				millisecond: "SSS",
				second: "s",
				minute: "HH:mm",
				hour: "HH:mm",
				weekday: "ddd D",
				day: "D",
				week: "w",
				month: "MM",
				year: "YYYY",
			},
			majorLabels: {
				millisecond: "HH:mm:ss",
				second: "D MM HH:mm",
				minute: "ddd D MM",
				hour: "ddd D MM",
				weekday: "MM YYYY",
				day: "MM YYYY",
				week: "MM YYYY",
				month: "YYYY",
				year: "",
			},
		},
		showCurrentTime: false,
		onRemove: function (item, callback) {
			if (confirm('Delete "' + item.name + '"?')) {
				deleteItem(item.id)
				callback(item)
			} else callback(null)
		},
	}
	const items = [
		//  {id: 116, content: item_period("item7",16,7,2),  className:"period",start: '2013-04-27', end: '2023-05-02',order:22,type:"range"},
		//  {id: 126, content: item_period("item9",26,10,7), className:"period", start: '2012-04-27', end: '2025-05-02',order:27,type:"range"}
		//   ,{id:124, content: item_range('item 4',24,4,5), start: '2010-03-16', end: '2013-04-19',className:"color-range",order:20,type:"range"},
	]

	for (const item of DB.data) {
		if (item.eventend && item.isPeriod) {
			let content = item_period(item.eventname, item.counter, item.color, item.importance)
			if (item.thumbnail && item.emojiThumbnail === 0) {
				content = item_period(item.eventname, item.counter, item.color, item.importance, addimg(item.thumbnail))
			} else if (item.emoji && item.emoji !== "undefined") {
				content = item_period(item.eventname, item.counter, item.color, item.importance, addemoji(item.emoji))
			}

			items.push({
				id: item.counter,
				content: content,
				className: "period eventitem-" + item.counter,
				start: item.eventstart.split("T")[0],
				end: item.eventend.split("T")[0],
				order: item.importance + 20,
				name: item.eventname,
			})
		} else if (item.eventend) {
			let content = item_range(item.eventname, item.counter, item.color, item.importance)
			if (item.thumbnail && item.emojiThumbnail === 0) {
				content = item_range(item.eventname, item.counter, item.color, item.importance, addimg(item.thumbnail))
			} else if (item.emoji && item.emoji !== "undefined") {
				content = item_range(item.eventname, item.counter, item.color, item.importance, addemoji(item.emoji))
			}
			items.push({
				id: item.counter,
				content: content,
				className: "color-range eventitem-" + item.counter,
				start: item.eventstart.split("T")[0],
				end: item.eventend.split("T")[0],
				order: item.importance + 10,
				name: item.eventname,
			})
		} else {
			let content = item_moment(item.eventname, item.counter, item.color, item.importance)
			if (item.thumbnail && item.emojiThumbnail === 0) {
				content = item_moment(item.eventname, item.counter, item.color, item.importance, addimg(item.thumbnail))
			} else if (item.emoji && item.emoji !== "undefined") {
				content = item_moment(item.eventname, item.counter, item.color, item.importance, addemoji(item.emoji))
			}
			let type = "box"
			if (item.importance < 4) type = "point"
			items.push({
				id: item.counter,
				content: content,
				className: "eventitem-" + item.counter,
				start: item.eventstart.split("T")[0],
				order: item.importance,
				type: type,
				name: item.eventname,
			})
		}
	}

	const timeline = new vis.Timeline(container, new vis.DataSet(items), options)
    $("#timeline-loading").hide()
	timeline.on("select", function (properties) {
		// console.log(properties.event);
		$(".edit-item").remove()
		if (properties.event.firstTarget.className === "edit-item") {
			openEdit(properties.items[0])

			properties.event.stopPropagation()
			properties.event.preventDefault()
		} else {
			$(".edit-item").remove()
			$(".eventitem-" + properties.items[0])
				.not(".vis-dot")
				.not(".vis-line")
				.append(`<img data-id=${properties.items[0]} class='edit-item' src='edit.svg'>`)
		}
	})

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