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
import { GiftedChat, Bubble } from 'react-native-gifted-chat'
import Lightbox from 'react-native-lightbox'


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
    console.log("---- CHAT WILL MOUNT ----- " + this.props.appStore.new_messages);
    if (this.props.postProps.image) {
      this.setState((previousState) => {
        return {
          messages: GiftedChat.append(previousState.messages, {
            _id: 1,
            text: this.props.postProps.title,
            createdAt: new Date(this.props.postProps.createdAt),
            user: {
              _id: this.props.postProps.uid,
              name: this.props.postProps.username,
            },
            image: this.props.postProps.image,
          }),
        }
      })
    }
    if (this.props.postProps.price) {
      this.setState((previousState) => {
        return {
          messages: GiftedChat.append(previousState.messages, {
            _id: 2,
            text: this.props.postProps.price,
            createdAt: new Date(this.props.postProps.createdAt),
            user: {
              _id: this.props.postProps.uid,
              name: this.props.postProps.username,
            },
          }),
        }
      })
    }
    if (this.props.postProps.text) {
      this.setState((previousState) => {
        return {
          messages: GiftedChat.append(previousState.messages, {
            _id: 3,
            text: this.props.postProps.text,
            createdAt: new Date(this.props.postProps.createdAt),
            user: {
              _id: this.props.postProps.uid,
              name: this.props.postProps.username,
            },
          }),
        }
      })
    }
    if (this.props.wantToBuy) {
      this.setState((previousState) => {
        return {
          messages: GiftedChat.append(previousState.messages, {
            _id: 4,
            text: "Please use this chat to confirm your order with the fisherman.",
            createdAt: new Date(this.props.postProps.createdAt),
            user: {
              _id: 0,
              name: "Fishii",
              avatar: 'https://github.com/jsappme/react-native-firebase-starter/raw/wip/src/assets/images/jsapp.png',
            },
          }),
        }
      })
    }
    console.log(this.props.postProps);
    if (this.props.postProps.new_messages) {
      this.props.appStore.new_messages = 0
    }
    this.props.appStore.current_page = 'chat'
    this.props.appStore.current_puid = this.props.postProps.puid
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

  _loadMessages(callback) {
    console.log("---------- LOAD MESSAGES ---------- " + this.props.postProps.puid);
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
      if (this.props.postProps.new_messages) {
        firebaseApp.database().ref('userchats/'+this.props.appStore.user.uid+'/posts').child(this.props.postProps.puid).update( { new_messages:0 } )
      }
    };
    firebaseApp.database().ref('messages').child(this.props.postProps.puid).limitToLast(20).on('child_added', onReceive)
  }

  _onSend = (messages = []) => {
    for (let i = 0; i < messages.length; i++) {
      firebaseApp.database().ref('posts').child(this.props.postProps.puid).update( {updatedAt: firebase.database.ServerValue.TIMESTAMP} )
      firebaseApp.database().ref('messages').child(this.props.postProps.puid).push({
        text: messages[i].text,
        user: messages[i].user,
        createdAt: firebase.database.ServerValue.TIMESTAMP,
      })
      firebaseApp.database().ref('messages_notif').child(this.props.postProps.puid).once('value')
      .then((snapshot) => {
        console.log("player_ids: ");
        console.log(snapshot.val());
        if (snapshot.val()) {
          snapshot.val().include_player_ids.map((playerId) => {
            console.log("+-------> " + playerId)
            firebaseApp.database().ref('userchats/'+this.props.appStore.user.uid+'/posts').child(this.props.postProps.puid).update({ updatedAt: firebase.database.ServerValue.TIMESTAMP })
            if (playerId != this.props.appStore.user.uid) {
              firebaseApp.database().ref('userchats/'+playerId+'/posts').child(this.props.postProps.puid).transaction(
                (post) => {
                  if (post) {
                    post.new_messages++;
                    post.updatedAt = firebase.database.ServerValue.TIMESTAMP
                  }
                  return post;
                }
              )
              console.log("PUSHING NOTIFICATION !!! " + this.props.title);
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
                  data: {"postProps": this.props.postProps},
                  headings: {"en": "New message from " + this.props.appStore.user.displayName},
                  contents: {"en": messages[i].text },
                  filters: [{"field":"tag","key":"uid","relation":"=","value":playerId}],
                })
              })
              .then((responseData) => {
                console.log("Push POST:" + JSON.stringify(responseData))
              })
              .catch((errorData) => {
                console.log("Push ERROR:" + JSON.stringify(errorData))
              })
              .done()
            }
          })
          if (snapshot.val().include_player_ids.indexOf(this.props.appStore.user.uid) === -1) {
            const playerIds = snapshot.val().include_player_ids
            playerIds.push(this.props.appStore.user.uid)
            console.log("ADDDDDING NEW PLAYER to " + this.props.postProps.puid);
            console.log(playerIds)
            firebaseApp.database().ref('messages_notif').child(this.props.postProps.puid).set({include_player_ids: playerIds})
            firebaseApp.database().ref('userchats/'+this.props.appStore.user.uid+'/posts').child(this.props.postProps.puid).set(this.props.postProps)
          }
        }
        else {
          firebaseApp.database().ref('messages_notif').child(this.props.postProps.puid).set({include_player_ids: [this.props.appStore.user.uid]})
        }
      })
    }
  }

  componentWillUnmount() {
    console.log("---- CHAT UNMOUNT ---")
    this.props.appStore.current_page = ''
    this.props.appStore.current_puid = ''
    firebaseApp.database().ref('messages').child(this.props.postProps.puid).off()
  }

  renderLightboxContent = (props) => {
    return (
            <Image
              source={{ uri:this.props.postProps.image }}
              resizeMode='contain'
              style={{
                marginTop:60,
                width: screenWidth,
                height: this.props.postProps.imageHeight,
              }}
            />
          )
  }

  renderMessageImage = (props) => {
    return (
             <View>
              <Lightbox renderContent={this.renderLightboxContent}>
                <Image
                  source={{ uri:props.currentMessage.image }}
                  style={{
                          width: 250,
                          height: 150,
                          borderRadius: 13,
                          margin: 3,
                          resizeMode: 'cover',
                        }}
                />
              </Lightbox>
            </View>
          )
  }

  render() {
    return (<View style={{marginTop:56,flex:1,}}>
              <GiftedChat
                messages={this.state.messages}
                onSend={this._onSend}
                user={{
                  _id: this.props.appStore.user.uid,
                  name: this.props.appStore.username,
                }}
                renderMessageImage={this.renderMessageImage}
              />
            </View>
          )
  }
}

const styles = StyleSheet.create({

})
