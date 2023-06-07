/**
 * Grab Snaffles and try to throw them through the opponent's goal!
 * Move towards a Snaffle and use your team id to determine where you need to throw it.
 **/

var myTeamId = parseInt(readline()); // if 0 you need to score on the right of the map, if 1 you need to score on the left
var goalPosX = [16000,0];
var factor = [-1,1];
var goalPos2X = [0,16000];
var goalPosY = 3750;

var goalToScoreX = goalPosX[myTeamId];
var goalToDefendX = goalPos2X[myTeamId];
var fac = factor[myTeamId];

// game loop
while (true) {
    
    var DistanceToEnemy = [];
    var bludgeXY = [];
    var bludgeState = [];
    var ballXY = [];
    var enemyXY = [];
    var myXY = [];
    var myState = [];
    
    var inputs = readline().split(' ');
    var myScore = parseInt(inputs[0]);
    var myMagic = parseInt(inputs[1]);
    var inputs = readline().split(' ');
    var opponentScore = parseInt(inputs[0]);
    var opponentMagic = parseInt(inputs[1]);
    var entities = parseInt(readline()); // number of entities still in game
    for (var i = 0; i < entities; i++) {
        var inputs = readline().split(' ');
        var entityId = parseInt(inputs[0]); // entity identifier
        var entityType = inputs[1]; // "WIZARD", "OPPONENT_WIZARD" or "SNAFFLE" (or "BLUDGER" after first league)
        var x = parseInt(inputs[2]); // position
        var y = parseInt(inputs[3]); // position
        var vx = parseInt(inputs[4]); // velocity
        var vy = parseInt(inputs[5]); // velocity
        var state = parseInt(inputs[6]); // 1 if the wizard is holding a Snaffle, 0 otherwise
        
        if(entityType === "SNAFFLE"){
            ballXY.push([x,y,vx,vy,entityId]);
        }else if (entityType === "OPPONENT_WIZARD"){
            enemyXY.push([x,y,vx,vy,state]);
        }else if (entityType === "WIZARD"){
            myXY.push([x,y,vx,vy]);
            myState.push([state,entityId]);
        }else if (entityType === "BLUDGER"){
            bludgeXY.push([x,y,vx,vy]);
            bludgeState.push([state, entityId]);
        }
    
    }
    

    var distanceToBall = []; //Calculates two arrays showing distances from wizard to each Snaffle
    var distanceToGoal = []; //Calculates two values showing distances from wizard to goal (to score in)
    var opponentDistToBall = [];
    var opponentBallComponent = [];
    var opponentDistToGoalTop = [];
    var opponentDistToGoalBot = [];//Distance to their defending goals
    var opponentDistToGoal = [];
    var bludgeDist = []; //self explanatory?
    var ballDistanceToDefend = [];
    var ballDistanceToScore = [];
    var newMagic = myMagic;
    
    for (var i = 0; i < 2; i++){
        opponentDistToGoalTop[i] = Math.hypot((enemyXY[i][0] + enemyXY[i][2]) - goalToScoreX, (enemyXY[i][1] + enemyXY[i][3]) - 2000);
        opponentDistToGoalBot[i] = Math.hypot((enemyXY[i][0] + enemyXY[i][2]) - goalToScoreX, (enemyXY[i][1] + enemyXY[i][3]) - 5500);
        opponentDistToGoal[i] = Math.hypot((enemyXY[i][0] + enemyXY[i][2]) - goalToScoreX, (enemyXY[i][1] + enemyXY[i][3]) - 3750);
        for(var t = 0; t < ballXY.length; t++){
            opponentBallComponent[t] = Math.hypot((enemyXY[i][0]+enemyXY[i][2]) - (ballXY[t][0] + ballXY[t][2]), (enemyXY[i][1]+enemyXY[i][3]) - (ballXY[t][1] + ballXY[t][3]) );
            opponentDistToBall[i] = opponentBallComponent;
        }
    }
    
    var moveX = [];
    var moveY = [];
    var shootX = [];
    var shootY = [];
    var distns = [];

    
    
    for (var i = 0; i < 2; i++) {
        
        var flipNtys = [];
        var choose = 'MOVE';
        
        distanceToGoal = Math.hypot((myXY[i][0]+myXY[i][2]) - goalToScoreX, (myXY[i][1]+myXY[i][3]) - goalPosY);
        var distanceToBludge1 = Math.hypot((myXY[i][0] + myXY[i][2]) - (bludgeXY[0][0] + bludgeXY[0][2]), (myXY[i][1] + myXY[i][3]) - (bludgeXY[0][1] + bludgeXY[0][3]));
        var distanceToBludge2 = Math.hypot((myXY[i][0] + myXY[i][2]) - (bludgeXY[1][0] + bludgeXY[1][2]), (myXY[i][1] + myXY[i][3]) - (bludgeXY[1][1] + bludgeXY[1][3]));
        
        //Calculates decent shot target
        if(distanceToGoal > opponentDistToGoal[0] || distanceToGoal > opponentDistToGoal[1]){
            
            if(distanceToGoal > opponentDistToGoal[0] && distanceToGoal > opponentDistToGoal[1]){
                for(var n = 0; n < 2; n++){
                    if(opponentDistToGoalTop[n] > opponentDistToGoalBot[n]){
                        distns[n] = 2200;
                    }else{
                        distns[n] = 5300;
                    }
                }
                
                shootY[i] = (distns[0] + distns[1])/2;
                
            }else if(distanceToGoal > opponentDistToGoal[0]){
                if(opponentDistToGoalTop[0] > opponentDistToGoalBot[0]){
                    shootY[i] = 2200;
                }else{
                    shootY[i] = 5300;
                }
            }else if(distanceToGoal > opponentDistToGoal[1]){
                if(opponentDistToGoalTop[1] > opponentDistToGoalBot[1]){
                    shootY[i] = 2200;
                }else{
                    shootY[i] = 5300;
                }
            }
        }
        
        //Calculates everything that has to do with Snaffle position
        for (var n = 0; n < ballXY.length; n++){
            distanceToBall[n] = Math.hypot(myXY[i][0] - ballXY[n][0], myXY[i][1] - ballXY[n][1]);
            ballDistanceToScore[n] = Math.hypot(ballXY[n][0] - goalToScoreX, ballXY[n][1] - goalPosY);
            ballDistanceToDefend[n] = Math.hypot(ballXY[n][0] + ballXY[n][2] - goalToDefendX, ballXY[n][1] + ballXY[n][3] - goalPosY);
            
            var slopeMeToBall = ((myXY[i][1]+myXY[i][3]) - (ballXY[n][1]+ballXY[n][3]))/((myXY[i][0]+myXY[i][2]) - (ballXY[n][0]+ballXY[n][2]));
            var xValueToGoal = goalToScoreX - (ballXY[n][0] + ballXY[n][2]);
            var negYVector = slopeMeToBall*xValueToGoal;
            var yValue = ballXY[n][1] + negYVector;
            if (((yValue >= 2100 && yValue <= 5400) ||(yValue >= 9600 && yValue <= 12900)) && distanceToGoal > ballDistanceToScore[n]){
                flipNtys.push([ballXY[n][4],ballDistanceToScore[n],n]);
            }
        }
        //All important indices
        var indexBallDistToDefend = ballDistanceToDefend.indexOf(Math.min.apply(null,ballDistanceToDefend));
        var indexBallDistToScore = ballDistanceToScore.indexOf(Math.min.apply(null,ballDistanceToScore));
        var indexClosestBall = distanceToBall.indexOf(Math.min.apply(null,distanceToBall));
        
        //Removes the nearest ball so it can find the next nearest
        
        //Movement AI and separation: Wizard 0 always defends, Wizard 1 looks for the nearest ball
        moveX[0] = ballXY[indexBallDistToDefend][0] + ballXY[indexBallDistToDefend][2];
        moveY[0] = ballXY[indexBallDistToDefend][1] + ballXY[indexBallDistToDefend][3];
        
        if(ballXY.length > 1){
            if(myScore >= opponentScore){
                if(indexBallDistToDefend === indexClosestBall){
                    
                    distanceToBall.splice(indexClosestBall,1,1000000);//uses big number as placeholder
                    var indexSecondClosestBall = distanceToBall.indexOf(Math.min.apply(null,distanceToBall));
        
                    moveX[1] = ballXY[indexSecondClosestBall][0] + ballXY[indexSecondClosestBall][2];
                    moveY[1] = ballXY[indexSecondClosestBall][1] + ballXY[indexSecondClosestBall][3];
                    var targetidx = indexSecondClosestBall;
                }else{
                    moveX[1] = ballXY[indexClosestBall][0] + ballXY[indexClosestBall][2];
                    moveY[1] = ballXY[indexClosestBall][1] + ballXY[indexClosestBall][3];
                    var targetidx = indexClosestBall;
                }
            }else{
                moveX[1] = ballXY[indexBallDistToScore][0] + ballXY[indexBallDistToScore][2];
                moveY[1] = ballXY[indexBallDistToScore][1] + ballXY[indexBallDistToScore][3];
                var targetidx = indexBallDistToScore;
            }
        }else{
            moveX[1] = ballXY[indexClosestBall][0] + ballXY[indexClosestBall][2];
            moveY[1] = ballXY[indexClosestBall][1] + ballXY[indexClosestBall][3];
            var targetidx = indexClosestBall;
        }
        
        if(flipNtys.length > 0){
            var value = flipNtys[0][1];
            for(var m = 0; m < flipNtys.length; m++){
                if(flipNtys[m][1] <= value){
                    value = flipNtys[m][1];
                    var ix = flipNtys[m][2];
                    var tt = m;
                }
            }
        }else{
            var ix = undefined;
        }
        
        if(opponentDistToBall[0][targetidx] <= distanceToBall[targetidx]){
            var AXIOneeded = true;
        }else{
            var AXIOneeded = false;
        }
        if(opponentDistToBall[1][targetidx] <= distanceToBall[targetidx]){
            var AXIOneeded = true;
        }else{
            var AXIOneeded = false;
        }
        
        if(flipNtys.length > 0 && myMagic >= 20 && distanceToBall[ix] <= 3000){
            choose = 'FLIPENDO';
            var id = flipNtys[tt][0];
        }else if(myState[i][0] === 1){
            choose = 'THROW'; 
        }else if(i === 0 && ballDistanceToDefend[indexBallDistToDefend] <= 2500 && myMagic >= 10 && fac*ballXY[indexBallDistToDefend][2] > 200 && distanceToBall[indexBallDistToDefend] > 300){
            choose = 'PETRIFICUS';
            var id = ballXY[indexBallDistToDefend][4];
        }else if(distanceToGoal <= ballDistanceToScore[indexBallDistToDefend] && i === 0 && myMagic >= 15 && distanceToBall[indexBallDistToDefend] <= 5500 && distanceToBall[indexBallDistToDefend] > 400){
            choose = 'ACCIO';
            var id = ballXY[indexBallDistToDefend][4];
        }else if(distanceToGoal <= ballDistanceToScore[targetidx] && i === 1 && myMagic >= 15 && distanceToBall[targetidx] <= 5500 && distanceToBall[targetidx] >= 600 && AXIOneeded === true && (opponentMagic < 12 || opponentMagic >= 20)){
            choose = 'ACCIO';
            var id = ballXY[targetidx][4];
        }/*else if(myMagic > 5  && myScore > opponentScore && ((distanceToBludge1 <= 800 && bludgeState[0][0] !== myState[i][1] && id !== bludgeState[0][1]) || (distanceToBludge2 <= 800 && bludgeState[1][0] !== myState[i][1] && id !== bludgeState[1][1] ))){
            choose = 'OBLIVIATE';
            if(distanceToBludge1 <= distanceToBludge2){
                var id = bludgeState[0][1];
            }else{
                var id = bludgeState[1][1];
            }
        }*/
        
        printErr(choose, flipNtys.length, distanceToGoal, ballXY[indexBallDistToDefend][2], distanceToBall[ix], distanceToBall[indexBallDistToDefend]);
        
        if(choose !== 'THROW'){
            
            if(choose !== 'MOVE'){
                print(choose, id);
            }else{
                print('MOVE',moveX[i] - myXY[i][2],moveY[i] - myXY[i][3],150);
            }
            
        }else{
            if(i === 1){
                if(distanceToGoal > opponentDistToGoal[0] || distanceToGoal > opponentDistToGoal[1]){
                    if(distanceToGoal <= 2000){
                        print('THROW',goalToScoreX - myXY[i][2],shootY[1] - myXY[i][3],500);
                    }else{
                        if(myXY[i][1] >= 2300 && myXY[i][1] <= 5200){
                            print('THROW',goalToScoreX,myXY[i][1],500);
                        }else if(distanceToGoal <= 1500){
                            
                            if(myXY[i][1] > 6000){
                                print('THROW',goalToScoreX - myXY[i][2],2750 - myXY[i][3],500);
                            }else if (myXY[i][1] < 1500){
                                print('THROW',goalToScoreX - myXY[i][2],4750 - myXY[i][3],500);
                            }else{
                                print('THROW',goalToScoreX - myXY[i][2],goalPosY - myXY[i][3],500);
                            }
                            
                        }else{
                                print('THROW',goalToScoreX - myXY[i][2],goalPosY - myXY[i][3],500);
                        } 
                    }
                }else if(myXY[i][1] >= 2300 && myXY[i][1] <= 5200){
                    print('THROW',goalToScoreX,myXY[i][1],500);
                }else if(distanceToGoal <= 1500){
                    if(myXY[i][1] > 6000){
                        print('THROW',goalToScoreX - myXY[i][2],2750 - myXY[i][3],500);
                    }else if (myXY[i][1] < 1500){
                        print('THROW',goalToScoreX - myXY[i][2],4750 - myXY[i][3],500);
                    }else{
                        print('THROW',goalToScoreX - myXY[i][2],goalPosY - myXY[i][3],500);
                    }
                }else{
                    print('THROW',goalToScoreX,goalPosY,500);
                }
            }else{
                 if (distanceToGoal >= 6000){
                    if(myXY[i][1] >= 3750){
                        print('THROW',goalToScoreX,7000,500);
                    }else{
                        print('THROW',goalToScoreX,0,500);
                    }
                }else{
                    print('THROW',goalToScoreX,goalPosY,500);
                }
            }
        }
        
    } // End of last for command 
} // End of loop
