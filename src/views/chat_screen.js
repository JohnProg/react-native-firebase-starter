import React, { Component } from 'react'
import {
  Text,
  TextInput,
  View,
  StatusBar,
  StyleSheet,
  Dimensions,
  Image,
  ScrollView,
  TouchableOpacity
} from 'react-native'
import { getColor } from '../components/config'
import { firebaseApp } from '../firebase'
import firebase from 'firebase'
import Icon from 'react-native-vector-icons/Ionicons'
import EvilIcon from 'react-native-vector-icons/EvilIcons'
import { observer,inject } from 'mobx-react/native'
import { Actions } from 'react-native-mobx'
import { GiftedChat } from 'react-native-gifted-chat'


const screenWidth = Dimensions.get('window').width

@inject("appStore") @observer
export default class ChatScreen extends Component {
  constructor(props) {
    super(props)
    this.state = {
      messages: [],
    }
  }

  componentWillMount() {
    this._loadMessages((message) => {
      this.setState((previousState) => {
        return {
          messages: GiftedChat.append(previousState.messages, message),
        }
      })
    })
  }

  componentDidMount() {

  }

  componentWillUnmount() {
    firebaseApp.database().ref('messages').child(this.props.postProps.postId).off()
  }

  _loadMessages(callback) {
    const onReceive = (data) => {
      const message = data.val()
      callback({
        _id: data.key,
        text: message.text,
        createdAt: new Date(message.createdAt),
        user: {
          _id: message.user._id,
          name: message.user.name,
        },
      });
    };
    firebaseApp.database().ref('messages').child(this.props.postProps.postId).limitToLast(20).on('child_added', onReceive)
  }

  _onSend = (messages = []) => {
    for (let i = 0; i < messages.length; i++) {
      firebaseApp.database().ref('messages').child(this.props.postProps.postId).push({
        text: messages[i].text,
        user: messages[i].user,
        createdAt: firebase.database.ServerValue.TIMESTAMP,
      })
      firebaseApp.database().ref('messages_notif').child(this.props.postProps.postId).once('value')
      .then((snapshot) => {
        console.log("player_ids: ");
        console.log(snapshot.val());
        if (snapshot.val()) {
          snapshot.val().include_player_ids.map((playerId) => {
            console.log(playerId);
            if (playerId != this.props.appStore.user.uid) {
              console.log("PUSHING NOTIFICATION !!! " + playerId);
              fetch('https://onesignal.com/api/v1/notifications',
              {
                method: 'POST',
                headers: {
                  'Accept': 'application/json',
                  'Content-Type': 'application/json',
                  'Authorization': 'Basic OGIzOTFhYzktOGUwNS00OTJjLWE4N2MtNTMwNGQzYTNjYTk1',
                },
                body: JSON.stringify(
                {
                  app_id: "a8f852be-2aa4-4c9d-a1b3-38d630926927",
                  included_segments: ["All"],
                  android_sound: "fishing",
                  ios_sound: "fishing.caf",
                  data: {"postId": this.props.postProps.postId},
                  headings: {"en": "New message from " + this.props.appStore.user.displayName},
                  contents: {"en": messages[i].text },
                  filters: [{"field":"tag","key":"uid","relation":"=","value":playerId}],
                })
              })
              .then((responseData) => {
                  console.log("Push POST:" + JSON.stringify(responseData));
              })
              .catch((errorData) => {
                  console.log("Push ERROR:" + JSON.stringify(errorData));
              })
              .done()
            }
          })
          if (snapshot.val().include_player_ids.indexOf(this.props.appStore.user.uid) === -1) {
            const playerIds = snapshot.val().include_player_ids
            playerIds.push(this.props.appStore.user.uid)
            console.log("ADDDDDING NEW PLAYER to " + this.props.postProps.postId);
            console.log(playerIds)
            firebaseApp.database().ref('messages_notif').child(this.props.postProps.postId).set({include_player_ids: playerIds})
          }
          else {
            console.log("This item already exists");
          }
        }
        else {
          firebaseApp.database().ref('messages_notif').child(this.props.postProps.postId).set({include_player_ids: [this.props.appStore.user.uid]})
        }
      })
    }
  }

  render() {
    return (
            <GiftedChat
              messages={this.state.messages}
              onSend={this._onSend}
              user={{
                _id: this.props.appStore.user.uid,
                name: this.props.appStore.username,
              }}
            />
          )
  }
}

const styles = StyleSheet.create({

})
