// This is the Node.js version of
// lambda-calculus.test.ts which is the Bun version.
// This version is 5 times slower.
// @ts-nocheck
import assert from 'node:assert/strict';
import test from 'node:test';

const jsBool = b => b(true)(false);
const jsNum = n => n(x => x + 1)(0);

// Adding underscores to avoid conflicting with JavaScript keywords.
const true_ = x => y => x; // λt. λf. t; returns first argument
const false_ = x => y => y; // λt. λf. f; returns second argument
test('true/false', () => {
  assert.equal(jsBool(true_), true);
  assert.equal(jsBool(false_), false);
});

const not = b => b(false_)(true_); // λb.b false true
test('not', () => {
  assert.equal(jsBool(not(true_)), false);
  assert.equal(jsBool(not(false_)), true);
});

const and = x => y => x(y)(false_); // λx. λy.x y false
test('and', () => {
  assert.equal(jsBool(and(true_)(true_)), true);
  assert.equal(jsBool(and(true_)(false_)), false);
  assert.equal(jsBool(and(false_)(true_)), false);
  assert.equal(jsBool(and(false_)(false_)), false);
});

const or = x => y => x(true_)(y); // λx. λy.x true y
test('or', () => {
  assert.equal(jsBool(or(true_)(true_)), true);
  assert.equal(jsBool(or(true_)(false_)), true);
  assert.equal(jsBool(or(false_)(true_)), true);
  assert.equal(jsBool(or(false_)(false_)), false);
});

const zero = f => x => x; // λfx.x
const one = f => x => f(x); // λfx.f x
const two = f => x => f(f(x)); // λfx.f (f x)
const three = f => x => f(f(f(x))); // λfx.f (f (f x))
const four = f => x => f(f(f(f(x)))); // λfx.f (f (f (fx)))
const five = f => x => f(f(f(f(f(x))))); // λfx.f (f (f (f (f x
const succ = n => f => x => f(n(f)(x)); // λn (λf. λx.f (n f x))
/* These alternate definitions work, but are slower.
const one = succ(zero);
const two = succ(one);
const three = succ(two);
const four = succ(three);
const five = succ(four);
*/

test('Church numerals', () => {
  const results = [];
  const demo = x => {
    results.push(x);
    return x + x;
  };
  five(demo)(3);
  // Creates array containing 3, 3+3, 6+6, 12+12, and 24+24.
  assert.deepEqual(results, [3, 6, 12, 24, 48]);
});

const identity = x => x; // λx.x
test('identity', () => {
  assert.equal(jsBool(identity(true_)), true);
  assert.equal(jsNum(identity(two)), 2);
});

const isZero = n => n(x => false_)(true_); // λn.n (λx.FALSE) TRUE
test('isZero', () => {
  assert.equal(jsBool(isZero(zero)), true);
  assert.equal(jsBool(isZero(one)), false);
  assert.equal(jsBool(isZero(two)), false);
});

// const if_ = b => x => y => b(x)(y); // λbxy.b x y
// b is a Boolean value.
// t is a function that can be called to get the true value.
// f is a function that can be called to get the false value.
const if_ = b => t => f => b(t)(f)(); // λbtf.(b t f)(_)
test('if_', () => {
  const first = () => one;
  const second = () => two;
  assert.equal(jsNum(if_(true_)(first)(second)), 1);
  assert.equal(jsNum(if_(false_)(first)(second)), 2);
  assert.equal(jsNum(if_(isZero(zero))(first)(second)), 1);
  assert.equal(jsNum(if_(isZero(one))(first)(second)), 2);
});

test('succ', () => {
  assert.equal(jsNum(succ(zero)), 1);
  assert.equal(jsNum(succ(one)), 2);
  assert.equal(jsNum(succ(two)), 3);
});

// This uses the definition from the Wikipedia page on Lambda Calculus.
// An easier to follow implementation, pred, is shown below.
const predW = n => f => x => n(g => h => h(g(f)))(u => x)(u => u);
// λn.λf.λx.n (λg.λh.h (g f)) (λu.x) (λu.u)
test('predW', () => {
  assert.equal(jsNum(predW(zero)), 0); // nothing before zero
  assert.equal(jsNum(predW(one)), 0);
  assert.equal(jsNum(predW(two)), 1);
  assert.equal(jsNum(predW(three)), 2);
});

