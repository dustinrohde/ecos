import inRange from 'lodash/inRange'
import map from 'lodash/map'
import range from 'lodash/range'

function toDirection(n) {
  if (n > 0) return n / n
  if (n < 0) return n / -n
  return 0
}

class Vector {

  constructor(x, y) {
    this._x = x
    this._y = y
  }

  get x() {
    return this._x
  }

  get y() {
    return this._y
  }

  plus(vector) {
    return new Vector(this.x + vector.x, this.y + vector.y)
  }

  minus(vector) {
    return new Vector(this.x - vector.x, this.y - vector.y)
  }

  dir() {
    return new Vector(toDirection(this.x), toDirection(this.y))
  }

  map(f) {
    return new Vector(f(this.x), f(this.y))
  }

  compare(vector) {
    const thisTotal = this.x + this.y
    const otherTotal = vector.x + vector.y

    if (thisTotal < otherTotal) return -1
    if (thisTotal > otherTotal) return 1
    return 0
  }
}

const directions = [
  new Vector(0, -1),
  new Vector(1, -1),
  new Vector(1, 0),
  new Vector(1, 1),
  new Vector(0, 1),
  new Vector(-1, 1),
  new Vector(-1, 0),
  new Vector(-1, -1),
]

class World {

  constructor(things) {
    this._things = Array.from(things)

    this._height = this._things.length
    this._width = this._things[0].length

    if (things.some(row => row.length !== this.width))
      throw Error('Width/height do not match things array')
  }

  static fromLegend(legend, keysArray) {
    return new World(
      map(keysArray, keys => {
        return map(keys, k => {
          if (!legend.has(k))
            return null
          const Thing = legend.get(k)
          return Thing()
        })
      })
    )
  }

  enumerate() {
    const things = []
    for (const [y, row] of this.things.entries()) {
      for (const [x, thing] of row.entries()) {
        things.push([new Vector(x, y), thing])
      }
    }
    return things
  }

  toString() {
    return this.things.map(row => {
      return row.map(thing => thing ? thing.image : ' ').join('')
    }).join('\n')
  }

  get width() {
    return this._width
  }

  get height() {
    return this._height
  }

  get things() {
    return this._things
  }

  _view(origin, distance) {
    const vectors = []

    const _range = range(-distance, distance + 1)
    _range.forEach(dx => {
      _range.forEach(dy => {
        if (dx !== 0 || dy !== 0)
          vectors.push(origin.plus(new Vector(dx, dy)))
      })
    })

    return vectors
  }

  view(vector, distance = 1) {
    return this._view(vector, distance).
      filter(v => this.inBounds(v))
  }

  viewWalkable(vector, distance = 1) {
    return this._view(vector, distance).
      filter(v => this.isWalkable(v))
  }

  get(vector) {
    return this.things[vector.y][vector.x]
  }

  set(vector, thing) {
    this._things[vector.y][vector.x] = thing
  }

  remove(vector) {
    this.set(vector, null)
  }

  move(vector1, vector2) {
    const thing = this.get(vector1)
    this.set(vector2, thing)
    this.remove(vector1)
  }

  inBounds(vector) {
    return inRange(vector.x, 0, this.width) &&
         inRange(vector.y, 0, this.height)
  }

  isWalkable(vector) {
    if (this.inBounds(vector)) {
      const thing = this.get(vector)
      return !thing || thing.walkable
    }
    return false
  }

  turn() {
    for (const [vector, thing] of this.enumerate()) {
      if (thing) {
        if (thing.hasOwnProperty('energy') && thing.energy <= 0) {
          this.remove(vector)
        } else if (thing.preAct) {
          const acted = thing.preAct(this, vector)
          if (acted === false)
            thing.act(this, vector)
        }
      }
    }
  }
}

export { World as default }
export { directions, Vector, World }
