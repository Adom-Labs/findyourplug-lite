import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import type { DisplayProduct } from './types'

export interface CartItem {
    id: number
    type: 'product'
    name: string
    price: number
    image: string
    quantity: number
}

const CART_KEY = 'minikit-cart'

const readCartFromStorage = (): CartItem[] => {
    if (typeof window === 'undefined') return []
    try {
        const stored = localStorage.getItem(CART_KEY)
        return stored ? JSON.parse(stored) : []
    } catch (error) {
        console.error('Error reading cart from localStorage:', error)
        return []
    }
}

const writeCartToStorage = (items: CartItem[]): void => {
    if (typeof window === 'undefined') return
    try {
        localStorage.setItem(CART_KEY, JSON.stringify(items))
    } catch (error) {
        console.error('Error saving cart to localStorage:', error)
    }
}

const toCartItem = (product: DisplayProduct, quantity: number = 1): CartItem => {
    const numericPrice = typeof product.price === 'string'
        ? Number(product.price.replace(/[^0-9.]/g, ''))
        : (product as unknown as { price: number }).price

    return {
        id: product.id,
        type: 'product',
        name: product.name,
        price: Number.isFinite(numericPrice) ? numericPrice : 0,
        image: product.image,
        quantity: Math.max(1, quantity)
    }
}

export function useCart(walletAddress?: string) {
    const queryClient = useQueryClient()
    const isConnected = Boolean(walletAddress)

    const { data: cartItems = [], isLoading, error } = useQuery<CartItem[]>({
        queryKey: ['cart', walletAddress],
        queryFn: async () => readCartFromStorage(),
        staleTime: Infinity,
        gcTime: Infinity,
        refetchOnWindowFocus: true,
    })

    const addMutation = useMutation({
        mutationFn: async ({ product, quantity }: { product: DisplayProduct; quantity?: number }) => {
            const newItem = toCartItem(product, quantity ?? 1)
            const current = readCartFromStorage()
            const existing = current.find(i => i.id === newItem.id && i.type === 'product')
            let updated: CartItem[]
            if (existing) {
                updated = current.map(i => i.id === newItem.id && i.type === 'product'
                    ? { ...i, quantity: i.quantity + newItem.quantity }
                    : i
                )
            } else {
                updated = [newItem, ...current]
            }
            writeCartToStorage(updated)
            return updated
        },
        onMutate: async ({ product, quantity }) => {
            await queryClient.cancelQueries({ queryKey: ['cart', walletAddress] })
            const previous = queryClient.getQueryData<CartItem[]>(['cart', walletAddress]) || []
            const optimisticItem = toCartItem(product, quantity ?? 1)
            const exists = previous.find(i => i.id === optimisticItem.id && i.type === 'product')
            const optimistic = exists
                ? previous.map(i => i.id === optimisticItem.id && i.type === 'product' ? { ...i, quantity: i.quantity + optimisticItem.quantity } : i)
                : [optimisticItem, ...previous]
            queryClient.setQueryData(['cart', walletAddress], optimistic)
            return { previous }
        },
        onError: (_err, _vars, context) => {
            if (context?.previous) queryClient.setQueryData(['cart', walletAddress], context.previous)
        },
        onSuccess: (updated) => {
            queryClient.setQueryData(['cart', walletAddress], updated)
        }
    })

    const removeMutation = useMutation({
        mutationFn: async ({ id }: { id: number }) => {
            const current = readCartFromStorage()
            const updated = current.filter(i => i.id !== id)
            writeCartToStorage(updated)
            return updated
        },
        onMutate: async ({ id }) => {
            await queryClient.cancelQueries({ queryKey: ['cart', walletAddress] })
            const previous = queryClient.getQueryData<CartItem[]>(['cart', walletAddress]) || []
            const optimistic = previous.filter(i => i.id !== id)
            queryClient.setQueryData(['cart', walletAddress], optimistic)
            return { previous }
        },
        onError: (_err, _vars, context) => {
            if (context?.previous) queryClient.setQueryData(['cart', walletAddress], context.previous)
        },
        onSuccess: (updated) => {
            queryClient.setQueryData(['cart', walletAddress], updated)
        }
    })

    const updateQtyMutation = useMutation({
        mutationFn: async ({ id, quantity }: { id: number; quantity: number }) => {
            const q = Math.max(0, quantity)
            const current = readCartFromStorage()
            let updated: CartItem[]
            if (q === 0) {
                updated = current.filter(i => i.id !== id)
            } else {
                updated = current.map(i => i.id === id ? { ...i, quantity: q } : i)
            }
            writeCartToStorage(updated)
            return updated
        },
        onMutate: async ({ id, quantity }) => {
            await queryClient.cancelQueries({ queryKey: ['cart', walletAddress] })
            const previous = queryClient.getQueryData<CartItem[]>(['cart', walletAddress]) || []
            const q = Math.max(0, quantity)
            const optimistic = q === 0
                ? previous.filter(i => i.id !== id)
                : previous.map(i => i.id === id ? { ...i, quantity: q } : i)
            queryClient.setQueryData(['cart', walletAddress], optimistic)
            return { previous }
        },
        onError: (_err, _vars, context) => {
            if (context?.previous) queryClient.setQueryData(['cart', walletAddress], context.previous)
        },
        onSuccess: (updated) => {
            queryClient.setQueryData(['cart', walletAddress], updated)
        }
    })

    const clearMutation = useMutation({
        mutationFn: async () => {
            writeCartToStorage([])
            return [] as CartItem[]
        },
        onMutate: async () => {
            await queryClient.cancelQueries({ queryKey: ['cart', walletAddress] })
            const previous = queryClient.getQueryData<CartItem[]>(['cart', walletAddress]) || []
            queryClient.setQueryData(['cart', walletAddress], [])
            return { previous }
        },
        onError: (_err, _vars, context) => {
            if (context?.previous) queryClient.setQueryData(['cart', walletAddress], context.previous)
        },
        onSuccess: (updated) => {
            queryClient.setQueryData(['cart', walletAddress], updated)
        }
    })

    const addItem = (product: DisplayProduct, quantity?: number) => addMutation.mutateAsync({ product, quantity })
    const removeItem = (id: number) => removeMutation.mutateAsync({ id })
    const updateQuantity = (id: number, quantity: number) => updateQtyMutation.mutateAsync({ id, quantity })
    const clearCart = () => clearMutation.mutateAsync()

    const getCartTotals = () => {
        const totalItems = cartItems.reduce((sum, i) => sum + i.quantity, 0)
        const totalPrice = cartItems.reduce((sum, i) => sum + i.price * i.quantity, 0)
        return { totalItems, totalPrice }
    }

    const isInCart = (id: number) => cartItems.some(i => i.id === id)

    const checkout = async () => {
        const { totalItems, totalPrice } = getCartTotals()
        try {
            if (typeof window !== 'undefined') {
                try { const { toast } = await import('sonner'); toast.success(`Checkout complete! Items: ${totalItems}, Total: $${totalPrice.toFixed(2)}`) } catch {}
            }
        } finally {
            await clearCart()
        }
    }

    return {
        cartItems,
        isLoading,
        error,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        checkout,
        isInCart,
        getCartTotals,
        isAdding: addMutation.isPending,
        isRemoving: removeMutation.isPending,
        isUpdating: updateQtyMutation.isPending,
        isClearing: clearMutation.isPending,
        isConnected,
    }
}


