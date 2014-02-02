/* @about: erix-like game
 * @author: jernej oblak
 * @last_change: 21.12.2013
 * 
 */
var canvas;
var stage;

var playerPic;
var playerColor = "red";
var playerSize = 10;

var grid;
var gridTemp;

var direction = "none";
var moveArrayX = new Array; // tabelci za shranjevat indekse kjer se nahajajo trenutne enice (kjer je player naredu crto)
var moveArrayY = new Array;

var line = 0; 
var lineColor = "#848484";
var fillColor = "black";
var outerEdgeColor = "black";
var innerEdgeColor = "gray";

var ball;
var ballSpeed = playerSize;
var ballDirectionUp = 1; // if 0 -> down
var ballDirectionLeft = 1; // if 0 -> right
var x;
var y;

var count = 0;
var area = 0; // to know which area I am at in any given moment
var area1x; // starting positions for filling areas recursively
var area1y;
var area2x;
var area2y;
var area1Count = 0;
var area2Count = 0;
var ballArea1 = 0; // if ball is inside area1, put to 1
var ballArea2 = 0; // if ball is inside area2, put to 1

var textL;
var lives = 1;

function init(){
 	
 	// add keyboard listener.
    window.addEventListener('keydown', whatKey, true);
 	
  	canvas = document.getElementById("mycanvas");
	stage = new createjs.Stage(canvas);

	createGrid("black",0.2);
  	createEdges("black");
	createPlayer();
		
	createBalls(1);		
		
	//alert("playerSize: "+playerSize+"\ncanvas height/playerSize: "+canvas.height/playerSize+"\ncanvas width/playerSize: "+canvas.width/playerSize);
	createText();
	
	// start the tick and point it at the method so we can do some work before updating the stage
	createjs.Ticker.addEventListener("tick", tick);
	createjs.Ticker.setFPS(16);
    
}

function stop() {
	createjs.Ticker.removeEventListener("tick", tick);
}

function tick(event){	
	managePlayerMoves();	
	
	manageBalls();
	
	manageText();
	
	// draw the updates to stage
	stage.update(event);
}


// trenutno: zafila tist prostor ki ne vsebuje zogice! Ko je prostor dovolj majhnen, smo zmagal!
// TODO:
// 1. robove (crte) ki jih narise player, mors od prvega koraka naprej nekak na CRNO dat da so "zafilani" 
// 2. shrani stanje playerja, PRED in PO tem ko nardi crto. (torej ko zapusti dvojko/rob in ko pride nanj nazaj) -> da loh reversam
// 3. isto rab nekak delat reversanje za "steno", ce se zogca zaleti v playerja (zgubljanje zivljenj)
// 4. vec zogic pogrunti da je + spreminjanje hitrosti zogic
function manageFillingAreas(){
	//alert("fill area!");
	
	makeLineOf1sToLineOf2s();
	
	copyGridToTemp();
	
	// reset ball counters
	ballArea1 = 0;
	ballArea2 = 0;
	
	// now I am counting area 1
	area = 1;
	
	// this method puts number of zeroes in "count" variable
	countArea();
	
	area1Count = count;
	
	// now I am counting area 2		
	area = 2;
	
	// v count dobim stevilo prostorckov v drugem Area
	countArea();
	
	area2Count = count;
	
	//alert(ballArea1 + " "+ ballArea2);
		
	// ce Area1 NIMA zogice not ga zafilaj	
	if (ballArea1 == 0){
		fillArea(1);
	}	
	// drugace zafilej Area2
	else{
		fillArea(2);
	}
	
	// SETTING WINNING AREA LIMIT
	if(area1Count+area2Count < 300){
		alert("WIN!");
		window.location.reload();
	}
}

function copyGridToTemp() {
	for(var i=0; i<grid.length; i++){
		for(var j=0; j<grid[0].length; j++){
			gridTemp[i][j] = grid[i][j];
		}
	}
}

function fillArea(area){
	if(area == 1){
		drawRecursively(area1x, area1y);
	}
	else if(area == 2){
		drawRecursively(area2x, area2y);
	}
}

