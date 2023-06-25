async function Gallery() {
    
	DB.view = VIEW.Album
	await loadData()
    
	window.scrollTo(0, 0)
	let html=""
	for (const item of DB.data) {
        if(item.thumbnail!=null){
            html+=`<a class=gallery-item data-src='uploads/${item.thumbnail}' data-name='${item.eventname}'><img  src="uploads/${item.thumbnail}"></a>`
        }
    }
    $("#gallery-container").html(html)
    if(html===""){
        $("#gallery-container").html(`<img class='empty-gallery-img' src="./empty.png" alt="image">`)
    }

    $(".gallery-item").click(function(){
        console.log("imageclick")
        let winratio=window.innerHeight/window.innerWidth
        let imgratio=$(this).height()/$(this).width()
        $("body").append(`
          <div id="imageview">
            <b class=imageview-text>${$(this).data("name")}</b>
            <img src="${$(this).data("src")}">
          </div>
        `)
        if(winratio < imgratio){
          $("#imageview img").css("height","100%")
          $("#imageview img").css("width","auto")
        }
        
        $("html").css("overflow","hidden")
  
        $("#imageview").click(function(){
          $("#imageview").remove()
          $("html").css("overflow","auto")
        })
      });
}