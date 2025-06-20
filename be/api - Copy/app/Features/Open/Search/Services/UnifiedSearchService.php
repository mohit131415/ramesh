<?php

namespace App\Features\Open\Search\Services;

use App\Features\Open\Search\DataAccess\UnifiedSearchRepository;
use Exception;

class UnifiedSearchService
{
    private $searchRepository;
    
    public function __construct()
    {
        $this->searchRepository = new UnifiedSearchRepository();
    }
    
    /**
     * Simple priority-based unified search with intelligent fuzzy fallback
     * 
     * @param string $query Search query
     * @param string $type Optional type filter
     * @param int $limit Maximum results per type
     * @return array Search results
     */
    public function search(string $query, string $type = '', int $limit = 10): array
    {
        try {
            error_log("UnifiedSearchService::search - Priority search for: '$query'");
            
            $results = [
                'categories' => [],
                'subcategories' => [],
                'products' => []
            ];
            
            // Clean the search query
            $query = trim($query);
            
            if (empty($query)) {
                return $this->getPopularSuggestions($limit);
            }
            
            // Priority 1: Items that START with the query
            $startResults = $this->searchByStartsWith($query, $type, $limit);
            
            // Priority 2: Items that CONTAIN the query in name
            $containResults = $this->searchByContains($query, $type, $limit);
            
            // Priority 3: Items found in other fields (description, etc.)
            $fieldResults = $this->searchByOtherFields($query, $type, $limit);
            
            // Merge results maintaining priority and removing duplicates
            $results = $this->mergeResultsByPriority($startResults, $containResults, $fieldResults, $limit);
            
            // Priority 4: INTELLIGENT FUZZY SEARCH - Only if no results found AND query makes sense
            if ($this->isEmpty($results) && $this->shouldRunFuzzySearch($query)) {
                error_log("UnifiedSearchService::search - No results found, trying intelligent fuzzy search for: '$query'");
                $fuzzyResults = $this->searchByIntelligentFuzzy($query, $type, $limit);
                $results = $fuzzyResults;
            }
            
            // Priority 5: If still no results found, return empty
            if ($this->isEmpty($results)) {
                error_log("UnifiedSearchService::search - No results found for: '$query'");
                return [
                    'categories' => [],
                    'subcategories' => [],
                    'products' => []
                ];
            }
            
            error_log("UnifiedSearchService::search - Found " . 
                     count($results['products']) . " products, " . 
                     count($results['categories']) . " categories, " . 
                     count($results['subcategories']) . " subcategories");
            
            return $results;
            
        } catch (Exception $e) {
            error_log("ERROR in UnifiedSearchService::search: " . $e->getMessage());
            return [
                'categories' => [],
                'subcategories' => [],
                'products' => []
            ];
        }
    }
    
    /**
     * Determine if fuzzy search should run based on query characteristics
     */
    private function shouldRunFuzzySearch(string $query): bool
    {
        // Don't run fuzzy search for very short queries (less than 2 characters)
        if (strlen($query) < 2) {
            return false;
        }

        // For 2-character queries, always allow fuzzy search if they could be meaningful
        if (strlen($query) == 2) {
            return true; // Let 2-char queries like "kj" go through fuzzy search
        }
        
        // Don't run fuzzy search for very long random strings (more than 8 characters)
        if (strlen($query) > 8) {
            return false;
        }
        
        // Don't run fuzzy search if query has too many consecutive consonants (likely random)
        if ($this->hasConsecutiveConsonants($query, 4)) {
            return false;
        }
        
        // Don't run fuzzy search if query has no vowels and is longer than 3 characters
        if (strlen($query) > 3 && !$this->hasVowels($query)) {
            return false;
        }
        
        // Don't run fuzzy search if query looks completely random
        if ($this->looksRandom($query)) {
            return false;
        }
        
        return true;
    }
    