function countArea(){
	count = 0;
	// iterate through whole field and when an empty field is found, run a recursive function to count empty fields withing this newly created area
	for (var i = 0; i<gridTemp.length; i += 1){
		for (var j = 0; j<gridTemp[0].length; j += 1){
			if(gridTemp[i][j] == 0){
				
				if (area == 1){
					area1x = i;
					area1y = j;
				}
				else if (area == 2){
					area2x = i;
					area2y = j;
				}
				
				gridTemp[i][j] = 3;
				count++;
	
				countRecursively(i,j);	
				return;
			}
		}
	}			
}

// same as countRecursively, but draws and fills the rectangles and doesn't count anything
function drawRecursively(i,j){
	if(grid[i+1][j] == 0){
		grid[i+1][j] = 3;
		
		var rect = new createjs.Shape();
		rect.graphics.beginFill(fillColor).drawRect((i+1)*playerSize, j*playerSize, playerSize, playerSize);
		stage.addChild(rect);
		
		drawRecursively(i+1,j);
	}
	
	if(grid[i-1][j] == 0){
		grid[i-1][j] = 3;
		
		var rect = new createjs.Shape();
		rect.graphics.beginFill(fillColor).drawRect((i-1)*playerSize, j*playerSize, playerSize, playerSize);
		stage.addChild(rect);
		
		drawRecursively(i-1,j);
	}
	
	if(grid[i][j+1] == 0){
		grid[i][j+1] = 3;

		var rect = new createjs.Shape();
		rect.graphics.beginFill(fillColor).drawRect(i*playerSize, (j+1)*playerSize, playerSize, playerSize);
		stage.addChild(rect);
		
		drawRecursively(i,j+1);
	}
	
	if(grid[i][j-1] == 0){
		grid[i][j-1] = 3;
		
		var rect = new createjs.Shape();
		rect.graphics.beginFill(fillColor).drawRect(i*playerSize, (j-1)*playerSize, playerSize, playerSize);
		stage.addChild(rect);
		
		drawRecursively(i,j-1);
	}
	
}


// counts number of "zero" fields within borders (other numbers) starting on indeces i/j 
function countRecursively(i,j){
	if(gridTemp[i+1][j] == 0){
		gridTemp[i+1][j] = 3;
		count++;
			
		countRecursively(i+1,j);
	}
	
	if(gridTemp[i-1][j] == 0){
		gridTemp[i-1][j] = 3;
		count++;

		countRecursively(i-1,j);
	}
	
	if(gridTemp[i][j+1] == 0){
		gridTemp[i][j+1] = 3;
		count++;

		countRecursively(i,j+1);
	}
	
	if(gridTemp[i][j-1] == 0){
		gridTemp[i][j-1] = 3;
		count++;

		countRecursively(i,j-1);
	}
	
	// preverm ze zogica slucajno v prostoru
	if(((i+1)*playerSize == x && (j*playerSize) == y) || ((i-1)*playerSize == x && (j*playerSize) == y) ||
	(i*playerSize == x && ((j+1)*playerSize) == y) || (i*playerSize == x && ((j-1)*playerSize) == y)){
		if(area == 1){
			ballArea1 = 1;
		}
		else if(area == 2){
			ballArea2 = 1;
		}
	}
	
	return count;
}

// crto ki jo naredi player (enice na grid-u) spremeni v dvojke na gridu 
function makeLineOf1sToLineOf2s(){
	for (var i=0; i<moveArrayX.length; i++){
		grid[moveArrayX[i]][moveArrayY[i]] = 2;
	}
}

function createBalls(num){
	ball = new createjs.Shape();
	ball.graphics.beginFill(playerColor).drawCircle(0, 0, playerSize/2, playerSize/2);
	
	// zogca nej zacne na sredini vedno
	ball.x = canvas.width/2-playerSize/2;
	ball.y = canvas.height/2-playerSize/2;	
			
	// x/y of the ball (not the middle of the circle as ball.x is) to be the same as x/y for rectangles		
	x = ball.x-playerSize/2; 
	y = ball.y-playerSize/2;	
		
	stage.addChild(ball);
}

