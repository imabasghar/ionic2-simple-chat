import {Page, IonicApp} from 'ionic-angular';
import {Http} from "angular2/http";
import {NgZone, AfterViewInit} from "angular2/core";

declare var io;

@Page({
  templateUrl: 'build/pages/home/home.html',
})

export class HomePage implements AfterViewInit{
  messages;
  socketHost;
  zone;
  chatBox;
  socket;
  userId;

  constructor(http: Http, private app: IonicApp) {
    this.userId = Math.random();
    this.messages = [];
    this.socketHost = "http://localhost:3000";
    this.zone = new NgZone({enableLongStackTrace: false});
    http.get(this.socketHost + "/fetch").subscribe((success) => {
      var data = success.json();
      for(var i = 0; i < data.length; i++) {
        this.messages.push(data[i].message);
      }
      var messagesContent = this.app.getComponent('messagesContent') as Content;
      messagesContent.scrollTo(0, this.messages.length * 46, 700);
      console.log(messagesContent.getContentDimensions());
    }, (error) => {
      console.log(JSON.stringify(error));
    });
    this.chatBox = "";
    this.socket = io(this.socketHost);
    this.socket.on("chat_message", (msg) => {
      this.zone.run(() => {
        this.messages.push(msg);
        var messagesContent = this.app.getComponent('messagesContent') as Content;
        messagesContent.scrollTo(0, messagesContent.getContentDimensions().contentBottom + messagesContent.getContentDimensions().scrollBottom , 700);
        console.log(messagesContent.getContentDimensions());
      });
    });
  }

  send(message) {
    if(message && message != "") {
      this.socket.emit("chat_message", {userId: this.userId, message: message});
    }
    this.chatBox = "";
  }
}