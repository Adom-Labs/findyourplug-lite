"use client";

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { useWishlist } from '../../../components/home/_components/wishlist-hooks'
import { StoreIcon, PackageIcon, StarIcon, LocationIcon, VerifiedIcon, HeartIcon, ShareIcon, ArrowLeftIcon } from '../../../components/home/_components/icons'

// Types for preview items
interface StorePreview {
    id: number
    name: string
    description: string
    rating: number
    reviews: number
    location: string
    image: string
    url: string
    verified: boolean
    type: 'store'
    address: string
    phone: string
    email: string
    hours: string
    categories: string[]
    productCount: number
    followers: number
    about: string
}

interface ProductPreview {
    id: number
    name: string
    description: string
    price: string
    storeName: string
    storeUrl: string
    image: string
    location: string
    type: 'product'
    categoryName: string
    sku: string
    brand: string
    inStock: boolean
    stockCount: number
    specifications: string[]
    images: string[]
}

type PreviewItem = StorePreview | ProductPreview

// Mock API functions - replace with real API calls
const fetchStoreDetails = async (id: number): Promise<StorePreview> => {
    // Mock store data - replace with actual API call
    return {
        id,
        name: "Tech Hub Store",
        description: "Premium electronics and tech accessories with cutting-edge innovation and quality.",
        rating: 4.8,
        reviews: 245,
        location: "San Francisco, CA",
        image: "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400&h=300&fit=crop",
        url: "tech-hub-store",
        verified: true,
        type: 'store',
        // Additional store details
        address: "123 Tech Street, San Francisco, CA 94103",
        phone: "+1 (555) 123-4567",
        email: "contact@techhubstore.com",
        hours: "Mon-Fri: 9AM-8PM, Sat-Sun: 10AM-6PM",
        categories: ["Electronics", "Tech Accessories", "Gadgets"],
        productCount: 156,
        followers: 1200,
        about: "Tech Hub Store has been serving the San Francisco community for over 10 years, providing the latest in technology and electronics. We pride ourselves on expert knowledge, competitive prices, and excellent customer service."
    }
}

const fetchProductDetails = async (id: number): Promise<ProductPreview> => {
    // Mock product data - replace with actual API call
    return {
        id,
        name: "Premium Wireless Headphones",
        description: "High-quality wireless headphones with noise cancellation and premium sound quality.",
        price: "$299.99",
        storeName: "Tech Hub Store",
        storeUrl: "tech-hub-store",
        image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=300&fit=crop",
        location: "San Francisco, CA",
        type: 'product',
        categoryName: "Electronics",
        // Additional product details
        sku: "WH-1000XM4",
        brand: "Sony",
        inStock: true,
        stockCount: 15,
        specifications: [
            "Active Noise Cancellation",
            "30-hour battery life",
            "Quick charge: 10 min = 5 hours",
            "Bluetooth 5.0",
            "Touch controls"
        ],
        images: [
            "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=300&fit=crop",
            "https://images.unsplash.com/photo-1484704849700-f032a568e944?w=400&h=300&fit=crop",
            "https://images.unsplash.com/photo-1583394838336-acd977736f90?w=400&h=300&fit=crop"
        ]
    }
}

