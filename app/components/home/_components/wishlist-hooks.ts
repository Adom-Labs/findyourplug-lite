import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import type { DisplayProduct, DisplayStore } from './types'

// Wishlist item type that combines products and stores
export interface WishlistItem {
    id: number
    type: 'product' | 'store'
    addedAt: string // ISO date string
    name: string
    description: string
    image: string
    location: string
    // Product-specific fields
    price?: string
    storeName?: string
    storeUrl?: string
    categoryName?: string
    // Store-specific fields
    rating?: number
    reviews?: number
    url?: string
    verified?: boolean
}

// Local storage key
const WISHLIST_KEY = 'minikit-wishlist'

// Helper functions for localStorage
const getWishlistFromStorage = (): WishlistItem[] => {
    if (typeof window === 'undefined') return []
    try {
        const stored = localStorage.getItem(WISHLIST_KEY)
        return stored ? JSON.parse(stored) : []
    } catch (error) {
        console.error('Error reading wishlist from localStorage:', error)
        return []
    }
}

const saveWishlistToStorage = (items: WishlistItem[]): void => {
    if (typeof window === 'undefined') return
    try {
        localStorage.setItem(WISHLIST_KEY, JSON.stringify(items))
    } catch (error) {
        console.error('Error saving wishlist to localStorage:', error)
    }
}

// Convert API items to wishlist items
const productToWishlistItem = (product: DisplayProduct): WishlistItem => ({
    ...product,
    type: 'product' as const,
    addedAt: new Date().toISOString(),
})

const storeToWishlistItem = (store: DisplayStore): WishlistItem => ({
    ...store,
    type: 'store' as const,
    addedAt: new Date().toISOString(),
})

// Main wishlist hook
export function useWishlist() {
    const queryClient = useQueryClient()

    // Get wishlist items
    const { data: wishlistItems = [], isLoading } = useQuery({
        queryKey: ['wishlist'],
        queryFn: getWishlistFromStorage,
        staleTime: Infinity, // Never consider stale since it's local data
        gcTime: Infinity, // Keep in cache forever
    })

    // Add to wishlist mutation
    const addToWishlistMutation = useMutation({
        mutationFn: async ({ item, type }: { item: DisplayProduct | DisplayStore; type: 'product' | 'store' }) => {
            const currentItems = getWishlistFromStorage()

            // Check if item already exists
            const exists = currentItems.some(wishlistItem =>
                wishlistItem.id === item.id && wishlistItem.type === type
            )

            if (exists) {
                throw new Error('Item already in wishlist')
            }

            // Add new item
            const newItem = type === 'product'
                ? productToWishlistItem(item as DisplayProduct)
                : storeToWishlistItem(item as DisplayStore)

            const updatedItems = [newItem, ...currentItems]
            saveWishlistToStorage(updatedItems)
            return updatedItems
        },
        onSuccess: (updatedItems) => {
            // Update the cache
            queryClient.setQueryData(['wishlist'], updatedItems)
        },
        onError: (error) => {
            console.error('Error adding to wishlist:', error)
        }
    })

    // Remove from wishlist mutation
    const removeFromWishlistMutation = useMutation({
        mutationFn: async ({ id, type }: { id: number; type: 'product' | 'store' }) => {
            const currentItems = getWishlistFromStorage()
            const updatedItems = currentItems.filter(item =>
                !(item.id === id && item.type === type)
            )
            saveWishlistToStorage(updatedItems)
            return updatedItems
        },
        onSuccess: (updatedItems) => {
            // Update the cache
            queryClient.setQueryData(['wishlist'], updatedItems)
        },
        onError: (error) => {
            console.error('Error removing from wishlist:', error)
        }
    })

    // Clear wishlist mutation
    const clearWishlistMutation = useMutation({
        mutationFn: async () => {
            saveWishlistToStorage([])
            return []
        },
        onSuccess: (updatedItems) => {
            queryClient.setQueryData(['wishlist'], updatedItems)
        }
    })

    // Helper functions
    const addToWishlist = (item: DisplayProduct | DisplayStore, type: 'product' | 'store') => {
        return addToWishlistMutation.mutateAsync({ item, type })
    }

    const removeFromWishlist = (id: number, type: 'product' | 'store') => {
        return removeFromWishlistMutation.mutateAsync({ id, type })
    }

    const clearWishlist = () => {
        return clearWishlistMutation.mutateAsync()
    }

    const isInWishlist = (id: number, type: 'product' | 'store'): boolean => {
        return wishlistItems.some(item => item.id === id && item.type === type)
    }

    const getWishlistCount = (): { total: number; products: number; stores: number } => {
        const products = wishlistItems.filter(item => item.type === 'product').length
        const stores = wishlistItems.filter(item => item.type === 'store').length
        return {
            total: wishlistItems.length,
            products,
            stores
        }
    }

    return {
        wishlistItems,
        isLoading,
        addToWishlist,
        removeFromWishlist,
        clearWishlist,
        isInWishlist,
        getWishlistCount,
        isAdding: addToWishlistMutation.isPending,
        isRemoving: removeFromWishlistMutation.isPending,
        addError: addToWishlistMutation.error,
        removeError: removeFromWishlistMutation.error,
    }
} 