const gameboardcontainer=document.querySelector('#gamesboard-preview')
const container=document.querySelector('.option-container');
const flipbutton=document.querySelector('#flip-option');
const startButton =document.querySelector('#Start-option');
const infoDisplay=document.querySelector('#Info');
const turnDisplay=document.querySelector('#turn-display');

let angle=0;
//options for flip
function flip(){
    const optionships=(Array.from(container.children));// more traditional way 
   // if(angle===0){
   //     angle=90;
   /// }
   // else{
      //  angle=0;
   // }
   angle=angle === 0 ? 90 :0;// same as the if above
    optionships.forEach(optionship=>optionship.style.transform=`rotate(${angle}deg)`)

}
flipbutton.addEventListener('click',flip);

// creating two boards

const width=10;

function createboards(color,user){
   const gameboard = document.createElement('div');
   gameboard.classList.add('game-board');
   gameboard.style.backgroundColor=color;
   gameboard.id=user;

   for(let i=0;i<width*width; i++){
      const block=document.createElement('div');
      block.classList.add('block');
      block.id=i;
      gameboard.append(block);

   }
   gameboardcontainer.appendChild(gameboard);
}
createboards('yellow','player');
createboards('pink','computer');

// creating ships

class ship{
constructor(name,length){

   this.name=name;
   this.length=length;
}
}
const destroyer=new ship('destroyer',2);
const submarine=new ship('submarine',3);
const cruiser=new ship('cruiser',3);
const battleship=new ship('battleship',4);
const carrier=new ship('carrier',4);

const ships = [destroyer,submarine,cruiser,battleship,carrier]
let notDropped


function getValidity(allBoardBlocks,isHorizontal,startIndex,ship){

   let validStart = isHorizontal
   ? startIndex <= width * width - ship.length
       ? startIndex
       : width * width - ship.length
   : startIndex <= width * width - width * ship.length
   ? startIndex
   : startIndex - ship.length * width + width;

let shipBlocks = [];

// Add horizontal or vertical ship blocks
for (let i = 0; i < ship.length; i++) {
   if (isHorizontal) {
       const block = allBoardBlocks[Number(validStart) + i];
       if (block) shipBlocks.push(block); // Only push if block exists
   } else {
       const block = allBoardBlocks[Number(validStart) + i * width];
       if (block) shipBlocks.push(block); // Only push if block exists
   }
}

// Ensure all blocks are valid (no undefined blocks)
if (shipBlocks.length !== ship.length) {
   // If ship blocks are incomplete, try again for computer ships
   if (user === 'computer') addShipPiece('computer', ship);
   if (user === 'player') notDropped = true;
   return;
}

let valid;
if (isHorizontal) {
   valid = shipBlocks.every((_shipBlock, index) =>
       _shipBlock && Number(_shipBlock.id) % width + shipBlocks.length <= width
   );
} else {
   valid = shipBlocks.every((_shipBlock, index) =>
       _shipBlock && Number(_shipBlock.id) + (ship.length - 1) * width < width * width
   );
}

const notTaken = shipBlocks.every(shipBlock => !shipBlock.classList.contains('taken'));
 
return{shipBlocks,valid,notTaken}

}
 
// adding ships 

function addShipPiece(user, ship, startId) {
   const allBoardBlocks = document.querySelectorAll(`#${user} .block`);
   const randomBoolean = Math.random() < 0.5;
   let isHorizontal = user === 'player' ? angle === 0 : randomBoolean;
   let startBoardIndex = Math.floor(Math.random() * width * width);

   let startIndex = startId ? startId : startBoardIndex;
  
   const{shipBlocks,valid,notTaken}=getValidity(allBoardBlocks,isHorizontal,startIndex,ship)
  
   if (valid && notTaken) {
       shipBlocks.forEach(shipBlock => {
           shipBlock.classList.add(ship.name);
           shipBlock.classList.add('taken');
       });
   } else {
       if (user === 'computer') addShipPiece('computer', ship); // Retry for computer
       if (user === 'player') notDropped = true; // Mark as not dropped for player
   }
}


ships.forEach(ship=>addShipPiece('computer',ship));

// drag player ship 
let draggedShip

const optionShips= Array.from(container.children)
optionShips.forEach(optionship=>optionship.addEventListener('dragstart',dragStart))

function dragStart(e){
   draggedShip=e.target

   // writing general for how a player will drag or drop

   const allPlayerBlocks=document.querySelectorAll('#player div')
   allPlayerBlocks.forEach(playerBlock=>{
      playerBlock.addEventListener('dragover',dragOver)
      playerBlock.addEventListener('drop' , dropShip)


   })
   function dragOver(e){
      notDropped=false;
      e.preventDefault();
      const ship=ships[draggedShip.id]
      highlightArea(e.target.id,ship)
   }
   function dropShip(e){
      const startId=e.target.id
      const ship=ships[Number(draggedShip.id)]
      addShipPiece('player',ship,startId)
      if(!notDropped){
         draggedShip.remove()
      }
   }
}

