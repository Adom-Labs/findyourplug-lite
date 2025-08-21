import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import type { DisplayProduct, DisplayStore } from './types'
import { DIGEMART_API_BASE } from './api'
import { useAccount } from 'wagmi'

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

        // Transform API response to match WishlistItem interface
        return (data.data || []).map((item: any) => {
            if (item.type === 'PRODUCT') {
                const product = item.product
                const mainImage = product.images?.find((img: any) => img.isMain)

                return {
                    id: item.productId,
                    type: 'product' as const,
                    addedAt: item.createdAt,
                    name: product.name,
                    description: product.description || '',
                    image: mainImage?.url || product.images?.[0]?.url || '',
                    location: '', // Products don't have location in wishlist context
                    price: `$${product.price}`,
                    storeName: '', // Could be populated if needed
                    storeUrl: '',
                    categoryName: '' // Could be populated if needed
                }
            } else {
                const store = item.store

                return {
                    id: item.storeId,
                    type: 'store' as const,
                    addedAt: item.createdAt,
                    name: store.storeName,
                    description: store.storeDescription || '',
                    image: store.logo || '',
                    location: store.storeAddress || '',
                    rating: store.averageRating || 0,
                    reviews: store.totalRatings || 0,
                    url: store.storeUrl || '',
                    verified: store.verified || false
                }
            }
        })
    } catch (error) {
        console.error('Error fetching wishlist from API:', error)
        throw error
    }
}

