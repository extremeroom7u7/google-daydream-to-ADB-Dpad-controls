# google-daydream-to-ADB-Dpad-controls
a little funky control based of https://github.com/mrdoob/daydream-controller.js/ source code.
works like the following:
when the ABDhandler.js is ran it will create a websocket server which the page.html will connect to after connecting a google daydream controller
ADBhandler will read the following inputs: isclickdown, Xtouch & Ytouch. and interpret them to Dpad inputs, pressing on the center will trigger "A" on a gamepad and double clicking will trigger "B"
these inputs are send via ADB commands to any android device that have developer options on and adb enable.
