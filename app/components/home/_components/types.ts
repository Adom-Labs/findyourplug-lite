// Types matching the real Digemart API responses

// Landing page API types
export interface StoreCategory {
    id: number
    name: string
    description: string
}

export interface ApiStore {
    id: number
    storeAddress: string
    storeName: string
    storeUrl: string
    logo: string
    storeType: "EXTERNAL" | "INTERNAL"
    verified: boolean
    averageRating: number
    totalRatings: number
    storeCategory: StoreCategory
}

export interface LandingPageResponse {
    statusCode: number
    status: boolean
    message: string
    data: {
        categories: unknown[]
        featuredStores: ApiStore[]
        recentReviews: unknown[]
    }
    timestamp: string
    path: string
}

// Search API types (updated to match actual response)
export interface SearchProduct {
    id: number
    name: string
    description: string
    image: string
    price: string  // Note: this is a string in the actual API
    storeId: number
    storeName: string
    storeUrl: string
    locationState: string
    locationCity: string
    rank: number
}

export interface SearchStore {
    id: number
    name: string
    description: string
    image: string
    url: string
    rating?: number  // Rating might not be available in search results
    locationState: string
    locationCity: string
    rank: number
}

export interface SearchCategory {
    id: number
    name: string
    description: string
    image: string
    url: string
    rank: number
}

export interface SearchCounts {
    products: number
    stores: number
    categories: number
    total: number
}

export interface SearchApiResponse {
    statusCode: number
    status: boolean
    message: string
    data: {
        products: SearchProduct[]
        stores: SearchStore[]
        categories: SearchCategory[]
        counts: SearchCounts
    }
    timestamp: string
    path: string
}

// Component-friendly types (normalized for display)
export interface FeaturedStore extends ApiStore {
    // Computed properties for component use
    name: string
    description: string
    rating: number
    reviews: number
    location: string
    image: string
    url: string
    type: 'store'
}

export interface DisplayProduct {
    id: number
    name: string
    description: string
    price: string
    storeName: string
    storeUrl: string
    image: string
    location: string
    type: 'product'
    categoryName?: string
}

export interface DisplayStore {
    id: number
    name: string
    description: string
    rating?: number  // Rating is optional for search stores
    reviews?: number
    location: string
    image: string
    url: string
    type: 'store'
    verified?: boolean
}

export interface DisplayCategory {
    id: number
    name: string
    description: string
    image: string
    url: string
    type: 'category'
}

export type SearchResult = DisplayProduct | DisplayStore | DisplayCategory

// Search parameters
export interface SearchParams {
    term: string
    entityType?: 'product' | 'store' | 'category' | 'all'
    productLimit?: number
    storeLimit?: number
    categoryLimit?: number
    skip?: number
    categoryIds?: number[]
    includeOutOfStock?: boolean
    locationState?: string
    locationCity?: string
} 