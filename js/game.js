// JavaScript Document

ls = function(){
	this.player = {
		hitPoints : {sheild:20, armor:10, core:3},
		weaponPower : 1,
		weaponSpeed : 1,
		weaponMax : 10,
		maxSpeed : 0.1,
		accel : 0.0001,
		specialAmmo : 3,
		mesh : null,
		currentSpeed : [0,0,0],	
		currentThrust : [0,0,0],
		shotTimer : 0,
		shotInt: 10,
		shotMax: 6,
		};
	
	this.enemeys = [];
	this.bullets = [];
	this.eBullets =[];
	this.items = [];
	this.coPilots = [];
	this.meshCache = {};
	this.materialCache = {};
		
	
	this._init();
	this.ui = {
		e1 : document.getElementById('engine-1-bar'),
		e2 : document.getElementById('engine-2-bar'),
		shot : document.getElementById('shot-timer-bar'),
	}
	this.ui.e1Width = this.ui.e1.offsetWidth;
	this.ui.e2Width = this.ui.e2.offsetWidth;
	this.ui.shotWidth = this.ui.shot.offsetWidth-2;
	
	return this;
};

ls.prototype._init = function(){
	this.canvas = document.querySelector("#game");
	this.engine = new BABYLON.Engine(this.canvas, true);
	this.ui = document.querySelector("#ui");
	var self = this;
	var createScene = function () {
         
         var scene = new BABYLON.Scene(self.engine);
        
         scene.clearColor = new BABYLON.Color3(0.2, 0.2, 0.3);
        
         var camera = new BABYLON.FreeCamera("camera1", new BABYLON.Vector3(0, 1.35, 5), scene);
         camera.setTarget(new BABYLON.Vector3(0, 1, -1));
         camera.attachControl(self.canvas, false);
      
         var light = new BABYLON.HemisphericLight("light1", new BABYLON.Vector3(0.15, 50, 0.5), scene);
         light.intensity = .5;	
		 
		  BABYLON.OBJFileLoader.OPTIMIZE_WITH_UV = true;
		 	var loader = new BABYLON.AssetsManager(scene);
		 	var newload = loader.addMeshTask("player_ship", "", "./", 'LSBAG001.OBJ');
		 	newload.onSuccess = function (task) {
			//console.log(task);
			for(var i=0; i<task.loadedMeshes.length; i++){
				var mesh = task.loadedMeshes[i];
				mesh.renderingGroupId = 2;
				var positions = mesh.getVerticesData(BABYLON.VertexBuffer.PositionKind);
       			var indices = mesh.getIndices();
        		var normals = mesh.getVerticesData(BABYLON.VertexBuffer.NormalKind);
       			mesh.updateVerticesData(BABYLON.VertexBuffer.NormalKind, normals, true, true);
				BABYLON.VertexData.ComputeNormals(positions, mesh.getIndices(), normals);
			}
			if(task.name == "player_ship"){
				self.meshCache[task.name] = task.loadedMeshes[0];
				self.player.mesh = self.meshCache[task.name];
				var playerMat = new BABYLON.StandardMaterial("Player_Mat", scene);
				playerMat.diffuseTexture = new BABYLON.Texture("./assets/player/ship/lsbag001color.jpg", scene);
				playerMat.normalTexture = new BABYLON.Texture("./assets/player/ship/lsbag001Normal.jpg", scene);
				self.player.mesh.material = playerMat;
				var particleSystem = new BABYLON.ParticleSystem("left_Engine", 200, scene);
				particleSystem.renderingGroupId = 2;
 				particleSystem.particleTexture = new BABYLON.Texture('./assets/player/ship/engine_pulse.jpg', scene);
				particleSystem.color1 = new BABYLON.Color4(0, 1, 0.7, 0.5);
    	
    			particleSystem.emitter = self.player.mesh; // the starting object, the emitter
   				particleSystem.minEmitBox = new BABYLON.Vector3(0.26, -0.175, 0.9); // Starting all from
   				particleSystem.maxEmitBox = new BABYLON.Vector3(0.26, -0.175, 0.9); // To...
				
   				particleSystem.minSize = 0.2;
    			particleSystem.maxSize = 0.35;
				particleSystem.opacity = 0.5;

   				particleSystem.minLifeTime = 0.01;
   				particleSystem.maxLifeTime = 0.02;
			    particleSystem.emitRate = 100;

   				 particleSystem.blendMode = BABYLON.ParticleSystem.BLENDMODE_ONEONE;
    			 particleSystem.gravity = new BABYLON.Vector3(0, 0, 20);
   	
   				particleSystem.minAngularSpeed = 0;
    			particleSystem.maxAngularSpeed = 0;

    			particleSystem.minEmitPower = 0.2;
    			particleSystem.maxEmitPower = 0.3;
    			particleSystem.updateSpeed = 0.005;
				self.player.engine = {};
				particleSystem.start();
				self.player.engine.left = particleSystem;
				self.player.engine.right = particleSystem.clone("right_Engine", self.player.mesh);
				self.player.engine.right.minEmitBox.x *= -1;
   				self.player.engine.right.maxEmitBox.x *= -1;
    			triggerRegister();
			}
			
			
		};
			loader.load();
        	scene.debugLayer.show();
			
			

			
			
			var keys = {};
			
		document.onkeydown = function (e) {
    		e = e || window.event;//Get event
   			//console.log(e);
			keys[e.keyCode] = true;
			//console.log(JSON.stringify(keys));
			};
		document.onkeyup = function (e) {
    		e = e || window.event;//Get event
   			//console.log(e);
			keys[e.keyCode] = false;
			//console.log(JSON.stringify(keys));
			};
			
			
			function triggerRegister(){
				for(var x=-20; x<20; x+=5){
					for(var z=-10; z>-80; z-=5){
						self.enemeys.push(new ls.enemy(new BABYLON.Vector3(x,0,z), self.scene));
					}	
				}
				
				scene.registerBeforeRender(function(){
				camera.position = new BABYLON.Vector3(self.player.mesh.position.x,self.player.mesh.position.y+1.35,self.player.mesh.position.z+5);
				if(keys['68']){					
					self.player.currentThrust[0] -= self.player.accel
				}else				
				if(keys['65']){					
					self.player.currentThrust[0] += self.player.accel;
				}else{
					self.player.currentThrust[0] *= 0.98;
				}
				
				if(self.player.currentSpeed[0]<self.player.maxSpeed*-1){
				self.player.currentSpeed[0]=self.player.maxSpeed*-1;
				}else if(self.player.currentSpeed[0]>self.player.maxSpeed){
					self.player.currentSpeed[0]=self.player.maxSpeed;
				}
			
				
				self.player.currentSpeed[0] += self.player.currentThrust[0];
				self.player.mesh.position.x += self.player.currentSpeed[0];
				var yaw = (Math.abs(self.player.currentSpeed[0]/self.player.maxSpeed)/4)*Math.PI;
				if(self.player.currentSpeed[0]>0){
					yaw*=-1;	
				}
				self.player.mesh.rotation.z = yaw;
				self.player.currentSpeed[0]*= 0.95;
				if(self.player.currentSpeed[0]<0.00001 && self.player.currentSpeed[0]>-0.00001){
				self.player.currentSpeed[0] = 0;
				
				}
				var es = Math.abs(self.player.currentSpeed[0])/self.player.maxSpeed;
				if(es>1){es=1};
				es*=100;
				if(self.player.currentSpeed[0]>0){
					self.ui.e1.style.setProperty('width', parseInt(es)+'%');
				}else if(self.player.currentSpeed[0]<0){
					self.ui.e2.style.setProperty('width', parseInt(es)+'%');
				}else{
					self.ui.e1.style.setProperty('width', '0px');
					self.ui.e2.style.setProperty('width', '0px');
				}
				//console.log(es);
				if(keys['32']){
					if(self.player.shotTimer == 0 && self.player.shotMax > self.bullets.length){
						self.spawnBullet();
						self.player.shotTimer++;						
					}else if(self.player.shotTimer>=self.player.shotInt){
						self.player.shotTimer = 0;	
					}
					//console.log(self.player.shotTimer);
				}
				if(self.player.shotTimer<self.player.shotInt && self.player.shotTimer !=0){
					self.player.shotTimer++;
				}else{
					self.player.shotTimer = 0;
				}
				
				//LOOPS
				for(var i = 0; i<self.bullets.length; i++){
					var b = self.bullets[i];
						b.mesh.position.z -= 0.1;
						if(b.life<b.lifeSpan){
							b.life++;
						}else{
							self.bullets.splice(i,1);
							i--;
							b.mesh.dispose();
						}
						
						for(var j=0; j<self.enemeys.length; j++){
								var ene = self.enemeys[j];
							if (ene.mesh.intersectsMesh(b.mesh, true)) {
  							self.bullets.splice(i,1);
							i--;
							b.mesh.dispose();
							self.enemeys.splice(j,1);
							j = self.enemeys.length;
							ene.mesh.dispose();							
							}
						}
					
				}
				
				//SHOT UI
				var aChunk = self.ui.shotWidth/self.player.shotMax;
				aChunk *= self.bullets.length;
				self.ui.shot.style.setProperty('width', self.ui.shotWidth-aChunk+'px');
				self.ui.shot.style.setProperty('opacity', 1-(self.player.shotTimer/self.player.shotInt));
			});
		}
			
         return scene;
      }; 
	  
      this.scene = createScene();
	  
	  this.engine.runRenderLoop(function () {
         self.scene.render();
      });
     
      window.addEventListener("resize", function () {
         self.engine.resize();
      });
	
};


ls.prototype.spawnBullet = function(){

this.bullets.push(new ls.bullet('good',this.player.mesh.position, this.scene));

}



ls.bullet = function(type, pos, scene){
	this.type = type;
	this.startPos = pos.clone();
	this.scene = scene;
	this.mesh = BABYLON.MeshBuilder.CreateCylinder("good-bullet", {height: 0.2, diameter: 0.03, tessellation: 6}, scene);
	this.mesh.position = this.startPos;
	this.mesh.position.z-=0.35;
	//this.mesh.position.y+=0.1;
	this.mesh.rotation.x = Math.PI/2;
	this.mesh.renderingGroupId = 1;
	this.life = 0;
	this.lifeSpan = 300;
	
	return this;
};






ls.enemy = function(pos, scene){
	this.mesh = BABYLON.Mesh.CreateSphere("pref", 6, 2, scene);
	this.mesh.position = pos.clone();
	return this;
};


