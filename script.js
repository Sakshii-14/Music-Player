// Constants
const CLIENT_ID = '78e1fa57951740b3a43c7cbe1775eb77';
const CLIENT_SECRET = 'b6ae33a394704178a1c83637be8e9bbe';
const AUTH_URL = "https://accounts.spotify.com/api/token";

// Get an access token
async function getAccessToken(clientId, clientSecret) {
    const authResponse = await fetch(AUTH_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Authorization': 'Basic ' + btoa(clientId + ':' + clientSecret)
        },
        body: 'grant_type=client_credentials'
    });

    const authData = await authResponse.json();
    return authData.access_token;
}
async function getArtistInfo(accessToken) {
    const data = await fetch('https://api.spotify.com/v1/search?q=us&type=track', {
        headers: {
            'Authorization': 'Bearer ' + accessToken // Replace accessToken with the token you obtained
        }
    });
    const result = await data.json();
    return result;


}
let isclicked = false;
let songsarray = [];
(async () => {
    const accessToken = await getAccessToken(CLIENT_ID, CLIENT_SECRET);

    const songdata = await getArtistInfo(accessToken);
    songsarray = [...(songdata.tracks.items)];
    console.log(songsarray);

    let cover = document.querySelector("#cover");
    cover.src = `${songsarray[0].album.images[1].url}`;

    let songname = document.querySelector("#songname");
    songname.innerHTML = `${songsarray[0].album.name}`

    let author = document.querySelector("#author");
    let artistsarray = [...(songsarray[current].artists)];
    let newarr = artistsarray.map(elem => {
        return elem.name
    })
    author.innerHTML = newarr.join(' , ');
    
    let buttons = document.querySelectorAll("button");
    buttons.forEach((elem) => {
        elem.addEventListener("click", () => {
            handleclick(elem)
        })
    })

})();

let current = 0;
let duration = 0;
let currtime = 0;
function handleclick(button) {

    //console.log(button.dataset.act);
    if (button.dataset.act === "play") {
        isclicked = !isclicked;
        if(isclicked)
        {
            button.classList.replace("bg-[#C93B76]","bg-[#f9579a]");
            button.classList.add("shadow-[#C93B76]");
            button.classList.add("shadow-md");
        }
        else 
        {
            button.classList.replace("bg-[#f9579a]","bg-[#C93B76]");
            button.classList.remove("shadow-[#C93B76]");
            button.classList.remove("shadow-md");
        }
        setMusic(current, button);
        return;
    }
    else if (button.dataset.act === "forward") {
        if (current === songsarray.length - 1) current = 0;
        else current += 1;
        progress.style.maxWidth = "0";
        currtime = 0;
        duration = 0;
    }
    else if (button.dataset.act === "backward") {
        if (current === 0) current = songsarray.length - 1;
        else current -= 1;
        currtime = 0;
        duration = 0;
    }
    setMusic(current, button);
}

let player = document.querySelector("#song");

function setMusic(current, button) {
    let box = document.querySelector(".box");
    console.log(box.offsetHeight);
    if (player.src !== songsarray[current].preview_url) {
        if (songsarray[current].preview_url !== null) {
            getDetails(current);
            player.src = `${songsarray[current].preview_url}`;
            player.addEventListener('loadedmetadata', function () {
                duration = player.duration;
                console.log('Song duration (seconds):', duration);
            })
            player.addEventListener("timeupdate", () => { handleprogress(duration) });
            player.addEventListener("ended",handleend);
            player.volume=1;
            player.play();
            return;
        }
        else {
            handleclick(button);
        }
    }
    if (isclicked) {
        player.currentTime = currtime;
        console.log(currtime);
        player.play();
    }
    else {

        currtime = player.currentTime;
        console.log(currtime);
        player.pause();
    }
}


function handleend(){
    let buttons=document.querySelectorAll("[data-act='forward']");
    buttons.forEach(elem=>elem.click());
}  

