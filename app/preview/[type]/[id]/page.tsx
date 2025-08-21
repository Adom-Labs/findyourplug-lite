"use client";

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { useAccount } from 'wagmi'
import { useWishlist, useWishlistIds } from '../../../components/home/_components/wishlist-hooks'
import { PackageIcon, StarIcon, LocationIcon, VerifiedIcon, HeartIcon, ShareIcon, ArrowLeftIcon, ShoppingCartIcon, PlusIcon, MinusIcon } from '../../../components/home/_components/icons'
import { DIGEMART_API_BASE } from '../../../components/home/_components/api'
import type { DisplayProduct, DisplayStore } from '../../../components/home/_components/types'
import { Logo } from '../../../components/Logo'
import { useCart } from '../../../components/home/_components/cart-hooks'

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
    email?: string
    phone?: string
    storeTimeOpen?: string
    storeTimeClose?: string
    storeWeekOpen?: string
    storeWeekClose?: string
    storeHeroHeadline?: string
    storeHeroTagline?: string
    storeHeroImage?: string
    storeCoverPhoto?: string | null
    views?: number
    likes?: number
    lastActive?: string
    ratingBreakdown?: Record<string, number>
    socialLinks?: Record<string, string>
    products?: Array<{ id: number; name: string; price?: number; images?: Array<{ url: string }> }>
    _count?: { products?: number; orders?: number }
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
            email: store.email || undefined,
            phone: store.phone || undefined,
            storeTimeOpen: store.storeTimeOpen || undefined,
            storeTimeClose: store.storeTimeClose || undefined,
            storeWeekOpen: store.storeWeekOpen || undefined,
            storeWeekClose: store.storeWeekClose || undefined,
            storeHeroHeadline: store.storeHeroHeadline || undefined,
            storeHeroTagline: store.storeHeroTagline || undefined,
            storeHeroImage: store.storeHeroImage || undefined,
            storeCoverPhoto: store.storeCoverPhoto || null,
            views: store.views || 0,
            likes: store.likes || 0,
            lastActive: store.lastActive || undefined,
            ratingBreakdown: store.ratingBreakdown || undefined,
            socialLinks: store.socialLinks || undefined,
            products: Array.isArray(store.products) ? store.products : undefined,
            _count: store._count || undefined,
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
    const { addItem, isAdding: isAddingToCart } = useCart(address)
    const [quantity, setQuantity] = useState(1)

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
                const wishlistItem: DisplayStore | DisplayProduct = item.type === 'store'
                    ? {
                        id: item.id,
                        name: item.name,
                        description: item.description,
                        image: item.image,
                        location: item.location,
                        url: (item as StorePreview).url || '',
                        type: 'store',
                        rating: (item as StorePreview).rating,
                        reviews: (item as StorePreview).reviews,
                        verified: (item as StorePreview).verified
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
                        type: 'product',
                        categoryName: (item as ProductPreview).category?.name || ''
                    }
                await addToWishlist(wishlistItem, item.type)
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
                    <h3 className="text-lg font-medium text-[var(--ock-text-foreground)]">
                        Item not found
                    </h3>
                    <p className="text-sm text-[var(--ock-text-foreground)]">
                        The {type} you&apos;re looking for doesn&apos;t exist or has been removed.
                    </p>
                </div>
                <button
                    onClick={() => router.back()}
                    className="inline-flex items-center space-x-2 px-4 py-2 bg-[var(--ock-accent)] text-[var(--ock-bg-default)] rounded-lg hover:bg-[var(--ock-accent)]/90 transition-colors"
                >
                    <ArrowLeftIcon className="w-4 h-4" />
                    <span>Go Back</span>
                </button>
            </div>
        )
    }

    const isStore = type === 'store'

    const StoreHero = ({ store }: { store: StorePreview }) => {
        const heroImg = store.storeHeroImage || store.storeCoverPhoto || store.image
        if (!heroImg && !store.storeHeroHeadline && !store.storeHeroTagline) return null
        return (
            <div className="space-y-2">
                {heroImg && (
                    <div className="aspect-video bg-[var(--ock-bg-alternate)] rounded-xl overflow-hidden">
                        <img src={heroImg} alt={`${store.name} hero`} className="w-full h-full object-cover" />
                    </div>
                )}
                {(store.storeHeroHeadline || store.storeHeroTagline) && (
                    <div>
                        {store.storeHeroHeadline && (
                            <h2 className="text-lg font-semibold text-[var(--ock-text-foreground)]">{store.storeHeroHeadline}</h2>
                        )}
                        {store.storeHeroTagline && (
                            <p className="text-sm text-[var(--ock-text-foreground-muted)]">{store.storeHeroTagline}</p>
                        )}
                    </div>
                )}
            </div>
        )
    }

    const InfoRow = ({ label, value }: { label: string; value?: string }) => {
        if (!value) return null
        return (
            <div className="flex items-center justify-between text-sm">
                <span className="text-[var(--ock-text-foreground-muted)]">{label}</span>
                <span className="text-[var(--ock-text-foreground)] font-medium">{value}</span>
            </div>
        )
    }

    const BusinessHours = ({ store }: { store: StorePreview }) => {
        const hasHours = store.storeTimeOpen && store.storeTimeClose
        const hasWeek = store.storeWeekOpen && store.storeWeekClose
        if (!hasHours && !hasWeek) return null
        const hours = hasHours ? `${store.storeTimeOpen} - ${store.storeTimeClose}` : undefined
        const days = hasWeek ? `${store.storeWeekOpen} - ${store.storeWeekClose}` : undefined
        return (
            <div className="space-y-2">
                <h3 className="font-semibold text-[var(--ock-text-foreground)]">Business Hours</h3>
                <div className="space-y-1">
                    <InfoRow label="Hours" value={hours} />
                    <InfoRow label="Days" value={days} />
                </div>
            </div>
        )
    }

    const ContactInfo = ({ store }: { store: StorePreview }) => {
        if (!store.email && !store.phone) return null
        return (
            <div className="space-y-2">
                <h3 className="font-semibold text-[var(--ock-text-foreground)]">Contact</h3>
                <div className="space-y-1">
                    <InfoRow label="Email" value={store.email} />
                    <InfoRow label="Phone" value={store.phone} />
                </div>
            </div>
        )
    }

    const StoreStats = ({ store }: { store: StorePreview }) => {
        const items: Array<{ label: string; value: string | number | undefined }> = [
            { label: 'Views', value: store.views },
            { label: 'Likes', value: store.likes },
            { label: 'Products', value: store._count?.products ?? store.products?.length },
        ]
        const display = items.filter(i => i.value !== undefined && i.value !== null)
        if (display.length === 0) return null
        return (
            <div className="grid grid-cols-3 gap-2">
                {display.map((it) => (
                    <div key={it.label} className="text-center p-2 rounded-md bg-[var(--ock-bg-alternate)]">
                        <div className="text-xs text-[var(--ock-text-foreground-muted)]">{it.label}</div>
                        <div className="text-sm font-semibold text-[var(--ock-text-foreground)]">{it.value}</div>
                    </div>
                ))}
            </div>
        )
    }

    const ProductMiniList = ({ products }: { products?: StorePreview['products'] }) => {
        if (!products || products.length === 0) return null
        const shown = products.slice(0, 3)
        return (
            <div className="space-y-2">
                <h3 className="font-semibold text-[var(--ock-text-foreground)]">Featured Products</h3>
                <div className="space-y-2">
                    {shown.map(p => (
                        <div
                            key={p.id}
                            className="flex items-center space-x-3 cursor-pointer"
                            onClick={() => router.push(`/preview/product/${p.id}`)}
                        >
                            <div className="w-12 h-12 rounded-md overflow-hidden bg-[var(--ock-bg-alternate)]">
                                {p.images && p.images[0]?.url ? (
                                    <img src={p.images[0].url} alt={p.name} className="w-full h-full object-cover" />
                                ) : null}
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="text-sm font-medium text-[var(--ock-text-foreground)] truncate">{p.name}</div>
                                {typeof p.price === 'number' && (
                                    <div className="text-xs text-[var(--ock-text-foreground-muted)]">${p.price.toFixed(2)}</div>
                                )}
                            </div>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation()
                                    const productLike: DisplayProduct = {
                                        id: p.id,
                                        name: p.name,
                                        description: '',
                                        image: p.images?.[0]?.url || '',
                                        location: '',
                                        price: typeof p.price === 'number' ? `$${p.price}` : '$0',
                                        storeName: '',
                                        storeUrl: '',
                                        type: 'product',
                                    }
                                    addItem(productLike, 1)
                                }}
                                className="px-2 py-1 text-xs rounded-md bg-[var(--ock-accent)] text-[var(--ock-bg-default)]"
                                aria-label={`Add ${p.name} to cart`}
                            >
                                Add
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-6 w-full max-w-md mx-auto px-4 py-3">
            {/* Header */}
            <div className="flex items-center justify-between">
                <button
                    onClick={() => router.back()}
                    className="flex items-center space-x-2 text-[var(--ock-text-foreground-muted)] hover:text-[var(--ock-text-foreground)] transition-colors"
                >
                    <ArrowLeftIcon className="w-5 h-5" />
                    <span className="text-sm">Back</span>
                </button>

                <Logo className="h-7" />

                <div className="flex items-center space-x-2">
                    <button
                        onClick={handleWishlistToggle}
                        disabled={isAdding || isRemoving}
                        className={`p-2 rounded-full transition-colors ${inWishlist
                            ? 'bg-red-500 text-[var(--ock-bg-default)]'
                            : 'bg-[var(--ock-bg-alternate)] text-gray-400 hover:bg-red-50 hover:text-red-500'
                            }`}
                        title={inWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
                    >
                        <HeartIcon className="w-5 h-5" />
                    </button>

                    <button
                        className="p-2 bg-[var(--ock-bg-alternate)] text-gray-400 rounded-full hover:bg-[var(--ock-bg-default)] hover:text-[var(--ock-text-foreground-muted)] transition-colors"
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
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <span className="text-2xl font-bold text-[var(--ock-text-foreground)]">
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
                            <div className="flex items-center justify-between gap-3">
                                <div className="inline-flex items-center bg-[var(--ock-bg-alternate)] rounded-md">
                                    <button
                                        onClick={() => setQuantity(q => Math.max(1, q - 1))}
                                        className="p-2 text-[var(--ock-text-foreground)] disabled:opacity-50"
                                        disabled={quantity <= 1}
                                        aria-label="Decrease quantity"
                                    >
                                        <MinusIcon />
                                    </button>
                                    <span className="px-3 text-sm font-medium">{quantity}</span>
                                    <button
                                        onClick={() => setQuantity(q => q + 1)}
                                        className="p-2 text-[var(--ock-text-foreground)]"
                                        aria-label="Increase quantity"
                                    >
                                        <PlusIcon />
                                    </button>
                                </div>
                                <button
                                    onClick={() => {
                                        try {
                                            if ((item as ProductPreview).inventory <= 0) return
                                            const productLike: DisplayProduct = {
                                                id: item.id,
                                                name: item.name,
                                                description: item.description,
                                                image: (item as ProductPreview).images?.[0]?.url || '',
                                                location: '',
                                                price: `$${(item as ProductPreview).price}`,
                                                storeName: '',
                                                storeUrl: '',
                                                type: 'product',
                                            }
                                            addItem(productLike, quantity)
                                        } catch (err) {
                                            console.error('Error adding to cart', err)
                                        }
                                    }}
                                    disabled={(item as ProductPreview).inventory <= 0 || isAddingToCart}
                                    className="flex-1 inline-flex items-center justify-center space-x-2 px-4 py-3 rounded-lg bg-[var(--ock-accent)] text-[var(--ock-bg-default)] disabled:opacity-60"
                                >
                                    <ShoppingCartIcon />
                                    <span>Add to Cart</span>
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Store hero and info sections for stores */}
                {isStore && item.type === 'store' && (
                    <div className="space-y-4">
                        <StoreHero store={item as StorePreview} />
                        <StoreStats store={item as StorePreview} />
                        <BusinessHours store={item as StorePreview} />
                        <ContactInfo store={item as StorePreview} />
                        <ProductMiniList products={(item as StorePreview).products} />
                    </div>
                )}

                {/* Metadata */}
                <div className="flex flex-wrap gap-4 py-3 border-y border-[var(--ock-border)]">
                    {isStore ? (
                        <>
                            {Number.isFinite(Number((item as StorePreview).rating)) && (
                                <div className="flex items-center space-x-1">
                                    <StarIcon className="w-4 h-4 text-yellow-500" />
                                    <span className="text-sm font-medium text-[var(--ock-text-foreground)]">{Number((item as StorePreview).rating).toFixed(1)}</span>
                                    {typeof (item as StorePreview).reviews === 'number' && (
                                        <span className="text-sm text-gray-600">
                                            ({(item as StorePreview).reviews} reviews)
                                        </span>
                                    )}
                                </div>
                            )}
                            <div className="flex items-center space-x-1">
                                <LocationIcon className="w-4 h-4 text-gray-600" />
                                <span className="text-sm text-gray-600">
                                    {(item as StorePreview).location}
                                </span>
                            </div>
                        </>
                    ) : (
                        <>
                            {Number.isFinite(Number((item as ProductPreview).averageRating)) && (
                                <div className="flex items-center space-x-1">
                                    <StarIcon className="w-4 h-4 text-yellow-500" />
                                    <span className="text-sm font-medium text-[var(--ock-text-foreground)]">{Number((item as ProductPreview).averageRating).toFixed(1)}</span>
                                    {typeof (item as ProductPreview).totalRatings === 'number' && (
                                        <span className="text-sm text-gray-400">
                                            ({(item as ProductPreview).totalRatings} ratings)
                                        </span>
                                    )}
                                </div>
                            )}
                            <span className="text-sm bg-[var(--ock-bg-alternate)] text-[var(--ock-text-foreground-muted)] px-2 py-1 rounded">
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
                                <h3 className="font-semibold text-[var(--ock-text-foreground)] mb-2">Features</h3>
                                <div className="text-sm text-[var(--ock-text-foreground-muted)] whitespace-pre-line">
                                    {(item as ProductPreview).features}
                                </div>
                            </div>
                        )}

                        {/* Tags */}
                        {(item as ProductPreview).tags && (item as ProductPreview).tags.length > 0 && (
                            <div>
                                <h3 className="font-semibold text-[var(--ock-text-foreground)] mb-2">Tags</h3>
                                <div className="flex flex-wrap gap-2">
                                    {(item as ProductPreview).tags.map((tag) => (
                                        <span
                                            key={tag.id}
                                            className="text-sm bg-[var(--ock-bg-alternate)] text-[var(--ock-text-foreground-muted)] px-3 py-1 rounded-full"
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