    /**
     * Check if query has consecutive consonants
     */
    private function hasConsecutiveConsonants(string $query, int $maxConsecutive): bool
    {
        $vowels = ['a', 'e', 'i', 'o', 'u'];
        $consecutiveConsonants = 0;
        
        for ($i = 0; $i < strlen($query); $i++) {
            $char = strtolower($query[$i]);
            if (ctype_alpha($char) && !in_array($char, $vowels)) {
                $consecutiveConsonants++;
                if ($consecutiveConsonants >= $maxConsecutive) {
                    return true;
                }
            } else {
                $consecutiveConsonants = 0;
            }
        }
        
        return false;
    }
    
    /**
     * Check if query has vowels
     */
    private function hasVowels(string $query): bool
    {
        $vowels = ['a', 'e', 'i', 'o', 'u'];
        for ($i = 0; $i < strlen($query); $i++) {
            if (in_array(strtolower($query[$i]), $vowels)) {
                return true;
            }
        }
        return false;
    }
    
    /**
     * Check if query looks completely random
     */
    private function looksRandom(string $query): bool
    {
        $query = strtolower($query);
        
        // Check for patterns that suggest randomness
        $randomPatterns = [
            '/[qxz]{2,}/',           // Multiple rare letters
            '/[bcdfghjklmnpqrstvwxyz]{5,}/', // 5+ consecutive consonants
            '/(.)\1{3,}/',           // Same character repeated 4+ times
        ];
        
        foreach ($randomPatterns as $pattern) {
            if (preg_match($pattern, $query)) {
                return true;
            }
        }
        
        // Check character frequency - random strings often have unusual distributions
        $charCount = array_count_values(str_split($query));
        $uniqueChars = count($charCount);
        $totalChars = strlen($query);
        
        // If almost all characters are unique and string is long, likely random
        if ($totalChars > 5 && $uniqueChars / $totalChars > 0.8) {
            return true;
        }
        
        return false;
    }
    
    /**
     * INTELLIGENT FUZZY SEARCH: Only for meaningful queries
     */
    private function searchByIntelligentFuzzy(string $query, string $type, int $limit): array
    {
        try {
            error_log("UnifiedSearchService::searchByIntelligentFuzzy - Starting intelligent fuzzy search for: '$query'");
            
            // For 2-character queries, use both partial match AND character-based fuzzy
            if (strlen($query) == 2) {
                $partialResults = $this->searchByPartialMatch($query, $type, $limit);
                
                // If partial match found results, return them
                if (!$this->isEmpty($partialResults)) {
                    return $partialResults;
                }
                
                // Otherwise, try character-based fuzzy search
                $characters = array_unique(str_split(strtolower($query)));
                $results = ['products' => [], 'categories' => [], 'subcategories' => []];
                
                if (!$type || $type === 'product') {
                    $results['products'] = $this->getFuzzyProductResults($characters, $limit);
                }
                
                if (!$type || $type === 'category') {
                    $results['categories'] = $this->getFuzzyCategoryResults($characters, $limit);
                }
                
                if (!$type || $type === 'subcategory') {
                    $results['subcategories'] = $this->getFuzzySubcategoryResults($characters, $limit);
                }
                
                return $results;
            }

            // For 3-character queries, only search for the whole query as substring
            if (strlen($query) == 3) {
                return $this->searchByPartialMatch($query, $type, $limit);
            }
            
            // For longer queries, break into meaningful parts
            $characters = array_unique(str_split(strtolower($query)));
            
            // Only proceed if we have reasonable number of characters
            if (count($characters) > 6) {
                error_log("UnifiedSearchService::searchByIntelligentFuzzy - Too many unique characters, skipping");
                return ['products' => [], 'categories' => [], 'subcategories' => []];
            }
            
            $results = ['products' => [], 'categories' => [], 'subcategories' => []];
            
            // Get fuzzy results for each type
            if (!$type || $type === 'product') {
                $results['products'] = $this->getFuzzyProductResults($characters, $limit);
            }
            
            if (!$type || $type === 'category') {
                $results['categories'] = $this->getFuzzyCategoryResults($characters, $limit);
            }
            
            if (!$type || $type === 'subcategory') {
                $results['subcategories'] = $this->getFuzzySubcategoryResults($characters, $limit);
            }
            
            return $results;
            
        } catch (Exception $e) {
            error_log("ERROR in searchByIntelligentFuzzy: " . $e->getMessage());
            return ['products' => [], 'categories' => [], 'subcategories' => []];
        }
    }
    
