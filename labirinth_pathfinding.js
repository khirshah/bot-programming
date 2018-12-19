// game loop
const testArr = ['1001 0101 1101 1111 0101 0101 1010',
                '1111 1111 1111 1111 1111 1111 1111',
                '1001 0101 1111 1111 0011 1111 1010',
                '1011 0101 1101 1111 0101 0110 1010',
                '1001 0101 1101 1111 0101 0101 1010',
                '1101 0101 1101 1111 0101 0101 1010',
                '1001 0101 1101 1111 0011 0111 1010'];

const info = ['3 2 5 1010','3 3 6 1110'];
const it = ['sword 6 4 0','wand 3 2 0','staff 1 9 0','sword 7 3 1','wand 2 9 1','staff 1 2 1'];
const q = ['sword 0', 'wand 0','wand 1'];

var loop = true;
var turnType = 0;


while (loop==true) {

    var map = [];
    var playerInfo = [];
    var items = [];
    var quests = [];
    var path = [];
    var bestPath = [];
    var checkedItems=[];
    var pathText = "";
    var found = false;

    for (let i = 0; i < 7; i++) {
        var inputs = testArr[i].split(' ');
        let line = [];
        for (let j = 0; j < 7; j++) {
            const tile = inputs[j];
            line.push(tile.split(''))
        }
        map.push(line)
    }

    
    for (let i = 0; i < 2; i++) {
        var inputs = info[i].split(' ');
        const numPlayerCards = parseInt(inputs[0]); // the total number of quests for a player (hidden and revealed)
        const playerX = parseInt(inputs[1]);
        const playerY = parseInt(inputs[2]);
        const playerTile = inputs[3];
        playerInfo.push({numPlayerCards:numPlayerCards,playerX:playerX,playerY:playerY,playerTile:playerTile})
    }

    const numItems = parseInt(it.length); // the total number of items available on board and on player tiles
    
    
    for (let i = 0; i < numItems; i++) {
        var inputs = it[i].split(' ');
        const itemName = inputs[0];
        const itemX = parseInt(inputs[1]);
        const itemY = parseInt(inputs[2]);
        const itemPlayerId = parseInt(inputs[3]);
        items.push({Name:itemName,X:itemX,Y:itemY,PlId:itemPlayerId})
    }

    var numQuests = parseInt(q.length); // the total number of revealed quests for both players
    

    for (let i = 0; i < numQuests; i++) {
        var inputs = q[i].split(' ');
        const questItemName = inputs[0];
        const questPlayerId = parseInt(inputs[1]);
        quests.push({Name:questItemName,PlId:questPlayerId})
    }
    var currQItLocs = getQuestItems(items,quests);
    
    
    if (turnType == 0) {

        runPushTurn();
        turnType=1;
    }
    else {

        runMoveTurn();
        loop = false ; 
    }
  
}

//------------------------------- turns main functions ----------------------------------

function runPushTurn() {
    getQIDistances();
    let pushtext = findBestPush();

    console.log(pushtext); // PUSH <id> <direction> | MOVE <direction> | PASS
}

function runMoveTurn() {
    

    found = false;
    let playerLoc = {X:playerInfo[0].playerX,Y:playerInfo[0].playerY};
    
    let QIWithNegativeX = numQuests;
    let foundNegative = false;
    
    for (let i in currQItLocs) {

        if (currQItLocs[i].X == -1) {
            foundNegative = true;
            QIWithNegativeX = i;
            
        }
        
    }
    
    foundNegative == true ? currQItLocs.splice(QIWithNegativeX,1) : null;
    getQIDistances();
    
    pathfinding(map,playerLoc,currQItLocs);
    
    if (found === true) {
        
        while (found === true && bestPath.length < 20) {

            found = false;
            path = [];
            checkedItems = [];
            let lastFoundQI = numQuests;
            
            for (let item in currQItLocs) {

                if (currQItLocs[item].X == bestPath[bestPath.length-1].X && currQItLocs[item].Y == bestPath[bestPath.length-1].Y) {
                    lastFoundQI = item;
                    
                }
            }

            currQItLocs.splice(lastFoundQI,1)
            getQIDistances();
            pathfinding(map,bestPath[bestPath.length-1],currQItLocs);
        }
    }
    
    console.log(pathText === "" ? "PASS" : "MOVE "+pathText);
}