// This uses a more literal interpretation of the Kleene solution.
const pair = x => y => f => f(x)(y); // λx.λy.λf.f x y
const fst = p => p(true_); // λp.p TRUE
const snd = p => p(false_); // λp.p FALSE
test('fst and snd', () => {
  let p = pair(zero)(zero);
  assert.equal(jsNum(fst(p)), 0);
  assert.equal(jsNum(snd(p)), 0);

  p = pair(one)(two);
  assert.equal(jsNum(fst(p)), 1);
  assert.equal(jsNum(snd(p)), 2);
});

// This takes a pair and returns a new pair composed of
// the second element and the successor of the second element.
const phi = p => pair(snd(p))(succ(snd(p))); // λp.pair (snd p) (succ (snd p))
test('phi', () => {
  let p = pair(zero)(zero);
  p = phi(p);
  assert.equal(jsNum(fst(p)), 0);
  assert.equal(jsNum(snd(p)), 1);
  p = phi(p);
  assert.equal(jsNum(fst(p)), 1);
  assert.equal(jsNum(snd(p)), 2);
  p = phi(p);
  assert.equal(jsNum(fst(p)), 2);
  assert.equal(jsNum(snd(p)), 3);
});

// n(phi) represents n applications of phi.
const pred = n => fst(n(phi)(pair(zero)(zero))); // λn.fst (n phi (pair zero zero))
test('pred', () => {
  assert.equal(jsNum(pred(zero)), 0); // nothing before zero
  assert.equal(jsNum(pred(one)), 0);
  assert.equal(jsNum(pred(two)), 1);
  assert.equal(jsNum(pred(three)), 2);
});

const add = m => n => m(succ)(n); // λmn.(m succ) n.
test('add', () => {
  assert.equal(jsNum(add(zero)(zero)), 0);
  assert.equal(jsNum(add(zero)(one)), 1);
  assert.equal(jsNum(add(one)(zero)), 1);
  assert.equal(jsNum(add(two)(three)), 5);
});

const sub = m => n => n(pred)(m); // λmn.(n pred) m
test('sub', () => {
  assert.equal(jsNum(sub(zero)(zero)), 0);
  assert.equal(jsNum(sub(one)(zero)), 1);
  assert.equal(jsNum(sub(two)(zero)), 2);
  assert.equal(jsNum(sub(two)(one)), 1);
  assert.equal(jsNum(sub(two)(two)), 0);
  assert.equal(jsNum(sub(three)(one)), 2);
  assert.equal(jsNum(sub(three)(two)), 1);
  assert.equal(jsNum(sub(three)(three)), 0);
  assert.equal(jsNum(sub(four)(two)), 2);
  assert.equal(jsNum(sub(one)(three)), 0); // no negative numbers
});

// const mul = m => n => m(add(n))(zero); // λmn.m (add n) 0
// The above is correct, but multiplication is also the same as composition!
const compose = f => g => x => f(g(x)); // λfgx.f (g x)
const mul = compose;
test('mul', () => {
  assert.equal(jsNum(mul(zero)(zero)), 0);
  assert.equal(jsNum(mul(zero)(one)), 0);
  assert.equal(jsNum(mul(one)(zero)), 0);
  assert.equal(jsNum(mul(one)(two)), 2);
  assert.equal(jsNum(mul(two)(one)), 2);
  assert.equal(jsNum(mul(two)(three)), 6);
});

// const exp = m => n => n(mul(m))(one); // λmn.n (mul m) 1
const exp = m => n => n(m); // λmn.n m
test('exp', () => {
  assert.equal(jsNum(exp(zero)(zero)), 1);
  assert.equal(jsNum(exp(two)(zero)), 1);
  assert.equal(jsNum(exp(two)(one)), 2);
  assert.equal(jsNum(exp(two)(three)), 8);
  assert.equal(jsNum(exp(three)(two)), 9);
});