    /**
     * Search by partial match for short queries
     */
    private function searchByPartialMatch(string $query, string $type, int $limit): array
    {
        $results = ['products' => [], 'categories' => [], 'subcategories' => []];
        
        if (!$type || $type === 'product') {
            $results['products'] = $this->searchRepository->searchProductsByPartialMatch($query, $limit);
        }
        
        if (!$type || $type === 'category') {
            $results['categories'] = $this->searchRepository->searchCategoriesByPartialMatch($query, $limit);
        }
        
        if (!$type || $type === 'subcategory') {
            $results['subcategories'] = $this->searchRepository->searchSubcategoriesByPartialMatch($query, $limit);
        }
        
        return $results;
    }
    
    /**
     * Search items that START with the query (highest priority)
     */
    private function searchByStartsWith(string $query, string $type, int $limit): array
    {
        $results = ['products' => [], 'categories' => [], 'subcategories' => []];
        
        if (!$type || $type === 'product') {
            $results['products'] = $this->searchRepository->searchProductsStartsWith($query, $limit);
        }
        
        if (!$type || $type === 'category') {
            $results['categories'] = $this->searchRepository->searchCategoriesStartsWith($query, $limit);
        }
        
        if (!$type || $type === 'subcategory') {
            $results['subcategories'] = $this->searchRepository->searchSubcategoriesStartsWith($query, $limit);
        }
        
        return $results;
    }
    
    /**
     * Search items that CONTAIN the query in name (medium priority)
     */
    private function searchByContains(string $query, string $type, int $limit): array
    {
        $results = ['products' => [], 'categories' => [], 'subcategories' => []];
        
        if (!$type || $type === 'product') {
            $results['products'] = $this->searchRepository->searchProductsContains($query, $limit);
        }
        
        if (!$type || $type === 'category') {
            $results['categories'] = $this->searchRepository->searchCategoriesContains($query, $limit);
        }
        
        if (!$type || $type === 'subcategory') {
            $results['subcategories'] = $this->searchRepository->searchSubcategoriesContains($query, $limit);
        }
        
        return $results;
    }
    
    /**
     * Search items in other fields like description (lowest priority)
     */
    private function searchByOtherFields(string $query, string $type, int $limit): array
    {
        $results = ['products' => [], 'categories' => [], 'subcategories' => []];
        
        if (!$type || $type === 'product') {
            $results['products'] = $this->searchRepository->searchProductsInFields($query, $limit);
        }
        
        if (!$type || $type === 'category') {
            $results['categories'] = $this->searchRepository->searchCategoriesInFields($query, $limit);
        }
        
        if (!$type || $type === 'subcategory') {
            $results['subcategories'] = $this->searchRepository->searchSubcategoriesInFields($query, $limit);
        }
        
        return $results;
    }
    
    /**
     * Get fuzzy product results with character-based priority
     */
    private function getFuzzyProductResults(array $characters, int $limit): array
    {
        $allResults = [];
        $seen = [];
        
        // Priority 1: Products containing ALL characters
        $allCharResults = $this->searchRepository->searchProductsByAllCharacters($characters, $limit);
        foreach ($allCharResults as $product) {
            if (!isset($seen[$product['id']])) {
                $seen[$product['id']] = true;
                $allResults[] = $product;
            }
        }
        
        // Priority 2: Products containing individual characters (only if we have few results)
        if (count($allResults) < $limit / 2) {
            foreach ($characters as $char) {
                $charResults = $this->searchRepository->searchProductsByCharacter($char, $limit);
                foreach ($charResults as $product) {
                    if (!isset($seen[$product['id']])) {
                        $seen[$product['id']] = true;
                        $allResults[] = $product;
                    }
                }
            }
        }
        
        return array_slice($allResults, 0, $limit);
    }
    
