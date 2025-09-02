{-# LANGUAGE ImpredicativeTypes #-}
{-# LANGUAGE RankNTypes #-}

type ChurchNum = forall a. (a -> a) -> a -> a
succ_ :: ChurchNum -> ChurchNum
succ_ n = \f x -> f (n f x)
zero, one, two :: ChurchNum
zero  = \f x -> x
one   = succ_ zero
two   = succ_ one
add :: ChurchNum -> ChurchNum -> ChurchNum
add m n = m succ_ n