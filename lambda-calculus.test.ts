// @ts-nocheck
import {expect, test} from 'bun:test';

const jsbool = b => b(true)(false);
const jsnum = n => n(x => x + 1)(0);

// Adding underscores to avoid conflicting with JavaScript keywords.
const true_ = x => y => x; // λt. λf. t; returns first argument
const false_ = x => y => y; // λt. λf. f; returns second argument
test('true/false', () => {
  expect(jsbool(true_)).toBe(true);
  expect(jsbool(false_)).toBe(false);
});

const not = b => b(false_)(true_); // λb. b false true
test('not', () => {
  expect(jsbool(not(true_))).toBe(false);
  expect(jsbool(not(false_))).toBe(true);
});

const and = x => y => x(y)(false_); // λx. (λy. x y false)
test('and', () => {
  expect(jsbool(and(true_)(true_))).toBe(true);
  expect(jsbool(and(true_)(false_))).toBe(false);
  expect(jsbool(and(false_)(true_))).toBe(false);
  expect(jsbool(and(false_)(false_))).toBe(false);
});

const or = x => y => x(true_)(y); // λx. (λy. x true y)
test('or', () => {
  expect(jsbool(or(true_)(true_))).toBe(true);
  expect(jsbool(or(true_)(false_))).toBe(true);
  expect(jsbool(or(false_)(true_))).toBe(true);
  expect(jsbool(or(false_)(false_))).toBe(false);
});

const zero = f => x => x; // λfx.x
const one = f => x => f(x); // λfx.f x
//const one = succ(zero);
const two = f => x => f(f(x)); // λfx.f (f x)
//const two = succ(one);
const three = f => x => f(f(f(x))); // λfx.f (f (f x))
//const three = succ(two);
const four = f => x => f(f(f(f(x)))); // λfx.f (f (f (fx)))
//const four = succ(three);

const if_ = b => x => y => b(x)(y); // λbxy.b x y
test('if_', () => {
  expect(jsnum(if_(true_)(two)(three))).toBe(2);
  expect(jsnum(if_(false_)(two)(three))).toBe(3);
});

const identity = x => x; // λx.x
test('identity', () => {
  expect(jsbool(identity(true_))).toBe(true);
  expect(jsnum(identity(two))).toBe(2);
});

const iszero = n => n(x => false_)(true_); // λn.n (λx.FALSE) TRUE
test('iszero', () => {
  expect(jsbool(iszero(zero))).toBe(true);
  expect(jsbool(iszero(one))).toBe(false);
  expect(jsbool(iszero(two))).toBe(false);
});

const succ = n => f => x => f(n(f)(x)); // λn (λf. λx. f (n f x))
test('succ', () => {
  expect(jsnum(succ(zero))).toBe(1);
  expect(jsnum(succ(one))).toBe(2);
  expect(jsnum(succ(two))).toBe(3);
});

const pred = n => f => x => n(g => h => h(g(f)))(u => x)(u => u);
// λn.λf.λx. n (λg.λh. h (g f)) (λu.x) (λu.u)
test('pred', () => {
  expect(jsnum(pred(zero))).toBe(0);
  expect(jsnum(pred(one))).toBe(0);
  expect(jsnum(pred(two))).toBe(1);
  expect(jsnum(pred(three))).toBe(2);
});

const add = m => n => m(succ)(n); // λmn. (m succ) n.
test('add', () => {
  expect(jsnum(add(zero)(zero))).toBe(0);
  expect(jsnum(add(zero)(one))).toBe(1);
  expect(jsnum(add(one)(zero))).toBe(1);
  expect(jsnum(add(two)(three))).toBe(5);
});

const sub = m => n => n(pred)(m); // λmn. (n pred) m
test('sub', () => {
  expect(jsnum(sub(zero)(zero))).toBe(0);
  expect(jsnum(sub(one)(zero))).toBe(1);
  expect(jsnum(sub(two)(zero))).toBe(2);
  expect(jsnum(sub(two)(one))).toBe(1);
  expect(jsnum(sub(two)(two))).toBe(0);
  expect(jsnum(sub(three)(one))).toBe(2);
  expect(jsnum(sub(three)(two))).toBe(1);
  expect(jsnum(sub(three)(three))).toBe(0);
  expect(jsnum(sub(one)(three))).toBe(0); // no negative numbers
});

const mul = m => n => m(add(n))(zero); // λmn. m (add n) 0
test('mul', () => {
  expect(jsnum(mul(zero)(zero))).toBe(0);
  expect(jsnum(mul(zero)(one))).toBe(0);
  expect(jsnum(mul(one)(zero))).toBe(0);
  expect(jsnum(mul(one)(two))).toBe(2);
  expect(jsnum(mul(two)(one))).toBe(2);
  expect(jsnum(mul(two)(three))).toBe(6);
});

//TODO: Fix this.
const div = m => n => m(sub(n))(zero); // λmn. m (sub n) 0
test('div', () => {
  expect(jsnum(div(zero)(zero))).toBe(0);
  expect(jsnum(div(zero)(one))).toBe(0);
  expect(jsnum(div(one)(zero))).toBe(0);
  //expect(jsnum(div(two)(one))).toBe(2);
  //expect(jsnum(div(four)(two))).toBe(2);
});

const exp = m => n => n(mul(m))(one); // λmn. n (mul m) 1
test('exp', () => {
  expect(jsnum(exp(zero)(zero))).toBe(1);
  expect(jsnum(exp(two)(zero))).toBe(1);
  expect(jsnum(exp(two)(one))).toBe(2);
  expect(jsnum(exp(two)(three))).toBe(8);
  expect(jsnum(exp(three)(two))).toBe(9);
});

const equalbool = a => b => or(and(a)(b))(and(not(a))(not(b)));
// λab. (or (and a b) (and (not a) (not b)))
test('equalbool', () => {
  expect(jsbool(equalbool(true_)(true_))).toBe(true);
  expect(jsbool(equalbool(true_)(false_))).toBe(false);
  expect(jsbool(equalbool(false_)(true_))).toBe(false);
  expect(jsbool(equalbool(false_)(false_))).toBe(true);
});

// We have to test both because sub returns zero when m < n.
const equalnum = m => n => and(iszero(sub(m)(n)))(iszero(sub(n)(m)));
// λmn.and (iszero (sub m n)) (iszero (sub n m))
test('equalnum', () => {
  expect(jsbool(equalnum(one)(two))).toBe(false);
  expect(jsbool(equalnum(two)(two))).toBe(true);
  expect(jsbool(equalnum(two)(one))).toBe(false);
});

const compose = f => g => x => f(g(x)); // λfgx.f (g x)
test('compose', () => {
  const add3 = n => add(three)(n);
  const mul2 = n => mul(two)(n);
  expect(jsnum(compose(add3)(mul2)(two))).toBe(7);
  expect(jsnum(compose(mul2)(add3)(two))).toBe(10);
});

// TODO: Implement the y combinator function.
