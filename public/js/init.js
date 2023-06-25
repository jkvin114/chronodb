
$("document").ready(function () {
	let query = new URLSearchParams(window.location.search)
	let id = query.get("db")

	

	if (!id) {
        $(".nav-item").hide()
		dbList()
		return
	}
	else{
        $(".nav-item").show()
    }
    $(".view-nav").click(function(){
		$(".view-nav .nav-link").removeClass("active")
		$(this).children(".nav-link").addClass("active")
		changeView($(this).data("view"))
	})
	$("#section-databases").hide()
	$("#section-input").show()
	//DB.id=sessionStorage.dbid
	DB.id = id
	if (!DB.id) DB.id = 1
	changeView("album")
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
	$("#submit-event").click(() => createEvent())
	$("#submit-event-edit").click(function () {
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
	inputImage.addEventListener("change", (e) => {
		let input = e.target
		if (input.files && input.files[0]) {
			// 이미지 파일인지 검사 (생략)
			// FileReader 인스턴스 생성
			const reader = new FileReader()
			// 이미지가 로드가 된 경우
			reader.onload = (e) => {
				$("#thumbnail").html("<img src='" + e.target.result + "'>")
			}
			// reader가 이미지 읽도록 하기
			reader.readAsDataURL(input.files[0])
		}
	})
})