//------------------------------- pathfinding algorithm ---------------------------------

function pathfinding(M,currTile,QILs) {

    let Tile = M[currTile.Y][currTile.X];
    path.push(currTile);
    checkedItems.push(currTile);
    
    main:
    for (let i in Tile) {

        if (Tile[i] == 1 ) {
            let nextTile = getNextTile(M,currTile, i);

            if (compareObjects(nextTile, currTile) == false) {                

                for (let i in QILs) {
                        
                    checkDistances(nextTile,QILs[i]);

                    if (QILs[i].X == nextTile.X && QILs[i].Y == nextTile.Y){

                        bestPath = bestPath.concat(copy(path));
                        bestPath.push(nextTile);
                        if (bestPath.length>20) {
                            bestPath.slice(0,20);
                        }
                        pathText = translatePath(bestPath);

                        found = true;
                        break main;
                    }

                }

                found === false ? pathfinding(M,nextTile,QILs) : null;
 
            }
        }
    }

    path.pop();
}

//---------------------------- other game specific functions ----------------------------

function getNextTile(M,currTile,direction) {

    let nextTile={X:currTile.X, Y:currTile.Y};
    let coord = direction % 2 == 0 ? "Y" : "X";
    let prefix = (direction == 0 || direction == 3) ? -1 : 1;
    let dirPrefix = direction < 2 ? 1 : -1;
    let nextTiledirection = parseInt(direction)+(dirPrefix*2);
    
    nextTile[coord] =  parseInt(nextTile[coord]) + parseInt(prefix);

    return (nextTile[coord] / 7 < 1 && 
        nextTile[coord] / 7 >=0 && 
        contains(nextTile) == false && 
        M[nextTile.Y][nextTile.X][nextTiledirection]==1) ? nextTile : currTile;
}

function checkDistances(nextTile,QIL) {

    
    let currDist = Math.sqrt(Math.pow(QIL.X-nextTile.X,2)+Math.pow(QIL.Y-nextTile.Y,2));

    if (currDist < origDist) {
        
        let goodPath = copy(bestPath).concat(copy(path));
        goodPath.push(nextTile);
        origDist = currDist;
        pathText = translatePath(goodPath);

    }

}

function getQuestItems (items,quests) {
    
    let currQItLocs = [];
    
    quests.map((quest) => {
        items.map((item) => {
            if (quest.PlId == 0 && item.PlId == 0 && quest.Name == item.Name){
                currQItLocs.push({itemName:item.Name,X:item.X,Y:item.Y});
            }
        })
    })

    return currQItLocs
}

function getQIDistances() {
    
    var QIDistances = [];
    for (let i in currQItLocs) {
        
        QIDistances.push(Math.sqrt(Math.pow(currQItLocs[i].X-playerInfo[0].playerX,2)+Math.pow(currQItLocs[i].Y-playerInfo[0].playerY,2)));

    }

    origDist = Math.min(...QIDistances);

}

function translatePath(path) {
    
    let translatedPath = [];
    for (let t=1; t<path.length;t++) {
    
        if (path[t].X < path[t-1].X) {
            translatedPath.push('LEFT');
        }
        else if (path[t].X > path[t-1].X) {
            translatedPath.push('RIGHT');
        }
        else if (path[t].Y < path[t-1].Y) {
            translatedPath.push('UP');
        }
        else if (path[t].Y > path[t-1].Y) {
            translatedPath.push('DOWN');
        }

    }

    return translatedPath.join(' ');
}

