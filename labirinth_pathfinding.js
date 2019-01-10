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
    //find the best push for both players
    let player1Loc = {X:playerInfo[0].playerX,Y:playerInfo[0].playerY}
    let pushtext1 = findBestPush(player1Loc);
    let player2Loc = {X:playerInfo[1].playerX,Y:playerInfo[1].playerY}
    let pushtext2 = findBestPush(player2Loc);
    console.log(pushtext1, pushtext2)
    //check if they try to push the same row or column or if they interfere

    console.log(pushtext1); // PUSH <id> <direction> | MOVE <direction> | PASS
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
    //initiate the path with the tile we are standing on
    let Tile = M[currTile.Y][currTile.X];
    //put this tile in the path array
    path.push(currTile);
    //also to the already visited tiles array
    checkedItems.push(currTile);
    //main loop of the pathfinder
    main:
    for (let i in Tile) {
        //we iterate the possible outgoing directions
        if (Tile[i] == 1 ) {
            //determine the next tile in the currently investigated direction
            let nextTile = getNextTile(M,currTile, i);
            //we check if we have visited this tile before
            if (compareObjects(nextTile, currTile) == false) {                
                //no we havent, so lets iterate the quest items
                for (let i in QILs) {
                    //how close are we to the currently investigated QI?
                    checkDistances(nextTile,QILs[i]);
                    //if we are standing on one
                    if (QILs[i].X == nextTile.X && QILs[i].Y == nextTile.Y){
                        //we save the current path as best path
                        bestPath = bestPath.concat(copy(path));
                        //also add the tile we are standing on
                        bestPath.push(nextTile);
                        //and if the best path is more than 20 elements
                        if (bestPath.length>20) {
                            //we have to cut it to be 20
                            bestPath.slice(0,20);
                        }
                        //now we can translate the path to text
                        pathText = translatePath(bestPath);
                        //and mark the task completed
                        found = true;
                        //break out the main loop
                        break main;
                    }

                }
                //if we havent found a QI, we continue our search
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

function findBestPush(playerLoc) {
    //iterate the current QI locations and calculate the euclidean distances
    QIs = currQItLocs.map((loc) => {
    
        return Math.sqrt(Math.pow(playerLoc.X-loc.X,2)+Math.pow(playerLoc.Y-loc.Y,2));
    })
    //get the closet QI
    let closestQI = Math.min(QIs);
    //and reset the bestmove and goodmoves
    let bestmove = "";
    let goodmoves= [];
    //do a pathfinding
    pathfinding(map, playerLoc,currQItLocs);
    //if no QI is found we try to find the best push
    if (found === false) {
        //declare itemToInsert - the spare tile we have for the push
        // and itemToRemove - the one that will fall out of the map in result of the push
        let itemToRemove = 0;
        let itemToInsert = 0;
        //the coordinate that will change because of the push
        let coord = "";
        let compareToCoord = "";
        let prefix = 0;
        //iterate the row and column numbers
        row:
        for (let i = 0 ; i < 7 ; i++) {
            //iterate the directions
            for (let d=0;d<4;++d) {
                //make a copy of the player's current location and same for the quest items
                let playerLocMod = {X:playerLoc.X,Y:playerLoc.Y};
                let QILocs = copy(currQItLocs);
                //the coord we will change depends on the direction
                //Y if the direction is even (UP or DOWN) column shift, X if it's odd
                coord = d % 2 == 0 ? "Y" : "X";
                compareToCoord = d % 2 == 0 ? "X" : "Y";
                prefix = d === 0 || d == 3 ? -1 : 1;
                
                //if the direction is UP or LEFT, we are going to delete a 0 coordinate
                //and insert something to the 6th spot - end of map either bottom or right end
                if (d === 0 || d == 3) {
                    
                    itemToRemove = 0;
                    itemToInsert = 6;
                    //if player is in the row or column to be pushed, their coordinates change
                    playerLocMod[coord] = playerLocMod[compareToCoord] == i ? parseInt(playerLocMod[coord])+prefix : playerLocMod[coord];
                    //if player is at position -1, they are shifted off from the map => to the other edge
                    playerLocMod[coord] = playerLocMod[coord] == -1 ? 6 : playerLocMod[coord];
                    //now let's see the same for each of the quest items
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

                    itemToRemove = -1;
                    itemToInsert = 0;   
                    playerLocMod[coord] = playerLocMod[compareToCoord] == i ? parseInt(playerLocMod[coord])+prefix : playerLocMod[coord];
                    playerLocMod[coord] = playerLocMod[coord] == 7 ? 0 : playerLocMod[coord];
                    
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
                //let's transform the map as well
                let shiftedMap = shiftMap(map,i,d, itemToInsert, itemToRemove);
                //do a pathfinding with the shifted map and coordinates
                pathfinding(shiftedMap,playerLocMod,QILocs);
                //if we find a QI like this
                if (found === true){
                    //declare this as the best move
                    bestmove = i+" "+translateDirection(d)
                    goodmoves= [];
                    //and break out of the push finding loop
                    break row;
                }
                //otherwise just see if we got closer to any of the QI-s
                else {
                    
                    QILocs.map((loc) => {

                        let distFromQI = Math.sqrt(Math.pow(playerLocMod.X-loc.X,2)+Math.pow(playerLocMod.Y-loc.Y,2))
                        //if not, we save this push as a good one
                        if (distFromQI == closestQI){
                            
                            goodmoves.push(i+" "+translateDirection(d));
                        }
                        //if yes, this is going to be our best push so far, but we go on with finding a better
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
    
    //evaluation of the results
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

function shiftMap(M, N, D, ins, rem){
    //if we are pushing a column, we transpose the map before the push
    let shiftedMap = D % 2 === 0 ? copy(transpose(M)) : copy(M);
    //perform the push
    shiftedMap[N].splice(rem,1);
    shiftedMap[N].splice(ins,0,playerInfo[0].playerTile.split(''));
    //redo the transope in case of column push
    shiftedMap =  D % 2 === 0 ? transpose(shiftedMap) : shiftedMap;

    return shifedMap;
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