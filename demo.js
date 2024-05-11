const log = x => console.log(x);
const newline = () => console.log();
const identity = x => x;

//-----------------------------------------------------------------------------

const t = x => y => x;
const f = x => y => y;
const not = b => b(f)(t);
const and = x => y => x(y)(f);
const or = x => y => x(t)(y);
const if2 = b => x => y => b(x)(y);

const jsbool = b => b(true)(false);
log(jsbool(t)); // true
log(jsbool(f)); // false
newline();
log(jsbool(not(t))); // false
log(jsbool(not(f))); // true
newline();
log(jsbool(and(t)(t))); // true
log(jsbool(and(t)(f))); // false
log(jsbool(and(f)(t))); // false
log(jsbool(and(f)(f))); // false
newline();
log(jsbool(or(t)(t))); // true
log(jsbool(or(t)(f))); // true
log(jsbool(or(f)(t))); // true
log(jsbool(or(f)(f))); // false
newline();

//-----------------------------------------------------------------------------

const zero = f => x => x;
const one = f => x => f(x);
const two = f => x => f(f(x));
const three = f => x => f(f(f(x)));

const jsnum = n => n(x => x + 1)(0);
const iszero = n => n(x => f)(t);
const succ = n => f => a => f(n(f)(a));
const add = m => n => m(succ)(n);
const mult = m => n => m(add(n))(zero);
const exp = m => n => n(mult(m))(one);

log(jsbool(iszero(zero))); // true
log(jsbool(iszero(one))); // false
log(jsbool(iszero(two))); // false
newline();

log(jsnum(zero)); // 0
log(jsnum(succ(zero))); // 1
log(jsnum(succ(three))); // 4
newline();

log(jsnum(add(zero)(zero))); // 0
log(jsnum(add(zero)(one))); // 1
log(jsnum(add(one)(zero))); // 1
log(jsnum(add(two)(three))); // 5
newline();

log(jsnum(mult(zero)(zero))); // 0
log(jsnum(mult(zero)(one))); // 0
log(jsnum(mult(one)(zero))); // 0
log(jsnum(mult(one)(two))); // 2
log(jsnum(mult(two)(one))); // 2
log(jsnum(mult(two)(three))); // 6
newline();

log(jsnum(exp(zero)(zero))); // 1
log(jsnum(exp(two)(zero))); // 1
log(jsnum(exp(two)(one))); // 2
log(jsnum(exp(two)(three))); // 8
log(jsnum(exp(three)(two))); // 9
newline();

//-----------------------------------------------------------------------------

log(jsnum(if2(t)(two)(three))); // 2
log(jsnum(if2(f)(two)(three))); // 3
