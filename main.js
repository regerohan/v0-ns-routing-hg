import { createApp } from "vue"
import "./style.css"
import NSRoutePlanner from "./NSRoutePlanner.vue"

// Vuetify
import 'vuetify/styles'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'

const vuetify = createVuetify({
  components,
  directives,
})

createApp(NSRoutePlanner).use(vuetify).mount("#app")