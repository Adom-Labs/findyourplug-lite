"use client";

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { useAccount } from 'wagmi'
import { useWishlist, useWishlistIds } from '../../../components/home/_components/wishlist-hooks'
import { PackageIcon, StarIcon, LocationIcon, VerifiedIcon, HeartIcon, ShareIcon, ArrowLeftIcon } from '../../../components/home/_components/icons'
import { DIGEMART_API_BASE } from '../../../components/home/_components/api'

// Types for preview items - matching API response
interface StorePreview {
    id: number
    name: string
    description: string
    rating?: number
    reviews?: number
    location: string
    image: string
    url?: string
    verified?: boolean
    type: 'store'
}

interface ProductPreview {
    id: number
    name: string
    description: string
    features?: string
    price: number
    inventory: number
    averageRating?: number
    totalRatings?: number
    category: {
        id: number
        name: string
        description: string
    }
    tags: Array<{
        id: number
        name: string
    }>
    images: Array<{
        id: number
        url: string
        isMain: boolean
    }>
    storeId: number
    type: 'product'
}

type PreviewItem = StorePreview | ProductPreview

// API functions to fetch real data
const fetchStoreDetails = async (id: number): Promise<StorePreview> => {
    try {
        const response = await fetch(`${DIGEMART_API_BASE}/stores/${id}`)
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`)
        }
        const data = await response.json()
        const store = data.data

        return {
            id: store.id,
            name: store.storeName,
            description: store.storeDescription || '',
            rating: store.averageRating,
            reviews: store.totalRatings,
            location: `${store.storeAddress}, ${store.storeLocationCity}, ${store.storeLocationState}`,
            image: store.logo || store.storeCoverPhoto || '',
            url: store.storeUrl,
            verified: store.verified || false,
            type: 'store'
        }
    } catch (error) {
        console.error('Error fetching store details:', error)
        throw error
    }
}

const fetchProductDetails = async (id: number): Promise<ProductPreview> => {
    try {
        const response = await fetch(`${DIGEMART_API_BASE}/products/${id}`)
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`)
        }
        const data = await response.json()
        const product = data.data

        return {
            id: product.id,
            name: product.name,
            description: product.description,
            features: product.features,
            price: product.price,
            inventory: product.inventory,
            averageRating: product.averageRating,
            totalRatings: product.totalRatings,
            category: product.category,
            tags: product.tags || [],
            images: product.images || [],
            storeId: product.storeId,
            type: 'product'
        }
    } catch (error) {
        console.error('Error fetching product details:', error)
        throw error
    }
}

