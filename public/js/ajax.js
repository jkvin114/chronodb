
async function dbList() {
    $("#database-loading").show()
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
        $("#database-loading").hide()
	} catch (e) {
		alert("Error!")
		console.error(e)
		return
	}
}

async function deleteItem(id,reload) {
	try {
		let result = await fetch("/db/event/" + id + "/delete", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
		})
		console.log(result)
		if (result.ok) {
			DB.isRecent = false
			if(reload)
				DB.reload()
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
		const tags = (await (await fetch("/db/" + DB.id + "/tags")).json()).items
		DB.setTags(tags)
		drawTags()
	} catch (e) {
		alert("Error!")
		console.error(e)
		return
	}
}