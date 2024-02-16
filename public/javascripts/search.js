const input=document.querySelector("#input")
let clutter=""
input.addEventListener("input",(e)=>{
    axios.get(`/username/${e.target.value}`).then(data=>{
        console.log(data.data)
        data.data.forEach(data=>{
            clutter=""
            clutter+=`
            <div class="user flex">
            <img src=/images/uploads/${data.profileImage} alt="">
            <div class="username-div">
                <h3 class="username">${data.username}</h3>
                <h4 class="name">${data.name}</h4>
            </div>
        </div>
            `
        })
        document.querySelector(".users").innerHTML=clutter
    })
})