import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import type { DisplayProduct, DisplayStore } from './types'
import { DIGEMART_API_BASE } from './api'

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

// API functions for server-side wishlist
const fetchWishlistFromAPI = async (walletAddress: string): Promise<WishlistItem[]> => {
    try {
        const response = await fetch(`${DIGEMART_API_BASE}/users/${walletAddress}/wishlist`)
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`)
        }
        const data = await response.json()
        return data.wishlist || []
    } catch (error) {
        console.error('Error fetching wishlist from API:', error)
        throw error
    }
}

const addToWishlistAPI = async (walletAddress: string, item: WishlistItem): Promise<WishlistItem[]> => {
    try {
        const response = await fetch(`${DIGEMART_API_BASE}/users/${walletAddress}/wishlist`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ item }),
        })
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`)
        }
        const data = await response.json()
        return data.wishlist || []
    } catch (error) {
        console.error('Error adding to wishlist via API:', error)
        throw error
    }
}

const removeFromWishlistAPI = async (walletAddress: string, id: number, type: 'product' | 'store'): Promise<WishlistItem[]> => {
    try {
        const response = await fetch(`${DIGEMART_API_BASE}/users/${walletAddress}/wishlist`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ id, type }),
        })
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`)
        }
        const data = await response.json()
        return data.wishlist || []
    } catch (error) {
        console.error('Error removing from wishlist via API:', error)
        throw error
    }
}

// Main wishlist hook
export function useWishlist(walletAddress?: string) {
    const queryClient = useQueryClient()
    const isConnected = Boolean(walletAddress)

    // Get wishlist items - from API if connected, localStorage if not
    const { data: wishlistItems = [], isLoading, error } = useQuery({
        queryKey: ['wishlist', walletAddress],
        queryFn: () => {
            if (isConnected && walletAddress) {
                return fetchWishlistFromAPI(walletAddress)
            } else {
                return getWishlistFromStorage()
            }
        },
        staleTime: isConnected ? 2 * 60 * 1000 : Infinity, // 2 min for API, infinite for localStorage
        gcTime: isConnected ? 10 * 60 * 1000 : Infinity, // 10 min for API, infinite for localStorage
        retry: isConnected ? 2 : 0, // Retry API calls, but not localStorage
    })

    // Add to wishlist mutation
    const addToWishlistMutation = useMutation({
        mutationFn: async ({ item, type }: { item: DisplayProduct | DisplayStore; type: 'product' | 'store' }) => {
            const newItem = type === 'product'
                ? productToWishlistItem(item as DisplayProduct)
                : storeToWishlistItem(item as DisplayStore)

            if (isConnected && walletAddress) {
                // Use API for connected users
                return await addToWishlistAPI(walletAddress, newItem)
            } else {
                // Use localStorage for non-connected users
                const currentItems = getWishlistFromStorage()

                // Check if item already exists
                const exists = currentItems.some(wishlistItem =>
                    wishlistItem.id === item.id && wishlistItem.type === type
                )

                if (exists) {
                    throw new Error('Item already in wishlist')
                }

                const updatedItems = [newItem, ...currentItems]
                saveWishlistToStorage(updatedItems)
                return updatedItems
            }
        },
        onSuccess: (updatedItems) => {
            // Update the cache
            queryClient.setQueryData(['wishlist', walletAddress], updatedItems)
        },
        onError: (error) => {
            console.error('Error adding to wishlist:', error)
        }
    })

    // Remove from wishlist mutation
    const removeFromWishlistMutation = useMutation({
        mutationFn: async ({ id, type }: { id: number; type: 'product' | 'store' }) => {
            if (isConnected && walletAddress) {
                // Use API for connected users
                return await removeFromWishlistAPI(walletAddress, id, type)
            } else {
                // Use localStorage for non-connected users
                const currentItems = getWishlistFromStorage()
                const updatedItems = currentItems.filter(item =>
                    !(item.id === id && item.type === type)
                )
                saveWishlistToStorage(updatedItems)
                return updatedItems
            }
        },
        onSuccess: (updatedItems) => {
            // Update the cache
            queryClient.setQueryData(['wishlist', walletAddress], updatedItems)
        },
        onError: (error) => {
            console.error('Error removing from wishlist:', error)
        }
    })

    // Clear wishlist mutation
    const clearWishlistMutation = useMutation({
        mutationFn: async () => {
            if (isConnected && walletAddress) {
                // For API users, we'd need to implement a clear endpoint
                // For now, just return empty array and let it sync
                return []
            } else {
                saveWishlistToStorage([])
                return []
            }
        },
        onSuccess: (updatedItems) => {
            queryClient.setQueryData(['wishlist', walletAddress], updatedItems)
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
        error,
        addToWishlist,
        removeFromWishlist,
        clearWishlist,
        isInWishlist,
        getWishlistCount,
        isAdding: addToWishlistMutation.isPending,
        isRemoving: removeFromWishlistMutation.isPending,
        addError: addToWishlistMutation.error,
        removeError: removeFromWishlistMutation.error,
        isConnected,
    }
} 