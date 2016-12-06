import { observable, autorun } from 'mobx'

class AppStore {
  @observable username = ''
  @observable user = {}
  @observable post_count = 0
  @observable new_messages = 0
  @observable current_page = ''
  @observable current_puid = ''
  //@observable posts = []
}

const appStore = new AppStore()

autorun(() => {
  console.log(appStore)
})

export default appStore
