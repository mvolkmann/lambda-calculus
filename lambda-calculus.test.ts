// @ts-nocheck
import {expect, test} from 'bun:test';

const jsbool = b => b(true)(false);
const jsnum = n => n(x => x + 1)(0);

const t = x => y => x; // returns the first argument
const f = x => y => y; // returns the second argument
test('true/false', () => {
  expect(jsbool(t)).toBe(true);
  expect(jsbool(f)).toBe(false);
});

const not = b => b(f)(t);
test('not', () => {
  expect(jsbool(not(t))).toBe(false);
  expect(jsbool(not(f))).toBe(true);
});

const and = x => y => x(y)(f);
test('and', () => {
  expect(jsbool(and(t)(t))).toBe(true);
  expect(jsbool(and(t)(f))).toBe(false);
  expect(jsbool(and(f)(t))).toBe(false);
  expect(jsbool(and(f)(f))).toBe(false);
});

const or = x => y => x(t)(y);
test('or', () => {
  expect(jsbool(or(t)(t))).toBe(true);
  expect(jsbool(or(t)(f))).toBe(true);
  expect(jsbool(or(f)(t))).toBe(true);
  expect(jsbool(or(f)(f))).toBe(false);
});

const iff = b => x => y => b(x)(y);
test('iff', () => {
  expect(jsnum(iff(t)(two)(three))).toBe(2);
  expect(jsnum(iff(f)(two)(three))).toBe(3);
});

const succ = n => f => a => f(n(f)(a));
const zero = f => x => x;
const one = f => x => f(x);
//const one = succ(zero);
const two = f => x => f(f(x));
//const two = succ(one);
const three = f => x => f(f(f(x)));
//const three = succ(two);

const identity = x => x;
test('identity', () => {
  expect(jsbool(identity(t))).toBe(true);
  expect(jsnum(identity(two))).toBe(2);
});

const iszero = n => n(x => f)(t);
test('iszero', () => {
  expect(jsbool(iszero(zero))).toBe(true);
  expect(jsbool(iszero(one))).toBe(false);
  expect(jsbool(iszero(two))).toBe(false);
});

test('succ', () => {
  expect(jsnum(succ(zero))).toBe(1);
  expect(jsnum(succ(one))).toBe(2);
  expect(jsnum(succ(two))).toBe(3);
});

// λn.λf.λx. n (λg.λh. h (g f)) (λu.x) (λu.u)
const pred = n => f => x => n(g => h => h(g(f)))(u => x)(u => u);
test('pred', () => {
  expect(jsnum(pred(zero))).toBe(0);
  expect(jsnum(pred(one))).toBe(0);
  expect(jsnum(pred(two))).toBe(1);
  expect(jsnum(pred(three))).toBe(2);
});

const add = m => n => m(succ)(n);
test('add', () => {
  expect(jsnum(add(zero)(zero))).toBe(0);
  expect(jsnum(add(zero)(one))).toBe(1);
  expect(jsnum(add(one)(zero))).toBe(1);
  expect(jsnum(add(two)(three))).toBe(5);
});

const sub = m => n => n(pred)(m);
test('sub', () => {
  expect(jsnum(sub(zero)(zero))).toBe(0);
  expect(jsnum(sub(one)(zero))).toBe(1);
  expect(jsnum(sub(two)(zero))).toBe(2);
  expect(jsnum(sub(two)(one))).toBe(1);
  expect(jsnum(sub(two)(two))).toBe(0);
  expect(jsnum(sub(three)(one))).toBe(2);
  expect(jsnum(sub(three)(two))).toBe(1);
  expect(jsnum(sub(three)(three))).toBe(0);
});

const mult = m => n => m(add(n))(zero);
test('mult', () => {
  expect(jsnum(mult(zero)(zero))).toBe(0);
  expect(jsnum(mult(zero)(one))).toBe(0);
  expect(jsnum(mult(one)(zero))).toBe(0);
  expect(jsnum(mult(one)(two))).toBe(2);
  expect(jsnum(mult(two)(one))).toBe(2);
  expect(jsnum(mult(two)(three))).toBe(6);
});

const exp = m => n => n(mult(m))(one);
test('exp', () => {
  expect(jsnum(exp(zero)(zero))).toBe(1);
  expect(jsnum(exp(two)(zero))).toBe(1);
  expect(jsnum(exp(two)(one))).toBe(2);
  expect(jsnum(exp(two)(three))).toBe(8);
  expect(jsnum(exp(three)(two))).toBe(9);
});

// TODO: Implement the function composition function.

// TODO: Implement the y combinator function.
