"use client";

import { useAccount } from 'wagmi'
import { useCart } from '../components/home/_components/cart-hooks'
import { ResultCard } from '../components/home/_components/result-card'
import { PackageIcon, ShoppingCartIcon, PlusIcon, MinusIcon } from '../components/home/_components/icons'
import { useState } from 'react'
import { toast } from 'sonner'
import type { DisplayProduct } from '../components/home/_components/types'
import { DIGEMART_API_BASE } from '../components/home/_components/api'
import { ShareSheet } from '../components/shared/ShareSheet'

export default function CartPage() {
    const { address, isConnected } = useAccount()
    const { cartItems, updateQuantity, removeItem, clearCart, checkout, getCartTotals, isLoading, error } = useCart(address)
    const [showShare, setShowShare] = useState(false)
    const [shareMode, setShareMode] = useState<'menu' | 'gift' | 'pay'>('menu')
    const [friendEmail, setFriendEmail] = useState('')
    const [isGeneratingLink, setIsGeneratingLink] = useState(false)
    const [payLink, setPayLink] = useState('')
    const [isSavingWishlist, setIsSavingWishlist] = useState(false)

    const { totalItems, totalPrice } = getCartTotals()

    if (isLoading) {
        return (
            <div className="space-y-4">
                <div className="text-center space-y-2">
                    <h1 className="text-xl font-bold text-[var(--ock-text-foreground)]">My Cart</h1>
                    <p className="text-sm text-[var(--ock-text-foreground-muted)]">Loading your cart...</p>
                </div>
                <div className="space-y-3">
                    {[1,2,3].map(i => (
                        <div key={i} className="bg-[var(--ock-bg-default)] border border-[var(--ock-border)] rounded-xl p-4 animate-pulse h-20"></div>
                    ))}
                </div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="space-y-4">
                <div className="text-center space-y-2">
                    <h1 className="text-xl font-bold text-[var(--ock-text-foreground)]">My Cart</h1>
                </div>
                <div className="text-center py-12 space-y-4">
                    <div className="w-20 h-20 mx-auto bg-red-50 rounded-full flex items-center justify-center">
                        <PackageIcon className="w-10 h-10 text-red-500" />
                    </div>
                    <div className="space-y-2">
                        <h3 className="text-lg font-medium text-[var(--ock-text-foreground)]">Unable to load cart</h3>
                        <p className="text-sm text-[var(--ock-text-foreground-muted)] max-w-sm mx-auto">There was an error loading your cart. Please try again.</p>
                    </div>
                    <button
                        onClick={() => window.location.reload()}
                        className="inline-flex items-center space-x-2 px-4 py-2 bg-[var(--ock-accent)] text-[var(--ock-bg-default)] rounded-lg hover:bg-[var(--ock-accent)]/90 transition-colors"
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
                <h1 className="text-xl font-bold text-[var(--ock-text-foreground)]">My Cart</h1>
                <p className="text-sm text-[var(--ock-text-foreground-muted)]">Items you intend to purchase</p>
            </div>

            {/* Items */}
            {cartItems.length > 0 ? (
                <div className="space-y-3">
                    {cartItems.map(item => (
                        <div key={item.id} className="bg-[var(--ock-bg-default)] border border-[var(--ock-border)] rounded-xl p-4">
                            <div className="flex items-start space-x-3">
                                <div className="w-12 h-12 bg-[var(--ock-bg-alternate)] rounded-lg overflow-hidden flex-shrink-0">
                                    {item.image ? (
                                        <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center">
                                            <PackageIcon className="w-6 h-6 text-[var(--ock-text-foreground-muted)]" />
                                        </div>
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-start justify-between">
                                        <h3 className="font-semibold text-[var(--ock-text-foreground)] truncate text-sm">{item.name}</h3>
                                        <button
                                            onClick={() => removeItem(item.id)}
                                            className="text-xs text-red-500 hover:text-red-600"
                                        >
                                            Remove
                                        </button>
                                    </div>
                                    <div className="flex items-center justify-between mt-2">
                                        <span className="font-bold text-[var(--ock-text-foreground)] text-sm">${(item.price * item.quantity).toFixed(2)}</span>
                                        <div className="inline-flex items-center bg-[var(--ock-bg-alternate)] rounded-md">
                                            <button
                                                onClick={() => updateQuantity(item.id, Math.max(0, item.quantity - 1))}
                                                className="p-2 text-[var(--ock-text-foreground)]"
                                                aria-label="Decrease quantity"
                                            >
                                                <MinusIcon />
                                            </button>
                                            <span className="px-3 text-sm font-medium">{item.quantity}</span>
                                            <button
                                                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                                className="p-2 text-[var(--ock-text-foreground)]"
                                                aria-label="Increase quantity"
                                            >
                                                <PlusIcon />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}

                    {/* Summary */}
                    <div className="bg-[var(--ock-bg-default)] border border-[var(--ock-border)] rounded-xl p-4 space-y-3">
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-[var(--ock-text-foreground-muted)]">Total Items</span>
                            <span className="text-sm font-semibold text-[var(--ock-text-foreground)]">{totalItems}</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-[var(--ock-text-foreground-muted)]">Total Price</span>
                            <span className="text-lg font-bold text-[var(--ock-text-foreground)]">${totalPrice.toFixed(2)}</span>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                            <button
                                onClick={() => clearCart()}
                                className="flex-1 py-3 rounded-lg border border-[var(--ock-border)] text-[var(--ock-text-foreground)] hover:bg-[var(--ock-bg-alternate)]"
                            >
                                Clear Cart
                            </button>
                            <button
                                onClick={() => checkout()}
                                className="flex-1 inline-flex items-center justify-center space-x-2 px-4 py-3 rounded-lg bg-[var(--ock-accent)] text-[var(--ock-bg-default)]"
                            >
                                <ShoppingCartIcon />
                                <span>Checkout</span>
                            </button>
                            <button
                                onClick={() => { setShowShare(true); setShareMode('menu') }}
                                className="flex-1 col-span-2 py-3 rounded-lg border border-[var(--ock-border)] text-[var(--ock-text-foreground)] hover:bg-[var(--ock-bg-alternate)]"
                            >
                                Share Cart
                            </button>
                            <button
                                onClick={async () => {
                                    try {
                                        setIsSavingWishlist(true)
                                        // Save all cart items to wishlist via API as an array (products only)
                                        const productIds = cartItems.map(i => i.id)
                                        if (isConnected && address) {
                                            await fetch(`${DIGEMART_API_BASE}/users/${address}/wishlist/bulk`, {
                                                method: 'POST',
                                                headers: { 'Content-Type': 'application/json' },
                                                body: JSON.stringify({ productIds, type: 'PRODUCT', isAddress: true })
                                            })
                                        }
                                        toast.success('Items saved to wishlist')
                                    } catch (e) {
                                        console.error(e)
                                    } finally {
                                        setIsSavingWishlist(false)
                                    }
                                }}
                                disabled={cartItems.length === 0 || isSavingWishlist}
                                className="flex-1 col-span-2 py-3 rounded-lg border border-[var(--ock-border)] text-[var(--ock-text-foreground)] hover:bg-[var(--ock-bg-alternate)] disabled:opacity-60"
                            >
                                Save items to Wishlist
                            </button>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="text-center py-12 space-y-4">
                    <div className="w-20 h-20 mx-auto bg-[var(--ock-bg-alternate)] rounded-full flex items-center justify-center">
                        <ShoppingCartIcon className="w-10 h-10 text-[var(--ock-text-foreground-muted)]" />
                    </div>
                    <div className="space-y-2">
                        <h3 className="text-lg font-medium text-[var(--ock-text-foreground)]">Your cart is empty</h3>
                        <p className="text-sm text-[var(--ock-text-foreground-muted)] max-w-sm mx-auto">Browse products and add them to your cart to see them here.</p>
                    </div>
                </div>
            )}

            <ShareSheet
                isOpen={showShare}
                onClose={() => setShowShare(false)}
                primary={{ kind: 'gift', label: 'Gift a friend' }}
                secondary={{ kind: 'pay', label: 'Pay for me' }}
                isConnected={isConnected}
                onRequireConnect={() => toast.info('Please connect your wallet to use this feature.')}
                onGiftSubmit={async (email) => {
                    // placeholder submit; integrate API here if needed
                    toast.success(`Gift flow started for ${email}`)
                }}
                onCreateCopyLink={async () => {
                    // for cart page, treat copy as gifting link for cart duplication if needed
                    const ids = cartItems.map(i => i.id).join(',')
                    const url = new URL(window.location.origin + '/cart')
                    url.searchParams.set('copy', 'true')
                    url.searchParams.set('ids', ids)
                    return url.toString()
                }}
                onCreatePayLink={async () => {
                    const ids = cartItems.map(i => i.id).join(',')
                    const url = new URL(window.location.origin + '/cart')
                    url.searchParams.set('request', 'pay')
                    url.searchParams.set('ids', ids)
                    url.searchParams.set('total', getCartTotals().totalPrice.toFixed(2))
                    return new Promise<string>((resolve) => setTimeout(() => resolve(url.toString()), 800))
                }}
                summary={{ items: cartItems.reduce((s, i) => s + i.quantity, 0), total: getCartTotals().totalPrice }}
                copyNote={"Share this cart with a friend or copy it to another account."}
                payNote={"Share this link with friends to pay for you. You will receive a mail to complete checkout after."}
            />
        </div>
    )
}


