const lab =  [">000#","#0#00","00#0#"]
const map = [];
const width = parseInt(5);
const height = parseInt(3);
var side ="L";
side = side=="L" ? -1 : +1;

  for (let i = 0; i < height; i++) {
    map.push(lab[i].split(""));
    for (let j in map[i]) {
        if (map[i][j] != "#" && map[i][j] != 0) {
            //pi = pikatchu
            var pi = {
                dir: convertDirToNum(map[i][j]),
                i: i,
                j: j,
                origi: i,
                origj:j
            }
            map[i][j] = 0;
        }
    }
  }

function makeDecision() {

  let data=calcData(pi.i,pi.j);
  //should check for j in case of up and down movement!!!
  //there is wall on the left
  if(data.isWallLeft || map[data.sidei][data.sidej] == "#") {
    //can he go straight?
    if(data.cantGoStraight || map[data.nexti][data.nextj]=="#") {
      //NO - TURN and CHECK
      turn(1);
      makeDecision();
    }

    else {
      //Yes - GO
      move(data.nexti, data.nextj);
    }
  }
  //he can turn left - TURN and GO
  else {
    turn(-1);
    move(data.sidei,data.sidej)
  }
}

function turn(d) {
  pi.dir += d;
  pi.dir < 0 ? pi.dir = 3 : null;
  pi.dir > 3 ? pi.dir = 0 : null;
}

function move(i,j) {

  map[i][j] = parseInt(map[i][j]) + 1;
  pi.i = i;
  pi.j = j;
}

function convertDirToNum(string) {
    switch (string) {
        case ">":
            return 0;
            
        case "˘":
            return 1;
            
        case "<":
            return 2;
            
        case "^":
            return 3;
    }
}

function calcData(i, j) {
  
  switch(pi.dir) {
    //RIGHT
    case 0:
      return {
        nexti:i,
        nextj:parseInt(j+1),
        sidei:parseInt(i+side),
        sidej: j,
        isWallLeft: parseInt(i+side) < 0,
        cantGoStraight: parseInt(j+1) >= width
        }
    //DOWN
    case 1:
      return {
        nexti:parseInt(i+1),
        nextj:j,
        sidei:i,
        sidej: parseInt(j-side),
        isWallLeft: parseInt(j-side) >= width,
        cantGoStraight: parseInt(i+1) >= height
        }
    //LEFT
    case 2:
      return {
        nexti:i,
        nextj:parseInt(j-1),
        sidei:parseInt(i-side),
        sidej: j,
        isWallLeft: parseInt(i-side) >= height,
        cantGoStraight: parseInt(j-1) < 0
        }
    //UP
    case 3:
      return {
        nexti:parseInt(i-1),
        nextj:j,
        sidei:i,
        sidej: parseInt(j+side),
        isWallLeft: parseInt(j+side) < 0,
        cantGoStraight: parseInt(i-1) < 0
        }
  }
}

function printResult() {
  
  for (let i = 0; i < height; i++) {

    console.log(map[i].join(""));
  }
}

function main() {

  makeDecision();

  while ((pi.i == pi.origi && pi.j == pi.origj) != true) {

    makeDecision();
  }

  printResult();
}

main();