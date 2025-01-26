
// function that return the songs;
let currsong=new Audio();
let currfolder;
let songs;

async function getsongs(folder){
    currfolder=folder;
    let x=await fetch(`http://127.0.0.1:5502/Songs/${folder}/`);
    let response = await x.text();
    console.log("response is " + response);
    let div=document.createElement("div");
    div.innerHTML=response;
    let as=div.getElementsByTagName("a");
    console.log(as);

    songs=[];
    
    for (let index = 0; index < as.length; index++) {
        const element = as[index];
        console.log(element);
        if(element.href.endsWith(".mp3")){
            songs.push(element.href.split(`/Songs/${folder}/`)[1]);
        }  
    }
    

     playmusic(songs[0],true);
    let songul=document.querySelector(".songslist").getElementsByTagName("ul")[0];
    songul.innerHTML=" ";

    for (const song of songs) {
        songul.innerHTML = songul.innerHTML + `<li><img width="34" src="Assets/music.svg" alt="">
        <div class="info">
            <div> ${song.replaceAll("%20", " ")}</div>
        </div>

        <div class="playnow">
            <span>Play Now</span>
            <img src="/Assets/play.svg" alt="">
        </div> </li>`;
}
 
    // adding event listener to each songs element
    Array.from(document.querySelector(".songslist").getElementsByTagName("li")).forEach(e=>{
        e.addEventListener("click",element=>{
           playmusic(e.querySelector(".info").firstElementChild.innerHTML.trim());
        })
    })
    console.log("songs = " + songs);
    return songs;
} 
// second to minute convert
function formatTime(seconds) {
    var minutes = Math.floor(seconds / 60);
    var remainingSeconds = Math.round(seconds % 60); // Round seconds to the nearest integer

    var formattedMinutes = ('0' + minutes).slice(-2); // Ensuring 2-digit format for minutes
    var formattedSeconds = ('0' + remainingSeconds).slice(-2); // Ensuring 2-digit format for seconds

    return formattedMinutes + ':' + formattedSeconds;
}

// playmusic function
const playmusic = (track, pause=false)=>{    
    currsong.src=`/Songs/${currfolder}/`+track;
    if(!pause){
        play.src="Assets/pause.svg"
        currsong.play();
    }

    document.querySelector(".songinfo").innerHTML=track.split("(PaglaSongs)")[0];
    document.querySelector(".songtime").innerHTML="00:00 / 00:00" 

}
function find(s){
    for (let index = 0; index < songs.length; index++) {
        const element = songs[index];
        if(element==s){
            return index;
        }
    }
    return -1;
}
// display folder
async function displayfolder(){
    let x=await fetch(`http://127.0.0.1:5502/Songs`);
    let response = await x.text();
    // console.log("end")
    // console.log("folder:")
    // console.log(response);
    let div=document.createElement("div");
    div.innerHTML=response;
    let anchor=div.getElementsByTagName("a");
    let arr=Array.from(anchor);
    // console.log(arr);

    let cardcontainer=document.querySelector(".cardcontainer")

    for (let index = 0; index < arr.length; index++) {
        const e = arr[index];
        if(e.href.includes("/Songs/")){
            let folder=e.href.split("/Songs/")[1].replaceAll("%20"," ");
            // console.log(folder);
            let x=await fetch(`http://127.0.0.1:5502/Songs/${folder}/info.json`)
            let response= await x.json();
            // console.log(response);
            // console.log(response.Title)
            // console.log(response.description)
            
           cardcontainer.innerHTML = cardcontainer.innerHTML +  `<div data-folder="${folder}" class="card">
           <img class="svgimg"src="Assets/playbtn.svg"alt="Error">
          <img src="/Songs/${folder}/cover.jpg" alt="Error">
          <h2>${response.Title}</h2>
          <p>${response.description}</p>
       </div>`
        }
        
    }
}

// get all the songs

 async function main(){
    await getsongs("gym");
    await displayfolder();
    

  
    play.addEventListener("click",func=>{
        if(currsong.paused){
            currsong.play();
            play.src="Assets/pause.svg";
        }
        else{
            currsong.pause();
            play.src="/Assets/play.svg";
        }
    })

    currsong.addEventListener("timeupdate",func=>{
        document.querySelector(".songtime").innerHTML=`${formatTime(currsong.currentTime)}/${formatTime(currsong.duration)}`;
        document.querySelector(".circle").style.left = (currsong.currentTime /currsong.duration)*100 +"%";
    })
    
    document.querySelector(".seekbar").addEventListener("click",e=>{
        let percent=(e.offsetX/e.target.getBoundingClientRect().width)*100;
        document.querySelector(".circle").style.left= percent +"%";
        currsong.currentTime=(currsong.duration * percent)/100;

    })
    document.querySelector(".hamburger").addEventListener("click",()=>{
        document.querySelector(".left").style.left = "0";
        
    })
    document.querySelector(".close").addEventListener("click",()=>{
        document.querySelector(".left").style.left = "-100%";
        
    })
    //  add event listener to the next button 
    next.addEventListener("click",()=>{
        
        let s=currsong.src.split(`/Songs/${currfolder}/`)[1];


        let index= find(s);
        if(index+1<songs.length){
            playmusic(songs[index+1]);
        }
        
    })

    //  add event listener to the prev button 
    prev.addEventListener("click",()=>{


        let s=currsong.src.split(`/Songs/${currfolder}/`)[1];


        let index= find(s);

        if(index-1>=0){
            playmusic(songs[index-1]);
        }
    })
    document.querySelector(".vol").getElementsByTagName("input")[0].addEventListener("change",(e)=>{

        currsong.volume=(e.target.value)/100;
    })

    // laod the songs for folder 
  Array.from(document.getElementsByClassName("card")).forEach(e=>{
    e.addEventListener("click", async item=>{
        songs=await getsongs(`${item.currentTarget.dataset.folder}`);
        playmusic(songs[0]);

    })

  })
  document.querySelector(".vol > img").addEventListener("click",e=>{
    // console.log(e.target)
    // console.log(e.target.src)
    if(e.target.src.includes("vol.svg")){
       e.target.src= e.target.src.replace("vol.svg","mute.svg");
       currsong.volume=0;
       document.querySelector(".vol").getElementsByTagName("input")[0].value=0;
    }
    else{
        e.target.src= e.target.src.replace("mute.svg","vol.svg");
        currsong.volume=1;
        document.querySelector(".vol").getElementsByTagName("input")[0].value=100;
        
    }
  })

 }
 main();