const equalBool = a => b => or(and(a)(b))(and(not(a))(not(b)));
// λab.(or (and a b) (and (not a) (not b)))
test('equalBool', () => {
  assert.equal(jsBool(equalBool(true_)(true_)), true);
  assert.equal(jsBool(equalBool(true_)(false_)), false);
  assert.equal(jsBool(equalBool(false_)(true_)), false);
  assert.equal(jsBool(equalBool(false_)(false_)), true);
});

// We have to test both because sub returns zero when m < n.
const equalNum = m => n => and(isZero(sub(m)(n)))(isZero(sub(n)(m)));
// λmn.and (isZero (sub m n)) (isZero (sub n m))
test('equalNum', () => {
  assert.equal(jsBool(equalNum(one)(two)), false);
  assert.equal(jsBool(equalNum(two)(two)), true);
  assert.equal(jsBool(equalNum(two)(one)), false);
});

// The compose function is defined above.
test('compose', () => {
  const add3 = n => add(three)(n);
  const mul2 = n => mul(two)(n);
  assert.equal(jsNum(compose(add3)(mul2)(two)), 7);
  assert.equal(jsNum(compose(mul2)(add3)(two)), 10);
});

// This definition only works in lazily evaluated languages like Haskell.
// const Y = f => (x => f(x(x)))(x => f(x(x))); // λf.(λx.f (x x)) (λx.f (x x))
// This definition works in strictly evaluated languages like JavaScript.
const Y = f => (x => x(x))(x => f(y => x(x)(y))); // λf.(λx.x x) (λx.f (x x))
const facGen = f => n => isZero(n)(() => one)(() => mul(n)(f(pred(n))))();
const factorialY = Y(facGen);
test('factorialY', () => {
  assert.equal(jsNum(factorialY(zero)), 1);
  assert.equal(jsNum(factorialY(one)), 1);
  assert.equal(jsNum(factorialY(two)), 2);
  assert.equal(jsNum(factorialY(three)), 6);
  assert.equal(jsNum(factorialY(four)), 24);
  assert.equal(jsNum(factorialY(five)), 120);
});

// This works in strictly evaluated languages like JavaScript.
// Note that the two terms at the end are identical.
const Z = f => (x => f(y => x(x)(y)))(x => f(y => x(x)(y)));
const factorialZ = Z(facGen);
test('factorialZ', () => {
  assert.equal(jsNum(factorialZ(zero)), 1);
  assert.equal(jsNum(factorialZ(one)), 1);
  assert.equal(jsNum(factorialZ(two)), 2);
  assert.equal(jsNum(factorialZ(three)), 6);
  assert.equal(jsNum(factorialZ(four)), 24);
  assert.equal(jsNum(factorialZ(five)), 120);
});

const lessThan = m => n => not(isZero(sub(n)(m)));

// This divides the whole number m by the whole number n.
// If n = zero then return zero (handles division by zero).
// If m < n then return zero (n cannot go into m even once).
// Otherwise, return successor of (m - n) / n.
const divGen = f => m => n =>
  isZero(n)(() => zero)(() =>
    lessThan(m)(n)(() => zero)(() => succ(f(sub(m)(n))(n)))()
  )();
const div = Z(divGen);

test('div', () => {
  assert.equal(jsNum(div(zero)(one)), 0);
  assert.equal(jsNum(div(one)(one)), 1);
  assert.equal(jsNum(div(two)(one)), 2);
  assert.equal(jsNum(div(three)(two)), 1);
  assert.equal(jsNum(div(four)(two)), 2);
  assert.equal(jsNum(div(five)(two)), 2);
  assert.equal(jsNum(div(two)(five)), 0);
});

const cons = a => b => f => f(a)(b);
const car = p => p(true_);
const cdr = p => p(false_);
const nil = _f => _x => null;
test('cons, car, cdr', () => {
  const pair = cons(one)(two);
  assert.equal(car(pair), one);
  assert.equal(cdr(pair), two);

  const list = cons(one)(cons(two)(cons(three)(nil)));
  assert.equal(car(list), one);
  assert.equal(car(cdr(list)), two);
  assert.equal(car(cdr(cdr(list))), three);
  assert.equal(cdr(cdr(cdr(list))), nil);
});