const addToWishlistAPI = async (walletAddress: string, id: number, type: 'product' | 'store'): Promise<WishlistItem[]> => {
    try {
        const requestBody = {
            productId: type === 'product' ? id : null,
            storeId: type === 'store' ? id : null,
            type: type.toUpperCase() as 'PRODUCT' | 'STORE', // API likely expects uppercase
            isAddress: true
        }

        const response = await fetch(`${DIGEMART_API_BASE}/users/${walletAddress}/wishlist`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestBody),
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
        const requestBody = {
            productId: type === 'product' ? id : null,
            storeId: type === 'store' ? id : null,
            type: type.toUpperCase() as 'PRODUCT' | 'STORE',
            isAddress: true
        }

        const response = await fetch(`${DIGEMART_API_BASE}/users/${walletAddress}/wishlist`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestBody),
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

// New type for just tracking IDs
type WishlistIds = {
    products: number[]
    stores: number[]
}

// Fetch just wishlist IDs for efficient checking
const fetchWishlistIds = async (walletAddress: string): Promise<WishlistIds> => {
    try {
        const response = await fetch(`${DIGEMART_API_BASE}/users/${walletAddress}/wishlist`)
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`)
        }
        const data = await response.json()
        const wishlist = data.data || []

        return {
            products: wishlist
                .filter((item: any) => item.type === 'PRODUCT')
                .map((item: any) => item.productId),
            stores: wishlist
                .filter((item: any) => item.type === 'STORE')
                .map((item: any) => item.storeId)
        }
    } catch (error) {
        console.error('Error fetching wishlist IDs from API:', error)
        throw error
    }
}

// Get wishlist IDs from localStorage
const getWishlistIdsFromStorage = (): WishlistIds => {
    try {
        const stored = localStorage.getItem('wishlist')
        if (!stored) return { products: [], stores: [] }

        const wishlist = JSON.parse(stored) as WishlistItem[]
        return {
            products: wishlist.filter(item => item.type === 'product').map(item => item.id),
            stores: wishlist.filter(item => item.type === 'store').map(item => item.id)
        }
    } catch (error) {
        console.error('Error reading wishlist IDs from localStorage:', error)
        return { products: [], stores: [] }
    }
}

// Hook for checking wishlist status globally
export const useWishlistIds = () => {
    const { isConnected, address: walletAddress } = useAccount()
    const queryClient = useQueryClient()

    const { data: wishlistIds = { products: [], stores: [] }, isLoading } = useQuery({
        queryKey: ['wishlistIds', walletAddress],
        queryFn: async () => {
            if (isConnected && walletAddress) {
                return await fetchWishlistIds(walletAddress)
            } else {
                return getWishlistIdsFromStorage()
            }
        },
        staleTime: isConnected ? 2 * 60 * 1000 : Infinity, // 2 min for API, infinite for localStorage
        gcTime: isConnected ? 5 * 60 * 1000 : Infinity,
        enabled: true, // Always enabled to track localStorage too
    })

    const isInWishlist = (id: number, type: 'product' | 'store'): boolean => {
        return type === 'product'
            ? wishlistIds.products.includes(id)
            : wishlistIds.stores.includes(id)
    }

    const updateWishlistIds = (id: number, type: 'product' | 'store', action: 'add' | 'remove') => {
        queryClient.setQueryData(['wishlistIds', walletAddress], (oldData: WishlistIds | undefined) => {
            if (!oldData) return { products: [], stores: [] }

            const newData = { ...oldData }

            if (type === 'product') {
                if (action === 'add') {
                    newData.products = [...newData.products.filter(pid => pid !== id), id]
                } else {
                    newData.products = newData.products.filter(pid => pid !== id)
                }
            } else {
                if (action === 'add') {
                    newData.stores = [...newData.stores.filter(sid => sid !== id), id]
                } else {
                    newData.stores = newData.stores.filter(sid => sid !== id)
                }
            }

            return newData
        })
    }

    return {
        wishlistIds,
        isInWishlist,
        updateWishlistIds,
        isLoading
    }
}

// Main wishlist hook
export function useWishlist(walletAddress?: string) {
    const queryClient = useQueryClient()
    const isConnected = Boolean(walletAddress)
    const { updateWishlistIds } = useWishlistIds()

    // Get wishlist items - from API if connected, localStorage if not  
    const { data: wishlistItems = [], isLoading, error, refetch } = useQuery({
        queryKey: ['wishlist', walletAddress],
        queryFn: () => {
            if (isConnected && walletAddress) {
                return fetchWishlistFromAPI(walletAddress)
            } else {
                return getWishlistFromStorage()
            }
        },
        staleTime: isConnected ? 2 * 60 * 1000 : Infinity,
        gcTime: isConnected ? 10 * 60 * 1000 : Infinity,
        retry: isConnected ? 2 : 0,
        refetchOnWindowFocus: true,
    })

    // Add to wishlist mutation
    const addToWishlistMutation = useMutation({
        mutationFn: async ({ item, type }: { item: DisplayProduct | DisplayStore; type: 'product' | 'store' }) => {
            if (isConnected && walletAddress) {
                // Use API for connected users - just send ID and type
                return await addToWishlistAPI(walletAddress, item.id, type)
            } else {
                // Use localStorage for non-connected users
                const newItem = type === 'product'
                    ? productToWishlistItem(item as DisplayProduct)
                    : storeToWishlistItem(item as DisplayStore)

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
        onSuccess: (updatedItems, { item, type }) => {
            // Update the cache
            queryClient.setQueryData(['wishlist', walletAddress], updatedItems)
            // Update global wishlist IDs cache
            updateWishlistIds(item.id, type, 'add')
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
        onSuccess: (updatedItems, { id, type }) => {
            // Update the cache
            queryClient.setQueryData(['wishlist', walletAddress], updatedItems)
            // Update global wishlist IDs cache
            updateWishlistIds(id, type, 'remove')
        },
        onError: (error) => {
            console.error('Error removing from wishlist:', error)
        }
    })

    // Clear wishlist mutation
    const clearWishlistMutation = useMutation({
        mutationFn: async () => {
            if (isConnected && walletAddress) {
                // need to implement a clear endpoint later
                // For now, just return empty array and let it sync
                return []
            } else {
                saveWishlistToStorage([])
                return []
            }
        },
        onSuccess: (updatedItems) => {
            queryClient.setQueryData(['wishlist', walletAddress], updatedItems)
            // Clear the global wishlist IDs cache
            queryClient.setQueryData(['wishlistIds', walletAddress], { products: [], stores: [] })
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
        refetchWishlist: refetch
    }
} 