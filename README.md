![](./src/assets/images/icons/app-icon.png)

# theinstashare-desktop
theinstashare-desktop is the desktop version of TheInstashare application which is a suite of apps built on top of WebRTC tech stack. Every feature is powered by the underlying peer to peer streaming capabilities provided by WebRTC stack. Product is still very much under active development and currently host only one app for peer to peer communication but more apps will going to be added related to webrtc use-cases like group communication and peer to peer games etc.

### Try web version at - https://theinstashare.com/

Currently, it supports the following features -
### Major Features - 
- Text Chat
- Audio Chat
- Video Chat
- Screen Sharing
- File Sharing
- Access Remote Machine
- Share Remote Access (Share keyboard and mouse control with a remote user)
- Share System Sound

NOTE - For web version of the app please follow following bitbucket repo - 

```
https://bitbucket.org/ironman0693/instashare/src/develop/
```

### Minor Features - 
- Flip Camera
- Do not disturb
- Mute
- Full-Screen Mode
- Shared Media Download
- Automatic reconnection attempt

### Steps to build the app - 
```
npm install
npm run electron:build
#packaged app will be placed in release folder
```

### Features working status - 

| Features      | Windows       | Mac |
|:------------- |:-------------:|:-----:|
| Text Chat | Yes | Yes |
| Audio Chat | Yes | Yes |
| Video Chat | Yes | Yes |
| Screen Sharing | Yes | Yes |
| File Transfer | Yes | Yes |
| Access Remote Machine | Yes | Yes |
| Share Remote Access | Yes | Yes |
| Share System Sound | Yes | No |

### Screenshots -

![](./markdown-images/login.png)

![](./markdown-images/app-dashboard.png)

![](./markdown-images/login-popup.png)

![](./markdown-images/text-screen.png)

![](./markdown-images/calling-screen.png)

![](./markdown-images/mobile-video-options.png)

![](./markdown-images/mobile-video.png)

![](./markdown-images/screen-sharing.png)

![](./markdown-images/screen.png)

![](./markdown-images/video.jpg)

### Credits - 
App bootstrapped using awesome [angular-electron](https://github.com/maximegris/angular-electron) project

### Author - 
Gaurav Kumar Yadav

Email - gaurav10610@gmail.com

Linkedin - https://www.linkedin.com/in/gaurav-kumar-yadav-6125817a/