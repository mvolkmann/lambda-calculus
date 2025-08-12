// @ts-nocheck
import {expect, test} from 'bun:test';

const jsBool = b => b(true)(false);
const jsNum = n => n(x => x + 1)(0);

// Adding underscores to avoid conflicting with JavaScript keywords.
const true_ = x => y => x; // λt. λf. t; returns first argument
const false_ = x => y => y; // λt. λf. f; returns second argument
test('true/false', () => {
  expect(jsBool(true_)).toBe(true);
  expect(jsBool(false_)).toBe(false);
});

const not = b => b(false_)(true_); // λb.b false true
test('not', () => {
  expect(jsBool(not(true_))).toBe(false);
  expect(jsBool(not(false_))).toBe(true);
});

const and = x => y => x(y)(false_); // λx. λy.x y false
test('and', () => {
  expect(jsBool(and(true_)(true_))).toBe(true);
  expect(jsBool(and(true_)(false_))).toBe(false);
  expect(jsBool(and(false_)(true_))).toBe(false);
  expect(jsBool(and(false_)(false_))).toBe(false);
});

const or = x => y => x(true_)(y); // λx. λy.x true y
test('or', () => {
  expect(jsBool(or(true_)(true_))).toBe(true);
  expect(jsBool(or(true_)(false_))).toBe(true);
  expect(jsBool(or(false_)(true_))).toBe(true);
  expect(jsBool(or(false_)(false_))).toBe(false);
});

const zero = f => x => x; // λfx.x
const one = f => x => f(x); // λfx.f x
//const one = succ(zero);
const two = f => x => f(f(x)); // λfx.f (f x)
//const two = succ(one);
const three = f => x => f(f(f(x))); // λfx.f (f (f x))
const four = f => x => f(f(f(f(x)))); // λfx.f (f (f (fx)))
const five = f => x => f(f(f(f(f(x))))); // λfx.f (f (f (f (f x))))

test('Church numerals', () => {
  const results = [];
  const demo = x => {
    results.push(x);
    return x + x;
  };
  five(demo)(3);
  // Creates array containing 3, 3+3, 6+6, 12+12, and 24+24.
  expect(results).toMatchObject([3, 6, 12, 24, 48]);
});

const identity = x => x; // λx.x
test('identity', () => {
  expect(jsBool(identity(true_))).toBe(true);
  expect(jsNum(identity(two))).toBe(2);
});

const isZero = n => n(x => false_)(true_); // λn.n (λx.FALSE) TRUE
test('isZero', () => {
  expect(jsBool(isZero(zero))).toBe(true);
  expect(jsBool(isZero(one))).toBe(false);
  expect(jsBool(isZero(two))).toBe(false);
});

// const if_ = b => x => y => b(x)(y); // λbxy.b x y
// b is a Boolean value.
// t is a function that can be called to get the true value.
// f is a function that can be called to get the false value.
const if_ = b => t => f => b(t)(f)(); // λbtf.(b t f)(_)
test('if_', () => {
  const first = () => one;
  const second = () => two;
  expect(jsNum(if_(true_)(first)(second))).toBe(1);
  expect(jsNum(if_(false_)(first)(second))).toBe(2);
  expect(jsNum(if_(isZero(zero))(first)(second))).toBe(1);
  expect(jsNum(if_(isZero(one))(first)(second))).toBe(2);
});

const succ = n => f => x => f(n(f)(x)); // λn (λf. λx.f (n f x))
test('succ', () => {
  expect(jsNum(succ(zero))).toBe(1);
  expect(jsNum(succ(one))).toBe(2);
  expect(jsNum(succ(two))).toBe(3);
});

// This uses the definition from the Wikipedia page on Lambda Calculus.
// An easier to follow implementation, pred, is shown below.
const predW = n => f => x => n(g => h => h(g(f)))(u => x)(u => u);
// λn.λf.λx.n (λg.λh.h (g f)) (λu.x) (λu.u)
test('predW', () => {
  expect(jsNum(predW(zero))).toBe(0); // nothing before zero
  expect(jsNum(predW(one))).toBe(0);
  expect(jsNum(predW(two))).toBe(1);
  expect(jsNum(predW(three))).toBe(2);
});