function manageText(){
	textL.text = "Lives left: "+lives;
	
	if (lives == 0){
		alert("GAME OVER.\nRefresh to start over.");
		stop();
	}	
}

function manageBalls(){
	x = ball.x-playerSize/2;
	y = ball.y-playerSize/2;
	
	/* ################ LEVO GOR ##################
		################ LEVO GOR ##################
			################ LEVO GOR ##################
	*/
	if(ballDirectionUp && ballDirectionLeft){ // zogca gre levo gor  
		// ce sm zadel ob levi rob
		if(grid[(x/playerSize)-1][(y/playerSize)-1] == 2 && grid[(x/playerSize)][(y/playerSize)-1] != 2 && grid[(x/playerSize)-1][(y/playerSize)] == 2){ 
			//alert("levi!");
			
			ballDirectionLeft = 0;
			ballDirectionUp = 1;
			
			// odbijem desno-gor
			ball.x += playerSize;
			ball.y -= playerSize;
		}	
		// ce sm zadel ob zgornji rob
		else if(grid[(x/playerSize)-1][(y/playerSize)-1] == 2 && grid[(x/playerSize)][(y/playerSize)-1] == 2 && grid[(x/playerSize)-1][(y/playerSize)] != 2){ 
			//alert("zgornji!");
			
			ballDirectionLeft = 1;
			ballDirectionUp = 0;
			
			// odbijem levo-dol
			ball.x -= playerSize;
			ball.y += playerSize;
		}	
		// zadel kot ALI spico (zunanji del kota)
		else if((grid[(x/playerSize)-1][(y/playerSize)-1] == 2 && grid[(x/playerSize)][(y/playerSize)-1] == 2 && grid[(x/playerSize)-1][(y/playerSize)] == 2)
		|| (grid[(x/playerSize)-1][(y/playerSize)-1] == 2 && grid[(x/playerSize)-1][(y/playerSize)] == 0 && grid[(x/playerSize)][(y/playerSize)-1] == 0)){
			//alert("kot!");
			
			ballDirectionLeft = 0;
			ballDirectionUp = 0;
			
			// odbijem isto kot sm prsu (desno dol)
			ball.x += playerSize;
			ball.y += playerSize;
		}
		// zadel playerja ki rise crto
		else if(grid[(x/playerSize)-1][(y/playerSize)-1] == 1){
			alert("BUM");
			lives--;
			window.location.reload();
		}
		else{
			ball.x -= playerSize;
			ball.y -= playerSize;
		}	
	}
	/* ################ DESNO DOL ##################
		################ DESNO DOL ##################
			################ DESNO DOL ##################
	*/
	else if(!ballDirectionUp && !ballDirectionLeft){ // zogca gre desno dol
		// zadel desni rob
		if(grid[(x/playerSize)+1][(y/playerSize)+1] == 2 && grid[(x/playerSize)][(y/playerSize)+1] != 2 && grid[(x/playerSize)+1][(y/playerSize)] == 2){ 
			//alert("desni!");
			
			ballDirectionLeft = 1;
			ballDirectionUp = 0;
			
			// odbijem levo-dol
			ball.x -= playerSize;
			ball.y += playerSize;
		}	
		// ce sm zadel ob spodnji rob
		else if(grid[(x/playerSize)+1][(y/playerSize)+1] == 2 && grid[(x/playerSize)][(y/playerSize)+1] == 2 && grid[(x/playerSize)+1][(y/playerSize)] != 2){ 
			//alert("spodnji!");
			
			ballDirectionLeft = 0;
			ballDirectionUp = 1;
			
			// odbijem desno-gor
			ball.x += playerSize;
			ball.y -= playerSize;
		}
		// zadel kot ALI spico (zunanji del kota)
		else if((grid[(x/playerSize)+1][(y/playerSize)+1] == 2 && grid[(x/playerSize)][(y/playerSize)+1] == 2 && grid[(x/playerSize)+1][(y/playerSize)] == 2) ||
		(grid[(x/playerSize)+1][(y/playerSize)+1] == 2 && grid[(x/playerSize)][(y/playerSize)+1] == 0 && grid[(x/playerSize)+1][(y/playerSize)] == 0)){
			//alert("kot!");
			
			ballDirectionLeft = 1;
			ballDirectionUp = 1;
			
			// odbijem isto kot sm prsu (levo gor)
			ball.x -= playerSize;
			ball.y -= playerSize;
		}		
		// zadel playerja ki rise crto
		else if(grid[(x/playerSize)+1][(y/playerSize)+1] == 1){
			alert("BUM");
			lives--;
			window.location.reload();
		}
		else{
			ball.x += playerSize;
			ball.y += playerSize;
		}	
	}
	/* ################ LEVO DOL ##################
		################ LEVO DOL ##################
			################ LEVO DOL ##################
	*/
	else if(!ballDirectionUp && ballDirectionLeft){ // zogca gre levo dol
		// zadel levi rob
		if(grid[(x/playerSize)-1][(y/playerSize)+1] == 2 && grid[(x/playerSize)][(y/playerSize)+1] != 2 && grid[(x/playerSize)-1][(y/playerSize)] == 2){ 
			//alert("levi!");
			
			ballDirectionLeft = 0;
			ballDirectionUp = 0;
			
			// odbijem desno-dol
			ball.x += playerSize;
			ball.y += playerSize;
		}	
		// ce sm zadel ob spodnji rob
		else if(grid[(x/playerSize)-1][(y/playerSize)+1] == 2 && grid[(x/playerSize)][(y/playerSize)+1] == 2 && grid[(x/playerSize)-1][(y/playerSize)] != 2){ 
			//alert("spodnji!");
			
			ballDirectionLeft = 1;
			ballDirectionUp = 1;
			
			// odbijem levo-gor
			ball.x -= playerSize;
			ball.y -= playerSize;
		}	
		// zadel kot ALI spico (zunanji del kota)
		else if((grid[(x/playerSize)-1][(y/playerSize)+1] == 2 && grid[(x/playerSize)][(y/playerSize)+1] == 2 && grid[(x/playerSize)-1][(y/playerSize)] == 2) ||
		(grid[(x/playerSize)-1][(y/playerSize)+1] == 2 && grid[(x/playerSize)][(y/playerSize)+1] == 0 && grid[(x/playerSize)-1][(y/playerSize)] == 0)){
			//alert("kot!");
			
			ballDirectionLeft = 0;
			ballDirectionUp = 1;
			
			// odbijem isto kot sm prsu (desno gor)
			ball.x += playerSize;
			ball.y -= playerSize;
		}	
		// zadel playerja ki rise crto
		else if(grid[(x/playerSize)-1][(y/playerSize)+1] == 1){
			alert("BUM");
			lives--;
			window.location.reload();
		}
		else{
			ball.x -= playerSize;
			ball.y += playerSize;
		}	
	}
	/* ################ DESNO GOR ##################
		################ DESNO GOR ##################
			################ DESNO GOR ##################
	*/
	else if(ballDirectionUp && !ballDirectionLeft){ // zogca gre desno gor
		// zadel desni rob
		if(grid[(x/playerSize)+1][(y/playerSize)-1] == 2 && grid[(x/playerSize)][(y/playerSize)-1] != 2 && grid[(x/playerSize)+1][(y/playerSize)] == 2){ 
			//alert("desni!");
			
			ballDirectionLeft = 1;
			ballDirectionUp = 1;
			
			// odbijem levo-gor
			ball.x -= playerSize;
			ball.y -= playerSize;
		}	
		// ce sm zadel ob zgornji rob
		else if(grid[(x/playerSize)+1][(y/playerSize)-1] == 2 && grid[(x/playerSize)][(y/playerSize)-1] == 2 && grid[(x/playerSize)+1][(y/playerSize)] != 2){ 
			//alert("zgornji!");
			
			ballDirectionLeft = 0;
			ballDirectionUp = 0;
			
			// odbijem desno-dol
			ball.x += playerSize;
			ball.y += playerSize;
		}
		// zadel kot ALI spico (zunanji del kota)
		else if((grid[(x/playerSize)+1][(y/playerSize)-1] == 2 && grid[(x/playerSize)][(y/playerSize)-1] == 2 && grid[(x/playerSize)+1][(y/playerSize)] == 2) ||
		(grid[(x/playerSize)+1][(y/playerSize)-1] == 2 && grid[(x/playerSize)][(y/playerSize)-1] == 0 && grid[(x/playerSize)+1][(y/playerSize)] == 0)){
			//alert("kot!");
			
			ballDirectionLeft = 1;
			ballDirectionUp = 0;
			
			// odbijem isto kot sm prsu (levo dol)
			ball.x -= playerSize;
			ball.y += playerSize;
		}	
		// zadel playerja ki rise crto
		else if(grid[(x/playerSize)+1][(y/playerSize)-1] == 1){
			alert("BUM");
			lives--;
			window.location.reload();
		}	
		else{
			ball.x += playerSize;
			ball.y -= playerSize;
		}	
	}
}

