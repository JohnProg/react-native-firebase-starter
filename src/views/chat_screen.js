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
    this.setState({
      messages: [
        {
          _id: 2,
          text: this.props.postProps.postContent,
          createdAt: new Date(Date.UTC(2016, 7, 30, 17, 20, 0)),
          user: {
            _id: 2,
            name: this.props.postProps.posterName,
            //avatar: 'https://facebook.github.io/react/img/logo_og.png',
          },
        },
        {
          _id: 1,
          text: this.props.postProps.postTitle,
          createdAt: new Date(Date.UTC(2016, 7, 30, 17, 20, 0)),
          user: {
            _id: 2,
            name: this.props.postProps.posterName,
            //avatar: 'https://facebook.github.io/react/img/logo_og.png',
          },
          image: this.props.postProps.imagePath,
        },
      ],
    })
  }

  _onSend = (messages = []) => {
    this.setState((previousState) => {
      return {
        messages: GiftedChat.append(previousState.messages, messages),
      }
    })
  }

  render() {
    const height = screenWidth*this.props.postProps.imageHeight/this.props.postProps.imageWidth
    return (
            <GiftedChat
              messages={this.state.messages}
              onSend={this._onSend}
              user={{
                _id: 1,
              }}
            />
          )
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
    marginTop: 56,
  },
  card: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#e2e2e2',
    borderRadius: 2,
    backgroundColor: '#eee',
    padding: 10,
    margin: 5,
    //justifyContent: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 5,
  },
  postInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 5,
  },
  itemIcon: {
    marginRight: 10
  },
  username: {
    color: getColor(),
    fontSize: 16,
    marginRight: 10,
  },
  time: {
    fontSize: 15,
  },
  content: {
    marginTop: 5,
    fontSize: 14
  },
})
