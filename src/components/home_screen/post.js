import React, { Component } from 'react'
import {
  Text,
  View,
  TouchableOpacity,
  StyleSheet,
  Image,
  Dimensions
} from 'react-native'
import { Actions } from 'react-native-mobx'
//import CacheableImage from 'react-native-cacheable-image'
import Icon from 'react-native-vector-icons/Ionicons'
import { getColor } from '../config'

const screenWidth = Dimensions.get('window').width

export default class Posts extends Component {
  constructor(props) {
    super(props)
  }

  _openChat = () => {
    Actions.chat({ title:this.props.postTitle, postProps:this.props })
  }

  render() {
    const height = screenWidth*this.props.imageHeight/this.props.imageWidth
    return (
      <View style={styles.card}>
        <Text style={styles.title}>
          {this.props.postTitle}
        </Text>
        <TouchableOpacity onPress={this._openChat}>
          <Image
            source={{ uri:this.props.imagePath }}
            resizeMode='contain'
            style={{
              height: height,
              width: screenWidth,
              alignSelf: 'center',
              marginBottom: 10,
            }}
          />
        </TouchableOpacity>
        <View style={styles.postInfo}>
          <Icon name='md-arrow-dropright' size={15} color='rgba(0,0,0,.5)' style={styles.itemIcon}/>
          <Text style={styles.username}>
            {this.props.posterName}
          </Text>
          <Text style={styles.time}>
            {this.props.postTime}
          </Text>
        </View>
        <Text style={styles.content}>
          {this.props.postContent}
        </Text>
      </View>
    )
  }
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#e2e2e2',
    borderRadius: 2,
    backgroundColor: '#eee',
    padding: 10,
    margin: 5,
    justifyContent: 'center',
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