function managePlayerMoves(){	
	// gledam kam se premikam (tist kvadratek kamor naj bi se premaknu ce bi kliknu "up" v tem primeru)
	if(direction === "up" && grid[playerPic.x/playerSize][(playerPic.y/playerSize)-1] != 3){
		// ce je tam kamor hocem it ze crta, potem sm se zaletel		
		if(grid[playerPic.x/playerSize][(playerPic.y/playerSize)-1] == 1){
			alert("KRI");
			playerColor = "red";
			playerPic.scaleX = 5;
			playerPic.scaleY = 5;
			stop();
		}
		// risem crto, drugac samo playerja premaknem
		else if(grid[playerPic.x/playerSize][(playerPic.y/playerSize)-1] == 0){
			grid[playerPic.x/playerSize][(playerPic.y/playerSize)-1] = 1;
			
			// saving player move into the temporary arrays
			moveArrayX.push(playerPic.x/playerSize);
			moveArrayY.push((playerPic.y/playerSize)-1);
			
			var rect = new createjs.Shape();
			rect.graphics.beginFill(lineColor).drawRect(playerPic.x, playerPic.y-playerSize, playerSize, playerSize);
			// addChildAt zato da gre player lahko cez to potem v naslednjem koraku
			stage.addChildAt(rect,0);
		}
		// sedanje stanje je 1, zdaj prisel na rob stanje 2 (fillArea!)
		else if(grid[playerPic.x/playerSize][(playerPic.y/playerSize)] == 1 && grid[playerPic.x/playerSize][(playerPic.y/playerSize)-1] == 2){
			manageFillingAreas();
		}
		
		playerPic.y -= playerSize;
		
	}
	if(direction === "down" && grid[playerPic.x/playerSize][(playerPic.y/playerSize)+1] != 3){
		// ce je tam kamor hocem it ze crta, potem sm se zaletel
		if(grid[playerPic.x/playerSize][(playerPic.y/playerSize)+1] == 1){
			alert("KRI");
			playerColor = "red";
			playerPic.scaleX = 5;
			playerPic.scaleY = 5;
			stop();
		}
		
		// risem crto, drugac samo playerja premaknem
		else if(grid[playerPic.x/playerSize][(playerPic.y/playerSize)+1] == 0){
			grid[playerPic.x/playerSize][(playerPic.y/playerSize)+1] = 1;
			
			// saving player move into the temporary arrays
			moveArrayX.push(playerPic.x/playerSize);
			moveArrayY.push((playerPic.y/playerSize)+1);
			
			var rect = new createjs.Shape();
			rect.graphics.beginFill(lineColor).drawRect(playerPic.x, playerPic.y+playerSize, playerSize, playerSize);
			// addChildAt zato da gre player lahko cez to potem v naslednjem koraku
			stage.addChildAt(rect,0);

		}	
		// sedanje stanje je 1, zdaj prisel na rob stanje 2 (fillArea!)
		else if(grid[playerPic.x/playerSize][(playerPic.y/playerSize)] == 1 && grid[playerPic.x/playerSize][(playerPic.y/playerSize)+1] == 2){
			manageFillingAreas();
		}
		
		playerPic.y += playerSize;
	}
	if(direction === "left" && grid[(playerPic.x/playerSize)-1][playerPic.y/playerSize] != 3){
		if(grid[(playerPic.x/playerSize)-1][playerPic.y/playerSize] == 1){
			alert("KRI");
			playerColor = "red";
			playerPic.scaleX = 5;
			playerPic.scaleY = 5;
			stop();
		}
		
		// risem crto, drugac samo playerja premaknem
		else if(grid[(playerPic.x/playerSize)-1][playerPic.y/playerSize] == 0){	
			grid[(playerPic.x/playerSize)-1][playerPic.y/playerSize] = 1;
			
			// saving player move into the temporary arrays
			moveArrayX.push((playerPic.x/playerSize)-1);
			moveArrayY.push(playerPic.y/playerSize);
			
			var rect = new createjs.Shape();
			rect.graphics.beginFill(lineColor).drawRect(playerPic.x-playerSize, playerPic.y, playerSize, playerSize);
			// addChildAt zato da gre player lahko cez to potem v naslednjem koraku
			stage.addChildAt(rect,0);
	
		}	
		// sedanje stanje je 1, zdaj prisel na rob stanje 2 (fillArea!)
		else if(grid[playerPic.x/playerSize][(playerPic.y/playerSize)] == 1 && grid[(playerPic.x/playerSize)-1][playerPic.y/playerSize] == 2){
			manageFillingAreas();
		}
		
		playerPic.x -= playerSize;
			
	}
	if(direction === "right" && grid[(playerPic.x/playerSize)+1][playerPic.y/playerSize] != 3){
		
		// ce je tam kamor hocem it ze crta, potem sm se zaletel
		if(grid[(playerPic.x/playerSize)+1][playerPic.y/playerSize] == 1){
			alert("KRI");
			playerColor = "red";
			playerPic.scaleX = 5;
			playerPic.scaleY = 5;
			stop();
		}
		
		// risem crto, drugac samo playerja premaknem
		else if(grid[(playerPic.x/playerSize)+1][playerPic.y/playerSize] == 0){	
			grid[(playerPic.x/playerSize)+1][playerPic.y/playerSize] = 1;
			
			// saving player move into the temporary arrays
			moveArrayX.push((playerPic.x/playerSize)+1);
			moveArrayY.push(playerPic.y/playerSize);
			
			var rect = new createjs.Shape();
			rect.graphics.beginFill(lineColor).drawRect(playerPic.x+playerSize, playerPic.y, playerSize, playerSize);
			// addChildAt zato da gre player lahko cez to potem v naslednjem koraku
			stage.addChildAt(rect,0);

		}
		// sedanje stanje je 1, zdaj prisel na rob stanje 2 (fillArea!)
		else if(grid[playerPic.x/playerSize][(playerPic.y/playerSize)] == 1 && grid[(playerPic.x/playerSize)+1][playerPic.y/playerSize] == 2){
			manageFillingAreas();
		}
			
		playerPic.x += playerSize;
	}
}