// This uses a more literal interpretation of the Kleene solution.
const pair = x => y => f => f(x)(y); // λx.λy.λf.f x y
const fst = p => p(true_); // λp.p TRUE
const snd = p => p(false_); // λp.p FALSE
test('fst and snd', () => {
  let p = pair(zero)(zero);
  expect(jsNum(fst(p))).toBe(0);
  expect(jsNum(snd(p))).toBe(0);

  p = pair(one)(two);
  expect(jsNum(fst(p))).toBe(1);
  expect(jsNum(snd(p))).toBe(2);
});

// This takes a pair and returns a new pair composed of
// the second element and the successor of the second element.
const phi = p => pair(snd(p))(succ(snd(p))); // λp.pair (snd p) (succ (snd p))
test('phi', () => {
  let p = pair(zero)(zero);
  p = phi(p);
  expect(jsNum(fst(p))).toBe(0);
  expect(jsNum(snd(p))).toBe(1);
  p = phi(p);
  expect(jsNum(fst(p))).toBe(1);
  expect(jsNum(snd(p))).toBe(2);
  p = phi(p);
  expect(jsNum(fst(p))).toBe(2);
  expect(jsNum(snd(p))).toBe(3);
});

// n(phi) represents n applications of phi.
const pred = n => fst(n(phi)(pair(zero)(zero))); // λn.fst (n phi (pair zero zero))
test('pred', () => {
  expect(jsNum(pred(zero))).toBe(0); // nothing before zero
  expect(jsNum(pred(one))).toBe(0);
  expect(jsNum(pred(two))).toBe(1);
  expect(jsNum(pred(three))).toBe(2);
});

const add = m => n => m(succ)(n); // λmn.(m succ) n.
test('add', () => {
  expect(jsNum(add(zero)(zero))).toBe(0);
  expect(jsNum(add(zero)(one))).toBe(1);
  expect(jsNum(add(one)(zero))).toBe(1);
  expect(jsNum(add(two)(three))).toBe(5);
});

const sub = m => n => n(pred)(m); // λmn.(n pred) m
test('sub', () => {
  expect(jsNum(sub(zero)(zero))).toBe(0);
  expect(jsNum(sub(one)(zero))).toBe(1);
  expect(jsNum(sub(two)(zero))).toBe(2);
  expect(jsNum(sub(two)(one))).toBe(1);
  expect(jsNum(sub(two)(two))).toBe(0);
  expect(jsNum(sub(three)(one))).toBe(2);
  expect(jsNum(sub(three)(two))).toBe(1);
  expect(jsNum(sub(three)(three))).toBe(0);
  expect(jsNum(sub(four)(two))).toBe(2);
  expect(jsNum(sub(one)(three))).toBe(0); // no negative numbers
});

// const mul = m => n => m(add(n))(zero); // λmn.m (add n) 0
// The above is correct, but multiplication is also the same as composition!
const compose = f => g => x => f(g(x)); // λfgx.f (g x)
const mul = compose;
test('mul', () => {
  expect(jsNum(mul(zero)(zero))).toBe(0);
  expect(jsNum(mul(zero)(one))).toBe(0);
  expect(jsNum(mul(one)(zero))).toBe(0);
  expect(jsNum(mul(one)(two))).toBe(2);
  expect(jsNum(mul(two)(one))).toBe(2);
  expect(jsNum(mul(two)(three))).toBe(6);
});

// Defining division by repeated subtraction isn't working.
// const div = m => n => m(sub(n))(zero); // λmn.m (sub n) 0
// See a recursive attempt at the bottom of this file.

// const exp = m => n => n(mul(m))(one); // λmn.n (mul m) 1
const exp = m => n => n(m); // λmn.n m
test('exp', () => {
  expect(jsNum(exp(zero)(zero))).toBe(1);
  expect(jsNum(exp(two)(zero))).toBe(1);
  expect(jsNum(exp(two)(one))).toBe(2);
  expect(jsNum(exp(two)(three))).toBe(8);
  expect(jsNum(exp(three)(two))).toBe(9);
});

