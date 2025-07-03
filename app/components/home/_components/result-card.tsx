import React from 'react'
import { useRouter } from 'next/navigation'
import { useAccount } from 'wagmi'
import {
    StoreIcon,
    PackageIcon,
    CategoryIcon,
    VerifiedIcon,
    StarIcon,
    HeartIcon,
    LocationIcon
} from './icons'
import { useWishlist, useWishlistIds } from './wishlist-hooks'
import type { SearchResult } from './types'

interface ResultCardProps {
    result: SearchResult
}

export function ResultCard({ result }: ResultCardProps) {
    const router = useRouter()
    const { address } = useAccount()
    const { addToWishlist, removeFromWishlist, isAdding, isRemoving } = useWishlist(address)
    const { isInWishlist } = useWishlistIds()

    const isProduct = result.type === 'product'
    const isStore = result.type === 'store'
    const isCategory = result.type === 'category'

    // Only check wishlist for products and stores using the global wishlist IDs
    const inWishlist = (isProduct || isStore) ? isInWishlist(result.id, result.type as 'product' | 'store') : false

    const handleClick = () => {
        router.push(`/preview/${result.type}/${result.id}`)
    }

    const handleWishlistToggle = async (e: React.MouseEvent) => {
        e.stopPropagation() // Prevent navigation when clicking heart

        // Only handle wishlist for products and stores
        if (!isProduct && !isStore) return

        try {
            if (inWishlist) {
                await removeFromWishlist(result.id, result.type as 'product' | 'store')
            } else {
                await addToWishlist(result as any, result.type as 'product' | 'store')
            }
        } catch (error) {
            console.error('Error toggling wishlist:', error)
        }
    }

    return (
        <div
            onClick={handleClick}
            className="bg-[var(--ock-bg-default)] border border-[var(--ock-border)] rounded-xl p-4 hover:border-[var(--ock-accent)] transition-colors cursor-pointer relative"
        >
            {/* Wishlist button - only for products and stores */}
            {(isProduct || isStore) && (
                <button
                    onClick={handleWishlistToggle}
                    disabled={isAdding || isRemoving}
                    className={`absolute top-2 right-2 w-8 h-8 rounded-full flex items-center justify-center transition-colors z-10 ${inWishlist
                        ? 'bg-red-500 text-white hover:bg-red-600'
                        : 'bg-white/80 text-gray-400 hover:bg-red-50 hover:text-red-500 border border-gray-200'
                        }`}
                    title={inWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
                >
                    <HeartIcon size="sm" className="w-4 h-4" />
                </button>
            )}

            <div className="flex items-start space-x-3">
                {/* Image/Icon */}
                <div className="w-12 h-12 bg-[var(--ock-bg-alternate)] rounded-lg overflow-hidden flex-shrink-0">
                    {result.image ? (
                        <img
                            src={result.image}
                            alt={result.name}
                            className="w-full h-full object-cover"
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center">
                            {isProduct && <PackageIcon className="w-6 h-6 text-[var(--ock-text-foreground-muted)]" />}
                            {isStore && <StoreIcon className="w-6 h-6 text-[var(--ock-text-foreground-muted)]" />}
                            {isCategory && <CategoryIcon className="w-6 h-6 text-[var(--ock-text-foreground-muted)]" />}
                        </div>
                    )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0 pr-6"> {/* Added pr-6 to make room for wishlist button */}
                    {/* Header */}
                    <div className="flex items-start justify-between mb-1">
                        <h3 className="font-semibold text-[var(--ock-text-foreground)] truncate text-sm">
                            {result.name}
                        </h3>
                        {isStore && result.verified && (
                            <VerifiedIcon size="sm" className="text-blue-500 flex-shrink-0 ml-2" />
                        )}
                    </div>

                    {/* Description */}
                    <p className="text-xs text-[var(--ock-text-foreground-muted)] line-clamp-2 mb-2">
                        {result.description}
                    </p>

                    {/* Type-specific content */}
                    <div className="space-y-1">
                        {/* Product details */}
                        {isProduct && (
                            <>
                                <div className="flex items-center justify-between">
                                    <span className="font-bold text-[var(--ock-text-foreground)] text-sm">
                                        {result.price}
                                    </span>
                                </div>
                            </>
                        )}

                        {/* Store details */}
                        {isStore && result.rating !== undefined && (
                            <div className="flex items-center space-x-1 text-xs">
                                <StarIcon size="sm" className="text-yellow-500" />
                                <span className="font-medium text-[var(--ock-text-foreground)]">
                                    {result.rating}
                                </span>
                                {result.reviews && (
                                    <span className="text-[var(--ock-text-foreground-muted)]">
                                        ({result.reviews})
                                    </span>
                                )}
                            </div>
                        )}

                        {/* Location for products and stores */}
                        {(isStore) && (
                            <div className="flex items-center space-x-1 text-xs text-[var(--ock-text-foreground-muted)]">
                                <LocationIcon size="sm" />
                                <span>{result.location}</span>
                            </div>
                        )}

                        {/* Category name for products */}
                        {isProduct && result.categoryName && (
                            <span className="inline-block text-xs bg-[var(--ock-bg-alternate)] text-[var(--ock-text-foreground-muted)] px-2 py-1 rounded">
                                {result.categoryName}
                            </span>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}

export function ResultTypeIndicator({ type }: { type: 'product' | 'store' | 'category' }) {
    const config = {
        product: {
            icon: PackageIcon,
            label: 'Product',
            color: 'text-green-600',
            bg: 'bg-green-50'
        },
        store: {
            icon: StoreIcon,
            label: 'Store',
            color: 'text-blue-600',
            bg: 'bg-blue-50'
        },
        category: {
            icon: CategoryIcon,
            label: 'Category',
            color: 'text-purple-600',
            bg: 'bg-purple-50'
        }
    }

    const { icon: Icon, label, color, bg } = config[type]

    return (
        <div className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${bg} ${color}`}>
            <Icon size="sm" />
            <span>{label}</span>
        </div>
    )
} 