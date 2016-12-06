import React, { Component } from 'react'
import codePush from 'react-native-code-push'
import OneSignal from 'react-native-onesignal'

import { Router, Scene, Actions } from 'react-native-mobx'
import { Provider } from 'mobx-react/native'

import LoginScreen from './views/login_screen'
import HomeScreen from './views/home_screen'
import SettingScreen from './views/setting_screen'
import ChatScreen from './views/chat_screen'

import appStore from './store/AppStore'

class App extends Component {
  componentDidMount() {
    OneSignal.configure({
      /*
      onIdsAvailable: function(device) {
          console.log('UserId = ', device.userId)
          console.log('PushToken = ', device.pushToken)
          OneSignal.getTags((receivedTags) => {
            console.log(receivedTags).username
          })
      },
      */
      onNotificationOpened: function(message, data, isActive) {
        //console.log('MESSAGE: ', message)
        //console.log('DATA: ', data)
        //console.log('CURRENT PUID:' + appStore.current_puid)
        //console.log('ISACTIVE: ', isActive)
        if (!isActive) {
          if (data.postProps && appStore.current_puid != data.postProps.puid) {
            Actions.login({ type: 'replace', postProps:data.postProps })
          }
        }
        else {
          if (data.postProps && appStore.current_puid != data.postProps.puid) {
            appStore.new_messages = appStore.new_messages + 1
          }
        }
      }
    })
  }
  render() {
    console.disableYellowBox = true
    return (
      <Provider appStore={appStore}>
        <Router>
          <Scene
            key="login"
            component={LoginScreen}
            duration={1}
            hideNavBar
            initial
          />
          <Scene
            key="home"
            component={HomeScreen}
            duration={1}
            hideNavBar
          />
          <Scene
            key="chat"
            component={ChatScreen}
            hideNavBar={false}
            panHandlers={null}
            duration={0}
          />
          <Scene
            key="setting"
            component={SettingScreen}
            hideNavBar={false}
            title="Edit your profile"
            panHandlers={null}
            duration={0}
          />
        </Router>
      </Provider>
    )
  }
}

//export default App
//export default App = codePush({ updateDialog: true, installMode: codePush.InstallMode.IMMEDIATE })(App)
export default App = codePush()(App)
