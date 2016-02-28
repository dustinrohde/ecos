import { World, Vector } from '../src/world'

describe('Vector', () => {

    let a, b, c, d
    beforeEach(() => {
        a = Vector(1, 3)
        b = Vector(5, 1)
        c = Vector(0, -2)
        d = Vector(-4, 0)
    })
    
    it('should store an x and a y value', () => {
        expect(a.x).toBe(1)
        expect(a.y).toBe(3)
        expect(c.x).toBe(0)
        expect(c.y).toBe(-2)
    })

    describe('#plus', () => {

        it('should add two vectors', () => {
            expect(a.plus(b)).toEqual(Vector(6, 4))
            expect(b.plus(d)).toEqual(Vector(1, 1))
        })
    })

    describe('#minus', () => {

        it('should subtract two vectors', () => {
            expect(a.minus(b)).toEqual(Vector(-4, 2))
            expect(b.minus(d)).toEqual(Vector(9, 1))
        })
    })
})

describe('World constructor', () => {

    const makeThing = (name) => {
        return () => {
            return { name }
        }
    }

    it('should set the correct width and height', () => {
        const things = [
            [1,1,1],
            [1,1,1],
            [1,1,1],
            [1,1,1],
        ]
        const world = new World(things)

        expect(world.width).toBe(3)
        expect(world.height).toBe(4)
    })

    it('should throw an error if given a `things` array with inconsistent row lengths', () => {
        const things = [
            [1,1,1],
            [1,1],
            [1,1,1],
        ]
        const newWorld = () => new World(things)

        expect(newWorld).toThrow()
    })

    it('should place each thing in the proper position', () => {
        const A = makeThing('a')
        const B = makeThing('b')
        const C = makeThing('c')
        const D = makeThing('d')
        const things = [
            [A(), B()],
            [C(), D()],
        ]
        const world = new World(things)

        const a = world.get(Vector(0, 0))
        const b = world.get(Vector(1, 0))
        const c = world.get(Vector(0, 1))
        const d = world.get(Vector(1, 1))

        expect(a.name).toBe('a')
        expect(b.name).toBe('b')
        expect(c.name).toBe('c')
        expect(d.name).toBe('d')
    })

    describe('#fromLegend', () => {

        it('should map each key in the given keys array to an instance of its corresponding class', () => {
            const keysArray = [
                'ab',
                'cd',
            ]
            const legend = new Map([
                ['a', makeThing('a')],
                ['b', makeThing('b')],
                ['c', makeThing('c')],
                ['d', makeThing('d')],
            ])
            const world = World.fromLegend(legend, keysArray)

            const a = world.get(Vector(0, 0))
            const b = world.get(Vector(1, 0))
            const c = world.get(Vector(0, 1))
            const d = world.get(Vector(1, 1))

            expect(a.name).toBe('a')
            expect(b.name).toBe('b')
            expect(c.name).toBe('c')
            expect(d.name).toBe('d')
        })
    })
})

