const WebSocket = require('ws');
const wss = new WebSocket.Server({ port: 7777 });
const { exec } = require("child_process");

console.log("WebSocket server running at ws://localhost:7777");

function sendAdbCommand(command) {
    exec(`adb shell ${command}`, (error, stdout, stderr) => {
        if (error) {
            console.error(`Error: ${error.message}`);
            return;
        }
        if (stderr) {
            console.error(`Stderr: ${stderr}`);
            return;
        }
    });
}


wss.on('connection', (ws) => {
    console.log('Client connected');
    
    let prevDirection = null;
    let prevCenterState = false;
   
    let lastCenterClickTime = 0;
    const doubleClickThreshold = 500; 
    let pendingDoubleClick = false;
    let centerClickTimer = null;
    
    ws.on('message', (message) => {
        try {
            const data = JSON.parse(message);
            
            if (data.TouchClick === true) {
                let currentDirection = null;
                const currentTime = Date.now();
                
                const isCenterPosition = (data.TouchX >= 0.45 && data.TouchX <= 0.55 && 
                                        data.TouchY >= 0.45 && data.TouchY <= 0.55);
                
                if (isCenterPosition) {
 
                    if (!prevCenterState) {

                        if (pendingDoubleClick && currentTime - lastCenterClickTime < doubleClickThreshold) {
 
                            if (centerClickTimer) {
                                clearTimeout(centerClickTimer);
                                centerClickTimer = null;
                            }
                            console.log("double click was executed");

                            sendAdbCommand("input keyevent 97");

                            pendingDoubleClick = false;
                            lastCenterClickTime = 0;
                        } else {
                            pendingDoubleClick = true;
                            lastCenterClickTime = currentTime;
                            
                            if (centerClickTimer) {
                                clearTimeout(centerClickTimer);
                            }
                            
                            centerClickTimer = setTimeout(() => {
                                if (pendingDoubleClick) {
                                    console.log("Center action triggered");
                                    sendAdbCommand("input keyevent 96");
                                    pendingDoubleClick = false;
                                }
                                centerClickTimer = null;
                            }, doubleClickThreshold);
                        }
                        prevCenterState = true;
                    }
                } else {

                    prevCenterState = false;

                    const horizontalStrength = Math.abs(data.TouchX - 0.5);
                    const verticalStrength = Math.abs(data.TouchY - 0.5);

                    if (horizontalStrength > verticalStrength) {
 
                        currentDirection = data.TouchX >= 0.4 ? "right" : "left";
                    } else {

                        currentDirection = data.TouchY >= 0.4 ? "down" : "up";
                    }

                    if (currentDirection !== prevDirection) {
                        switch (currentDirection) {
                            case "right":
                                console.log("Right action triggered");
                                sendAdbCommand("input keyevent 22");
                                break;
                            case "left":
                                console.log("Left action triggered");
                                sendAdbCommand("input keyevent 21");
                                break;
                            case "down":
                                console.log("Down action triggered");
                                sendAdbCommand("input keyevent 20");
                                break;
                            case "up":
                                console.log("Up action triggered");
                                sendAdbCommand("input keyevent 19");
                                break;
                        }
                        
                        prevDirection = currentDirection;
                    }
                }
            } else {

                prevDirection = null;
                prevCenterState = false;

            }
        } catch (error) {
            console.error('Error parsing message:', error);
        }
    });
    
    ws.on('close', () => {
        console.log('Client disconnected');

        if (centerClickTimer) {
            clearTimeout(centerClickTimer);
        }
    });
    
    ws.on('error', (error) => {
        console.error('WebSocket error:', error);
    });
});