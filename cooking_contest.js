//---------------------------------- init ----------------------------------------
const numAllCustomers = 20;
const kitchen = "#####D#####,#1.....0..#,#.####.##.#,#.#..#..#.#,#.##.####.B,#.........#,#####WI####".split(",").map((line) => {return line.split("")});
console.log(kitchen)
var customerList = [ [ 'DISH-BLUEBERRIES-ICE_CREAM', 650 ],
  [ 'DISH-BLUEBERRIES-ICE_CREAM', 650 ],
  [ 'DISH-BLUEBERRIES-ICE_CREAM', 650 ],
  [ 'DISH-BLUEBERRIES-ICE_CREAM', 650 ],
  [ 'DISH-ICE_CREAM-BLUEBERRIES', 650 ],
  [ 'DISH-BLUEBERRIES-ICE_CREAM', 650 ],
  [ 'DISH-ICE_CREAM-BLUEBERRIES', 650 ],
  [ 'DISH-BLUEBERRIES-ICE_CREAM', 650 ],
  [ 'DISH-BLUEBERRIES-ICE_CREAM', 650 ],
  [ 'DISH-ICE_CREAM-BLUEBERRIES', 650 ],
  [ 'DISH-ICE_CREAM-BLUEBERRIES', 650 ],
  [ 'DISH-BLUEBERRIES-ICE_CREAM', 650 ],
  [ 'DISH-BLUEBERRIES-ICE_CREAM', 650 ],
  [ 'DISH-BLUEBERRIES-ICE_CREAM', 650 ],
  [ 'DISH-ICE_CREAM-BLUEBERRIES', 650 ],
  [ 'DISH-BLUEBERRIES-ICE_CREAM', 650 ],
  [ 'DISH-ICE_CREAM-BLUEBERRIES', 650 ],
  [ 'DISH-ICE_CREAM-BLUEBERRIES', 650 ],
  [ 'DISH-ICE_CREAM-BLUEBERRIES', 650 ],
  [ 'DISH-BLUEBERRIES-ICE_CREAM', 650 ] ];
//player stats
var playerX = 1;
var playerY = 6;
var playerItem = "NONE";
//partner stats
var partnerX = 9;
var partnerY = 4;
var partnerItem = "NONE";
//table stats
var numTablesWithItems = 0;
var tables = [];
//oven stats
var ovenContents = "NONE";
var ovenTimer = 0;
//customer stats
var numCustomers = 3;
var customersWaiting = [];

//food info
const reachDish = [[4,1],[5,1],[6,1]];
const reachWindow = [[5,5],[5,5],[6,5]];

var turnsRemaining = 1;
// game loop
while (turnsRemaining > 0) {
    
    turnsRemaining--;

    numCustomers = customerList.length >= 3 ? 3 : customerList.length;
    customersWaiting = customerList.slice(0,numCustomers);

    main();
    
}

//------------------------- main function --------------------------------------

function main() {

	let action = chooseAction();

	console.log(action);
}

//---------------------------------- game specific functions -----------------------------
function chooseAction() {

		switch (playerItem) {

			case 'NONE':

				if (contains(reachDish,[playerX,playerY])) {

					return useDish();
				}

				else {
				    
					return walkToDish();
				}
				

			case 'DISH-BLUEBERRIES-ICE_CREAM':
			case "DISH-ICE_CREAM-BLUEBERRIES":

				if (contains(reachWindow,[playerX,playerY])) {
					
					return serveFood();
				}
				
				else {
				    
					return walkToWindow();
				}

			default:

				let ingredientNum = playerItem.split("-").length;    						//integer, index of next food on plate
				let foodToTake = customersWaiting[0].split("-")[ingredientNum]; //string eg BLUEBERRIES
				let foodInitial = foodToTake.slice(0,1);                        //first letter of food
				let foodCoords = getCoordinates(kitchen,foodInitial);           //string, coordinates of food
				let reachFood = getEmptyNeighbours(foodCoords);								//2D array, empty cells around food 

				if (contains(reachFood,[playerX,playerY])) {
					return "USE "+foodCoords;
				}
				else {
					let x = getRandomInt(0,reachFood.length);
					return 'MOVE ' + reachFood[x][0] + ' ' + reachFood[x][1];
				}
				
	}
}


//----------------------------- chef actions -------------------------------
function walkToDish() {

	return (kitchen[0][5] == "." ? 'MOVE 1 5': 'MOVE 6 1');
}

function useDish() {
    
	return 'USE 5 0';
}

function walkToWindow() {
    
	return(kitchen[0][5] == "." ? 'MOVE 5 5': 'MOVE 6 5');
}

function serveFood() {
    
	return 'USE 5 6';
}
//--------------------------- helper functions ----------------------------------


function getCoordinates(array,value) {

	let A = array.map((line) =>{
		return line.indexOf(value);
	});
    
	let y = Math.max(...A);
	let x = A.indexOf(y);
	return `${y} ${x}`;
}

function getEmptyNeighbours(item) {

	let coords = item.split(" ");
	let neighbours = [];
	for (let j = -1 ; j <= 1 ; ++j) {
		let y = parseInt(coords[1])+j;
		if (y < kitchen.length && y >= 0) {
			
			for (let i = -1 ; i <= 1 ; ++i) {
			    
				let x = parseInt(coords[0])+i;
				if (x < kitchen[0].length && x >= 0) {
					
					if (kitchen[y][x] == '.') {

						neighbours.push([x,y]);
					}
				}
			}
		}
	}
	return neighbours;
}

function contains(a, obj) {

	let x = false;
    var i = a.length;
    while (i--) {
       if (JSON.stringify(a[i]) === JSON.stringify(obj)) {
       	
           x = true;
           break;
       }
    }
    return x;
}

function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min)) + min;
}