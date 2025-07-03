"use client";

import { useState, useMemo } from 'react'
import { SearchIcon } from './_components/icons'
import { ResultCard, ResultTypeIndicator } from './_components/result-card'
import { useFeaturedStores, useDebouncedSearch } from './_components/hooks'

export default function Home() {
    const [searchQuery, setSearchQuery] = useState('')
    const [selectedFilter, setSelectedFilter] = useState<'all' | 'product' | 'store' | 'category'>('all')

    // React Query hooks - much cleaner!
    const {
        data: featuredStores = [],
        isLoading: loadingStores,
        error: storesError
    } = useFeaturedStores()

    const {
        data: searchData,
        isLoading: loadingSearch,
        error: searchError
    } = useDebouncedSearch(searchQuery, {
        entityType: selectedFilter,
        productLimit: 8,
        storeLimit: 8,
        categoryLimit: 4,
    })

    // Determine what to show
    const isSearchMode = searchQuery.trim().length > 0
    const results = useMemo(() => isSearchMode ? (searchData?.results || []) : featuredStores, [searchData, featuredStores, isSearchMode])
    const searchCounts = searchData?.counts
    const isLoading = isSearchMode ? loadingSearch : loadingStores
    const error = isSearchMode ? searchError : storesError

    // Filter results based on selected filter
    const filteredResults = useMemo(() => {
        if (selectedFilter === 'all') {
            return results
        }
        return results.filter(result => result.type === selectedFilter)
    }, [results, selectedFilter])

    // Handle filter changes
    const handleFilterChange = (filter: typeof selectedFilter) => {
        setSelectedFilter(filter)
    }

    return (
        <div className="space-y-4">
            {/* Header */}
            <div className="text-center space-y-2">
                <h1 className="text-xl font-bold text-[var(--ock-text-foreground)]">
                    Find Your Plug
                </h1>
                <p className="text-sm text-[var(--ock-text-foreground-muted)]">
                    Search stores, products, and categories
                </p>
            </div>

            {/* Search Bar */}
            <div className="relative">
                <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[var(--ock-text-foreground-muted)]" />
                <input
                    type="text"
                    placeholder="Search for anything..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-[var(--ock-bg-alternate)] border border-[var(--ock-border)] rounded-xl text-[var(--ock-text-foreground)] placeholder-[var(--ock-text-foreground-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--ock-accent)] focus:border-transparent text-sm"
                />
            </div>

            {/* Search Filters (only show when searching) */}
            {isSearchMode && (
                <div className="flex space-x-2 overflow-x-auto pb-2">
                    {[
                        { key: 'all', label: 'All Results' },
                        { key: 'product', label: 'Products' },
                        { key: 'store', label: 'Stores' },
                        { key: 'category', label: 'Categories' },
                    ].map(({ key, label }) => (
                        <button
                            key={key}
                            onClick={() => handleFilterChange(key as typeof selectedFilter)}
                            className={`flex-shrink-0 px-4 py-2 rounded-lg text-xs font-medium transition-colors ${selectedFilter === key
                                ? 'bg-[var(--ock-accent)] text-white'
                                : 'bg-[var(--ock-bg-alternate)] text-[var(--ock-text-foreground-muted)] hover:bg-[var(--ock-bg-default)]'
                                }`}
                        >
                            {label}
                            {searchCounts && key !== 'all' && (
                                <span className="ml-1 opacity-75">
                                    ({searchCounts[key as keyof typeof searchCounts]})
                                </span>
                            )}
                        </button>
                    ))}
                </div>
            )}

            {/* Results Section */}
            <div className="space-y-3">
                {/* Section Header */}
                <div className="flex items-center justify-between">
                    <h2 className="text-sm font-semibold text-[var(--ock-text-foreground)]">
                        {isSearchMode ? (
                            selectedFilter === 'all'
                                ? 'Search Results'
                                : `${selectedFilter.charAt(0).toUpperCase() + selectedFilter.slice(1)} Results`
                        ) : 'Featured Stores'}
                    </h2>
                    {filteredResults.length > 0 && (
                        <span className="text-xs text-[var(--ock-text-foreground-muted)]">
                            {filteredResults.length} {filteredResults.length === 1 ? 'result' : 'results'}
                            {searchCounts && isSearchMode && (
                                <span className="ml-1">
                                    of {searchCounts.total} total
                                </span>
                            )}
                        </span>
                    )}
                </div>

                {/* Search Summary (when searching) */}
                {isSearchMode && searchCounts && searchCounts.total > 0 && (
                    <div className="bg-[var(--ock-bg-alternate)] rounded-lg p-3">
                        <div className="flex items-center justify-between text-xs">
                            <span className="text-[var(--ock-text-foreground-muted)]">
                                Found {searchCounts.total} results for &quot;{searchQuery}&quot;
                            </span>
                            <div className="flex space-x-3">
                                {searchCounts.products > 0 && (
                                    <span className="flex items-center space-x-1">
                                        <ResultTypeIndicator type="product" />
                                        <span className="text-[var(--ock-text-foreground-muted)]">
                                            {searchCounts.products}
                                        </span>
                                    </span>
                                )}
                                {searchCounts.stores > 0 && (
                                    <span className="flex items-center space-x-1">
                                        <ResultTypeIndicator type="store" />
                                        <span className="text-[var(--ock-text-foreground-muted)]">
                                            {searchCounts.stores}
                                        </span>
                                    </span>
                                )}
                                {searchCounts.categories > 0 && (
                                    <span className="flex items-center space-x-1">
                                        <ResultTypeIndicator type="category" />
                                        <span className="text-[var(--ock-text-foreground-muted)]">
                                            {searchCounts.categories}
                                        </span>
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* Error State */}
                {error && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                        <p className="text-red-600 text-sm">
                            {isSearchMode ? 'Search failed. Please try again.' : 'Failed to load featured stores.'}
                        </p>
                    </div>
                )}

                {/* Loading Skeleton */}
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

                {/* Results Grid */}
                {!isLoading && !error && filteredResults.length > 0 && (
                    <div className="space-y-3">
                        {filteredResults.map((result) => (
                            <ResultCard key={`${result.type}-${result.id}`} result={result} />
                        ))}
                    </div>
                )}

                {/* Empty State */}
                {!isLoading && !error && filteredResults.length === 0 && (
                    <div className="text-center py-8 space-y-2">
                        <div className="w-16 h-16 mx-auto bg-[var(--ock-bg-alternate)] rounded-full flex items-center justify-center">
                            <SearchIcon className="w-8 h-8 text-[var(--ock-text-foreground-muted)]" />
                        </div>
                        <h3 className="text-sm font-medium text-[var(--ock-text-foreground)]">
                            {isSearchMode ? 'No results found' : 'No stores available'}
                        </h3>
                        <p className="text-xs text-[var(--ock-text-foreground-muted)]">
                            {isSearchMode
                                ? `No ${selectedFilter === 'all' ? 'results' : selectedFilter + 's'} found for "${searchQuery}"`
                                : 'Check back later for featured stores'
                            }
                        </p>
                        {isSearchMode && (
                            <p className="text-xs text-[var(--ock-text-foreground-muted)]">
                                Try different keywords or browse categories
                            </p>
                        )}
                    </div>
                )}
            </div>
        </div>
    )
}