export default function PreviewPage() {
    const params = useParams()
    const router = useRouter()
    const [currentImageIndex, setCurrentImageIndex] = useState(0)

    const type = params.type as 'store' | 'product'
    const id = parseInt(params.id as string)
    const { isInWishlist, addToWishlist, removeFromWishlist, isAdding, isRemoving } = useWishlist()

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
                await addToWishlist(item, item.type)
            }
        } catch (error) {
            console.error('Error toggling wishlist:', error)
        }
    }

    if (isLoading) {
        return (
            <div className="space-y-4">
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
            <div className="text-center py-12 space-y-4">
                <div className="w-20 h-20 mx-auto bg-[var(--ock-bg-alternate)] rounded-full flex items-center justify-center">
                    <PackageIcon className="w-10 h-10 text-[var(--ock-text-foreground-muted)]" />
                </div>
                <div className="space-y-2">
                    <h3 className="text-lg font-medium text-[var(--ock-text-foreground)]">
                        Item not found
                    </h3>
                    <p className="text-sm text-[var(--ock-text-foreground-muted)]">
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
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <button
                    onClick={() => router.back()}
                    className="flex items-center space-x-2 text-[var(--ock-text-foreground-muted)] hover:text-[var(--ock-text-foreground)] transition-colors"
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
                            : 'bg-[var(--ock-bg-alternate)] text-[var(--ock-text-foreground-muted)] hover:bg-red-50 hover:text-red-500'
                            }`}
                        title={inWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
                    >
                        <HeartIcon className="w-5 h-5" />
                    </button>

                    <button
                        className="p-2 bg-[var(--ock-bg-alternate)] text-[var(--ock-text-foreground-muted)] rounded-full hover:bg-[var(--ock-bg-default)] transition-colors"
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
                        src={isStore ? item.image : (item.type === 'product' ? (item.images?.[currentImageIndex] || item.image) : item.image)}
                        alt={item.name}
                        className="w-full h-full object-cover"
                    />
                </div>

                {!isStore && item.type === 'product' && item.images && item.images.length > 1 && (
                    <div className="flex space-x-2 overflow-x-auto pb-2">
                        {item.images.map((img: string, index: number) => (
                            <button
                                key={index}
                                onClick={() => setCurrentImageIndex(index)}
                                className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-colors ${currentImageIndex === index
                                    ? 'border-[var(--ock-accent)]'
                                    : 'border-transparent'
                                    }`}
                            >
                                <img src={img} alt={`${item.name} ${index + 1}`} className="w-full h-full object-cover" />
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
                        <h1 className="text-xl font-bold text-[var(--ock-text-foreground)]">
                            {item.name}
                        </h1>
                        {isStore && item.type === 'store' && item.verified && (
                            <VerifiedIcon className="w-6 h-6 text-blue-500 flex-shrink-0" />
                        )}
                    </div>

                    <p className="text-[var(--ock-text-foreground-muted)]">
                        {item.description}
                    </p>

                    {/* Price for products */}
                    {!isStore && item.type === 'product' && (
                        <div className="flex items-center justify-between">
                            <span className="text-2xl font-bold text-[var(--ock-text-foreground)]">
                                {item.price}
                            </span>
                            {item.inStock ? (
                                <span className="text-sm text-green-600 bg-green-50 px-2 py-1 rounded">
                                    In Stock ({item.stockCount} available)
                                </span>
                            ) : (
                                <span className="text-sm text-red-600 bg-red-50 px-2 py-1 rounded">
                                    Out of Stock
                                </span>
                            )}
                        </div>
                    )}
                </div>

                {/* Metadata */}
                <div className="flex flex-wrap gap-4 py-3 border-y border-[var(--ock-border)]">
                    {isStore ? (
                        <>
                            <div className="flex items-center space-x-1">
                                <StarIcon className="w-4 h-4 text-yellow-500" />
                                <span className="text-sm font-medium">{(item as StorePreview).rating}</span>
                                <span className="text-sm text-[var(--ock-text-foreground-muted)]">
                                    ({(item as StorePreview).reviews} reviews)
                                </span>
                            </div>
                            <div className="flex items-center space-x-1">
                                <LocationIcon className="w-4 h-4 text-[var(--ock-text-foreground-muted)]" />
                                <span className="text-sm text-[var(--ock-text-foreground-muted)]">
                                    {item.location}
                                </span>
                            </div>
                            <div className="flex items-center space-x-1">
                                <PackageIcon className="w-4 h-4 text-[var(--ock-text-foreground-muted)]" />
                                <span className="text-sm text-[var(--ock-text-foreground-muted)]">
                                    {(item as StorePreview).productCount} products
                                </span>
                            </div>
                        </>
                    ) : (
                        <>
                            <div className="flex items-center space-x-1">
                                <StoreIcon className="w-4 h-4 text-[var(--ock-text-foreground-muted)]" />
                                <span className="text-sm text-[var(--ock-text-foreground-muted)]">
                                    {(item as ProductPreview).storeName}
                                </span>
                            </div>
                            <div className="flex items-center space-x-1">
                                <LocationIcon className="w-4 h-4 text-[var(--ock-text-foreground-muted)]" />
                                <span className="text-sm text-[var(--ock-text-foreground-muted)]">
                                    {(item as ProductPreview).location}
                                </span>
                            </div>
                            {(item as ProductPreview).categoryName && (
                                <span className="text-sm bg-[var(--ock-bg-alternate)] text-[var(--ock-text-foreground-muted)] px-2 py-1 rounded">
                                    {(item as ProductPreview).categoryName}
                                </span>
                            )}
                        </>
                    )}
                </div>

                {/* Store-specific details */}
                {isStore && (
                    <div className="space-y-4">
                        <div>
                            <h3 className="font-semibold text-[var(--ock-text-foreground)] mb-2">About</h3>
                            <p className="text-sm text-[var(--ock-text-foreground-muted)]">
                                {(item as StorePreview).about}
                            </p>
                        </div>

                        <div>
                            <h3 className="font-semibold text-[var(--ock-text-foreground)] mb-2">Categories</h3>
                            <div className="flex flex-wrap gap-2">
                                {(item as StorePreview).categories.map((category: string, index: number) => (
                                    <span
                                        key={index}
                                        className="text-sm bg-[var(--ock-bg-alternate)] text-[var(--ock-text-foreground-muted)] px-3 py-1 rounded-full"
                                    >
                                        {category}
                                    </span>
                                ))}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 gap-3 text-sm">
                            <div>
                                <span className="font-medium text-[var(--ock-text-foreground)]">Address: </span>
                                <span className="text-[var(--ock-text-foreground-muted)]">{(item as StorePreview).address}</span>
                            </div>
                            <div>
                                <span className="font-medium text-[var(--ock-text-foreground)]">Hours: </span>
                                <span className="text-[var(--ock-text-foreground-muted)]">{(item as StorePreview).hours}</span>
                            </div>
                            <div>
                                <span className="font-medium text-[var(--ock-text-foreground)]">Phone: </span>
                                <span className="text-[var(--ock-text-foreground-muted)]">{(item as StorePreview).phone}</span>
                            </div>
                        </div>
                    </div>
                )}

                {/* Product-specific details */}
                {!isStore && item.type === 'product' && (
                    <div className="space-y-4">
                        <div>
                            <h3 className="font-semibold text-[var(--ock-text-foreground)] mb-2">Specifications</h3>
                            <ul className="space-y-2">
                                {item.specifications.map((spec, index) => (
                                    <li key={index} className="flex items-center space-x-2 text-sm">
                                        <div className="w-1.5 h-1.5 bg-[var(--ock-accent)] rounded-full flex-shrink-0"></div>
                                        <span className="text-[var(--ock-text-foreground-muted)]">{spec}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div className="grid grid-cols-2 gap-3 text-sm">
                            <div>
                                <span className="font-medium text-[var(--ock-text-foreground)]">Brand: </span>
                                <span className="text-[var(--ock-text-foreground-muted)]">{item.brand}</span>
                            </div>
                            <div>
                                <span className="font-medium text-[var(--ock-text-foreground)]">SKU: </span>
                                <span className="text-[var(--ock-text-foreground-muted)]">{item.sku}</span>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
} 