// addd highlight 
function highlightArea(startIndex,ship){

   const allBoardBlocks=document.querySelectorAll('#player div')
   let isHorizontal= angle===0

 const {shipBlocks,valid,notTaken} = getValidity(allBoardBlocks,isHorizontal,startIndex,ship)

 if(valid && notTaken){
   shipBlocks.forEach(shipBlock=>{
      shipBlock.classList.add('hover')
      setTimeout(()=>shipBlock.classList.remove('hover'),500)
   })
 }

}

// foe game over

let gameOver =false;
 let playerTurn


 // start game

 function startGame(){
   if(playerTurn===undefined){
      if(container.children.length!=0){
         infoDisplay.textContent='please place all your pieces first'
         }
         else{
           const allBoardBlocks=document.querySelectorAll('#computer div')
           
           allBoardBlocks.forEach(block => {
              block.addEventListener('click', handleClick)});
         
         playerTurn=true
         turnDisplay.textContent='Your Go'
         infoDisplay.textContent='The Game has Started '
         }

   }
}

 
 startButton.addEventListener('click', startGame)

 let playerHits=[]
 let computerHits=[]
 let playerSunkShips=[]
let computerSunkShips=[]

 function handleClick(e){
   if(!gameOver){
      if(e.target.classList.contains('taken')){
         e.target.classList.add('boom')
         infoDisplay.textContent='You hit the computer ship '
         let classes=Array.from(e.target.classList)
       classes = classes.filter(className=>className!=='block')
       classes = classes.filter(className=>className!=='boom')
       classes = classes.filter(className=>className!=='taken')
       playerHits.push(...classes)
      
       checkScore('player',playerHits,playerSunkShips)
      }
      if(!e.target.classList.contains('taken')){
         infoDisplay.textContent='nothing hits this time.'
         e.target.classList.add('empty')
      }
      playerTurn=false;
      const allBoardBlocks=document.querySelectorAll('#computer div')
      allBoardBlocks.forEach(block=> block.replaceWith(block.cloneNode(true)))
      setTimeout(computerGo,3000)
   }

 }
 
 // define computers go 

 function computerGo(){
   if(!gameOver){
      turnDisplay.textContent='computers go'
      infoDisplay.textContent='the computer is thinking ....'

      setTimeout(()=>{
         let randomGo =Math.floor(Math.random()*width*width)
         const allBoardBlocks=document.querySelectorAll('#player div')

         if(allBoardBlocks[randomGo].classList.contains('taken') && allBoardBlocks[randomGo].classList.contains('boom')){

            computerGo()
            return;
         }
         else if 
            (allBoardBlocks[randomGo].classList.contains('taken') && !allBoardBlocks[randomGo].classList.contains('boom')){
               allBoardBlocks[randomGo].classList.add('boom')
               infoDisplay.textContent='the computer hit your ship!'
               let classes=Array.from(allBoardBlocks[randomGo].classList)
               classes = classes.filter(className=>className!=='block')
               classes = classes.filter(className=>className!=='boom')
               classes = classes.filter(className=>className!=='taken')
               computerHits.push(...classes)
               checkScore('computer',computerHits,playerSunkShips)
            }

         else{
            infoDisplay.textContent='nothing hits this time'
            allBoardBlocks[randomGo].classList.add('empty')
         }
      },3000)

      setTimeout(()=>{
         playerTurn=true
         turnDisplay.textContent='your go'
         infoDisplay.textContent='please take our go'
         const allBoardBlocks=document.querySelectorAll('#computer div')
         allBoardBlocks.forEach(block=> block.addEventListener('click',handleClick))
      },6000)
   }
 }

 // check how many ships we have hit so far 

 function checkScore(user,userHits,userSunkShips){
   function checkShip(shipName,shipLength){
      if(userHits.filter(storedShipName=>storedShipName === shipName).length=== shipLength){
         infoDisplay.textContent=`u sunk the ${user}'s  ${shipName}`
         if(user === 'player'){
            playerHits=userHits.filter(storedShipName =>storedShipName!==shipName)
         }
         if(user === 'computer'){
            computerHits=userHits.filter(storedShipName =>storedShipName!==shipName)
         }
         userSunkShips.push(shipName)
      }

   }

   checkShip('destroyer',2)
   checkShip('submarine',3)
   checkShip('cruiser',3)
   checkShip('battleship',4)
   checkShip('carrier',5)

   console.log('playerHits',playerHits)
   console.log('playerSunkShips',playerSunkShips)

   if(playerSunkShips.length===5){
      infoDisplay.textContent='you have sunk all the computers ship. You  WON !'
      gameOver=true;
   }

   if(computerSunkShips.length===5){
      infoDisplay.textContent='your ships are sunk by computer. You LOOSE !'
      gameOver=true;
   }
 }