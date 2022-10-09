class StateObject{
    constructor(Previous, Target, Tile){
        this.Previous = Previous;
        this.Target = Target;
        this.Tile = Tile;
    }
}
//#region Variables
var GameOver = 0;
//Timer Variables 
var TimePerTile = 20;
var startingTimerValue = TimePerTile * 3;
var sec = startingTimerValue;
var TimerSwitch = 0;

//Plates Variables
NoPlates = 0;
PlatesLimit = 7;
moves = 0;

//States Lists
var UndoStates = [];
var RedoStates = [];
console.log(UndoStates.length, RedoStates.length);


//Colors List
let colors = [
    '#fdcb6e',
    '#55efc4',
    '#74b9ff',
    '#fd9644',
    '#ff7675'
    
]
//#endregion


function Reset() {
    let content = localStorage.getItem("initialhtml");
    if (content) {
        document.body.innerHTML = content;
        NoPlates = 0;
        sec = startingTimerValue;
        TimerSwitch = 0
        GameOver = 0;
        moves = 0;
        UndoStates =[];
        RedoStates = [];
        MakePlate(3);
        SetTimeValue();
    }
}
function Undo(){
    if(UndoStates.length>0)
    {
        let state = UndoStates.pop();
        let RedoObj= new StateObject(state.Target, state.Previous, state.Tile);
        RedoStates.push(RedoObj);
        state.Previous.appendChild(state.Tile);
        document.getElementById("13").innerHTML = "Moves: "+ (moves-=1);
        
    }
}
function Redo(){
    if(RedoStates.length>0)
    {
        let state = RedoStates.pop();
        let UndoObj= new StateObject(state.Target, state.Previous, state.Tile);
        UndoStates.push(UndoObj);
        state.Previous.appendChild(state.Tile);
        document.getElementById("13").innerHTML = "Moves: "+ (moves+=1);
        
    }
}


function allowDrop(ev) {
    ev.preventDefault();
  }
function Drop(ev)
{

    //After every move we need to save the current state of the game to provide the Undo and Redo Functionality to user.
    
    
    //SaveState();
    var current_tile = document.getElementById(ev.dataTransfer.getData("span"));
    var EndChild = ev.target.childNodes[ev.target.childNodes.length-1];
    if(EndChild == null || current_tile == null)
    {
        //Checking if the Last Child of target is NULL or not.
        return;
    }
    else if(((current_tile.id) < (EndChild.id)) ){
        //Bonus Part where we make sure that user cannot stack a larger tile over smaller tile.
        return;
    }
    else{
        let obj = new StateObject(current_tile.parentElement,ev.target, current_tile);
        console.log(obj);
        UndoStates.push(obj);

        document.getElementById("13").innerHTML = "Moves: "+ (moves+=1);
        ev.target.appendChild(current_tile);
        return;
    }
}
function Drag(ev)
{
    //Checking if User has changed the no of plates and then increasing the timer values based on the extra tiles.
    if(NoPlates>3 && sec == startingTimerValue)
    {
        let diff = NoPlates - 3;
        sec = sec + (diff*TimePerTile);
    }
    TimerSwitch = 1;
    //Setting the swith of timer to ON here, because we want to start the timer right after the first action of user.
    if(document.getElementById("Platesbtnid").disabled == false)
    {
        //Disabling the interaction of user with Plates+ and Plates- button after right after the first move.
        document.getElementById("Platesbtnid").disabled = true;
        document.getElementById("PlatesbtnReduceid").disabled = true;
        document.getElementById("Platesbtnid").style.backgroundColor = "black";
        document.getElementById("PlatesbtnReduceid").style.backgroundColor = "black";
        //Enabling the Reset Button here Because at start there's no need of enabling Reset Button.
        document.getElementById("ResetBtn").disabled = false;
        document.getElementById("ResetBtn").style.backgroundColor = "darkorchid";

        document.getElementById("TimerIncId").disabled = true;
        document.getElementById("TimerIncId").style.backgroundColor = "black";

    }
    if(ev.target.parentNode.childNodes[ev.target.parentNode.childNodes.length-1].id > ev.target.id){
        //Checking if user is selecting the tile from middle of stack and if that's the case then simple return and do nothing. 
        return;
    }
    ev.dataTransfer.setData("span", ev.target.id);
}




