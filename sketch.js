var cnv;

var gameManager;
var dataManager;
var chat;
var userInterface;
var computer;

function setup() {
    cnv = createCanvas(700, 700);       //eigentliche größe 600, 550
    cnv.position((windowWidth - 600)/2, 0);
    gameManager = new GameManager();
    dataManager = new DataManager();
    chat = new Chat(285, 20, 250, 200);
    userInterface = new UserInterface(260, 310);
    dataManager.setup(gameManager, chat);
    gameManager.setup(dataManager);
    chat.setup();
    userInterface.setup(gameManager);
    computer = new Computer();
}

function draw() {
    background(0);
    gameManager.show();
    chat.show();
    if(!gameManager.gameStarted){
        userInterface.show();   
    }
}


//die Methode callInput gibt true zurück wenn sie mit "KeyPressed" aufgerufen wurde
//dadruch wird sichergestellt, dass wenn man was in den chat schreibt man keine 
//Tastenkombination vom GameManager aufrufen möchte
//wird ggf. noch entfernt falls wir uns für buttons entscheiden
function keyPressed(){
    if(!chat.callInput("KeyPressed", [key, keyCode])){
        gameManager.callInput("KeyPressed", key);
    }
    
}   

function mousePressed(){
    gameManager.callInput("MousePressed", createVector(mouseX, mouseY));
    chat.callInput("MousePressed", createVector(mouseX, mouseY));
    userInterface.mousePressed();
} 

function mouseReleased(){
    gameManager.callInput("MouseReleased", createVector(mouseX, mouseY));
    userInterface.mouserReleased();
}

function windowResized(){
    cnv.position((windowWidth - width)/2, 0);
}

window.onbeforeunload = function(){
    alert("Sind sie sicher, dass sie die Website verlassen möchten?");
} 