describe('World', () => {

    const makeThing = (name, walkable = true) => {
        return {
            name: name,
            image: name,
            walkable: walkable,
            act(world, vector) { }
        }
    }

    let world, things

    beforeEach(() => {
        things = [
            [makeThing('a', true ), makeThing('b', false)],
            [null                 , makeThing('d', true )],
            [makeThing('e', false), null                 ],
        ]
        world = new World(things)
    })

    it('should provide an accurate string representation', () => {
        const expected = [
            'ab',
            ' d',
            'e ',
        ].join('\n')

        expect(world.toString()).toBe(expected)
    })

    it('should let you get and set things by vector', () => {
        const a = Vector(0, 0)
        const d = Vector(1, 1)
        const e = Vector(0, 2)

        expect(world.get(a).name).toBe('a')
        expect(world.get(d).name).toBe('d')
        expect(world.get(e).name).toBe('e')

        world.set(a, makeThing('new a'))
        world.set(d, makeThing('new d'))

        expect(world.get(a).name).toBe('new a')
        expect(world.get(d).name).toBe('new d')
        expect(world.get(e).name).toBe('e')
    })

    it('should let you move things from one vector to another', () => {
        const a = Vector(0, 0)
        const d = Vector(1, 1)

        expect(world.get(a).name).toBe('a')
        expect(world.get(d).name).toBe('d')

        world.move(a, d)

        expect(world.get(a)).toBeNull()
        expect(world.get(d).name).toBe('a')
    })

    it('should let you remove things by vector', () => {
        const a = Vector(0, 0)
        const b = Vector(1, 0)

        expect(world.get(a).name).toBe('a')
        expect(world.get(b).name).toBe('b')

        world.remove(a)

        expect(world.get(a)).toBeNull()
        expect(world.get(b).name).toBe('b')
    })

    it('should tell you whether a vector is in bounds', () => {
        expect(world.inBounds(Vector(2, 0))).toBe(false)
        expect(world.inBounds(Vector(0, 3))).toBe(false)
        expect(world.inBounds(Vector(-1, 0))).toBe(false)
        expect(world.inBounds(Vector(0, -1))).toBe(false)
        expect(world.inBounds(Vector(-1, 4))).toBe(false)
    })

    describe('#enumerate', () => {
        
        it('should return an array of [vector, thing] pairs', () => {
           const enumerated = world.enumerate() 

           things.forEach((row, y) => {
               row.forEach((thing, x) => {
                   expect(enumerated).toContain([Vector(x, y), thing])
               })
           })
        })
    })

    describe('#isWalkable', () => {

        const a = Vector(0, 0)
        const b = Vector(1, 0)
        const c = Vector(0, 1)
        const d = Vector(1, 1)
        const e = Vector(0, 2)
        const f = Vector(1, 2)

        const x = Vector(2, 0)
        const y = Vector(0, 3)

        it('should tell you whether a thing at a vector is walkable', () => {
            expect(world.isWalkable(a)).toBe(true)
            expect(world.isWalkable(b)).toBe(false)
        })

        it('should tell you whether a vector is within the bounds of the world', () => {
            expect(world.isWalkable(x)).toBe(false)
            expect(world.isWalkable(y)).toBe(false)
        })

        it('should return `true` if there is nothing at the given vector', () => {
            expect(world.isWalkable(c)).toBe(true)
            expect(world.isWalkable(f)).toBe(true)
        })
    })

    describe('#view', () => {

        beforeEach(() => {
            world = new World([
                [makeThing('a', true), makeThing('b', true), makeThing('c', true)],
                [makeThing('d', false), makeThing('e', true), makeThing('f', false)],
                [makeThing('g', true), makeThing('h', false), makeThing('i', true)],
            ])
        })

        it('should return a list of vectors that surround the given vector', () => {
            const view = world.view(Vector(1, 1))

            expect(view.length).toBe(8)
            expect(view).toContain(Vector(0, 0))
            expect(view).toContain(Vector(0, 1))
            expect(view).toContain(Vector(0, 2))
            expect(view).toContain(Vector(1, 0))
            expect(view).toContain(Vector(2, 0))
            expect(view).toContain(Vector(1, 2))
            expect(view).toContain(Vector(2, 1))
            expect(view).toContain(Vector(2, 2))
        })

        it('should not include any vectors that are out of bounds', () => {
            const view = world.view(Vector(0, 0))

            expect(view.length).toBe(3)
            expect(view).toContain(Vector(0, 1))
            expect(view).toContain(Vector(1, 0))
            expect(view).toContain(Vector(1, 1))
        })

        describe('#viewWalkable', () => {

            it('should return only vectors whose positions are walkable and in bounds', () => {
                const view = world.viewWalkable(Vector(1, 0))
                expect(view.length).toBe(3)
                expect(view).toContain(Vector(0, 0))
                expect(view).toContain(Vector(1, 1))
                expect(view).toContain(Vector(2, 0))
            })
        })
    })

    describe('#turn', () => {

        it('should call the `act` method on every `thing`', () => {
            for (const row of things) {
                for (const thing of row) {
                    if (thing)
                        spyOn(thing, 'act')
                }
            }

            world.turn()

            for (const row of things) {
                for (const thing of row) {
                    if (thing)
                        expect(thing.act).toHaveBeenCalledTimes(1)
                }
            }
        })
    })
})