    /**
     * Get fuzzy category results with character-based priority
     */
    private function getFuzzyCategoryResults(array $characters, int $limit): array
    {
        $allResults = [];
        $seen = [];
        
        // Priority 1: Categories containing ALL characters
        $allCharResults = $this->searchRepository->searchCategoriesByAllCharacters($characters, $limit);
        foreach ($allCharResults as $category) {
            if (!isset($seen[$category['id']])) {
                $seen[$category['id']] = true;
                $allResults[] = $category;
            }
        }
        
        // Priority 2: Categories containing individual characters (only if we have few results)
        if (count($allResults) < $limit / 2) {
            foreach ($characters as $char) {
                $charResults = $this->searchRepository->searchCategoriesByCharacter($char, $limit);
                foreach ($charResults as $category) {
                    if (!isset($seen[$category['id']])) {
                        $seen[$category['id']] = true;
                        $allResults[] = $category;
                    }
                }
            }
        }
        
        return array_slice($allResults, 0, $limit);
    }
    
    /**
     * Get fuzzy subcategory results with character-based priority
     */
    private function getFuzzySubcategoryResults(array $characters, int $limit): array
    {
        $allResults = [];
        $seen = [];
        
        // Priority 1: Subcategories containing ALL characters
        $allCharResults = $this->searchRepository->searchSubcategoriesByAllCharacters($characters, $limit);
        foreach ($allCharResults as $subcategory) {
            if (!isset($seen[$subcategory['id']])) {
                $seen[$subcategory['id']] = true;
                $allResults[] = $subcategory;
            }
        }
        
        // Priority 2: Subcategories containing individual characters (only if we have few results)
        if (count($allResults) < $limit / 2) {
            foreach ($characters as $char) {
                $charResults = $this->searchRepository->searchSubcategoriesByCharacter($char, $limit);
                foreach ($charResults as $subcategory) {
                    if (!isset($seen[$subcategory['id']])) {
                        $seen[$subcategory['id']] = true;
                        $allResults[] = $subcategory;
                    }
                }
            }
        }
        
        return array_slice($allResults, 0, $limit);
    }
    
    /**
     * Merge results by priority, removing duplicates
     */
    private function mergeResultsByPriority(array $startResults, array $containResults, array $fieldResults, int $limit): array
    {
        $finalResults = ['products' => [], 'categories' => [], 'subcategories' => []];
        
        foreach (['products', 'categories', 'subcategories'] as $type) {
            $seen = [];
            $merged = [];
            
            // Add start results first (highest priority)
            foreach ($startResults[$type] as $item) {
                $id = $item['id'];
                if (!isset($seen[$id])) {
                    $seen[$id] = true;
                    $merged[] = $item;
                }
            }
            
            // Add contain results (medium priority)
            foreach ($containResults[$type] as $item) {
                $id = $item['id'];
                if (!isset($seen[$id])) {
                    $seen[$id] = true;
                    $merged[] = $item;
                }
            }
            
            // Add field results (lowest priority)
            foreach ($fieldResults[$type] as $item) {
                $id = $item['id'];
                if (!isset($seen[$id])) {
                    $seen[$id] = true;
                    $merged[] = $item;
                }
            }
            
            // Limit results
            $finalResults[$type] = array_slice($merged, 0, $limit);
        }
        
        return $finalResults;
    }
    
    /**
     * Check if results are empty
     */
    private function isEmpty(array $results): bool
    {
        return empty($results['categories']) && 
               empty($results['subcategories']) && 
               empty($results['products']);
    }
    
    /**
     * Get popular suggestions when no query provided
     */
    private function getPopularSuggestions(int $limit): array
    {
        try {
            return [
                'categories' => $this->searchRepository->getPopularCategories($limit),
                'subcategories' => $this->searchRepository->getPopularSubcategories($limit),
                'products' => $this->searchRepository->getPopularProducts($limit)
            ];
        } catch (Exception $e) {
            error_log("Error in getPopularSuggestions: " . $e->getMessage());
            return ['categories' => [], 'subcategories' => [], 'products' => []];
        }
    }
}