const equalBool = a => b => or(and(a)(b))(and(not(a))(not(b)));
// λab.(or (and a b) (and (not a) (not b)))
test('equalBool', () => {
  expect(jsBool(equalBool(true_)(true_))).toBe(true);
  expect(jsBool(equalBool(true_)(false_))).toBe(false);
  expect(jsBool(equalBool(false_)(true_))).toBe(false);
  expect(jsBool(equalBool(false_)(false_))).toBe(true);
});

// We have to test both because sub returns zero when m < n.
const equalNum = m => n => and(isZero(sub(m)(n)))(isZero(sub(n)(m)));
// λmn.and (isZero (sub m n)) (isZero (sub n m))
test('equalNum', () => {
  expect(jsBool(equalNum(one)(two))).toBe(false);
  expect(jsBool(equalNum(two)(two))).toBe(true);
  expect(jsBool(equalNum(two)(one))).toBe(false);
});

// The compose function is defined above.
test('compose', () => {
  const add3 = n => add(three)(n);
  const mul2 = n => mul(two)(n);
  expect(jsNum(compose(add3)(mul2)(two))).toBe(7);
  expect(jsNum(compose(mul2)(add3)(two))).toBe(10);
});

// This definition only works in lazily evaluated languages like Haskell.
// const Y = f => (x => f(x(x)))(x => f(x(x))); // λf.(λx.f (x x)) (λx.f (x x))
// This definition works in strictly evaluated languages like JavaScript.
const Y = f => (x => x(x))(x => f(y => x(x)(y))); // λf.(λx.x x) (λx.f (x x))
const facGen = f => n => isZero(n)(() => one)(() => mul(n)(f(pred(n))))();
const factorialY = Y(facGen);
test('factorialY', () => {
  expect(jsNum(factorialY(zero))).toBe(1);
  expect(jsNum(factorialY(one))).toBe(1);
  expect(jsNum(factorialY(two))).toBe(2);
  expect(jsNum(factorialY(three))).toBe(6);
  expect(jsNum(factorialY(four))).toBe(24);
  expect(jsNum(factorialY(five))).toBe(120);
});

// This works in strictly evaluated languages like JavaScript.
// Note that the two terms at the end are identical.
const Z = f => (x => f(y => x(x)(y)))(x => f(y => x(x)(y)));
const factorialZ = Z(facGen);
test('factorialZ', () => {
  expect(jsNum(factorialZ(zero))).toBe(1);
  expect(jsNum(factorialZ(one))).toBe(1);
  expect(jsNum(factorialZ(two))).toBe(2);
  expect(jsNum(factorialZ(three))).toBe(6);
  expect(jsNum(factorialZ(four))).toBe(24);
  expect(jsNum(factorialZ(five))).toBe(120);
});

const lessThan = m => n => not(isZero(sub(n)(m)));
const divGen = f => m => n =>
  isZero(n)(() => zero)(() =>
    lessThan(m)(n)(() => zero)(() =>
      lessThan(sub(m)(n))(n)(() => one)(() => succ(f(sub(m)(n))(n)))()
    )()
  )();
const div = Z(divGen);

test('div', () => {
  expect(jsNum(div(zero)(one))).toBe(0);
  expect(jsNum(div(one)(one))).toBe(1);
  expect(jsNum(div(two)(one))).toBe(2);
  expect(jsNum(div(three)(two))).toBe(1);
  expect(jsNum(div(four)(two))).toBe(2);
  expect(jsNum(div(five)(two))).toBe(2);
  expect(jsNum(div(two)(five))).toBe(0);
});

const cons = a => b => f => f(a)(b);
const car = p => p(true_);
const cdr = p => p(false_);
const nil = _f => _x => null;
test('cons, car, cdr', () => {
  const pair = cons(one)(two);
  expect(car(pair)).toBe(one);
  expect(cdr(pair)).toBe(two);

  const list = cons(one)(cons(two)(cons(three)(nil)));
  expect(car(list)).toBe(one);
  expect(car(cdr(list))).toBe(two);
  expect(car(cdr(cdr(list)))).toBe(three);
  expect(cdr(cdr(cdr(list)))).toBe(nil);
});
