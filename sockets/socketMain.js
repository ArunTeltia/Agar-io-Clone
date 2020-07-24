const io = require('../server').io
const checkForOrbCollisions = require('./checkCollision').checkForOrbCollisions
const checkForPlayerCollisions = require('./checkCollision').checkForPlayerCollisions


const Player = require("./classes/Player");
const PlayerConfig = require("./classes/PlayerConfig");
const PlayerData = require("./classes/PlayerData")
const Orb = require('./classes/Orb');
let orbs = []
let players = []
let settings = {
    defaultOrbs: 5000,
    defaultSpeed: 6,
    defaultSize: 6,
    defaultZoom: 1.5,
    worldWidth: 5000,
    worldHeight: 5000,

}
initGame();
// issue a message to every connected 30 fps

io.sockets.on('connect', (socket) => {
    let player = {};
    socket.on('init', (data => {
        console.log(data.playerName + "I am a monkey");
        socket.join('game');
        let playerConfig = new PlayerConfig(settings);
        let playerData = new PlayerData(data.playerName, settings);
        console.log(playerData.locX)
        player = new Player(socket.id, playerConfig, playerData);

        setInterval(() => {
            io.to('game').emit('tock', {
                players,
                playerX: player.playerData.locX,
                playerY: player.playerData.locY
            })
        }, 33)

        socket.emit('initReturn', {
            orbs
        })
        players.push(playerData)
    }))
    socket.on('tick', (data) => {
        // console.log(player)
        if (player.playerConfig) {
            speed = player.playerConfig.speed
            xV = player.playerConfig.xVector = data.xVector;
            yV = player.playerConfig.yVector = data.yVector;

            if ((player.playerData.locX < 5 && player.playerData.xVector < 0) || (player.playerData.locX > settings.worldWidth) && (xV > 0)) {
                player.playerData.locY -= speed * yV;
            } else if ((player.playerData.locY < 5 && yV > 0) || (player.playerData.locY > settings.worldHeight) && (yV < 0)) {
                player.playerData.locX += speed * xV;
            } else {
                player.playerData.locX += speed * xV;
                player.playerData.locY -= speed * yV;
            }
            //orb collision
            let capturedOrb = checkForOrbCollisions(player.playerData, player.playerConfig, orbs, settings)
            capturedOrb.then((data) => {
                //if collision happens 
                // console.log('Orb collision')
                // emit to all sockets the orbs replace
                const orbData = {
                    orbIndex: data,
                    newOrb: orbs[data]
                }
                io.sockets.emit('orbSwitch', orbData);
            }).catch(() => {
                //no collision
                // console.log('no collision')


            })
        }
    })

})

function initGame() {
    for (let i = 0; i < settings.defaultOrbs; i++) {
        orbs.push(new Orb(settings))
    }
}
module.exports = io