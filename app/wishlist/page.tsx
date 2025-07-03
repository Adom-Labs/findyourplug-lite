"use client";

import { useState } from 'react'
import { useAccount } from 'wagmi'
import { ResultCard } from '../components/home/_components/result-card'
import { useWishlist } from '../components/home/_components/wishlist-hooks'
import { StoreIcon, PackageIcon, WalletIcon } from '../components/home/_components/icons'
import { ConnectWallet } from '@coinbase/onchainkit/wallet'
import { SearchResult } from '../components/home/_components/types'

export default function WishlistPage() {
    const [activeTab, setActiveTab] = useState<'products' | 'stores'>('products')
    const { address, isConnected } = useAccount()
    const { wishlistItems, removeFromWishlist, isLoading, error } = useWishlist(address)

    // Filter items by type
    const products = wishlistItems.filter(item => item.type === 'product')
    const stores = wishlistItems.filter(item => item.type === 'store')

    const currentItems = activeTab === 'products' ? products : stores

    // If wallet not connected, show connect prompt
    if (!isConnected) {
        return (
            <div className="space-y-4">
                {/* Header */}
                <div className="text-center space-y-2">
                    <h1 className="text-xl font-bold text-[var(--ock-text-foreground)]">
                        My Wishlist
                    </h1>
                    <p className="text-sm text-[var(--ock-text-foreground-muted)]">
                        Connect your wallet to access your saved items
                    </p>
                </div>

                {/* Wallet Connect Prompt */}
                <div className="text-center py-12 space-y-4">
                    <div className="w-20 h-20 mx-auto bg-[var(--ock-bg-alternate)] rounded-full flex items-center justify-center">
                        <WalletIcon className="w-10 h-10 text-[var(--ock-text-foreground-muted)]" />
                    </div>
                    <div className="space-y-2">
                        <h3 className="text-lg font-medium text-[var(--ock-text-foreground)]">
                            Wallet Required
                        </h3>
                        <p className="text-sm text-[var(--ock-text-foreground-muted)] max-w-sm mx-auto">
                            Please connect your wallet to save and access your wishlist across devices
                        </p>
                    </div>
                    <ConnectWallet className="mx-auto">
                        <div className="inline-flex items-center space-x-2 px-4 py-2 bg-[var(--ock-accent)] text-white rounded-lg hover:bg-[var(--ock-accent)]/90 transition-colors">
                            <WalletIcon className="w-4 h-4" />
                            <span>Connect Wallet</span>
                        </div>
                    </ConnectWallet>
                </div>
            </div>
        )
    }

    // If there's an error loading wishlist
    if (error) {
        return (
            <div className="space-y-4">
                <div className="text-center space-y-2">
                    <h1 className="text-xl font-bold text-[var(--ock-text-foreground)]">
                        My Wishlist
                    </h1>
                </div>
                <div className="text-center py-12 space-y-4">
                    <div className="w-20 h-20 mx-auto bg-red-50 rounded-full flex items-center justify-center">
                        <PackageIcon className="w-10 h-10 text-red-500" />
                    </div>
                    <div className="space-y-2">
                        <h3 className="text-lg font-medium text-[var(--ock-text-foreground)]">
                            Unable to load wishlist
                        </h3>
                        <p className="text-sm text-[var(--ock-text-foreground-muted)] max-w-sm mx-auto">
                            There was an error loading your wishlist. Please try again.
                        </p>
                    </div>
                    <button
                        onClick={() => window.location.reload()}
                        className="inline-flex items-center space-x-2 px-4 py-2 bg-[var(--ock-accent)] text-white rounded-lg hover:bg-[var(--ock-accent)]/90 transition-colors"
                    >
                        <span>Try Again</span>
                    </button>
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-4">
            {/* Header */}
            <div className="text-center space-y-2">
                <h1 className="text-xl font-bold text-[var(--ock-text-foreground)]">
                    My Wishlist
                </h1>
                <p className="text-sm text-[var(--ock-text-foreground-muted)]">
                    Your saved products and stores
                </p>
            </div>

            {/* Tab Navigation */}
            <div className="flex space-x-1 bg-[var(--ock-bg-alternate)] rounded-lg p-1">
                <button
                    onClick={() => setActiveTab('products')}
                    className={`flex-1 flex items-center justify-center space-x-2 py-2 px-4 rounded-md text-sm font-medium transition-colors ${activeTab === 'products'
                        ? 'bg-[var(--ock-bg-default)] text-[var(--ock-text-foreground)] shadow-sm'
                        : 'text-[var(--ock-text-foreground-muted)] hover:text-[var(--ock-text-foreground)]'
                        }`}
                >
                    <PackageIcon className="w-4 h-4" />
                    <span>Products</span>
                    <span className="bg-[var(--ock-bg-alternate)] text-[var(--ock-text-foreground-muted)] text-xs px-2 py-1 rounded-full">
                        {products.length}
                    </span>
                </button>

                <button
                    onClick={() => setActiveTab('stores')}
                    className={`flex-1 flex items-center justify-center space-x-2 py-2 px-4 rounded-md text-sm font-medium transition-colors ${activeTab === 'stores'
                        ? 'bg-[var(--ock-bg-default)] text-[var(--ock-text-foreground)] shadow-sm'
                        : 'text-[var(--ock-text-foreground-muted)] hover:text-[var(--ock-text-foreground)]'
                        }`}
                >
                    <StoreIcon className="w-4 h-4" />
                    <span>Stores</span>
                    <span className="bg-[var(--ock-bg-alternate)] text-[var(--ock-text-foreground-muted)] text-xs px-2 py-1 rounded-full">
                        {stores.length}
                    </span>
                </button>
            </div>

            {/* Content */}
            <div className="space-y-3">
                {/* Section Header */}
                <div className="flex items-center justify-between">
                    <h2 className="text-sm font-semibold text-[var(--ock-text-foreground)]">
                        Saved {activeTab === 'products' ? 'Products' : 'Stores'}
                    </h2>
                    {currentItems.length > 0 && (
                        <span className="text-xs text-[var(--ock-text-foreground-muted)]">
                            {currentItems.length} {currentItems.length === 1 ? 'item' : 'items'}
                        </span>
                    )}
                </div>

                {/* Loading State */}
                {isLoading && (
                    <div className="space-y-3">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="bg-[var(--ock-bg-default)] border border-[var(--ock-border)] rounded-xl p-4">
                                <div className="flex items-start space-x-3">
                                    <div className="w-12 h-12 bg-[var(--ock-bg-alternate)] rounded-lg animate-pulse"></div>
                                    <div className="flex-1 space-y-2">
                                        <div className="h-4 bg-[var(--ock-bg-alternate)] rounded animate-pulse"></div>
                                        <div className="h-3 bg-[var(--ock-bg-alternate)] rounded w-3/4 animate-pulse"></div>
                                        <div className="h-3 bg-[var(--ock-bg-alternate)] rounded w-1/2 animate-pulse"></div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Items List */}
                {!isLoading && currentItems.length > 0 && (
                    <div className="space-y-3">
                        {currentItems.map((item) => (
                            <div key={`${item.type}-${item.id}`} className="relative">
                                <ResultCard result={item as SearchResult} />
                                {/* Remove Button */}
                                <button
                                    onClick={() => removeFromWishlist(item.id, item.type)}
                                    className="absolute top-2 right-2 w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
                                    title="Remove from wishlist"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                        ))}
                    </div>
                )}

                {/* Empty State */}
                {!isLoading && currentItems.length === 0 && (
                    <div className="text-center py-12 space-y-4">
                        <div className="w-20 h-20 mx-auto bg-[var(--ock-bg-alternate)] rounded-full flex items-center justify-center">
                            {activeTab === 'products' ? (
                                <PackageIcon className="w-10 h-10 text-[var(--ock-text-foreground-muted)]" />
                            ) : (
                                <StoreIcon className="w-10 h-10 text-[var(--ock-text-foreground-muted)]" />
                            )}
                        </div>
                        <div className="space-y-2">
                            <h3 className="text-lg font-medium text-[var(--ock-text-foreground)]">
                                No {activeTab} saved yet
                            </h3>
                            <p className="text-sm text-[var(--ock-text-foreground-muted)] max-w-sm mx-auto">
                                Your wishlist is empty. Save your favorite {activeTab} to see them here.
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
} 