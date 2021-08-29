import React from "react";
import "./components.css"
import ReactPlayer from "react-player";

class Game extends React.Component{

    constructor(props){
        super(props);
        this.state = {recorder:null,
            youTubeVideoUrlPool:[
                ["https://youtu.be/ZELd-PHliNU", "https://youtu.be/wQVbqP4fKX8", "https://youtu.be/16-FQFLHTGU", "https://youtu.be/Y3Pu9yLdJS8", "https://youtu.be/3XTGjQzD4T4"],
                ["https://youtu.be/R6id8iT-V3Y", "https://youtu.be/98ALw97exrc", "https://youtu.be/ACopNLsdr0U", "https://youtu.be/EfPKpN0We9Q", "https://youtu.be/VV50jcTwS7Y"],
                ["https://youtu.be/zVtD40GVp5M", "https://youtu.be/IyKDDUg70M4", "https://youtu.be/IyKDDUg70M4", "https://youtu.be/odLqTheH11M", "https://youtu.be/75quC4Eszuw"],
                ["https://youtu.be/T0WN-VdDcxM", "https://youtu.be/2SLCSluURwU", "https://youtu.be/J7QEbaPI66k", "https://youtu.be/ShQSujRprn0", "https://youtu.be/AOXn9BD6jn0"],
                ["https://youtu.be/33MycV47bbo", "https://youtu.be/55rfMXqrb4Q", "https://youtu.be/FhtJ_ZteuoI"],
                [["https://youtu.be/MeqbuH_VoFg", "https://youtu.be/LOT-Ovqr5Dk"], ["https://youtu.be/qN4ISnWcaAA", "https://youtu.be/_OIz4_8yCxY"]]
            ],
            questionPool:null,
            index:0
        }
    }

    componentDidMount(){
        if("mediaDevices" in navigator && "getUserMedia" in navigator.mediaDevices){
            navigator.mediaDevices.getUserMedia({video:true})
            .then(mediaStream=>{
              const video = document.querySelector("#self");
              video.srcObject = mediaStream;
              video.onloadedmetadata = e => {
                video.play();
              };
              this.screenRecorder(mediaStream);
            });
        }
    }

    loadQuestions = _=>{
        let questionArr = [], counter = 1;
        for(let el of this.state.youTubeVideoUrlPool){
            if(counter === 6){
                let targetEl = el[Math.round(Math.random())];
                questionArr.push(targetEl[0]);
                questionArr.push(targetEl[1]);
            }else{
                questionArr.push(el[Math.round(Math.random()*(el.length-1))]);
                counter++;
            }
        }
        this.setState({questionPool:questionArr});
    }

    screenRecorder = async _=>{
        const ac = new AudioContext();
        const screenStream = await navigator.mediaDevices.getDisplayMedia({
            audio: true,
            video: true
        });
        const micStream = await navigator.mediaDevices.getUserMedia({audio:true});
        const dest = ac.createMediaStreamDestination();
        // const screenAudio = screenStream.getAudioTracks();
        const screenAC = ac.createMediaStreamSource(screenStream);
        const micAC = ac.createMediaStreamSource(micStream)
        screenAC.connect(dest);
        micAC.connect(dest);

        dest.stream.addTrack(screenStream.getVideoTracks()[0]);

        const recorder = new MediaRecorder(dest.stream);
        this.setState({recorder:recorder});
        const chunks = [];
        recorder.ondataavailable = e => chunks.push(e.data);
        recorder.start();
        recorder.onstop = e => {
            const completeBlob = new Blob(chunks, {type: "video/mp4"});
            const vid = URL.createObjectURL(completeBlob);
            this.downloadHelper(vid);
        }
    }

    downloadHelper = url =>{
        const a = document.createElement("a");
        a.href = url;
        a.download = "recording";
        a.click();
        URL.revokeObjectURL(url);
    }

    stopRecording = _=>{
        try{
            document.getElementById("toggleRec").style.animationName = "stopRecording";
            this.state.recorder.stop();
        }catch(err){
            window.alert("There was a problem with the recording... \nMake sure you are allowing access to the camera and mic");
            window.location.reload();
        }
    }


    arrayParser = _=>{
        const url = this.state.questionPool[this.state.index];
        return url;
    }

    incrementIndex = direction =>{
        if(direction===1){
            if(this.state.index<6){this.setState({index:parseInt(this.state.index)+parseInt(1)})};
        }else{
            if(this.state.index>0){this.setState({index:this.state.index-1})};
        }
    }

    render(){
        let rendered;
        if(this.state.questionPool===null){
            rendered = "Now Loading...";
            this.loadQuestions();
        }else{
            const currentUrl = this.arrayParser();
            rendered =  <ReactPlayer id="other" playing={true} url={currentUrl}/>;
        }

        return(
            <>
                <div id="container">
                    <video id="self" muted/>
                   {rendered}
                </div>
                <div id="manualCnt">
                    <div id="backBtn" onClick={_=>this.incrementIndex(0)}/>
                    <div id="toggleRec" onClick={this.stopRecording}/>
                    <div id="nextBtn"  onClick={_=>this.incrementIndex(1)}/>
                </div>
            </>
        );
    };
}

export {Game};