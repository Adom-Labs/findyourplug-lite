import { useState, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { fetchTopStores, advancedSearch } from './api'
import type { SearchParams } from './types'

export function useFeaturedStores() {
    return useQuery({
        queryKey: ['featured-stores'],
        queryFn: fetchTopStores,
        staleTime: 10 * 60 * 1000,
        gcTime: 30 * 60 * 1000,
    })
}

export function useSearch(query: string, options: Partial<SearchParams> = {}) {
    return useQuery({
        queryKey: ['search', query, options],
        queryFn: () => advancedSearch({ term: query, ...options }),
        enabled: query.trim().length > 0,
        staleTime: 2 * 60 * 1000,
        gcTime: 5 * 60 * 1000,
        placeholderData: (previousData) => previousData,
    })
}

export function useBasicSearch(query: string, options: Partial<SearchParams> = {}) {
    return useQuery({
        queryKey: ['basic-search', query, options],
        queryFn: async () => {
            const results = await advancedSearch({ term: query, ...options })
            return results.results
        },
        enabled: query.trim().length > 0,
        staleTime: 2 * 60 * 1000,
        gcTime: 5 * 60 * 1000,
        placeholderData: (previousData) => previousData,
    })
}

export function useDebouncedSearch(query: string, options: Partial<SearchParams> = {}, delay: number = 500) {
    const [debouncedQuery, setDebouncedQuery] = useState(query)

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedQuery(query)
        }, delay)

        return () => clearTimeout(timer)
    }, [query, delay])

    return useSearch(debouncedQuery, options)
} 