function createText(){
	textL = new createjs.Text("lives left: 3", "14px Arial", "white");
	textL.x = canvas.width-80; 
	textL.y = 15;
	textL.textBaseline = "alphabetic";
	textL.visible = true;
	stage.addChild(textL);
}

function createPlayer(){
	playerPic = new createjs.Shape();
	playerPic.graphics.beginFill(playerColor).drawRect(0, 0, playerSize, playerSize);
	playerPic.x = playerSize;
	playerPic.y = playerSize;	
		
	stage.addChild(playerPic);
}

function createGrid(color,strokeStyle){
	// tole samo zame da vidm ce se pravilno odbijajo/premikajo stvari po gridu 
	
	// tole nardi 60 elementov Array[32] -> 60 stolpcev in 32 vrstic (600*320 px)
	grid = new Array(canvas.width/playerSize);
	gridTemp = new Array(canvas.width/playerSize);
	
	for (var i=0; i<grid.length; i++){
		grid[i] = new Array(canvas.height/playerSize);
		gridTemp[i] = new Array(canvas.height/playerSize);
	}
	
	// nardim robove z eno barvo, dolocim jim stevilko 3
	for(var i=0; i<grid.length; i++){
		for(var j=0; j<grid[i].length; j++){
			if (i == 0 || j == 0 || i == canvas.width/playerSize-1 || j == canvas.height/playerSize-1 ){
				grid[i][j] = 3; // 3 so robovi playground-a, kjer se player NEMORE premikat
				gridTemp[i][j] = 3;
				
				var rect = new createjs.Shape();
				rect.graphics.beginFill(outerEdgeColor).drawRect(playerSize*i, playerSize*j, playerSize, playerSize);;
				stage.addChild(rect);
			}
			else if (i == 1 || j == 1 || i == canvas.width/playerSize-2 || j == canvas.height/playerSize-2 ){
				grid[i][j] = 2; // 3 so robovi playground-a, kjer se player LAHKO PREMIKA 
				grid[i][j] = 2;
				
				var rect = new createjs.Shape();
				rect.graphics.beginFill(innerEdgeColor).drawRect(playerSize*i, playerSize*j, playerSize, playerSize);;
				stage.addChild(rect);
			}
			else{
				grid[i][j] = 0;	// znotraj se player LAHKO PREMIKA + RISE CRTO
				grid[i][j] = 0;
			}	
		}
	}
				
	// prvi stolpec prva vrstica
//	grid[0][0] = 1;
	// prvi stolpec zadnja vrstica
//	grid[0][31] = 1;
	// zadnji stolpec prva vrstica
//	grid[59][0] = 1;
	// zadnji stolpec zadnja vrstica
//	grid[59][31] = 1;
	
	// risanje grid crt cez cel canvas
	var line = new createjs.Shape();
	line.graphics.setStrokeStyle(strokeStyle);
	for (var y=0; y<canvas.width; y+=playerSize){
		// vodoravne crte
		line.graphics.beginStroke(color);
        line.graphics.moveTo(0, y);
        line.graphics.lineTo(canvas.width, y);
        line.graphics.endStroke();
		stage.addChild(line);
		// navpicne crte
		line.graphics.beginStroke(color);
		line.graphics.moveTo(y, 0);
        line.graphics.lineTo(y, canvas.width);
        line.graphics.endStroke();
		stage.addChild(line);
	}
}

