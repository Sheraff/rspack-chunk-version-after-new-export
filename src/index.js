import { label } from './format.js'
import('./chunk.js').then((m) => {
  document.body.textContent = label('app') + ' ' + m.default()
})