let bar = document.querySelector(".bar");
let progress = bar.querySelector(".glow-wrapper");
let mousedown = false;
let startmin = document.querySelector("#startmin");
let startsec = document.querySelector("#startsec");
let minutes = document.querySelector("#minutes");
let seconds = document.querySelector("#seconds");
function handleprogress(duration) {

    let min = Math.round(duration / 60);
    let sec = Math.round(duration % 60);
    minutes.innerHTML = min < 10 ? '0' + min : min;
    seconds.innerHTML = sec < 10 ? '0' + sec : sec;
    let remainingmin = Math.round(player.currentTime / 60);
    let remainingsec = Math.round(player.currentTime % 60);
    startmin.innerHTML = remainingmin < 10 ? '0' + remainingmin : remainingmin;
    startsec.innerHTML = remainingsec < 10 ? '0' + remainingsec : remainingsec;
    let percent = (player.currentTime / duration) * 100;
    progress.style.maxWidth = `${percent}%`;


}

bar.addEventListener("mousedown", () => { mousedown = true; })
bar.addEventListener("mousemove", (e) => { mousedown && handleseek(e) })
bar.addEventListener("mouseup", () => { mousedown = false; })
bar.addEventListener("click", handleseek);

function handleseek(e) {
    console.log(e.offsetX);
    console.log(bar.offsetWidth);
    let seekpoint = (e.offsetX / bar.offsetWidth) * duration;
    currtime=seekpoint;
    player.currentTime=seekpoint;
    setMusic();
   
}

function getDetails(current) {
    let songname = document.querySelector("#songname");
    let author = document.querySelector("#author");
    let cover = document.querySelector("#cover");
    let artistsarray = [...(songsarray[current].artists)];
    cover.src = `${songsarray[current].album.images[1].url}`;
    songname.innerHTML = `${songsarray[current].album.name}`
    let newarr = artistsarray.map(elem => {
        return elem.name
    })
    author.innerHTML = newarr.join(' , ');

    console.log(artistsarray);
    console.log(songsarray[current].album.images);
    console.log(songsarray[current].album.name);
}

let volmouse=false;
let vol=0;
let volumes=document.querySelectorAll(".volumes");
volumes.forEach(volume=>volume.addEventListener("mousedown",()=>volmouse=true))
volumes.forEach(volume=>volume.addEventListener("mouseup",()=>volmouse=false))
volumes.forEach(volume=>volume.addEventListener("mousemove",(e)=>volmouse && handlechange(e)))
volumes.forEach(volume=>volume.addEventListener("change",handlechange))
function handlechange(e){
   
    player.volume=e.target.value;
}
let searchinput=document.querySelector("#searchinput");
let ul=document.querySelector("#items");
searchinput.addEventListener("keyup",searchValue);
function searchValue(){
    console.log(searchinput.value);
    const regex=new RegExp(`${this.value}`,"gi");
    let filteredarray=songsarray.filter((elem)=>{
       if(elem.preview_url!==null){
        let str= elem.album.name;
        return str.matchAll(regex)
       }
       
    })
    let html=filteredarray.map((elem)=>{
        const name=elem.album.name.replace(regex,`<span class="hl">${this.value}</span>`)
        return `
        <li>${name}</li>`;
    })
    
    if(searchinput.value!=='')
    {
        console.log(html);
        ul.classList.replace("hidden","block");
        ul.innerHTML=html.join('');
    }
    else {
        ul.classList.replace("block","hidden");
    }
    let list=document.querySelectorAll('li');
    list.forEach(elem=>elem.addEventListener("click",playlist));
}
function playlist(){
    console.log(this.innerText);
    let str=this.innerText;
    let val=str[0].toUpperCase() + str.substring(1);
    let index=songsarray.findIndex(elem=>elem.album.name===val);
    console.log(index);
    current=index;
    isclicked=true;
    setMusic(index);
    ul.classList.replace("block","hidden");
    searchinput.value="";
}
