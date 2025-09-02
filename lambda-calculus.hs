{-# LANGUAGE ImpredicativeTypes #-}
{-# LANGUAGE RankNTypes #-}

type ChurchBool = forall a. a -> a -> a

hsBool :: ChurchBool -> Bool
hsBool b = b True False

true_ :: ChurchBool
true_ = \x y -> x

false_ :: ChurchBool
false_ = \x y -> y

equalBool :: ChurchBool -> ChurchBool -> ChurchBool
equalBool a b = or_ (and_ a b) (and_ (not_ a) (not_ b))

not_ :: ChurchBool -> ChurchBool
not_ b = b false_ true_

and_ :: ChurchBool -> ChurchBool -> ChurchBool
and_ x y = x y false_

or_ :: ChurchBool -> ChurchBool -> ChurchBool
or_ x y = x true_ y

type ChurchNum = forall a. (a -> a) -> a -> a

hsNum :: ChurchNum -> Int
hsNum n = n (+1) 0

succ_ :: ChurchNum -> ChurchNum
succ_ n = \f x -> f (n f x)

zero, one, two, three, four, five :: ChurchNum
zero  = \f x -> x
{-
one   = \f x -> f x
two   = \f x -> f (f x)
three = \f x -> f (f (f x))
four  = \f x -> f (f (f (f x)))
five  = \f x -> f (f (f (f (f x))))
-}
one   = succ_ zero
two   = succ_ one
three = succ_ two
four  = succ_ three
five  = succ_ four

isZero :: ChurchNum -> ChurchBool
isZero n = n (\_ -> false_) true_

add :: ChurchNum -> ChurchNum -> ChurchNum
add m n = m succ_ n

mul :: ChurchNum -> ChurchNum -> ChurchNum
mul m n = \f -> m (n f)

exp_ :: ChurchNum -> ChurchNum -> ChurchNum
exp_ m n = n m

if_ :: ChurchBool -> a -> a -> a
if_ b t f = b t f

identity :: a -> a
identity x = x

pair :: a -> b -> (a -> b -> c) -> c
pair x y = \f -> f x y

fst_ :: ((ChurchBool -> a) -> a)
fst_ p = p true_

snd_ :: ((ChurchBool -> a) -> a)
snd_ p = p false_

phi :: ((ChurchNum -> ChurchNum -> ChurchNum) -> ChurchNum) -> (ChurchNum -> ChurchNum -> ChurchNum) -> ChurchNum
phi p = pair (snd_ p) (succ_ (snd_ p))

pred_ :: ChurchNum -> ChurchNum
pred_ n = fst_ (n phi (pair zero zero))

sub :: ChurchNum -> ChurchNum -> ChurchNum
sub m n = n pred_ m

equalNum :: ChurchNum -> ChurchNum -> ChurchBool
equalNum m n = and_ (isZero (sub m n)) (isZero (sub n m))

lessThan :: ChurchNum -> ChurchNum -> ChurchBool
lessThan m n = not_ (isZero (sub n m))

div_ :: ChurchNum -> ChurchNum -> ChurchNum
div_ = y divGen

divGen :: (ChurchNum -> ChurchNum -> ChurchNum) -> ChurchNum -> ChurchNum -> ChurchNum
divGen f m n =
  if_ (isZero n) zero $
  if_ (lessThan m n) zero $
  succ_ (f (sub m n) n)

main :: IO ()
main = do
  print $ hsBool true_ == True
  print $ hsBool false_ == False

  print $ hsBool (equalBool true_ true_) == True
  print $ hsBool (equalBool true_ false_) == False
  print $ hsBool (equalBool false_ true_) == False
  print $ hsBool (equalBool false_ false_) == True

  print $ hsBool (not_ true_) == False
  print $ hsBool (not_ false_) == True

  print $ hsBool (and_ true_ true_) == True
  print $ hsBool (and_ true_ false_) == False
  print $ hsBool (and_ false_ true_) == False
  print $ hsBool (and_ false_ false_) == False

  print $ hsBool (or_ true_ true_) == True
  print $ hsBool (or_ true_ false_) == True
  print $ hsBool (or_ false_ true_) == True
  print $ hsBool (or_ false_ false_) == False

  print $ hsNum zero == 0
  print $ hsNum one == 1
  print $ hsNum two == 2

  print $ hsBool (equalNum one two) == False
  print $ hsBool (equalNum two two) == True
  print $ hsBool (equalNum two one) == False

  print $ hsNum (succ_ zero) == 1
  print $ hsNum (succ_ one) == 2
  print $ hsNum (succ_ two) == 3

  print $ hsNum (add zero zero) == 0
  print $ hsNum (add zero one) == 1
  print $ hsNum (add one zero) == 1
  print $ hsNum (add two three) == 5

  print $ hsNum (mul zero zero) == 0
  print $ hsNum (mul zero one) == 0
  print $ hsNum (mul one zero) == 0
  print $ hsNum (mul one two) == 2
  print $ hsNum (mul two one) == 2
  print $ hsNum (mul two three) == 6

  print $ hsNum (pred_ zero) == 0
  print $ hsNum (pred_ one) == 0
  print $ hsNum (pred_ two) == 1
  print $ hsNum (pred_ three) == 2

  print $ hsNum (mul two three) == 6
  print $ hsNum (exp_ two three) == 8
  print $ hsBool (equalNum two two) == True
  print $ hsNum (div_ five two) == 2
  print $ hsNum (pred_ three) == 2