function findBestPush() {
    
    QIs = currQItLocs.map((loc) => {
    
        return Math.sqrt(Math.pow(playerInfo[0].playerX-loc.X,2)+Math.pow(playerInfo[0].playerY-loc.Y,2));
    })
    let closestQI = Math.min(QIs);
    let bestmove = "";
    let goodmoves= [];
    
    pathfinding(map, {X:playerInfo[0].playerX,Y:playerInfo[0].playerY},currQItLocs);
    
    if (found === false) {
    
        let del = 0;
        let ins = 0;
        
        let coord = ""
        
        row:
        for (let i=0;i<7;i++) {
            
            
            for (let d=0;d<4;++d) {
                
                let playerLoc = {X:playerInfo[0].playerX,Y:playerInfo[0].playerY};
                let QILocs = copy(currQItLocs);

                coord = d % 2 == 0 ? "Y" : "X";
                compareToCoord = d % 2 == 0 ? "X" : "Y";
                prefix = d === 0 || d == 3 ? -1 : 1;
                
                
                if (d === 0 || d == 3) {
                    
                    del = 0;
                    ins = 6;
                    
                    playerLoc[coord] = playerLoc[compareToCoord] == i ? parseInt(playerLoc[coord])+prefix : playerLoc[coord];
                    playerLoc[coord] = playerLoc[coord] == -1 ? 6 : playerLoc[coord];
                    
                    QILocs.map((loc) => {

                        if (loc[coord] != -1) {
                            
                            loc[coord] = loc[compareToCoord] == i ? parseInt(loc[coord])+prefix : loc[coord];
                            loc[coord] == -1 ? (loc.X = -1, loc.Y = -1) : loc[coord];
                        }
                        else{
                            loc[coord] = 6;
                        }

                    })
                }
                else if (d === 1 || d == 2) {

                    del = -1;
                    ins = 0;   
                    playerLoc[coord] = playerLoc[compareToCoord] == i ? parseInt(playerLoc[coord])+prefix : playerLoc[coord];
                    playerLoc[coord] = playerLoc[coord] == 7 ? 0 : playerLoc[coord];
                    
                    QILocs.map((loc) => {

                        if (loc.X != -1) {
                            
                            loc[coord] = loc[compareToCoord] == i ? parseInt(loc[coord])+prefix : loc[coord];
                            loc[coord] == 7 ? (loc.X = -1, loc.Y = -1) : loc[coord];
                        }
                        else{
                            loc[coord] = 0;
                        }

                    })
                }
                
                shiftedMap = d % 2 === 0 ? copy(transpose(map)) : copy(map);
                shiftedMap[i].splice(del,1);
                shiftedMap[i].splice(ins,0,playerInfo[0].playerTile.split(''));
                shiftedMap =  d % 2 === 0 ? transpose(shiftedMap) : shiftedMap;
    
                pathfinding(shiftedMap,playerLoc,QILocs);
                
                if (found === true){
                    
                    bestmove = i+" "+translateDirection(d)
                    goodmoves= [];
                    break row;
                }
                else {
                    
                    QILocs.map((loc) => {

                        let distFromQI = Math.sqrt(Math.pow(playerLoc.X-loc.X,2)+Math.pow(playerLoc.Y-loc.Y,2))
                        if (distFromQI == closestQI){
                            
                            goodmoves.push(i+" "+translateDirection(d));
                        }
                        
                        else if (distFromQI < closestQI) {
                            closestQI = distFromQI;
                            bestmove = i+" "+translateDirection(d);
                            goodmoves= [];
                        }

                    })
                }
            }
        }
    }
    
    
    if (goodmoves.length > 0){

        return 'PUSH '+goodmoves[getRandomInt(0,goodmoves.length)];  
    }
        
    else if (bestmove == ""){

        let dir = translateDirection(getRandomInt(0,4));
        let col = getRandomInt(0,7);
        return 'PUSH '+col+' '+dir;
    
    }
    else {

        return 'PUSH '+ bestmove;
    }
}

//---------------------------- helper functions -----------------------------------------

function contains (element) {
    
    for (item in checkedItems) {

        if (compareObjects(checkedItems[item],element)==true) {
            return true;
            break;
        }
    }
    return false;
}

function compareObjects (obj1, obj2) {

    return (obj1.X == obj2.X && obj1.Y == obj2.Y) ? true : false;
}

function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min)) + min;
}

function translateDirection (value){
    
    switch (value) {
    
    case 0:
        return "UP";

    case 1:
        return "RIGHT";

    case 2:
        return "DOWN";

    case 3:
        return "LEFT";

    }
}

function copy(aObject) {
  if (!aObject) {
    return aObject;
  }

  let v;
  let bObject = Array.isArray(aObject) ? [] : {};
  for (const k in aObject) {
    v = aObject[k];
    bObject[k] = (typeof v === "object") ? copy(v) : v;
  }

  return bObject;
}

function transpose(a) {
    return Object.keys(a[0]).map((col) => {
        return a.map((row) => {
            return row[col];
        });
    });
}