function RemovePlate(){
    if(NoPlates>3)
    {
        let container= document.getElementById("1");
        let lastPlate = document.getElementById("20"+(NoPlates));
        NoPlates-=1;
        container.removeChild(lastPlate);
    }
        
}
function MakePlate(init){
    if(NoPlates<PlatesLimit)
    {
        for (let i =0; i<init; i++)
        {
            NoPlates+=1;
            let container= document.getElementById("1");
            let spa = document.createElement('span');
            spa.id = '20'+ NoPlates;
            spa.style.backgroundColor = colors[(NoPlates-1)%colors.length];
            spa.style.zIndex= 100;
            spa.style.width =   300-(NoPlates*40) +'px';
            spa.style.height = 20 + 'px';
            //spa.innerText = "Tile:" + String(NoPlates+1);
            spa.style.textAlign = "center";
            spa.style.fontSize = 15+'px';
            spa.style.borderRadius = 0.7+'rem'
            spa.draggable = true;
            spa.style.cursor = "pointer";
            spa.addEventListener("dragstart", Drag);
            container.appendChild(spa);
        }
    }
    
}

function SetTimeValue(){
    document.getElementById("12").innerHTML = "Time Limit: " + sec + " s";
}
function IncreaseTime(){
    sec+=TimePerTile;
    SetTimeValue();
}
function GameWin(){
    var PlatesInOrder = 0;
    var col3 = document.getElementById('3');
    
    var val = 200;
    //console.log("Total Childs: "+col3.childNodes.length);
    for( var i = 1;i<col3.childNodes.length; i+=1 )
    {   
        val+=1;
        if(parseInt(col3.childNodes[i].id) == val){
            PlatesInOrder+=1;
        }
    }
    if(PlatesInOrder == NoPlates)
        return "GameWon";
    else
    return "continue";
}
function timer(){
    
   
    var timer = setInterval(function(){
        if(TimerSwitch == 1)
        {
            let WinningCondition = GameWin();
            if(WinningCondition == "continue"){
                document.getElementById("11").innerHTML = "Time Left " + sec + "s";
                sec-=1;
                if(sec<0)
                {
                    GameOver = 1;
                    TimerSwitch = 0;
                    document.getElementById("PopImg").src = "Loser.gif"
                    document.getElementById("PopTitle").innerText = "Time Over!";
                    document.getElementById("PopMsg").innerText = "Press Restart To Start The Game Again...";
                    document.getElementById("ResetbtnId").innerText = "RESTART";
                    openPopup();
                }
            }
            else{
                document.getElementById("PopImg").src = "Victory.gif"
                document.getElementById("PopTitle").innerText = "Victory!";
                document.getElementById("PopMsg").innerText = "Congratulations, You Have Won The Game...";
                document.getElementById("ResetbtnId").innerText = "PLAY AGAIN";
                openPopup();

            }
        }
    }, 1000);
}

function WelcomePopup(){
    document.getElementById("PopImg").src = "welcome.gif";
    document.getElementById("PopTitle").innerText = "WELCOME!";
    document.getElementById("PopMsg").innerText = "Rules: \n1.Stack all the plates in third column in Descending order from bottom to top.\n2.Complete the game in limited time (Time Limit can only be changed at the start of the game).\n3.Plates can only be increased or decreased at the start of the Game.\n\n\nPress Start To Launch Game...";
    document.getElementById("ResetbtnId").innerText = "START";
    openPopup();
    UndoStates.push(document.getElementById("upperContainer").innerHTML);
RedoStates.push(document.getElementById("upperContainer").innerHTML);
}
function openPopup(){
    let popup = document.getElementById("popupid");
    popup.classList.add("open-popup");
}

function closePopup(){
    let popup = document.getElementById("popupid");
    popup.classList.remove("open-popup");

}
localStorage.setItem("initialhtml", document.body.innerHTML);
