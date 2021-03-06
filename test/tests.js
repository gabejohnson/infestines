import * as I from "../src/infestines"

function show(x) {
  switch (typeof x) {
  case "string":
  case "object":
    return JSON.stringify(x)
  default:
    return `${x}`
  }
}

const testEq = (expr, expect) => it(`${expr} => ${show(expect)}`, () => {
  const actual = eval(`() => ${expr}`)()
  if (!I.acyclicEqualsU(actual, expect))
    throw new Error(`Expected: ${show(expect)}, actual: ${show(actual)}`)
})

const expectFail = expr => it(`${expr} => failure`, () => {
  try {
    const actual = eval(`() => ${expr}`)()
    throw new Error(`Expected: failure, actual: ${show(actual)}`)
  } catch (_e) {
    return
  }
})

describe("currying", () => {
  testEq('I.curry(x => x+1)(1)', 2)
  testEq('I.curry((x,y) => x+y)(1)(2)', 3)
  testEq('I.curry((x,y,z) => x+y+z)(1)(2,3)', 6)
  testEq('I.curry((a, b, c, d) => a+b+c+d).length', 4)
  testEq('I.curry((a, b, c, d) => a+b+c+d)(1).length', 3)
  testEq('I.curry((a, b, c, d) => a+b+c+d)(1,2).length', 2)
  testEq('I.curry((a, b, c, d) => a+b+c+d)(1)(2, 3).length', 1)
  testEq('I.curry((a, b, c, d) => a+b+c+d)(1,2,3,4)', 10)
  testEq('I.curry((a, b, c, d) => a+b+c+d)(1,2,3)(4)', 10)
  testEq('I.curry((a, b, c, d) => a+b+c+d)(1)(2,3,4)', 10)
  expectFail('I.curry(() => {})')
  expectFail('I.curry((a,b,c,d,e) => {})')
})

describe("piping", () => {
  testEq('I.pipe((a, b) => a + b, x => x + 1)(1,2)', 4)
  testEq('I.pipe((a, b) => a + b, x => x + 1, x => x * 2)(1)(2)', 8)
  testEq('I.pipe((a, b) => a + b, x => x + 1).length', 2)
  testEq('I.pipe(x=>x+1,x=>x+1,x=>x+1,x=>x+1)(1)', 5)
  expectFail('I.pipe()')
  expectFail('I.pipe(_=>{})')
  expectFail('I.pipe(_=>{},_=>{},_=>{},_=>{},_=>{})')
})

describe("seq", () => {
  testEq('I.seq(11)', 11)
  testEq('I.seq(11, x => x + 1)', 12)
})

describe("seqPartial", () => {
  testEq('I.seqPartial(11)', 11)
  testEq('I.seqPartial(11, x => x+2)', 13)
  testEq('I.seqPartial(11, _ => undefined, x => x.wouldFail)', undefined)
})

describe("array0", () => {
  testEq('I.array0', [])
})

describe("object0", () => {
  testEq('I.object0', {})
})

describe("isObject", () => {
  testEq('I.isObject(null)', false)
  testEq('I.isObject({})', true)
  testEq('I.isObject([])', false)
  testEq('I.isObject({constructor: "haha"})', true)
})

describe("isArray", () => {
  testEq('I.isArray(null)', false)
  testEq('I.isArray({})', false)
  testEq('I.isArray([])', true)
})

export class Foo {
  constructor(v) {this.v = v}
  equals(other) {return this.v === other.v}
}

describe("identicalU", () => {
  testEq('I.identicalU(null, null)', true)
  testEq('I.identicalU(-0, +0)', false)
  testEq('I.identicalU(NaN, NaN)', true)
  testEq('I.identicalU({}, {})', false)
})

describe("acyclicEqualsU", () => {
  testEq('I.acyclicEqualsU(null, {})', false)
  testEq('I.acyclicEqualsU({a:1}, {a:1, b:2})', false)
  testEq('I.acyclicEqualsU([1,2], [1])', false)
  testEq('I.acyclicEqualsU([1,2], [1,3])', false)
  testEq('I.acyclicEqualsU({a: 1, b: [true]}, {b: [true], a: 1})', true)
  testEq('I.acyclicEqualsU({a: 1, b: [true]}, {b: [true]})', false)
  testEq('I.acyclicEqualsU([], {})', false)
  testEq('I.acyclicEqualsU(new Foo(1), new Foo(1))', true)
  testEq('I.acyclicEqualsU(new Foo(2), new Foo(1))', false)
})

describe("keys", () => {
  testEq('I.keys({})', [])
  testEq('I.keys({x: 1, y: 2})', ["x", "y"])
})

describe("values", () => {
  testEq('I.values({})', [])
  testEq('I.values({x: 1, y: 2})', [1, 2])
})

describe("unzipObjIntoU", () => {
  testEq('{const ks=[],vs=[]; I.unzipObjIntoU({x:1,y:2}, ks, vs); return [ks, vs]}', [["x", "y"], [1, 2]])
  testEq('{const kvs=[]; I.unzipObjIntoU({x:1,y:2}, kvs, kvs); return kvs}', ["x", 1, "y", 2])
})

describe("assocPartialU", () => {
  testEq('I.assocPartialU("x", 1, null)', {x: 1})
  testEq('I.assocPartialU("x", 1, undefined)', {x: 1})
  testEq('I.assocPartialU("x", 2, {x: 1})', {x: 2})
  testEq('I.assocPartialU("x", 2, {z: 1})', {z: 1, x: 2})
})

describe("dissocPartialU", () => {
  testEq('I.dissocPartialU("x", null)', undefined)
  testEq('I.dissocPartialU("x", undefined)', undefined)
  testEq('I.dissocPartialU("x", {})', undefined)
  testEq('I.dissocPartialU("x", {x: 1})', undefined)
  testEq('I.dissocPartialU("x", {x: 1, y: 2})', {y: 2})
})

describe("isDefined", () => {
  testEq('I.isDefined(undefined)', false)
  testEq('I.isDefined(0/0)', true)
  testEq('I.isDefined(null)', true)
  testEq('I.isDefined("anything except undefined")', true)
})

describe("always", () => {
  testEq('I.always.length', 1)
  testEq('I.always(2).length', 1)
  testEq('I.always(1)(0)', 1)
})

describe("applyU", () => {
  testEq('I.applyU(x => x + 1, 2)', 3)
})

describe("sndU", () => {
  testEq('I.sndU("a", "b")', "b")
})

describe("assert", () => {
  if (process.env.NODE_ENV === "production") {
    testEq('I.assert(1, x => x < 1, "Does not fail in production")', 1)
    testEq('I.assert(-1, x => x < 1, "Does not fail")', -1)
  } else {
    expectFail('I.assert(1, x => x < 1, "Fails when not in production")')
    testEq('I.assert(-1, x => x < 1, "Does not fail")', -1)
  }
})