export default function PreviewPage() {
    const params = useParams()
    const router = useRouter()
    const [currentImageIndex, setCurrentImageIndex] = useState(0)

    const type = params.type as 'store' | 'product'
    const id = parseInt(params.id as string)
    const { address } = useAccount()
    const { addToWishlist, removeFromWishlist, isAdding, isRemoving } = useWishlist(address)
    const { isInWishlist } = useWishlistIds()

    // Fetch item details
    const { data: item, isLoading, error } = useQuery<PreviewItem>({
        queryKey: ['preview', type, id],
        queryFn: async () => {
            if (type === 'store') {
                return await fetchStoreDetails(id)
            } else {
                return await fetchProductDetails(id)
            }
        },
        enabled: !isNaN(id) && (type === 'store' || type === 'product'),
    })

    const inWishlist = item ? isInWishlist(item.id, item.type as 'product' | 'store') : false

    const handleWishlistToggle = async () => {
        if (!item) return

        try {
            if (inWishlist) {
                await removeFromWishlist(item.id, item.type)
            } else {
                // Convert to the format expected by addToWishlist
                const wishlistItem = item.type === 'store'
                    ? {
                        id: item.id,
                        name: item.name,
                        description: item.description,
                        image: item.image,
                        location: item.location,
                        rating: (item as StorePreview).rating || 0,
                        reviews: (item as StorePreview).reviews || 0,
                        url: (item as StorePreview).url || '',
                        verified: (item as StorePreview).verified || false
                    }
                    : {
                        id: item.id,
                        name: item.name,
                        description: item.description,
                        image: (item as ProductPreview).images?.[0]?.url || '',
                        location: '',
                        price: `$${(item as ProductPreview).price}`,
                        storeName: '',
                        storeUrl: '',
                        categoryName: (item as ProductPreview).category?.name || ''
                    }
                await addToWishlist(wishlistItem as any, item.type)
            }
        } catch (error) {
            console.error('Error toggling wishlist:', error)
        }
    }

    // Get main image for display
    const getMainImage = (item: PreviewItem): string => {
        if (item.type === 'store') {
            return item.image || ''
        } else {
            const mainImage = item.images.find(img => img.isMain)
            return mainImage?.url || item.images[0]?.url || ''
        }
    }

    if (isLoading) {
        return (
            <div className="space-y-4 w-full max-w-md mx-auto px-4 py-3">
                <div className="h-64 bg-[var(--ock-bg-alternate)] rounded-xl animate-pulse"></div>
                <div className="space-y-3">
                    <div className="h-6 bg-[var(--ock-bg-alternate)] rounded animate-pulse"></div>
                    <div className="h-4 bg-[var(--ock-bg-alternate)] rounded w-3/4 animate-pulse"></div>
                    <div className="h-4 bg-[var(--ock-bg-alternate)] rounded w-1/2 animate-pulse"></div>
                </div>
            </div>
        )
    }

    if (error || !item) {
        return (
            <div className="text-center py-12 space-y-4 w-full max-w-md mx-auto px-4 py-3">
                <div className="w-20 h-20 mx-auto bg-[var(--ock-bg-alternate)] rounded-full flex items-center justify-center">
                    <PackageIcon className="w-10 h-10 text-[var(--ock-text-foreground-muted)]" />
                </div>
                <div className="space-y-2">
                    <h3 className="text-lg font-medium text-white">
                        Item not found
                    </h3>
                    <p className="text-sm text-gray-300">
                        The {type} you&apos;re looking for doesn&apos;t exist or has been removed.
                    </p>
                </div>
                <button
                    onClick={() => router.back()}
                    className="inline-flex items-center space-x-2 px-4 py-2 bg-[var(--ock-accent)] text-white rounded-lg hover:bg-[var(--ock-accent)]/90 transition-colors"
                >
                    <ArrowLeftIcon className="w-4 h-4" />
                    <span>Go Back</span>
                </button>
            </div>
        )
    }

    const isStore = type === 'store'

    return (
        <div className="space-y-6 w-full max-w-md mx-auto px-4 py-3">
            {/* Header */}
            <div className="flex items-center justify-between">
                <button
                    onClick={() => router.back()}
                    className="flex items-center space-x-2 text-gray-300 hover:text-white transition-colors"
                >
                    <ArrowLeftIcon className="w-5 h-5" />
                    <span className="text-sm">Back</span>
                </button>

                <div className="flex items-center space-x-2">
                    <button
                        onClick={handleWishlistToggle}
                        disabled={isAdding || isRemoving}
                        className={`p-2 rounded-full transition-colors ${inWishlist
                            ? 'bg-red-500 text-white'
                            : 'bg-[var(--ock-bg-alternate)] text-gray-400 hover:bg-red-50 hover:text-red-500'
                            }`}
                        title={inWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
                    >
                        <HeartIcon className="w-5 h-5" />
                    </button>

                    <button
                        className="p-2 bg-[var(--ock-bg-alternate)] text-gray-400 rounded-full hover:bg-[var(--ock-bg-default)] hover:text-gray-300 transition-colors"
                        title="Share"
                    >
                        <ShareIcon className="w-5 h-5" />
                    </button>
                </div>
            </div>

            {/* Image Gallery */}
            <div className="space-y-3">
                <div className="aspect-video bg-[var(--ock-bg-alternate)] rounded-xl overflow-hidden">
                    <img
                        src={getMainImage(item)}
                        alt={item.name}
                        className="w-full h-full object-cover"
                    />
                </div>

                {!isStore && item.type === 'product' && item.images && item.images.length > 1 && (
                    <div className="flex space-x-2 overflow-x-auto pb-2">
                        {item.images.map((img, index: number) => (
                            <button
                                key={img.id}
                                onClick={() => setCurrentImageIndex(index)}
                                className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-colors ${currentImageIndex === index
                                    ? 'border-[var(--ock-accent)]'
                                    : 'border-transparent'
                                    }`}
                            >
                                <img src={img.url} alt={`${item.name} ${index + 1}`} className="w-full h-full object-cover" />
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {/* Content */}
            <div className="space-y-4">
                {/* Title & Basic Info */}
                <div className="space-y-2">
                    <div className="flex items-start justify-between">
                        <h1 className="text-xl font-bold text-white">
                            {item.name}
                        </h1>
                        {isStore && item.type === 'store' && item.verified && (
                            <VerifiedIcon className="w-6 h-6 text-blue-500 flex-shrink-0" />
                        )}
                    </div>

                    <p className="text-gray-300">
                        {item.description}
                    </p>

                    {/* Price for products */}
                    {!isStore && item.type === 'product' && (
                        <div className="flex items-center justify-between">
                            <span className="text-2xl font-bold text-white">
                                ${(item as ProductPreview).price}
                            </span>
                            <span className={`text-sm px-2 py-1 rounded ${(item as ProductPreview).inventory > 0
                                ? 'text-green-400 bg-green-900/20'
                                : 'text-red-400 bg-red-900/20'
                                }`}>
                                {(item as ProductPreview).inventory > 0
                                    ? `In Stock (${(item as ProductPreview).inventory} available)`
                                    : 'Out of Stock'
                                }
                            </span>
                        </div>
                    )}
                </div>

                {/* Metadata */}
                <div className="flex flex-wrap gap-4 py-3 border-y border-[var(--ock-border)]">
                    {isStore ? (
                        <>
                            {(item as StorePreview).rating && (
                                <div className="flex items-center space-x-1">
                                    <StarIcon className="w-4 h-4 text-yellow-500" />
                                    <span className="text-sm font-medium text-white">{(item as StorePreview).rating}</span>
                                    <span className="text-sm text-gray-400">
                                        ({(item as StorePreview).reviews} reviews)
                                    </span>
                                </div>
                            )}
                            <div className="flex items-center space-x-1">
                                <LocationIcon className="w-4 h-4 text-gray-400" />
                                <span className="text-sm text-gray-400">
                                    {(item as StorePreview).location}
                                </span>
                            </div>
                        </>
                    ) : (
                        <>
                            {(item as ProductPreview).averageRating && (
                                <div className="flex items-center space-x-1">
                                    <StarIcon className="w-4 h-4 text-yellow-500" />
                                    <span className="text-sm font-medium text-white">{(item as ProductPreview).averageRating}</span>
                                    <span className="text-sm text-gray-400">
                                        ({(item as ProductPreview).totalRatings} ratings)
                                    </span>
                                </div>
                            )}
                            <span className="text-sm bg-[var(--ock-bg-alternate)] text-gray-300 px-2 py-1 rounded">
                                {(item as ProductPreview).category?.name}
                            </span>
                        </>
                    )}
                </div>

                {/* Product-specific details */}
                {!isStore && item.type === 'product' && (
                    <div className="space-y-4">
                        {/* Features */}
                        {(item as ProductPreview).features && (
                            <div>
                                <h3 className="font-semibold text-white mb-2">Features</h3>
                                <div className="text-sm text-gray-300 whitespace-pre-line">
                                    {(item as ProductPreview).features}
                                </div>
                            </div>
                        )}

                        {/* Tags */}
                        {(item as ProductPreview).tags && (item as ProductPreview).tags.length > 0 && (
                            <div>
                                <h3 className="font-semibold text-white mb-2">Tags</h3>
                                <div className="flex flex-wrap gap-2">
                                    {(item as ProductPreview).tags.map((tag) => (
                                        <span
                                            key={tag.id}
                                            className="text-sm bg-[var(--ock-bg-alternate)] text-gray-300 px-3 py-1 rounded-full"
                                        >
                                            {tag.name}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    )
} 