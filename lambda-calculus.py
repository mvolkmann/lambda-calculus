import unittest

def py_bool(b): return b(True)(False)
def py_num(n): return n(lambda x: x + 1)(0)

true_ = lambda x: lambda y: x
false_ = lambda x: lambda y: y

zero = lambda f: lambda x: x
succ = lambda n: lambda f: lambda x: f(n(f)(x))
one = succ(zero)
two = succ(one)
three = succ(two)
four = succ(three)
five = succ(four)

not_ = lambda b: b(false_)(true_)
and_ = lambda x: lambda y: x(y)(false_)
or_ = lambda x: lambda y: x(true_)(y)
identity = lambda x: x
is_zero = lambda n: n(lambda _: false_)(true_)
if_ = lambda b: lambda t: lambda f: b(t)(f)()

# Wikipedia predecessor
predW = lambda n: lambda f: lambda x: n(lambda g: lambda h: h(g(f)))(lambda u: x)(lambda u: u)

# Kleene pair-based predecessor
pair = lambda x: lambda y: lambda f: f(x)(y)
fst = lambda p: p(true_)
snd = lambda p: p(false_)
phi = lambda p: pair(snd(p))(succ(snd(p)))
pred = lambda n: fst(n(phi)(pair(zero)(zero)))

add = lambda m: lambda n: m(succ)(n)
sub = lambda m: lambda n: n(pred)(m)
compose = lambda f: lambda g: lambda x: f(g(x))
mul = compose
exp = lambda m: lambda n: n(m)
equal_bool = lambda a: lambda b: or_(and_(a)(b))(and_(not_(a))(not_(b)))
equal_num = lambda m: lambda n: and_(is_zero(sub(m)(n)))(is_zero(sub(n)(m)))
less_than = lambda m: lambda n: not_(is_zero(sub(n)(m)))

Y = lambda f: (lambda x: x(x))(lambda x: f(lambda y: x(x)(y)))
Z = lambda f: (lambda x: f(lambda *args: x(x)(*args)))(lambda x: f(lambda *args: x(x)(*args)))


fac_gen = lambda f: lambda n: (
    one if py_bool(is_zero(n)) else mul(n)(f(pred(n)))
)
factorial = Z(fac_gen)

div_gen = lambda f: lambda m: lambda n: (
    zero if py_bool(is_zero(n)) else
    zero if py_bool(less_than(m)(n)) else
    succ(f(sub(m)(n))(n))
)
div = Z(div_gen)

cons = lambda a: lambda b: lambda f: f(a)(b)
car = lambda p: p(true_)
cdr = lambda p: p(false_)
nil = lambda _f: lambda _x: None

class TestLambdaCalculus(unittest.TestCase):
    def test_true_false(self):
        self.assertTrue(py_bool(true_))
        self.assertFalse(py_bool(false_))

    def test_not(self):
        self.assertFalse(py_bool(not_(true_)))
        self.assertTrue(py_bool(not_(false_)))

    def test_and(self):
        self.assertTrue(py_bool(and_(true_)(true_)))
        self.assertFalse(py_bool(and_(true_)(false_)))
        self.assertFalse(py_bool(and_(false_)(true_)))
        self.assertFalse(py_bool(and_(false_)(false_)))

    def test_or(self):
        self.assertTrue(py_bool(or_(true_)(true_)))
        self.assertTrue(py_bool(or_(false_)(true_)))
        self.assertTrue(py_bool(or_(true_)(false_)))
        self.assertFalse(py_bool(or_(false_)(false_)))

    def test_numerals(self):
        results = []
        demo = lambda x: results.append(x) or x + x
        five(demo)(3)
        self.assertEqual(results, [3, 6, 12, 24, 48])

    def test_identity(self):
        self.assertEqual(py_num(identity(two)), 2)

    def test_is_zero(self):
        self.assertTrue(py_bool(is_zero(zero)))
        self.assertFalse(py_bool(is_zero(one)))

    def test_if(self):
        first = lambda: one
        second = lambda: two
        self.assertEqual(py_num(if_(true_)(first)(second)), 1)
        self.assertEqual(py_num(if_(false_)(first)(second)), 2)

    def test_succ(self):
        self.assertEqual(py_num(succ(zero)), 1)
        self.assertEqual(py_num(succ(one)), 2)
        self.assertEqual(py_num(succ(two)), 3)

    def test_pred(self):
        self.assertEqual(py_num(predW(zero)), 0)
        self.assertEqual(py_num(predW(one)), 0)
        self.assertEqual(py_num(predW(two)), 1)
        self.assertEqual(py_num(predW(three)), 2)

        self.assertEqual(py_num(pred(zero)), 0)
        self.assertEqual(py_num(pred(one)), 0)
        self.assertEqual(py_num(pred(two)), 1)
        self.assertEqual(py_num(pred(three)), 2)

    def test_arithmetic(self):
        self.assertEqual(py_num(add(two)(three)), 5)
        self.assertEqual(py_num(sub(four)(two)), 2)
        self.assertEqual(py_num(mul(two)(three)), 6)
        self.assertEqual(py_num(exp(two)(three)), 8)

    def test_equality(self):
        self.assertTrue(py_bool(equal_bool(true_)(true_)))
        self.assertFalse(py_bool(equal_bool(true_)(false_)))
        self.assertTrue(py_bool(equal_num(two)(two)))
        self.assertFalse(py_bool(equal_num(one)(two)))

    def test_factorial(self):
        self.assertEqual(py_num(factorial(five)), 120)

    def test_division(self):
        self.assertEqual(py_num(div(five)(two)), 2)
        self.assertEqual(py_num(div(two)(five)), 0)

    def test_lists(self):
        pair_ = cons(one)(two)
        self.assertEqual(car(pair_), one)
        self.assertEqual(cdr(pair_), two)

        lst = cons(one)(cons(two)(cons(three)(nil)))
        self.assertEqual(car(lst), one)
        self.assertEqual(car(cdr(lst)), two)
        self.assertEqual(car(cdr(cdr(lst))), three)
        self.assertEqual(cdr(cdr(cdr(lst))), nil)

if __name__ == "__main__":
    unittest.main()