function createEdges(color){
	var line = new createjs.Shape();
	// 4x zacetni rob za playground
	// to lahko tud potem pustim, za zacetne robove playground-a
	line.graphics.beginStroke(color);
    line.graphics.moveTo(playerSize, playerSize);
    line.graphics.lineTo(playerSize, canvas.height-playerSize);
    line.graphics.endStroke();
	stage.addChild(line);
	
	// to lahko tud potem pustim, za zacetne robove playground-a
	line.graphics.beginStroke(color);
    line.graphics.moveTo(playerSize, playerSize);
    line.graphics.lineTo(canvas.width-playerSize, playerSize);
    line.graphics.endStroke();
	stage.addChild(line);
	
	// to lahko tud potem pustim, za zacetne robove playground-a
	line.graphics.beginStroke(color);
    line.graphics.moveTo(canvas.width-playerSize, playerSize);
    line.graphics.lineTo(canvas.width-playerSize, canvas.height-playerSize);
    line.graphics.endStroke();
	stage.addChild(line);
	
	// to lahko tud potem pustim, za zacetne robove playground-a
	line.graphics.beginStroke(color);
    line.graphics.moveTo(playerSize, canvas.height-playerSize);
    line.graphics.lineTo(canvas.width-playerSize, canvas.height-playerSize);
    line.graphics.endStroke();
	stage.addChild(line);
}

// function to figure out which key was pressed
function whatKey(event) {
	switch (event.keyCode) {
		// space
		case 32:
			break;
		// left arrow
        case 37:
        	direction = "left";
    	    break;
        // right arrow
        case 39:
        	direction = "right";
	        break;
        // down arrow
        case 40:
        	direction = "down";
          	break;
        // up arrow 
        case 38:
        	direction = "up";
          	break;    	
	}
}      	
